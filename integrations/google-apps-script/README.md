# Raccoglitore Gmail - Copione Engine

Questo Google Apps Script importa su comando nell'archivio privato i PDF
ricevuti da `stlamarca+copione@gmail.com`, senza Chrome e senza computer acceso.

La raccolta conserva integralmente i PDF, ma nella successiva lettura per il
copione devono essere ignorati riferimenti, didascalie e richiami alle immagini:
si utilizza esclusivamente il contenuto testuale degli articoli.

## Comportamento

- controlla Gmail soltanto quando viene eseguito il comando;
- cerca anche nelle email archiviate o spostate nel Cestino, così può generare
  l'OCR degli allegati già importati senza doverli rispedire;
- considera soltanto allegati con nome `.pdf`;
- usa la data di ricezione della mail;
- salva il PDF originale nella categoria `pdf`;
- esegue automaticamente l'OCR in italiano ed esporta il testo direttamente
  con Google Drive, senza dipendere da Google Documenti;
- salva il testo ottenuto in Markdown nella categoria `testi`, accanto alla stessa data;
- antepone l'oggetto della mail al nome del file;
- etichetta le mail riuscite come `Copione/Importato`;
- etichetta l'OCR completato come `Copione/OCR`;
- etichetta gli errori come `Copione/Errore`;
- non contiene la chiave privata nei file del progetto.

## Attivazione una tantum

1. Creare un progetto su https://script.google.com/ con l'account Gmail corretto.
2. Copiare `Code.gs` nell'editor.
3. Aprire **Impostazioni progetto > Proprietà script**.
4. Creare la proprietà `PORTAL_BYPASS_TOKEN` e inserirvi la chiave privata.
5. Aprire **Impostazioni progetto**, attivare **Mostra il file manifest** e sostituire `appsscript.json` con quello fornito qui. Il manifesto abilita Drive API v2, necessaria per l'OCR.
6. Eseguire una volta `raccogliPdfCopione` e autorizzare Gmail e le richieste esterne.
7. Controllare che i PDF compaiano nel portale.
8. Ogni volta che serve, selezionare `raccogliPdfCopione` e premere **Esegui**.
   Il comando può essere lanciato più volte al giorno: le conversazioni già
   importate vengono ignorate grazie all'etichetta `Copione/Importato`.
   Dopo questo aggiornamento, la prima esecuzione riprende anche le mail già
   importate ma prive dell'etichetta `Copione/OCR`: in questo modo genera i
   testi dei PDF del 4 agosto senza dover rispedire le mail.

## Perché i PDF online non compaiono nella cartella locale

Il comando Apps Script lavora interamente nel cloud: legge Gmail e carica i
PDF direttamente nel portale. Non passa dal sistema Download di Chrome e non
può quindi creare una copia nella cartella locale dell'estensione. Quella
cartella contiene soltanto file scaricati esplicitamente da Chrome mentre la
raccolta PDF dell'estensione è attiva. Il portale è l'archivio principale;
l'archivio locale dell'estensione è una copia facoltativa e non sincronizzata.
