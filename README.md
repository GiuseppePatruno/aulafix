# AulaFix

AulaFix e una Single Page Application elementare per segnalare problemi nelle aule universitarie. Il progetto usa Node.js, Express, React, MongoDB Atlas, JWT, Socket.IO e CSS scritto da zero.

Il codice e volutamente semplice e diviso soltanto dove serve a mostrare model, controller, router e middleware.

## Avvio in Visual Studio Code

Servono Node.js 20 o successivo e un database gratuito MongoDB Atlas.

1. Aprire la cartella `AulaFix` con Visual Studio Code.
2. Copiare `backend/.env.example` in `backend/.env`.
3. Inserire in `MONGO_URI` la stringa di connessione di MongoDB Atlas e scegliere un valore lungo per `JWT_SECRET`.
4. Aprire un terminale nella cartella `backend` ed eseguire:

```bash
npm install
npm run seed
npm run dev
```

5. Aprire un secondo terminale nella cartella `frontend` ed eseguire:

```bash
npm install
npm run dev
```

6. Aprire `http://localhost:5173`. Swagger si trova su `http://localhost:5000/api-docs`.

Il seed non cancella dati esistenti e crea questi utenti dimostrativi:

| Ruolo | Email | Password |
| --- | --- | --- |
| Studente | `studente@aulafix.it` | `Studente123!` |
| Tecnico admin | `admin@aulafix.it` | `Admin123!` |

## Comandi di controllo

Nel backend:

```bash
npm test
```

Nel frontend:

```bash
npm run build
```

## Cosa dimostra il progetto

| Richiesta | Implementazione |
| --- | --- |
| API Express | Router REST e controller CRUD per le segnalazioni |
| Dati in ingresso | `req.body`, `req.params` e `req.query` |
| Middleware | logger, autenticazione, rate limit, 404 e gestione errori |
| Query Mongoose | `find`, `findOne`, `findById`, `populate`, `sort`, `aggregate` |
| Autenticazione | bcrypt, JWT in cookie httpOnly, sessione, permessi proprietario/admin |
| React | componenti e props nello stesso `App.jsx` per ridurre i file |
| Stato ed eventi | `useState`, form controllati, click, change e submit |
| Lista modificabile | creazione, modifica, cambio stato ed eliminazione |
| Filtri | ricerca testuale, stato e priorita inviati alle API |
| Effetti e fetch | controllo sessione, caricamento dati e debounce con `useEffect` |
| Real-time | Socket.IO autenticato e aggiornamento della bacheca |
| CSS | un solo foglio from scratch, semplice e responsive |
| Tecnica avanzata | container Docker multi-stage, health check e rate limiting |
| Deployment | configurazione `render.yaml` pronta per un servizio Docker |
| Documentazione | relazione, UML e Swagger interattivo |

## Documentazione

- La relazione completa e in `docs/RELAZIONE.md` e `docs/Documentazione-AulaFix.pdf`.
- Il diagramma UML dei casi d'uso e in `docs/diagramma-casi-uso.svg`.
- La documentazione interattiva delle API e disponibile alla rotta `/api-docs` quando il backend e avviato.

## Deployment con Render

1. Pubblicare questa cartella in un proprio repository GitHub.
2. In Render scegliere **New > Blueprint** e collegare il repository: verra letto `render.yaml`.
3. Inserire la variabile segreta `MONGO_URI`; `JWT_SECRET` viene generata automaticamente.
4. Inserire l'URL pubblico del servizio in `CLIENT_URL` solo se frontend e backend vengono separati. Con il Dockerfile fornito non serve, perche Express serve la build React.
5. Eseguire una volta il seed usando la stessa `MONGO_URI` di Atlas.

La presenza del file di configurazione prepara il deployment; per ottenere il relativo punto della griglia il servizio deve essere realmente pubblicato nell'account dello studente e mostrato durante la demo.
