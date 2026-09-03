import { useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  room: "",
  priority: "media",
};

export default function ReportForm({ onCreate }) {
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
      <form onSubmit={submit}>
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

        <label>
          Descrizione
          <textarea name="description" value={form.description} onChange={changeField} maxLength="300" required />
        </label>

        <button>Aggiungi</button>
      </form>
    </section>
  );
}
