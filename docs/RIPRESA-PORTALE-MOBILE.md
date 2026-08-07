# RIPRESA — PORTALE MOBILE COPIONE ENGINE

## Aggiornamento 5 agosto 2026 — OCR e archivio locale

- Diagnosticata l'assenza locale dei PDF del 4 agosto: Apps Script li ha trasferiti direttamente da Gmail all'archivio cloud; non sono mai passati dai Download di Chrome. La cartella locale del 4 agosto contiene infatti soltanto `web` e nessuna cartella `pdf`.
- I due archivi non sono sincronizzati: il portale è l'archivio principale; la cartella dell'estensione contiene solo i download avviati esplicitamente in Chrome durante la raccolta.
- Preparato in `outputs/raccoglitore-gmail-apps-script/Code.gs` il flusso PDF + OCR: conserva il PDF, usa Google Drive OCR in italiano, crea un Markdown e lo invia nella nuova categoria `testi`.
- Aggiunta l'etichetta Gmail `Copione/OCR`. La prima esecuzione aggiornata riprenderà anche le mail già etichettate `Copione/Importato`, compresi i PDF del 4 agosto, se prive di `Copione/OCR`.
- Aggiornati manifesto Apps Script, README e portale locale per mostrare separatamente i testi OCR.
- Sintassi Apps Script e dei due file TypeScript modificati verificata. La build completa del portale resta bloccata localmente dal già noto errore Windows `spawn EPERM`; la modifica `testi` non è ancora pubblicata.
- Prossimo passo: pubblicare il portale aggiornato; poi copiare nel progetto Apps Script il nuovo `Code.gs` e il nuovo `appsscript.json`, autorizzare Drive e rieseguire `raccogliPdfCopione`.

Ultimo aggiornamento: 4 agosto 2026 — interruzione durante il collaudo dell'invio articoli web

Aggiornamento collaudo: 4 agosto 2026

- Accesso privato completato con successo.
- Caricato e aperto `collaudo-portale-mobile.pdf` nella raccolta del 4 agosto 2026.
- Caricato e aperto `collaudo-portale-mobile.html` nella raccolta del 4 agosto 2026.
- Archivio online verificato: 1 giornata, 1 PDF, 1 copione, 3,2 KB complessivi.
- Individuato il valore data fisso `2026-08-02`: corretto localmente con la data corrente del dispositivo.
- Individuato l’errore `Cannot read properties of null (reading 'reset')` dopo un caricamento riuscito: corretto localmente conservando il riferimento al modulo prima dell’operazione asincrona.
- Le due correzioni sono registrate nel repository locale, ma la pubblicazione è da completare perché nella sessione del 4 agosto l’accesso di rete al deposito del sito era bloccato.
- La pubblicazione delle correzioni del portale resta da completare, ma non è il primo passo alla ripresa: iniziare dalla diagnosi dell'invio web descritta in **FERMO ESATTO — RIPARTIRE DA QUI**.
- Gmail verificato il 4 agosto 2026: account `stlamarca@gmail.com`, alias di raccolta `stlamarca+copione@gmail.com`.
- La ricerca `to:stlamarca+copione@gmail.com has:attachment filename:pdf newer_than:30d` funziona.
- Il 4 agosto risultano 17 PDF: 10 messaggi “Oggi pol” e 7 messaggi “Oggi”.
- Gli allegati sono leggibili e scaricabili tramite Gmail, ma il portale non contiene ancora il collegamento automatico.
- Soluzione scelta da completare: Google Apps Script con attivazione periodica, invio degli allegati all’endpoint del portale e chiave tecnica privata conservata nelle proprietà dello script. Il nome archiviato deve includere anche l’oggetto della mail per evitare che `Articoli-1.pdf` di raccolte diverse si sovrascriva.
- Autorizzazione dell'utente ricevuta il 4 agosto 2026 e chiave tecnica privata del portale generata. La chiave non è salvata nei file del progetto.
- Raccoglitore preparato in `outputs/raccoglitore-gmail-apps-script/` con `Code.gs`, `appsscript.json` e `README.md`; sintassi JavaScript verificata.
- Il raccoglitore viene avviato manualmente, anche più volte al giorno; importa solo PDF, usa la data della mail, antepone l'oggetto al nome e applica le etichette `Copione/Importato` o `Copione/Errore`.
- Regola di lettura: ignorare riferimenti, didascalie e richiami alle immagini; usare per il copione esclusivamente il contenuto testuale degli articoli.
- Prossimo passaggio: creare/compilare il progetto Google Apps Script, inserire la chiave in `PORTAL_BYPASS_TOKEN`, autorizzare Google ed eseguire il primo recupero.

## Punto esatto raggiunto

### FERMO ESATTO — RIPARTIRE DA QUI

