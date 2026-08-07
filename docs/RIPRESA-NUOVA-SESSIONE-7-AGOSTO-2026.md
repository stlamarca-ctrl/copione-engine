
# RIPRESA NUOVA SESSIONE — 7 AGOSTO 2026

## Istruzione iniziale per la nuova sessione

Leggere integralmente, nell'ordine:

1. `docs/DA-LEGGERE-PER-PRIMO.md`;
2. questo file;
3. `docs/RIPRESA-GITHUB-7-AGOSTO-2026.md`;
4. `docs/RIPRESA-PORTALE-MOBILE.md`;
5. `docs/REGOLE-COPIONE.md`.

Non ripetere attività dichiarate completate. Prima di agire, riferire in poche
righe lo stato riconosciuto e il prossimo passo effettivamente ancora aperto.

## Stato esatto raggiunto

- Portale pubblicato: https://copione-engine-mobile.slammovie.chatgpt.site
- Repository ufficiale: `stlamarca-ctrl/copione-engine`.
- Pull request GitHub numero 1 unita in `main`.
- Commit di `main` verificato:
  `1aff498d55eed37b27ff360d490ac1fd2396aa08`.
- Codex Cloud collegato al repository tramite ChatGPT Codex Connector.
- Accesso del connettore GitHub limitato al solo repository
  `stlamarca-ctrl/copione-engine`.
- Ambiente Codex Cloud `copione-engine` creato automaticamente.
- Primo collaudo cloud in sola lettura: `COLLAUDO SUPERATO`.
- Nel contenitore Codex Cloud il ramo temporaneo può chiamarsi `work`: è
  normale. Il ramo sorgente selezionato resta `main`; controllare l'HEAD quando
  occorre verificare la provenienza.
- Il collaudo ha confermato la presenza di portale, `README.md`, `docs/`,
  `integrations/`, `legacy/` e `legacy/copione-engine.html`.
- Nessun token, credenziale, PDF o materiale dell'archivio R2 è tracciato in
  GitHub.
- Il collaudo non ha modificato file, creato commit o aperto pull request.

## Architettura operativa

- GitHub contiene codice, documentazione tecnica e regole utilizzabili da
  Codex Cloud su qualsiasi dispositivo.
- Codex Cloud può leggere e modificare il repository, eseguire controlli e
  preparare commit o pull request.
- Portale, Gmail e integrazioni raccolgono i materiali.
- PDF, articoli e Markdown dell'archivio restano nello spazio cloud privato
  del portale/R2 e non devono essere trasferiti su GitHub.
- Token e credenziali restano fuori dal repository, in Google Apps Script o
  nelle configurazioni private previste.
- L'estensione Chrome resta necessaria soltanto per le funzioni locali che la
  richiedono; il codice del progetto è comunque gestibile da qualunque device
  tramite Codex Cloud.

## Regole di interazione con l'utente

- Non inventare mai contenuti, fatti, ospiti, tempi, movimenti o dati mancanti.
- Chiedere all'utente tutto ciò che serve e non è ricavabile dai materiali.
- Porre le domande necessarie direttamente nella conversazione, una fase alla
  volta e in forma interattiva.
- Prima di creare un copione, chiedere direttamente all'utente i bilanciamenti
  necessari; l'estensione non deve raccoglierli in anticipo.
- Gli ospiti restano `da definire` finché l'utente non li comunica.
- Per i movimenti non ancora definiti scrivere soltanto
  `MOVIMENTO CONDUTTORE`.
- Usare esclusivamente le raccolte indicate dall'utente e non integrare altre
  fonti senza autorizzazione esplicita.
- Ignorare riferimenti, didascalie e richiami alle immagini nei PDF e negli
  articoli; usare il contenuto testuale.
- Presentare le domande in modo modificabile, selezionabile e riordinabile.
- La numerazione delle proposte deve essere progressiva attraverso i blocchi;
  quella del copione definitivo deve ripartire da 1 seguendo l'ordine finale.
- Il copione definitivo deve essere HTML stampabile A4 verticale e seguire il
  modello redazionale descritto in `docs/REGOLE-COPIONE.md`.
- Spiegare brevemente sigle, missioni o riferimenti tecnici necessari alla
  comprensione della domanda.
- Prima di produrre l'output definitivo, chiedere conferma sui dati mancanti e
  sul numero di domande selezionate quando non coincide con quello previsto.

## Regole di iterazione tecnica

- Per richieste di analisi o diagnosi: verificare e riferire, senza modificare
  automaticamente il progetto.
- Per richieste di modifica: lavorare su un ramo dedicato, eseguire controlli
  proporzionati e proporre una pull request; non usare force push.
- Non lavorare nel working tree locale sporco del portale se esiste una copia o
  un worktree isolato più sicuro.
- Non rinominare o sostituire il remoto tecnico `origin` del portale.
- Non pubblicare mai `PORTAL_BYPASS_TOKEN` o altre credenziali.
- Non cancellare `legacy/copione-engine.html`.
- Non ripetere importazione, build, test iniziali, merge della PR 1,
  collegamento GitHub o primo collaudo cloud: sono conclusi.
- Ogni attività cloud può usare un ramo temporaneo `work`; verificare il commit
  sorgente invece di considerare automaticamente questo nome un errore.
- Dopo una modifica reale, aggiornare i file di ripresa prima di interrompere.

## Contatori richiesti dall'utente

- In fondo alle risposte mostrare una stima progressiva delle parole inviate
  dall'utente rispetto alla soglia di 700.
- Avvisare esplicitamente al raggiungimento o superamento delle 700 parole.
- Mostrare anche una stima generale del contesto rispetto a circa 50.000 parole.
- Il contatore precedente ha superato la soglia: nella nuova sessione avviare
  un nuovo ciclo da `0 / 700`, dichiarando che il ciclo precedente è chiuso.

## Prossimo punto aperto

Non esiste una lavorazione tecnica obbligatoria rimasta in sospeso. Chiedere
all'utente quale funzione vuole affrontare per prima. La direzione già emersa è
rendere progressivamente accessibili a Codex Cloud, in modo sicuro e senza
spostare segreti su GitHub, anche le operazioni sull'archivio e gli output
definitivi del copione.


