# RIPRESA — OCR E ARCHIVIO PDF

Data del punto di arresto: 5 agosto 2026

## Obiettivo

Rendere automatica la trasformazione dei PDF ricevuti via Gmail in testo OCR
leggibile da Codex, conservando sempre anche il PDF originale. Capire e gestire
correttamente la differenza tra archivio online e cartella locale.

## Problemi chiariti

1. I PDF del 4 agosto sono presenti online ma non nella cartella locale perché
   Google Apps Script li trasferisce direttamente da Gmail al portale. Non
   transitano dai Download di Chrome.
2. La cartella locale dell'estensione non è una copia sincronizzata del portale:
   contiene soltanto i file scaricati esplicitamente da Chrome durante una
   raccolta attiva.
3. Verifica effettuata sul computer: nella cartella locale `2026-08-04` è
   presente soltanto la sottocartella `web`; la sottocartella `pdf` non esiste.
4. Decisione: il portale online resta l'archivio principale. Non è necessario
   duplicare automaticamente tutti i PDF sul computer, salvo futura richiesta.

## Modifiche già preparate — non rifarle

- `outputs/raccoglitore-gmail-apps-script/Code.gs`
  - conserva il PDF originale;
  - avvia l'OCR Google Drive in italiano;
  - genera un Markdown associato al PDF;
  - invia il Markdown nella categoria `testi`;
  - applica l'etichetta Gmail `Copione/OCR`;
  - alla prima esecuzione riprende anche le email già importate che non hanno
    ancora l'etichetta `Copione/OCR`.
- `outputs/raccoglitore-gmail-apps-script/appsscript.json`
  - abilita Drive API v2 e le autorizzazioni necessarie.
- `outputs/raccoglitore-gmail-apps-script/README.md`
  - documenta OCR e mancata sincronizzazione locale.
- Portale aggiornato localmente:
  - `outputs/copione-mobile/worker/index.ts` accetta `testi`;
  - `outputs/copione-mobile/app/page.tsx` mostra il contatore e i file OCR;
  - `outputs/copione-mobile/app/globals.css` distingue graficamente i testi.
- `RIPRESA-PORTALE-MOBILE.md` contiene il riepilogo storico aggiornato.

## Verifiche già eseguite

- Sintassi di `Code.gs`: corretta.
- Sintassi dei file TypeScript modificati: corretta.
- La build completa del portale non è stata completata a causa del noto errore
  locale Windows `spawn EPERM`; non è stato diagnosticato come errore delle
  modifiche.
- La nuova categoria `testi` non è ancora pubblicata online.
- Il codice aggiornato non è ancora stato copiato nel progetto Google Apps
  Script dell'utente.

## Aggiornamento 6 agosto 2026

- Portale versione 2 pubblicato privatamente con categoria `testi`.
- Build e due collaudi del portale superati.
- `Code.gs` e `appsscript.json` copiati e salvati nel progetto Apps Script.
- Drive API v2 compare tra i servizi del progetto.
- Primo collaudo: 8 PDF rilevati, 8 PDF conservati, 0 testi; Google ha negato
  `drive.files.insert` perché il nuovo consenso Drive non è ancora stato
  completato.
- Individuata un'ulteriore causa per l'arretrato del 4 agosto: le 17 email sono
  nel Cestino, mentre il filtro precedente usava `-in:trash`. Il filtro locale
  è stato corretto con `in:anywhere` e continua a escludere lo spam.
- Prossimo passo esatto: completare il consenso Google a Drive, quindi eseguire
  nuovamente la raccolta e verificare i Markdown sul portale.
- Secondo collaudo: Drive è stato autorizzato, ma `DocumentApp.openById` ha
  segnalato che lo scope `documents.readonly` non è sufficiente. Correzione
  definitiva: eliminare `DocumentApp` ed esportare il testo OCR direttamente
  con `Drive.Files.export(..., "text/plain")`. Non serve un nuovo permesso
  Google Documenti; resta sufficiente l'autorizzazione Drive già concessa.

## Collaudo conclusivo del 6 agosto 2026

- Eliminata definitivamente la dipendenza da `DocumentApp`.
- L'esportazione OCR usa ora l'endpoint Drive v2 `files/.../export` con token
  OAuth dello script; risolto anche l'errore `Export requires alt=media`.
- La prima elaborazione completa ha raggiunto il limite di 6 minuti, ma ha
  caricato correttamente tutti i testi: il portale mostrava 25 testi OCR.
- Per evitare nuovi timeout, `maxThreadsPerRun` è stato impostato a `1`: ogni
  pressione di **Esegui** elabora una sola mail-raccolta e quella successiva
  viene ripresa alla pressione seguente.
- Collaudo della modalità a blocchi riuscito:
  `{"threads":1,"messages":1,"pdfs":1,"texts":1,"errors":0}`.
- Stato finale verificato sul portale: **33 PDF e 26 testi OCR**, senza perdita
  dei PDF originali.
- Restano solo da controllare qualitativamente alcuni Markdown OCR prima di
  usarli per un copione; immagini, didascalie e richiami grafici vanno ignorati.

## Conversione rapida e repository multi-dispositivo

- Il raccoglitore prova ora, immediatamente dopo il salvataggio del PDF, la
  conversione del testo già incorporato nel documento.
- Se ottiene almeno 200 caratteri, crea subito il Markdown senza OCR.
- Solo per PDF scansionati o privi di testo sufficiente usa l'OCR Google Drive.
- Collaudo Apps Script riuscito il 6 agosto: 1 mail, 1 PDF, 1 Markdown, 0
  errori, esecuzione completata in circa 17 secondi.
- Nel repository del portale sono state aggiunte copie prive di credenziali di:
  raccoglitore Apps Script, estensione Chrome, regole e file di ripresa.
- Il remoto Git attuale è il repository tecnico gestito da Sites
  (`git.chatgpt-team.site`), non è ancora stato verificato un repository
  `github.com` utilizzabile direttamente da Codex Cloud.
- Prima della sincronizzazione GitHub occorre identificare l'esatto repository
  privato `proprietario/nome`; non creare duplicati e non inserire credenziali.

## FERMO ESATTO — RIPARTIRE DA QUI

1. Aprire dal portale almeno un Markdown **TESTO OCR** voluminoso e verificarne
   leggibilità e completezza rispetto al PDF originale.
2. Se restano mail-raccolta senza etichetta `Copione/OCR`, premere nuovamente
   **Esegui**: una pressione elabora una raccolta e termina entro il limite.
3. Quando il log restituisce `threads:0`, l'arretrato Gmail è terminato.
4. Solo dopo il controllo qualitativo, usare i testi OCR come materiali per il
   copione, ignorando immagini, didascalie e richiami grafici.

## Attenzioni

- Non ruotare `PORTAL_BYPASS_TOKEN`: la chiave attuale funziona sia per Apps
  Script sia per l'estensione.
- Non rispedire le email del 4 agosto: il nuovo filtro OCR deve recuperarle.
- Non cancellare i PDF originali dopo l'OCR.
- Non configurare esecuzioni automatiche ogni dieci minuti: l'utente vuole
  l'avvio manuale, anche più volte al giorno.
- Non confondere la categoria `testi` con gli articoli `web`.

## Comando consigliato per domani

> Leggi `DA-LEGGERE-PER-PRIMO.md` e `RIPRESA-OCR-6-AGOSTO-2026.md`. Riprendi
> esattamente da “FERMO ESATTO — RIPARTIRE DA QUI”. Non rifare le attività già
> completate e non ruotare la chiave del portale.