- Il portale online, all'ultimo controllo, mostra **2 giornate, 0 articoli web, 24 PDF, 1 copione, 172,1 MB**.
- L'ultimo articolo salvato con l'estensione **non è ancora entrato** nel portale: il contatore resta a zero.
- Non è ancora noto il messaggio mostrato dal pulsante flottante **01** dopo l'ultimo tentativo. Alla ripresa chiedere per prima cosa il testo esatto del messaggio oppure una fotografia.
- L'estensione locale è ora alla versione `1.3.0`. La chiave privata non è nei file: viene letta da `chrome.storage.local` e inserita dalla pagina **Dettagli → Opzioni estensione**.
- Il 4 agosto 2026 la chiave privata del portale è stata ruotata. La proprietà `PORTAL_BYPASS_TOKEN` del progetto Google Apps Script è stata aggiornata con la nuova chiave; quindi il raccoglitore Gmail è allineato.
- La nuova chiave è stata copiata negli appunti e l'utente ha riferito di aver completato i passaggi in Chrome. Non ruotarla di nuovo prima di diagnosticare l'errore del pulsante **01**.
- Se il messaggio dell'estensione non chiarisce il problema, aprire `chrome://extensions`, entrare in **01 - Copione - Raccoglitore rassegna → Dettagli → Errori** e acquisire l'errore del service worker/background.
- Dopo la correzione, salvare un solo articolo di prova con data `2026-08-04`, aggiornare il portale e verificare che il contatore passi da `0` a `1` e che il file appaia nella categoria `web` del 4 agosto.
- Non rifare: creazione del portale, raccolta Gmail, autorizzazione Google, rotazione della chiave, aggiornamento della proprietà Apps Script, pulsante flottante e pagina Opzioni sono già completati.
- Collaudo del 5 agosto 2026: il pulsante **01** salva correttamente l'articolo sul computer, ma l'invio online riceve `401/403` e mostra «la chiave del portale non è valida». Poiché il raccoglitore Gmail ha già caricato i PDF usando la proprietà aggiornata, verificare per prima cosa che nelle Opzioni dell'estensione sia inserito esattamente lo stesso valore di `PORTAL_BYPASS_TOKEN` presente nelle Proprietà script di Google Apps Script. Non ruotare la chiave prima di questa verifica.
- **Risolto il 5 agosto 2026:** reinserito nelle Opzioni dell'estensione lo stesso `PORTAL_BYPASS_TOKEN` delle Proprietà script. Collaudo riuscito: articolo caricato nell'archivio online come `2026-08-05__corriere-della-sera__giorgetti-sulla-clausola-di-salvaguardia-alla-ue-chiederemo-di-aumentare-la-spesa-per-l-en.md`. L'invio web dell'estensione è quindi operativo.

- Estensione Chrome aggiornata alla versione `1.2.0`: sulle pagine `http/https` mostra il pulsante flottante **01** in basso a destra. Il pannello consente di scegliere la data e salvare l'articolo senza aprire il popup; immagini, didascalie e richiami grafici vengono esclusi.
- Estensione aggiornata alla versione `1.2.1`: ogni nuovo articolo viene anche inviato all'endpoint del portale nella categoria `web` e nella data scelta. Il caricamento usa la sessione privata già aperta in Chrome; in caso di mancata autenticazione mostra un errore esplicito.
- Estensione aggiornata alla versione `1.3.0`: usa una chiave privata conservata in `chrome.storage.local`, configurabile dalla pagina Opzioni; la chiave non è inclusa nei file dell'estensione.
- Chiave del portale ruotata il 4 agosto 2026 e proprietà `PORTAL_BYPASS_TOKEN` di Google Apps Script aggiornata. La nuova chiave è stata copiata negli appunti per l'inserimento una tantum nelle opzioni dell'estensione.

- Preparata la raccolta degli articoli web direttamente dal portale: campo URL e data, acquisizione lato server, estrazione del solo testo e salvataggio HTML in `web` senza immagini, didascalie o richiami grafici.
- Modifica salvata nel progetto mobile con commit locale `d030e0c`.
- Sintassi di `app/page.tsx` e `worker/index.ts` verificata. La build completa resta impedita dal limite locale `spawn EPERM` e la pubblicazione è bloccata dalla connessione a `git.chatgpt-team.site`; la funzione web non è ancora online.

È stata creata e pubblicata la prima versione privata di **Copione Engine Mobile**:

https://copione-engine-mobile.slammovie.chatgpt.site

Il portale consente già, anche da cellulare, di:

- caricare PDF, HTML, Markdown e file di testo;
- assegnare ogni documento a una data;
- distinguerlo come PDF di rassegna, articolo web o copione finale;
- consultare l’archivio raggruppato per data;
- aprire PDF e HTML nel browser;
- stampare dal cellulare tramite il comando di stampa del browser.

