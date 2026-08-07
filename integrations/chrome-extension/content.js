function firstMeta(selectors) {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    const value = node?.content || node?.getAttribute?.("datetime") || node?.textContent;
    if (value?.trim()) return value.trim();
  }
  return "";
}

function visibleText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll([
    "script", "style", "noscript", "svg", "canvas", "img", "picture", "figure", "figcaption", "form", "button",
    "nav", "aside", "footer", "[aria-hidden='true']", ".advertisement", ".ads"
  ].join(",")).forEach((item) => item.remove());

  return clone.innerText
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function bestArticleNode() {
  const candidates = [
    ...document.querySelectorAll("article, main, [role='main'], .article-body, .article-content, .post-content")
  ];
  return candidates
    .map((node) => ({ node, score: visibleText(node).length }))
    .sort((a, b) => b.score - a.score)[0]?.node || document.body;
}

function extractArticle() {
  const title = firstMeta([
    "meta[property='og:title']",
    "meta[name='twitter:title']",
    "article h1",
    "main h1",
    "h1"
  ]) || document.title;

  const site = firstMeta([
    "meta[property='og:site_name']",
    "meta[name='application-name']"
  ]) || location.hostname.replace(/^www\./, "");

  const author = firstMeta([
    "meta[name='author']",
    "meta[property='article:author']",
    "[rel='author']",
    ".author"
  ]);

  const published = firstMeta([
    "meta[property='article:published_time']",
    "meta[name='date']",
    "time[datetime]"
  ]);

  const text = visibleText(bestArticleNode());
  return { title, site, author, published, text, url: location.href };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTRACT_ARTICLE") {
    try {
      const article = extractArticle();
      if (article.text.length < 200) {
        sendResponse({ ok: false, error: "Non ho trovato abbastanza testo nella pagina." });
      } else {
        sendResponse({ ok: true, article });
      }
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
  }
});

function localDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function installFloatingCollector() {
  if (document.querySelector("#copione-floating-collector")) return;
  const host = document.createElement("div");
  host.id = "copione-floating-collector";
  host.style.position = "fixed";
  host.style.right = "18px";
  host.style.bottom = "18px";
  host.style.zIndex = "2147483647";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      *{box-sizing:border-box}button,input{font:14px Arial,sans-serif}
      .open{width:58px;height:58px;border:0;border-radius:50%;background:#196b4a;color:white;font-weight:900;box-shadow:0 5px 20px #0005;cursor:pointer}
      .panel{display:none;width:270px;padding:14px;margin-bottom:10px;border:1px solid #ccd5cf;border-radius:14px;background:#fff;color:#17211d;box-shadow:0 8px 28px #0004;font:14px Arial,sans-serif}
      .panel.visible{display:block}.title{font-weight:800;margin-bottom:10px}.row{display:flex;gap:8px;align-items:end}
      label{flex:1;color:#637069;font-size:11px;font-weight:700}input{width:100%;height:40px;margin-top:5px;padding:7px;border:1px solid #ccd5cf;border-radius:8px}
      .save{height:40px;border:0;border-radius:8px;padding:0 12px;background:#196b4a;color:#fff;font-weight:800;cursor:pointer}
      .status{margin:10px 0 0;color:#637069;font-size:12px;line-height:1.35}.error{color:#a42e20}
    </style>
    <div class="panel" role="dialog" aria-label="Salva articolo per Copione">
      <div class="title">Salva nella raccolta</div>
      <div class="row"><label>Data<input type="date"></label><button class="save">Salva</button></div>
      <p class="status">Verrà salvato soltanto il testo dell’articolo.</p>
    </div>
    <button class="open" title="Salva articolo per Copione" aria-label="Salva articolo per Copione">01</button>`;
  const panel = root.querySelector(".panel");
  const open = root.querySelector(".open");
  const save = root.querySelector(".save");
  const date = root.querySelector("input");
  const status = root.querySelector(".status");
  date.value = localDate();
  open.addEventListener("click", () => panel.classList.toggle("visible"));
  save.addEventListener("click", async () => {
    save.disabled = true;
    status.classList.remove("error");
    status.textContent = "Raccolta in corso…";
    try {
      const article = extractArticle();
      if (article.text.length < 200) throw new Error("Non ho trovato abbastanza testo nella pagina.");
      const response = await chrome.runtime.sendMessage({ type: "SAVE_ARTICLE", date: date.value, article });
      if (!response?.ok) throw new Error(response?.error || "Salvataggio non riuscito.");
      status.textContent = `Salvato nell’archivio online: ${response.filename}`;
    } catch (error) {
      status.classList.add("error");
      status.textContent = error.message;
    } finally {
      save.disabled = false;
    }
  });
  document.documentElement.append(host);
}

installFloatingCollector();
