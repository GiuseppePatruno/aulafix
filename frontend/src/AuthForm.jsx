import { useState } from "react";
import { apiRequest } from "./api.js";

export default function AuthForm({ onAuthenticated, showMessage }) {
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
    }

    setWaiting(false);
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

        <button disabled={waiting}>
          {waiting ? "Attendi..." : isRegister ? "Registrati" : "Entra"}
        </button>
      </form>

      <button className="link-button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Vai al login" : "Crea un account"}
      </button>
    </section>
  );
}
