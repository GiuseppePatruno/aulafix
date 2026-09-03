import { after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, io } from "../server.js";

after(() => io.close());

test("GET /api/health risponde senza usare il database", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("le rotte delle segnalazioni richiedono il login", async () => {
  const response = await request(app).get("/api/reports");
  assert.equal(response.status, 401);
});

test("la registrazione controlla i dati in ingresso", async () => {
  const response = await request(app).post("/api/auth/register").send({ email: "vuota@email.it" });
  assert.equal(response.status, 400);
  assert.equal(response.body.message, "Compila tutti i campi");
});

test("una rotta API inesistente restituisce 404", async () => {
  const response = await request(app).get("/api/inesistente");
  assert.equal(response.status, 404);
});
