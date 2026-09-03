function ReportCard({ report, user, onUpdate, onEdit, onDelete }) {
  const canChange = report.author?._id === user._id || user.role === "admin";

  return (
    <article>
      <h3>{report.title}</h3>
      <p>{report.description}</p>
      <p><strong>Aula:</strong> {report.room}</p>
      <p><strong>Priorita:</strong> {report.priority}</p>
      <p><strong>Autore:</strong> {report.author?.name || "Utente"}</p>

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
        <p className="actions">
          <button onClick={() => onEdit(report)}>Modifica titolo</button>
          <button className="delete-button" onClick={() => onDelete(report._id)}>Elimina</button>
        </p>
      )}
    </article>
  );
}

export default function ReportList({ reports, user, onUpdate, onEdit, onDelete }) {
  if (reports.length === 0) {
    return <p>Nessuna segnalazione trovata.</p>;
  }

  return (
    <section>
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