Il sito è privato. L’archivio online parte vuoto e usa uno spazio cloud dedicato.

## File principali

Applicazione mobile:

`outputs/copione-mobile/`

File da conoscere:

- `outputs/copione-mobile/app/page.tsx`: interfaccia mobile e caricamento file;
- `outputs/copione-mobile/app/globals.css`: aspetto grafico e impaginazione mobile;
- `outputs/copione-mobile/app/layout.tsx`: titolo e metadati;
- `outputs/copione-mobile/worker/index.ts`: archivio cloud, caricamento e apertura file;
- `outputs/copione-mobile/.openai/hosting.json`: collegamento al sito e archivio cloud;
- `outputs/copione-raccoglitore-chrome/`: estensione Chrome già esistente;
- `outputs/REGOLE-COPIONE.md`: regole editoriali e di impaginazione del copione.

## Pubblicazione

- Nome: Copione Engine Mobile
- URL: https://copione-engine-mobile.slammovie.chatgpt.site
- Versione pubblicata: 1
- Accesso: privato
- Archivio documenti: binding cloud `ARCHIVE`
- Identificativo progetto: `appgprj_6a6f8a7f849c81918532d4bf9c48b695`

Non salvare nei file token temporanei o credenziali di pubblicazione.

## Verifiche già effettuate

- PowerShell corretto e funzionante: versione 7.6.4.
- Eseguibile utilizzato: `C:\Users\stefano la marca\software\pshell764\pwsh.exe`.
- Build dell’applicazione completata senza errori.
- Versione privata pubblicata correttamente.
- Il server locale di prova è stato chiuso dopo la pubblicazione.

## Decisione architetturale

Chrome non deve più essere indispensabile.

Flusso finale desiderato:

1. Gmail raccoglie automaticamente i PDF lato cloud.
2. Gli articoli web arrivano al medesimo archivio per data.
3. Il portale mobile mostra raccolte, bozze e copioni finali.
4. Dal portale si avvia la creazione del copione.
5. Bilanciamenti e dati mancanti vengono chiesti in modo interattivo.
6. Il risultato viene salvato come HTML A4 verticale e PDF.
7. HTML e PDF possono essere aperti e stampati dal cellulare.

L’estensione Chrome resta utile come strumento aggiuntivo per salvare velocemente articoli dal computer, ma non deve essere il motore del sistema.

## Prossima fase — ordine operativo

### 1. Collaudo mobile del portale

- Aprire il sito dal cellulare.
- Caricare un PDF di prova.
- Caricare un HTML di prova.
- Verificare apertura e stampa di entrambi.
- Annotare eventuali problemi di accesso o resa su schermo.

### 2. Sincronizzazione dell’estensione

- Aggiungere all’estensione il comando “Invia all’archivio online”.
- Conservare l’organizzazione `AAAA-MM-GG/pdf`, `AAAA-MM-GG/web`, `AAAA-MM-GG/copioni`.
- Evitare credenziali permanenti dentro l’estensione.
- Decidere il metodo sicuro con cui l’estensione può autenticarsi al portale.

### 3. Raccolta senza Chrome

- Collegare Gmail lato server per scaricare automaticamente gli allegati PDF.
- Salvare originale, mittente, oggetto, data del messaggio e nome allegato.
- Impedire duplicati.
- Registrare esito ed eventuali errori di ogni raccolta.

### 4. Articoli online senza estensione obbligatoria

- Aggiungere al portale un campo “Incolla link articolo”.
- Valutare la condivisione diretta dal cellulare.
- Estrarre titolo, fonte, data, URL e testo leggibile senza inventare contenuti.
- Conservare sempre anche l’URL originale.

### 5. Generazione del copione

- Collegare il comando “Prepara bozza”.
- Chiedere direttamente all’utente i bilanciamenti prima delle domande.
- Applicare tutte le regole contenute in `outputs/REGOLE-COPIONE.md`.
- Mostrare domande selezionabili, modificabili e riordinabili.
- Rinumerare la selezione finale in una nuova sequenza continua.
- Generare HTML A4 verticale conforme al modello allegato.
- Non inventare dati mancanti.
- Per i movimenti non ancora definiti usare esattamente `MOVIMENTO CONDUTTORE`.

## Comando consigliato per riprendere

Nella prossima sessione scrivere:

> Apri `RIPRESA-PORTALE-MOBILE.md` e riprendi da “FERMO ESATTO — RIPARTIRE DA QUI”. Diagnostica l'invio dell'articolo web dall'estensione; non rifare le attività già completate e non ruotare nuovamente la chiave prima di leggere l'errore del pulsante 01.
