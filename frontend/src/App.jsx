import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Richiesta non riuscita");
    error.status = response.status;
    throw error;
  }
  return data;
}

function AuthForm({ onAuthenticated, showMessage }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [waiting, setWaiting] = useState(false);

  function changeField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setWaiting(true);

    try {
      const path = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? form
        : { email: form.email, password: form.password };
      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      onAuthenticated(data.user);
      showMessage("Accesso effettuato");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <section className="panel auth-panel">
      <h2>{isRegister ? "Registrazione" : "Login"}</h2>
      <form onSubmit={submit}>
        {isRegister && (
          <label>
            Nome
            <input name="name" value={form.name} onChange={changeField} required />
          </label>
        )}
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={changeField} required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            minLength="8"
            value={form.password}
            onChange={changeField}
            required
          />
        </label>
        <button disabled={waiting}>{waiting ? "Attendi..." : isRegister ? "Registrati" : "Entra"}</button>
      </form>
      <button className="link-button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Hai gia un account? Accedi" : "Non hai un account? Registrati"}
      </button>
    </section>
  );
}

function ReportForm({ onCreate }) {
  const emptyForm = {
    title: "",
    description: "",
    room: "",
    priority: "media",
  };
  const [form, setForm] = useState(emptyForm);

  function changeField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    const created = await onCreate(form);
    if (created) setForm(emptyForm);
  }

  return (
    <section className="panel">
      <h2>Nuova segnalazione</h2>
      <form onSubmit={submit} className="form-grid">
        <label>
          Titolo
          <input name="title" value={form.title} onChange={changeField} maxLength="80" required />
        </label>
        <label>
          Aula
          <input name="room" value={form.room} onChange={changeField} maxLength="30" required />
        </label>
        <label>
          Priorita
          <select name="priority" value={form.priority} onChange={changeField}>
            <option value="bassa">Bassa</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>
        <label className="wide">
          Descrizione
          <textarea name="description" value={form.description} onChange={changeField} maxLength="300" required />
        </label>
        <button className="wide">Aggiungi alla bacheca</button>
      </form>
    </section>
  );
}

function Filters({ search, status, priority, onSearch, onStatus, onPriority }) {
  return (
    <section className="panel filters">
      <h2>Filtri</h2>
      <label>
        Cerca titolo o aula
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="es. proiettore" />
      </label>
      <label>
        Stato
        <select value={status} onChange={(event) => onStatus(event.target.value)}>
          <option value="">Tutti</option>
          <option value="aperta">Aperta</option>
          <option value="in-lavorazione">In lavorazione</option>
          <option value="risolta">Risolta</option>
        </select>
      </label>
      <label>
        Priorita
        <select value={priority} onChange={(event) => onPriority(event.target.value)}>
          <option value="">Tutte</option>
          <option value="bassa">Bassa</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </label>
    </section>
  );
}

function Stats({ stats }) {
  return (
    <section className="stats" aria-label="Riepilogo segnalazioni">
      <div><strong>{stats.aperta}</strong><span>Aperte</span></div>
      <div><strong>{stats["in-lavorazione"]}</strong><span>In lavorazione</span></div>
      <div><strong>{stats.risolta}</strong><span>Risolte</span></div>
    </section>
  );
}

function ReportCard({ report, user, onUpdate, onEdit, onDelete }) {
  const canChange = report.author?._id === user._id || user.role === "admin";

  return (
    <article className="report-card">
      <div className="report-top">
        <h3>{report.title}</h3>
        <span className={`priority ${report.priority}`}>{report.priority}</span>
      </div>
      <p>{report.description}</p>
      <p className="details">
        <strong>{report.room}</strong> - inserita da {report.author?.name || "Utente"}
      </p>
      <p className="date">{new Date(report.createdAt).toLocaleString("it-IT")}</p>
      <div className="report-actions">
        <label>
          Stato
          <select
            value={report.status}
            disabled={!canChange}
            onChange={(event) => onUpdate(report._id, { status: event.target.value })}
          >
            <option value="aperta">Aperta</option>
            <option value="in-lavorazione">In lavorazione</option>
            <option value="risolta">Risolta</option>
          </select>
        </label>
        {canChange && (
          <>
            <button className="secondary" onClick={() => onEdit(report)}>Modifica</button>
            <button className="danger" onClick={() => onDelete(report._id)}>Elimina</button>
          </>
        )}
      </div>
    </article>
  );
}

