const reportSchema = {
  type: "object",
  properties: {
    _id: { type: "string", example: "66d04d35f1c123456789abcd" },
    title: { type: "string", example: "Proiettore non funzionante" },
    description: { type: "string", example: "Il proiettore non si accende" },
    room: { type: "string", example: "Aula A3" },
    priority: { type: "string", enum: ["bassa", "media", "alta"] },
    status: { type: "string", enum: ["aperta", "in-lavorazione", "risolta"] },
    author: {
      type: "object",
      properties: {
        _id: { type: "string" },
        name: { type: "string", example: "Mario Rossi" },
        role: { type: "string", enum: ["student", "admin"] },
      },
    },
  },
};

const errorResponse = {
  description: "Errore",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
};

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "AulaFix API",
    version: "1.0.0",
    description: "API REST per autenticazione e gestione delle segnalazioni nelle aule.",
  },
  servers: [{ url: "/", description: "Server corrente" }],
  tags: [
    { name: "Autenticazione" },
    { name: "Segnalazioni" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "Cookie JWT httpOnly creato dal login",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "Mario Rossi" },
          email: { type: "string", example: "mario@email.it" },
          role: { type: "string", enum: ["student", "admin"] },
        },
      },
      Report: reportSchema,
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Autenticazione"],
        summary: "Registra uno studente e apre la sessione",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Mario Rossi" },
                  email: { type: "string", example: "mario@email.it" },
                  password: { type: "string", minLength: 8, example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Utente registrato",
            content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } },
          },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Autenticazione"],
        summary: "Effettua il login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "studente@aulafix.it" },
                  password: { type: "string", example: "Studente123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login riuscito" },
          401: errorResponse,
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Autenticazione"],
        summary: "Chiude la sessione",
        responses: { 200: { description: "Logout riuscito" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Autenticazione"],
        summary: "Restituisce l'utente della sessione",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Utente autenticato",
            content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } },
          },
          401: errorResponse,
        },
      },
    },
    "/api/reports": {
      get: {
        tags: ["Segnalazioni"],
        summary: "Elenca e filtra le segnalazioni",
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: "query", name: "search", schema: { type: "string" }, description: "Cerca nel titolo o nell'aula" },
          { in: "query", name: "status", schema: { type: "string", enum: ["aperta", "in-lavorazione", "risolta"] } },
          { in: "query", name: "priority", schema: { type: "string", enum: ["bassa", "media", "alta"] } },
        ],
        responses: {
          200: {
            description: "Lista ordinata dalla piu recente",
            content: { "application/json": { schema: { type: "object", properties: { reports: { type: "array", items: { $ref: "#/components/schemas/Report" } } } } } },
          },
          401: errorResponse,
        },
      },
      post: {
        tags: ["Segnalazioni"],
        summary: "Crea una segnalazione",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "room"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  room: { type: "string" },
                  priority: { type: "string", enum: ["bassa", "media", "alta"] },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Segnalazione creata" }, 400: errorResponse, 401: errorResponse },
      },
    },
    "/api/reports/{id}": {
      put: {
        tags: ["Segnalazioni"],
        summary: "Modifica una segnalazione propria; l'admin puo modificarle tutte",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Report" } } },
        },
        responses: { 200: { description: "Segnalazione modificata" }, 403: errorResponse, 404: errorResponse },
      },
      delete: {
        tags: ["Segnalazioni"],
        summary: "Elimina una segnalazione propria; l'admin puo eliminarle tutte",
        security: [{ cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Segnalazione eliminata" }, 403: errorResponse, 404: errorResponse },
      },
    },
  },
};
