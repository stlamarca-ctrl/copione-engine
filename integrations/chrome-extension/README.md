# 01 - Copione - Raccoglitore rassegna

Numero progressivo dell'estensione: **01**. Le prossime estensioni del progetto
useranno `02`, `03` e così via. La versione tecnica segue invece lo schema
`principale.secondaria.correzione` nel file `manifest.json`.

Estensione Chrome Manifest V3 per raccogliere PDF e articoli online, organizzati
per data nella cartella Download.

## Struttura prodotta

```text
Download/
└── Copione-Engine/
    └── rassegne/
        └── 2026-07-30/
            ├── pdf/
            │   ├── Articoli-1.pdf
            │   └── Articoli-2.pdf
            ├── web/
            │   └── 2026-07-30__open__titolo-articolo.md
            └── manifest.json
```

## Installazione

1. Aprire `chrome://extensions` in Chrome.
2. Attivare **Modalità sviluppatore**.
3. Premere **Carica estensione non pacchettizzata**.
4. Selezionare questa cartella.
5. Fissare l'estensione alla barra di Chrome.

## Raccogliere un articolo online

Su ogni normale pagina web compare in basso a destra il pulsante flottante
**01**. Premendolo si sceglie la data e si salva direttamente l'articolo,
senza aprire il pannello dell'estensione. Immagini, didascalie e richiami
grafici vengono ignorati.

L'articolo viene salvato sia nella cartella locale sia nell'archivio mobile,
nella categoria `web` della data scelta, accanto ai PDF della stessa raccolta.
La chiave privata viene inserita una sola volta nelle opzioni dell'estensione e
rimane esclusivamente nella memoria locale di Chrome.

1. Aprire l'articolo nel browser.
2. Aprire l'estensione.
3. Scegliere la data a cui appartiene la raccolta.
4. Premere **Salva articolo aperto**.

Il file Markdown contiene titolo, fonte, URL, data, autore e testo leggibile.
Paywall, iframe e pagine che caricano soltanto un estratto possono limitare il
contenuto recuperabile: l'estensione salva esclusivamente ciò che è già visibile
e disponibile nella pagina aperta.

## Raccogliere PDF da Gmail

1. Aprire l'estensione e scegliere la data delle email.
2. Premere **Attiva raccolta PDF**.
3. In Gmail scaricare i PDF, singolarmente o con **Scarica tutti**.
4. Per dieci minuti l'estensione instrada ogni PDF scaricato nella cartella
   `pdf` della data scelta.
5. Premere **Ferma raccolta PDF** se si termina prima.

Nota: se Gmail scarica più allegati come archivio ZIP, Chrome vede un file ZIP e
non i singoli PDF. In quel caso scaricare gli allegati PDF singolarmente.

## Manifest della giornata

Premere **Esporta manifest.json** dopo la raccolta. Il file elenca PDF e pagine
web registrati dall'estensione. Se viene esportato di nuovo, sostituisce la
versione precedente.

## Dashboard dell'archivio

Premere **Apri archivio** nel popup. La dashboard mostra per ogni data:

- quantità di articoli web e PDF;
- spazio occupato;
- elenco dei file;
- collegamento alla cartella locale;
- pulsante **Crea copione**, che prepara e copia il comando da inviare a Codex.

La dashboard legge la cronologia Download di Chrome e considera soltanto i file
salvati sotto `Copione-Engine/rassegne`.

## Impostazione Chrome consigliata

In `chrome://settings/downloads` disattivare **Chiedi dove salvare ogni file
prima di scaricarlo**, altrimenti Chrome mostrerà una finestra per ogni elemento.

## Limiti della prima versione

- La data viene scelta dall'utente: per gli articoli web rappresenta la data
  editoriale della raccolta, non necessariamente quella indicata dalla pagina.
- Non aggira paywall, login o protezioni anti-bot.
- Gmail deve avviare materialmente il download; l'estensione ne organizza la
  destinazione.
- L'indice è conservato anche nella memoria locale dell'estensione. Rimuovendo
  l'estensione si perde l'indice interno, ma non i file già scaricati.