function ReportList({ reports, user, onUpdate, onEdit, onDelete }) {
  if (reports.length === 0) return <p className="empty">Nessuna segnalazione trovata.</p>;

  return (
    <section className="report-list">
      {reports.map((report) => (
        <ReportCard
          key={report._id}
          report={report}
          user={user}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ aperta: 0, "in-lavorazione": 0, risolta: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  async function loadBoard() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      const query = params.toString() ? `?${params.toString()}` : "";
      const [reportData, statsData] = await Promise.all([
        apiRequest(`/api/reports${query}`),
        apiRequest("/api/reports/stats"),
      ]);
      setReports(reportData.reports);
      setStats(statsData.stats);
    } catch (error) {
      setMessage(error.message);
      if (error.status === 401) setUser(null);
    }
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const data = await apiRequest("/api/auth/me");
        setUser(data.user);
      } catch (error) {
        if (error.status !== 401) setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Il timer evita una richiesta a ogni singolo tasto digitato nel filtro.
  useEffect(() => {
    if (!user) return undefined;
    const timer = setTimeout(loadBoard, 250);
    return () => clearTimeout(timer);
  }, [user, search, status, priority, refreshKey]);

  // Socket.IO avvisa il client; il client rilegge i dati aggiornati dal database.
  useEffect(() => {
    if (!user) return undefined;
    const socket = io(API_URL || window.location.origin, { withCredentials: true });
    socket.on("report:changed", () => setRefreshKey((value) => value + 1));
    socket.on("connect_error", () => setMessage("Aggiornamenti real-time non disponibili"));
    return () => socket.disconnect();
  }, [user]);

  async function createReport(form) {
    try {
      await apiRequest("/api/reports", { method: "POST", body: JSON.stringify(form) });
      setMessage("Segnalazione creata");
      setRefreshKey((value) => value + 1);
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  }

  async function updateReport(id, changes) {
    try {
      await apiRequest(`/api/reports/${id}`, { method: "PUT", body: JSON.stringify(changes) });
      setMessage("Segnalazione aggiornata");
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editReport(report) {
    const newTitle = window.prompt("Nuovo titolo", report.title);
    if (newTitle && newTitle.trim()) updateReport(report._id, { title: newTitle.trim() });
  }

  async function deleteReport(id) {
    if (!window.confirm("Vuoi eliminare questa segnalazione?")) return;
    try {
      await apiRequest(`/api/reports/${id}`, { method: "DELETE" });
      setMessage("Segnalazione eliminata");
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      setReports([]);
      setMessage("Logout effettuato");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <header>
        <div>
          <h1>AulaFix</h1>
          <p>Bacheca semplice per i problemi delle aule</p>
        </div>
        {user && (
          <div className="user-box">
            <span>{user.name} ({user.role})</span>
            <button onClick={logout}>Esci</button>
          </div>
        )}
      </header>

      <main>
        {message && <p className="message" onClick={() => setMessage("")}>{message}</p>}
        {loading ? (
          <p>Caricamento...</p>
        ) : !user ? (
          <AuthForm onAuthenticated={setUser} showMessage={setMessage} />
        ) : (
          <>
            <Stats stats={stats} />
            <ReportForm onCreate={createReport} />
            <Filters
              search={search}
              status={status}
              priority={priority}
              onSearch={setSearch}
              onStatus={setStatus}
              onPriority={setPriority}
            />
            <h2 className="board-title">Bacheca segnalazioni</h2>
            <ReportList
              reports={reports}
              user={user}
              onUpdate={updateReport}
              onEdit={editReport}
              onDelete={deleteReport}
            />
          </>
        )}
      </main>
    </>
  );
}
