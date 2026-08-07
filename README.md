# Copione Engine

Portale privato per raccogliere PDF ricevuti via Gmail, articoli web, testi
estratti e copioni finali. L'archivio è consultabile e stampabile da computer,
tablet e cellulare.

## Flusso operativo

1. Google Apps Script raccoglie manualmente le mail inviate a
   `stlamarca+copione@gmail.com`.
2. Il PDF viene salvato subito nell'archivio online.
3. Il raccoglitore prova prima a convertire il testo già incorporato nel PDF.
4. Solo per scansioni senza testo sufficiente viene eseguito l'OCR.
5. PDF e Markdown vengono archiviati nella stessa data di raccolta.
6. L'estensione Chrome invia gli articoli web allo stesso archivio.

## Struttura del repository

- `app/` e `worker/`: portale mobile e API dell'archivio.
- `integrations/google-apps-script/`: raccoglitore Gmail, senza credenziali.
- `integrations/chrome-extension/`: estensione Chrome, senza chiave privata.
- `docs/`: regole del copione e documenti per riprendere il lavoro.
- `.openai/hosting.json`: collegamento del portale privato e archivio R2.

## Utilizzo da più dispositivi

- Il portale pubblicato permette di consultare e stampare i materiali da ogni
  dispositivo autorizzato.
- Il repository remoto contiene codice e documentazione e può essere aperto da
  un ambiente Codex collegato al repository.
- Le modifiche diventano disponibili agli altri dispositivi soltanto dopo un
  commit e un push.
- Le chiavi restano nelle Proprietà script di Apps Script e nella memoria locale
  dell'estensione: non devono essere inserite nel repository.
- L'archivio dei documenti resta in R2, non in Git: in questo modo i PDF non
  appesantiscono il repository e sono comunque disponibili sul portale.

Notion non è necessario come secondo archivio: il portale è già la fonte unica
per PDF, articoli, Markdown e copioni. Potrà essere aggiunto in seguito come
indice editoriale, senza duplicare i file.

## Sviluppo

Richiede Node.js 22 o successivo.

```bash
pnpm install
pnpm build
```

Il sito usa vinext e Cloudflare R2. Non salvare mai token, file `.env`, chiavi o
credenziali di pubblicazione nel repository.
