"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ArchiveFile = {
  key: string;
  date: string;
  category: "pdf" | "testi" | "web" | "copioni";
  name: string;
  size: number;
  uploaded: string;
  url: string;
};

const formatBytes = (value: number) => {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const level = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** level).toFixed(level ? 1 : 0)} ${units[level]}`;
};

const italianDate = (value: string) => new Intl.DateTimeFormat("it-IT", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
}).format(new Date(`${value}T12:00:00`));

const currentLocalDate = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 10);
};

export default function Home() {
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingWeb, setSavingWeb] = useState(false);
  const [collectionDate, setCollectionDate] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/archive", { cache: "no-store" });
      if (!response.ok) throw new Error("Archivio non disponibile");
      const data = await response.json() as { files: ArchiveFile[] };
      setFiles(data.files);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore di collegamento");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCollectionDate(currentLocalDate());
    void refresh();
  }, [refresh]);

  const days = useMemo(() => {
    const grouped = new Map<string, ArchiveFile[]>();
    files.forEach((file) => grouped.set(file.date, [...(grouped.get(file.date) ?? []), file]));
    return [...grouped.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [files]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setUploading(true);
    setMessage("Caricamento in corso…");
    try {
      const response = await fetch("/api/files", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error(await response.text() || "Caricamento non riuscito");
      form.reset();
      setMessage("Documento aggiunto all’archivio.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Caricamento non riuscito");
    } finally {
      setUploading(false);
    }
  }

  async function saveWebArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSavingWeb(true);
    setMessage("Raccolta dell’articolo in corso…");
    try {
      const response = await fetch("/api/web", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error(await response.text() || "Articolo non acquisito");
      form.reset();
      setMessage("Articolo web aggiunto alla raccolta.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Articolo non acquisito");
    } finally {
      setSavingWeb(false);
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <main>
      <header className="hero">
        <div className="brand"><span>02</span> COPIONE ENGINE</div>
        <p className="kicker">Archivio mobile</p>
        <h1>I materiali della trasmissione, sempre con te.</h1>
        <p className="intro">Apri raccolte e copioni dal telefono. I PDF e gli HTML finali sono pronti per la stampa direttamente dal browser.</p>
        <button className="refresh" onClick={() => void refresh()} disabled={loading}>{loading ? "Aggiornamento…" : "Aggiorna archivio"}</button>
      </header>

      <section className="metrics" aria-label="Consistenza archivio">
        <div><strong>{days.length}</strong><span>giornate</span></div>
        <div><strong>{files.filter((f) => f.category === "web").length}</strong><span>articoli</span></div>
        <div><strong>{files.filter((f) => f.category === "pdf").length}</strong><span>PDF</span></div>
        <div><strong>{files.filter((f) => f.category === "testi").length}</strong><span>testi OCR</span></div>
        <div><strong>{files.filter((f) => f.category === "copioni").length}</strong><span>copioni</span></div>
        <div><strong>{formatBytes(totalSize)}</strong><span>spazio</span></div>
      </section>

      <section className="upload-card">
        <div><p className="section-label">Aggiungi</p><h2>Carica un documento</h2><p>Puoi scegliere un PDF, un HTML o un articolo salvato sul telefono.</p></div>
        <form onSubmit={upload}>
          <label>Data della raccolta<input name="date" type="date" value={collectionDate} onChange={(event) => setCollectionDate(event.target.value)} required /></label>
          <label>Tipo<select name="category" defaultValue="copioni"><option value="copioni">Copione finale</option><option value="pdf">PDF rassegna</option><option value="testi">Testo OCR</option><option value="web">Articolo web</option></select></label>
          <label className="file-picker">Scegli il documento<input name="file" type="file" accept=".pdf,.html,.htm,.md,.txt" required /></label>
          <button disabled={uploading}>{uploading ? "Caricamento…" : "Carica nell’archivio"}</button>
        </form>
        {message && <p className="status" role="status">{message}</p>}
      </section>

      <section className="upload-card web-card">
        <div><p className="section-label">Dal web</p><h2>Salva un articolo</h2><p>Incolla il collegamento: il portale conserva il testo dell’articolo senza immagini, didascalie o richiami grafici.</p></div>
        <form onSubmit={saveWebArticle}>
          <label>Data della raccolta<input name="date" type="date" value={collectionDate} onChange={(event) => setCollectionDate(event.target.value)} required /></label>
          <label className="url-field">Indirizzo della pagina<input name="url" type="url" inputMode="url" placeholder="https://…" required /></label>
          <button disabled={savingWeb}>{savingWeb ? "Raccolta…" : "Salva articolo web"}</button>
        </form>
      </section>

      <section className="archive">
        <div className="section-heading"><div><p className="section-label">Raccolte</p><h2>Archivio per data</h2></div></div>
        {!loading && !days.length && <div className="empty"><strong>L’archivio online è pronto.</strong><span>Carica il primo PDF o HTML per renderlo disponibile anche sul cellulare.</span></div>}
        {days.map(([date, dayFiles]) => (
          <article className="day" key={date}>
            <div className="day-title"><div><h3>{italianDate(date)}</h3><p>{dayFiles.length} documenti · {formatBytes(dayFiles.reduce((sum, f) => sum + f.size, 0))}</p></div><span>{dayFiles.filter((f) => f.category === "copioni").length} copioni</span></div>
            <div className="file-list">
              {dayFiles.map((file) => <a className="file" href={file.url} target="_blank" rel="noreferrer" key={file.key}><span className={`badge ${file.category}`}>{file.category === "copioni" ? "COPIONE" : file.category === "testi" ? "TESTO OCR" : file.category.toUpperCase()}</span><span className="file-name"><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></span><span className="open">Apri</span></a>)}
            </div>
          </article>
        ))}
      </section>

      <footer><strong>Copione Engine</strong><span>Dal telefono: apri il documento e usa Condividi → Stampa.</span></footer>
    </main>
  );
}
