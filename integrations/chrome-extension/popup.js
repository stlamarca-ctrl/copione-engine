const dateInput = document.querySelector("#collectionDate");
const statusNode = document.querySelector("#status");
const counterNode = document.querySelector("#counter");

dateInput.value = new Date().toLocaleDateString("en-CA");

function selectedDate() {
  if (!dateInput.value) throw new Error("Scegli la data della raccolta.");
  return dateInput.value;
}

function setStatus(text, error = false) {
  statusNode.textContent = text;
  statusNode.style.color = error ? "#a42e20" : "#264f3d";
}

async function message(payload) {
  const response = await chrome.runtime.sendMessage(payload);
  if (!response?.ok) throw new Error(response?.error || "Operazione non riuscita.");
  return response;
}

async function refresh() {
  const response = await message({ type: "GET_STATUS", date: selectedDate() });
  counterNode.textContent = `${response.count} elementi registrati`;
  if (response.activeDate) {
    setStatus(`Raccolta PDF attiva per ${response.activeDate}.`);
  }
}

document.querySelector("#saveArticle").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:/i.test(tab.url || "")) {
      throw new Error("Apri prima un articolo in una normale pagina web.");
    }

    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const extracted = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_ARTICLE" });
    if (!extracted?.ok) throw new Error(extracted?.error || "Articolo non leggibile.");

    const saved = await message({
      type: "SAVE_ARTICLE",
      date: selectedDate(),
      article: extracted.article
    });
    counterNode.textContent = `${saved.count} elementi registrati`;
    setStatus(`Salvato nell’archivio online: ${saved.filename}`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#startPdf").addEventListener("click", async () => {
  try {
    const response = await message({ type: "START_PDF_CAPTURE", date: selectedDate() });
    setStatus(`Raccolta attiva per ${response.minutes} minuti. Ora scarica gli allegati PDF da Gmail.`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.querySelector("#stopPdf").addEventListener("click", async () => {
  try {
    await message({ type: "STOP_PDF_CAPTURE" });
    setStatus("Raccolta PDF fermata.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.querySelector("#exportManifest").addEventListener("click", async () => {
  try {
    const response = await message({ type: "EXPORT_MANIFEST", date: selectedDate() });
    setStatus(`Manifest esportato con ${response.count} elementi.`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.querySelector("#openArchive").addEventListener("click", async () => {
  await chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});

dateInput.addEventListener("change", () => refresh().catch((error) => setStatus(error.message, true)));
refresh().catch((error) => setStatus(error.message, true));
