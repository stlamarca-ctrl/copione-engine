const tokenInput = document.querySelector("#portalToken");
const status = document.querySelector("#status");

chrome.storage.local.get("portalToken").then(({ portalToken }) => {
  if (portalToken) tokenInput.value = portalToken;
});

document.querySelector("#save").addEventListener("click", async () => {
  const portalToken = tokenInput.value.trim();
  if (!portalToken) {
    status.textContent = "Inserisci la chiave privata.";
    return;
  }
  await chrome.storage.local.set({ portalToken });
  status.textContent = "Collegamento salvato. Puoi chiudere questa pagina.";
});
