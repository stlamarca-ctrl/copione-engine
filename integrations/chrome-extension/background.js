const ROOT = "Copione-Engine/rassegne";
const PDF_WINDOW_MS = 10 * 60 * 1000;
const PORTAL_FILES_ENDPOINT = "https://copione-engine-mobile.slammovie.chatgpt.site/api/files";

function safeFilename(value, fallback = "documento") {
  return (value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 120) || fallback;
}

function slug(value) {
  return safeFilename(value, "articolo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "articolo";
}

function dataUrl(text, type) {
  return `data:${type};charset=utf-8,${encodeURIComponent(text)}`;
}

async function uploadArticleToPortal(date, filename, markdown) {
  const { portalToken } = await chrome.storage.local.get("portalToken");
  if (!portalToken) throw new Error("Articolo salvato sul computer, ma manca la chiave del portale. Apri le opzioni dell’estensione.");
  const form = new FormData();
  form.append("date", date);
  form.append("category", "web");
  form.append("file", new Blob([markdown], { type: "text/markdown;charset=utf-8" }), filename);
  const response = await fetch(PORTAL_FILES_ENDPOINT, {
    method: "POST",
    body: form,
    headers: { "OAI-Sites-Authorization": `Bearer ${portalToken}` }
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Articolo salvato sul computer, ma la chiave del portale non è valida. Riapri le opzioni dell’estensione.");
    }
    throw new Error(`Articolo salvato sul computer, ma il portale ha risposto con errore ${response.status}.`);
  }
}

async function getIndex() {
  const { dailyIndex = {} } = await chrome.storage.local.get("dailyIndex");
  return dailyIndex;
}

async function addIndexEntry(date, entry) {
  const dailyIndex = await getIndex();
  const entries = dailyIndex[date] || [];
  if (!entries.some((item) => item.key === entry.key)) {
    entries.push(entry);
  }
  dailyIndex[date] = entries;
  await chrome.storage.local.set({ dailyIndex });
  return entries.length;
}

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  (async () => {
    const { pdfCapture, pendingDownload } = await chrome.storage.local.get([
      "pdfCapture",
      "pendingDownload"
    ]);

    if (pendingDownload && item.byExtensionId === chrome.runtime.id) {
      await chrome.storage.local.remove("pendingDownload");
      suggest({ filename: pendingDownload.filename, conflictAction: pendingDownload.conflictAction });
      return;
    }

    const active = pdfCapture && Date.now() < pdfCapture.expiresAt;
    const isPdf = /\.pdf(?:$|[?#])/i.test(item.filename) || item.mime === "application/pdf";

    if (!active || !isPdf) {
      suggest();
      return;
    }

    const original = item.filename.split(/[\\/]/).pop();
    const filename = safeFilename(original, `allegato-${Date.now()}.pdf`);
    const target = `${ROOT}/${pdfCapture.date}/pdf/${filename}`;
    suggest({ filename: target, conflictAction: "uniquify" });

    addIndexEntry(pdfCapture.date, {
      key: `pdf:${item.id}`,
      type: "pdf",
      filename,
      sourceUrl: item.url,
      collectedAt: new Date().toISOString()
    }).catch(() => {});
  })().catch(() => suggest());

  return true;
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.type === "START_PDF_CAPTURE") {
      await chrome.storage.local.set({
        pdfCapture: {
          date: message.date,
          expiresAt: Date.now() + PDF_WINDOW_MS
        }
      });
      sendResponse({ ok: true, minutes: PDF_WINDOW_MS / 60000 });
      return;
    }

    if (message.type === "STOP_PDF_CAPTURE") {
      await chrome.storage.local.remove("pdfCapture");
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "SAVE_ARTICLE") {
      const article = message.article;
      const fileBase = `${message.date}__${slug(article.site)}__${slug(article.title)}`;
      const filename = `${fileBase}.md`;
      const markdown = [
        "---",
        `titolo: ${JSON.stringify(article.title)}`,
        `fonte: ${JSON.stringify(article.site)}`,
        `url: ${JSON.stringify(article.url)}`,
        `data_raccolta: ${JSON.stringify(message.date)}`,
        `data_articolo: ${JSON.stringify(article.published || "")}`,
        `autore: ${JSON.stringify(article.author || "")}`,
        "---",
        "",
        `# ${article.title}`,
        "",
        article.text,
        ""
      ].join("\n");

      const destination = `${ROOT}/${message.date}/web/${filename}`;
      await chrome.storage.local.set({
        pendingDownload: { filename: destination, conflictAction: "uniquify" }
      });

      await chrome.downloads.download({
        url: dataUrl(markdown, "text/markdown"),
        filename: destination,
        conflictAction: "uniquify",
        saveAs: false
      });

      await uploadArticleToPortal(message.date, filename, markdown);

      const count = await addIndexEntry(message.date, {
        key: `web:${article.url}`,
        type: "web",
        filename,
        title: article.title,
        site: article.site,
        url: article.url,
        published: article.published || "",
        author: article.author || "",
        collectedAt: new Date().toISOString()
      });
      sendResponse({ ok: true, count, filename, online: true });
      return;
    }

    if (message.type === "EXPORT_MANIFEST") {
      const dailyIndex = await getIndex();
      const entries = dailyIndex[message.date] || [];
      const manifest = {
        date: message.date,
        exportedAt: new Date().toISOString(),
        total: entries.length,
        pdf: entries.filter((entry) => entry.type === "pdf"),
        web: entries.filter((entry) => entry.type === "web")
      };
      const destination = `${ROOT}/${message.date}/manifest.json`;
      await chrome.storage.local.set({
        pendingDownload: { filename: destination, conflictAction: "overwrite" }
      });
      await chrome.downloads.download({
        url: dataUrl(JSON.stringify(manifest, null, 2), "application/json"),
        filename: destination,
        conflictAction: "overwrite",
        saveAs: false
      });
      sendResponse({ ok: true, count: entries.length });
      return;
    }

    if (message.type === "GET_STATUS") {
      const [{ pdfCapture }, dailyIndex] = await Promise.all([
        chrome.storage.local.get("pdfCapture"),
        getIndex()
      ]);
      sendResponse({
        ok: true,
        activeDate: pdfCapture && Date.now() < pdfCapture.expiresAt ? pdfCapture.date : null,
        count: (dailyIndex[message.date] || []).length
      });
    }
  })().catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
