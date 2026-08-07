/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ARCHIVE: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const decodeEntities = (value: string) => value
  .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");

const plainTextFromHtml = (html: string) => decodeEntities(html
  .replace(/<(script|style|noscript|svg|picture|figure)[^>]*>[\s\S]*?<\/\1>/gi, " ")
  .replace(/<img\b[^>]*>/gi, " ")
  .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, "\n")
  .replace(/<[^>]+>/g, " "))
  .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character] ?? character));

const safeWebHost = (hostname: string) => {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return false;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host)) return false;
  const private172 = host.match(/^172\.(\d{1,3})\./);
  return !(private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31);
};

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/archive" && request.method === "GET") {
      const listed = await env.ARCHIVE.list({ limit: 1000 });
      const files = listed.objects.map((object) => {
        const [date, category, ...nameParts] = object.key.split("/");
        return {
          key: object.key,
          date,
          category,
          name: nameParts.join("/"),
          size: object.size,
          uploaded: object.uploaded.toISOString(),
          url: `/files/${object.key.split("/").map(encodeURIComponent).join("/")}`,
        };
      }).filter((file) => /^\d{4}-\d{2}-\d{2}$/.test(file.date));
      return Response.json({ files });
    }

    if (url.pathname === "/api/files" && request.method === "POST") {
      const form = await request.formData();
      const date = String(form.get("date") ?? "");
      const category = String(form.get("category") ?? "");
      const file = form.get("file");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !["pdf", "testi", "web", "copioni"].includes(category) || !(file instanceof File)) {
        return new Response("Dati del documento non validi.", { status: 400 });
      }
      if (file.size > 25 * 1024 * 1024) return new Response("Il documento supera il limite di 25 MB.", { status: 413 });
      const safeName = file.name.replace(/[\\/]/g, "-").replace(/[^\p{L}\p{N}._() -]/gu, "_");
      const key = `${date}/${category}/${safeName}`;
      await env.ARCHIVE.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
      return Response.json({ ok: true, key });
    }

    if (url.pathname === "/api/web" && request.method === "POST") {
      const form = await request.formData();
      const date = String(form.get("date") ?? "");
      let source: URL;
      try { source = new URL(String(form.get("url") ?? "")); } catch { return new Response("Indirizzo web non valido.", { status: 400 }); }
      if (!/^https?:$/.test(source.protocol) || !safeWebHost(source.hostname) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response("Indirizzo web o data non validi.", { status: 400 });
      }
      const response = await fetch(source.toString(), { redirect: "follow", headers: { "user-agent": "CopioneEngine/1.0" } });
      if (!response.ok) return new Response(`Il sito ha risposto con errore ${response.status}.`, { status: 502 });
      const type = response.headers.get("content-type") ?? "";
      if (!type.includes("text/html")) return new Response("La pagina indicata non è un articolo HTML.", { status: 415 });
      const sourceHtml = (await response.text()).slice(0, 5_000_000);
      const titleMatch = sourceHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = decodeEntities((titleMatch?.[1] ?? source.hostname).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
      const text = plainTextFromHtml(sourceHtml);
      if (text.length < 200) return new Response("Non è stato possibile estrarre il testo dell’articolo.", { status: 422 });
      const saved = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>body{max-width:780px;margin:40px auto;padding:0 20px;font:18px/1.55 Georgia,serif;color:#17211d}h1{line-height:1.1}a{color:#196b4a}.source{font:14px Arial,sans-serif;color:#637069;word-break:break-all}pre{white-space:pre-wrap;font:inherit}</style></head><body><h1>${escapeHtml(title)}</h1><p class="source">Fonte: <a href="${escapeHtml(source.toString())}">${escapeHtml(source.toString())}</a></p><pre>${escapeHtml(text)}</pre></body></html>`;
      const baseName = title.replace(/[\\/]/g, "-").replace(/[^\p{L}\p{N}._() -]/gu, "_").slice(0, 120) || source.hostname;
      const key = `${date}/web/${baseName}.html`;
      await env.ARCHIVE.put(key, saved, { httpMetadata: { contentType: "text/html; charset=utf-8" } });
      return Response.json({ ok: true, key });
    }

    if (url.pathname.startsWith("/files/") && request.method === "GET") {
      const key = url.pathname.slice(7).split("/").map(decodeURIComponent).join("/");
      const object = await env.ARCHIVE.get(key);
      if (!object) return new Response("Documento non trovato.", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("content-disposition", `inline; filename*=UTF-8''${encodeURIComponent(key.split("/").pop() || "documento")}`);
      headers.set("cache-control", "private, max-age=60");
      return new Response(object.body, { headers });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
