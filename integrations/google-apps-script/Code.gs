const COPIONE_CONFIG = Object.freeze({
  alias: "stlamarca+copione@gmail.com",
  endpoint: "https://copione-engine-mobile.slammovie.chatgpt.site/api/files",
  processedLabel: "Copione/Importato",
  ocrLabel: "Copione/OCR",
  errorLabel: "Copione/Errore",
  timezone: "Europe/Rome",
  // Una raccolta per esecuzione: evita il limite di 6 minuti di Apps Script.
  // Le raccolte completate sono escluse automaticamente tramite l'etichetta OCR.
  maxThreadsPerRun: 1,
});

/**
 * Cerca le mail indirizzate all'alias e invia i PDF al portale privato.
 * La funzione è idempotente: i messaggi completati ricevono un'etichetta Gmail
 * e un secondo invio dello stesso file sovrascrive la stessa chiave in archivio.
 */
function raccogliPdfCopione() {
  const token = PropertiesService.getScriptProperties().getProperty("PORTAL_BYPASS_TOKEN");
  if (!token) throw new Error("Manca la proprietà PORTAL_BYPASS_TOKEN.");

  const imported = getOrCreateLabel_(COPIONE_CONFIG.processedLabel);
  const ocrCompleted = getOrCreateLabel_(COPIONE_CONFIG.ocrLabel);
  const failed = getOrCreateLabel_(COPIONE_CONFIG.errorLabel);
  const query = [
    `to:${COPIONE_CONFIG.alias}`,
    "has:attachment",
    "filename:pdf",
    "in:anywhere",
    `-label:${quoteLabel_(COPIONE_CONFIG.ocrLabel)}`,
    "-in:spam",
  ].join(" ");

  const threads = GmailApp.search(query, 0, COPIONE_CONFIG.maxThreadsPerRun);
  const result = { threads: threads.length, messages: 0, pdfs: 0, texts: 0, errors: 0 };

  threads.forEach((thread) => {
    let threadCompleted = true;

    thread.getMessages().forEach((message) => {
      if (!wasSentToAlias_(message)) return;
      const pdfs = message.getAttachments({ includeInlineImages: false, includeAttachments: true })
        .filter((attachment) => /\.pdf$/i.test(attachment.getName()));
      if (!pdfs.length) return;

      result.messages += 1;
      const date = Utilities.formatDate(message.getDate(), COPIONE_CONFIG.timezone, "yyyy-MM-dd");
      const subject = safePart_(message.getSubject() || "Senza oggetto");

      pdfs.forEach((attachment) => {
        const archiveName = `${subject}--${safePart_(attachment.getName())}`;
        try {
          uploadPdf_(token, date, archiveName, attachment);
          result.pdfs += 1;
          const extracted = extractPdfText_(attachment, archiveName);
          uploadText_(token, date, `${archiveName.replace(/\.pdf$/i, "")}--testo.md`, extracted.text, archiveName, extracted.method);
          result.texts += 1;
        } catch (error) {
          threadCompleted = false;
          result.errors += 1;
          console.error(`${archiveName}: ${error.message}`);
        }
      });
    });

    if (threadCompleted) {
      thread.addLabel(imported);
      thread.addLabel(ocrCompleted);
      thread.removeLabel(failed);
    } else {
      thread.addLabel(failed);
    }
  });

  console.log(JSON.stringify(result));
  return result;
}

/**
 * Tenta prima la conversione rapida del testo già presente nel PDF.
 * L'OCR viene eseguito soltanto per le scansioni prive di testo sufficiente.
 * Il file temporaneo viene sempre spostato nel cestino.
 * Richiede il servizio avanzato Drive API v2 indicato in appsscript.json.
 */
function extractPdfText_(attachment, archiveName) {
  const fastText = convertPdfToText_(attachment, archiveName, false);
  if (fastText.length >= 200) return { text: fastText, method: "testo incorporato nel PDF" };

  const ocrText = convertPdfToText_(attachment, archiveName, true);
  if (!ocrText) throw new Error("L'OCR non ha restituito testo.");
  return { text: ocrText, method: "OCR automatico Google Drive" };
}

function convertPdfToText_(attachment, archiveName, useOcr) {
  let temporaryId = null;
  try {
    const converted = Drive.Files.insert({
      title: `${useOcr ? "OCR" : "Conversione"} temporanea - ${archiveName}`,
      mimeType: "application/pdf",
    }, attachment.copyBlob(), {
      ocr: useOcr,
      ocrLanguage: "it",
      convert: true,
    });
    temporaryId = converted.id;
    const exportUrl = `https://www.googleapis.com/drive/v2/files/${temporaryId}/export?mimeType=${encodeURIComponent("text/plain")}`;
    const exportResponse = UrlFetchApp.fetch(exportUrl, {
      headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    });
    const text = exportResponse.getContentText("UTF-8").trim();
    return text;
  } finally {
    if (temporaryId) DriveApp.getFileById(temporaryId).setTrashed(true);
  }
}

function uploadText_(token, date, filename, text, sourcePdf, extractionMethod) {
  const markdown = [
    "---",
    `pdf_originale: ${JSON.stringify(sourcePdf)}`,
    `data_raccolta: ${JSON.stringify(date)}`,
    `origine: ${JSON.stringify(extractionMethod)}`,
    'regola_immagini: "Ignorare immagini, didascalie e richiami grafici"',
    "---",
    "",
    `# Testo OCR — ${sourcePdf}`,
    "",
    text,
    "",
  ].join("\n");
  const blob = Utilities.newBlob(markdown, "text/markdown", filename);
  uploadFile_(token, date, "testi", blob);
}

function uploadPdf_(token, date, archiveName, attachment) {
  uploadFile_(token, date, "pdf", attachment.copyBlob().setName(archiveName).setContentType("application/pdf"));
}

function uploadFile_(token, date, category, file) {
  const response = UrlFetchApp.fetch(COPIONE_CONFIG.endpoint, {
    method: "post",
    headers: { "OAI-Sites-Authorization": `Bearer ${token}` },
    payload: {
      date,
      category,
      file,
    },
    followRedirects: true,
    muteHttpExceptions: true,
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(`Portale HTTP ${status}: ${response.getContentText().slice(0, 300)}`);
  }
}

function wasSentToAlias_(message) {
  return message.getTo().toLowerCase().includes(COPIONE_CONFIG.alias.toLowerCase());
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function quoteLabel_(name) {
  return `"${name.replace(/"/g, "")}"`;
}

function safePart_(value) {
  return String(value)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "documento";
}
