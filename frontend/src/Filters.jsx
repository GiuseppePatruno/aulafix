export default function Filters({ search, status, priority, onSearch, onStatus, onPriority }) {
  return (
    <section className="panel">
      <h2>Filtri</h2>

      <label>
        Cerca titolo o aula
        <input value={search} onChange={(event) => onSearch(event.target.value)} />
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
