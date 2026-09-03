import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiRequest } from "./api.js";
import AuthForm from "./AuthForm.jsx";
import Filters from "./Filters.jsx";
import ReportForm from "./ReportForm.jsx";
import ReportList from "./ReportList.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiRequest(`/api/reports${query}`);
      setReports(data.reports);
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
      }
      setLoading(false);
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (user) loadReports();
  }, [user, search, status, priority]);

  useEffect(() => {
    if (!user) return;

    const socket = io();
    socket.on("report:changed", loadReports);

    return () => socket.disconnect();
  }, [user, search, status, priority]);

  async function createReport(form) {
    try {
      await apiRequest("/api/reports", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Segnalazione creata");
      loadReports();
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  }

  async function updateReport(id, changes) {
    try {
      await apiRequest(`/api/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify(changes),
      });
      setMessage("Segnalazione aggiornata");
      loadReports();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editReport(report) {
    const newTitle = window.prompt("Nuovo titolo", report.title);
    if (newTitle && newTitle.trim()) {
      updateReport(report._id, { title: newTitle.trim() });
    }
  }

  async function deleteReport(id) {
    if (!window.confirm("Vuoi eliminare questa segnalazione?")) return;

    try {
      await apiRequest(`/api/reports/${id}`, { method: "DELETE" });
      setMessage("Segnalazione eliminata");
      loadReports();
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
        <h1>AulaFix</h1>
        <p>Bacheca per i problemi delle aule</p>
        {user && (
          <p>
            {user.name} ({user.role}) <button onClick={logout}>Esci</button>
          </p>
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
            <ReportForm onCreate={createReport} />
            <Filters
              search={search}
              status={status}
              priority={priority}
              onSearch={setSearch}
              onStatus={setStatus}
              onPriority={setPriority}
            />
            <h2>Segnalazioni</h2>
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
