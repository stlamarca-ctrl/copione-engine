# RIPRESA GITHUB — 7 AGOSTO 2026

## Decisione confermata dall'utente

Il repository privato `stlamarca-ctrl/copione-engine` deve diventare il
repository ufficiale del nuovo Copione Engine utilizzabile da Codex Cloud.

Il vecchio file `copione-engine.html` già presente su GitHub non va eliminato:
deve essere conservato in `legacy/copione-engine.html`.

## Stato locale da non rifare

Repository locale del portale:

`outputs/copione-mobile`

Remoti configurati:

- `origin`: repository tecnico Sites, da conservare;
- `github`: `https://github.com/stlamarca-ctrl/copione-engine.git`.

Il comando `git fetch github` è già stato eseguito con successo dal terminale
dell'utente.

Rami remoti rilevati:

- `origin/main`: portale mobile attualmente pubblicato;
- `github/main`: vecchio repository GitHub.

Le due cronologie non hanno un antenato comune. Non tentare merge automatici e
non usare force push.

Contenuto attuale di `github/main`:

- `.gitattributes`;
- `copione-engine.html`.

## Modifiche locali già preparate

Nel repository locale del portale sono presenti modifiche non ancora committate:

- nuovo `README.md` specifico del progetto;
- `docs/` con regole e file di ripresa;
- `integrations/google-apps-script/`;
- `integrations/chrome-extension/`.

Non contengono token o chiavi reali. Le credenziali restano in Google Apps
Script e nella memoria locale dell'estensione.

Il raccoglitore Apps Script live è già aggiornato:

1. salva subito il PDF;
2. tenta la conversione rapida del testo incorporato;
3. usa l'OCR soltanto sotto la soglia di 200 caratteri;
4. crea il Markdown nella stessa data della raccolta;
5. elabora una mail-raccolta per esecuzione.

Ultimo collaudo live: 1 mail, 1 PDF, 1 Markdown, 0 errori, circa 17 secondi.

## Verifiche già eseguite

- Sintassi di `Code.gs`: corretta.
- Sintassi dei JavaScript dell'estensione: corretta.
- `git diff --check`: nessun errore sostanziale.
- Portale live accessibile da PC e cellulare.
- Build locale del portale ancora bloccata dal noto errore Windows
  `spawn EPERM`; non è un errore introdotto dalle modifiche documentali o
  dall'integrazione Apps Script.

## FERMO ESATTO — RIPARTIRE DA QUI

1. Non lavorare direttamente nel working tree sporco su `main`.
2. Preparare un worktree o una cartella temporanea basata su `github/main`.
3. Conservare `copione-engine.html` come
   `legacy/copione-engine.html`.
4. Importare nel nuovo ramo GitHub tutto il sorgente del portale da
   `origin/main`, quindi sovrapporre le modifiche locali intenzionali:
   `README.md`, `docs/` e `integrations/`.
5. Non importare `node_modules`, `dist`, `.env`, token, PDF, Markdown
   dell'archivio R2 o credenziali.
6. Usare il ramo `agent/portale-mobile-multidevice`.
7. Eseguire i controlli disponibili. Trattare `spawn EPERM` come limite
   ambientale già documentato, ma non ignorare nuovi errori diversi.
8. Creare un commit descrittivo soltanto dopo l'ispezione completa dei file.
9. Pubblicare il ramo sul remoto `github` senza force push.
10. Aprire una pull request in bozza verso `stlamarca-ctrl/copione-engine:main`.
11. Dopo il merge, collegare quel repository a Codex Cloud. Le credenziali
    continueranno a essere configurate separatamente.

## Attenzioni

- Non sostituire o rinominare il remoto `origin`: serve alla pubblicazione
  del portale Sites.
- Non unire le storie con `--allow-unrelated-histories` dentro il working tree
  principale.
- Non cancellare il vecchio HTML: conservarlo in `legacy`.
- Non pubblicare mai la chiave `PORTAL_BYPASS_TOKEN`.
- Non spostare i PDF su GitHub: restano nell'archivio R2 del portale.

## Completamento del 7 agosto 2026

- Creato il worktree isolato `outputs/copione-mobile-github` basato su
  `github/main`.
- Creato il ramo `agent/portale-mobile-multidevice`.
- Conservato il vecchio file come `legacy/copione-engine.html`.
- Importati portale, documentazione, Apps Script ed estensione senza
  credenziali o documenti dell'archivio.
- Build vinext completata con successo fuori dal limite Windows della sandbox.
- Test del portale: 2 superati, 0 falliti.
- Commit creato: `0e3e1f8 Porta Copione Engine su GitHub`.
- Ramo pubblicato sul remoto `github` senza force push.
- Pull request in bozza aperta e verificata come unibile:
  https://github.com/stlamarca-ctrl/copione-engine/pull/1

## NUOVO FERMO ESATTO — RIPARTIRE DA QUI

1. Aprire e controllare la pull request in bozza numero 1.
2. Se il contenuto è approvato, trasformarla in pronta o unirla in `main`.
3. Dopo il merge, verificare che `main` contenga il portale e la cartella
   `legacy`.
4. Collegare `stlamarca-ctrl/copione-engine` a Codex Cloud.
5. Non trasferire in GitHub token, PDF o materiali dell'archivio R2.
