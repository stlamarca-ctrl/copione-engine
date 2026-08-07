const ROOT_PATTERN = /[\\/]Copione-Engine[\\/]rassegne[\\/](\d{4}-\d{2}-\d{2})[\\/](pdf|web)[\\/]/i;

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const level = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** level)).toFixed(level ? 1 : 0)} ${units[level]}`;
}

function italianDate(value) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = value;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    const copied = document.execCommand("copy");
    temporary.remove();
    if (!copied) throw new Error("Copia non riuscita");
  }
}

async function prepareCodexCommand(command) {
  const panel = document.querySelector("#commandPanel");
  const text = document.querySelector("#commandText");
  if (!panel || !text) throw new Error("Ricarica la pagina Archivio e riprova.");
  text.value = command;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
  await copyText(command);
}

async function getArchive() {
  const downloads = await chrome.downloads.search({ limit: 10000 });
  const days = new Map();

  for (const item of downloads) {
    const match = item.filename?.match(ROOT_PATTERN);
    if (!match || item.state !== "complete") continue;
    const [, date, type] = match;
    if (!days.has(date)) days.set(date, []);
    days.get(date).push({
      id: item.id,
      type: type.toLowerCase(),
      name: item.filename.split(/[\\/]/).pop(),
      size: item.fileSize || item.totalBytes || 0,
      url: item.finalUrl || item.url
    });
  }

  return [...days.entries()]
    .map(([date, files]) => ({ date, files }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function renderTotals(days) {
  const totals = document.querySelector("#totals");
  if (!totals) return;
  const files = days.flatMap((day) => day.files);
  const metrics = [
    [days.length, "giornate"],
    [files.filter((file) => file.type === "web").length, "articoli web"],
    [files.filter((file) => file.type === "pdf").length, "PDF"],
    [formatBytes(files.reduce((sum, file) => sum + file.size, 0)), "spazio occupato"]
  ];
  totals.innerHTML = metrics
    .map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
}

function renderDays(days) {
  const archive = document.querySelector("#archive");
  if (!archive) return;
  archive.replaceChildren();

  if (!days.length) {
    archive.innerHTML = '<div class="empty">Nessun file organizzato dall’estensione è presente nella cronologia Download.</div>';
    return;
  }

  for (const day of days) {
    const pdfCount = day.files.filter((file) => file.type === "pdf").length;
    const webCount = day.files.filter((file) => file.type === "web").length;
    const size = day.files.reduce((sum, file) => sum + file.size, 0);
    const card = document.createElement("article");
    card.className = "day-card";
    card.innerHTML = `
      <header class="day-header">
        <div>
          <p class="date"></p>
          <p class="counts"></p>
        </div>
        <div class="actions">
          <button class="copy-command">Crea copione</button>
          <button class="toggle" aria-expanded="false">Mostra file</button>
        </div>
      </header>
      <div class="details" hidden>
        <div class="file-list"></div>
      </div>`;
    card.querySelector(".date").textContent = italianDate(day.date);
    card.querySelector(".counts").textContent = `${webCount} articoli · ${pdfCount} PDF · ${formatBytes(size)}`;

    const details = card.querySelector(".details");
    const toggle = card.querySelector(".toggle");
    toggle.addEventListener("click", () => {
      details.hidden = !details.hidden;
      toggle.textContent = details.hidden ? "Mostra file" : "Nascondi file";
      toggle.setAttribute("aria-expanded", String(!details.hidden));
    });

    card.querySelector(".copy-command").addEventListener("click", async (event) => {
      const command = `Prepara una bozza di copione usando la raccolta di ${italianDate(day.date)}. Prima di generare le domande, chiedimi direttamente i bilanciamenti necessari.`;
      try {
        await prepareCodexCommand(command);
        event.currentTarget.textContent = "Pronto per Codex";
        setTimeout(() => { event.currentTarget.textContent = "Crea copione"; }, 1800);
      } catch (error) {
        const status = document.querySelector("#status");
        if (status) status.textContent = `Errore nella preparazione: ${error.message}`;
      }
    });

    const list = card.querySelector(".file-list");
    for (const file of day.files.sort((a, b) => a.name.localeCompare(b.name))) {
      const row = document.createElement("div");
      row.className = "file-row";
      row.innerHTML = `
        <span class="badge ${file.type}">${file.type.toUpperCase()}</span>
        <span class="filename"></span>
        <span class="filesize">${formatBytes(file.size)}</span>
        <button>Mostra nella cartella</button>`;
      row.querySelector(".filename").textContent = file.name;
      row.querySelector("button").addEventListener("click", () => chrome.downloads.show(file.id));
      list.append(row);
    }
    archive.append(card);
  }
}

async function refresh() {
  const status = document.querySelector("#status");
  if (!status) return;
  status.textContent = "Lettura dell’archivio…";
  try {
    const days = await getArchive();
    renderTotals(days);
    renderDays(days);
    status.textContent = `Ultimo aggiornamento: ${new Date().toLocaleTimeString("it-IT")}`;
  } catch (error) {
    status.textContent = `Errore: ${error.message}`;
  }
}

document.querySelector("#refresh")?.addEventListener("click", refresh);
document.querySelector("#copyAgain")?.addEventListener("click", async (event) => {
  try {
    await copyText(document.querySelector("#commandText").value);
    event.currentTarget.textContent = "Copiato";
    setTimeout(() => { event.currentTarget.textContent = "Copia di nuovo"; }, 1500);
  } catch (error) {
    const status = document.querySelector("#status");
    if (status) status.textContent = `Errore nella copia: ${error.message}`;
  }
});
refresh();
