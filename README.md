# AulaFix

AulaFix e una semplice Single Page Application per segnalare problemi nelle aule universitarie. Usa Node.js, Express, React, MongoDB Atlas, JWT, Socket.IO e un foglio CSS scritto a mano.

Il progetto usa soltanto tecniche presenti nelle lezioni. La grafica e volutamente elementare e non usa Bootstrap, Material UI, Tailwind, animazioni o componenti grafici esterni.

## Avvio in Visual Studio Code

Servono Node.js 20 o successivo e un database MongoDB Atlas.

1. Aprire la cartella `AulaFix` con Visual Studio Code.
2. Copiare `backend/.env.example` in `backend/.env`.
3. Inserire la stringa di MongoDB Atlas in `MONGO_URI` e una frase segreta in `JWT_SECRET`.
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

6. Aprire `http://localhost:5173`.

Swagger si trova su `http://localhost:5000/api-docs`.

## Utenti dimostrativi

Il comando `npm run seed` crea questi utenti senza cancellare i dati esistenti:

| Ruolo | Email | Password |
| --- | --- | --- |
| Studente | `studente@aulafix.it` | `Studente123!` |
| Tecnico admin | `admin@aulafix.it` | `Admin123!` |

## Contenuti del progetto

| Argomento | Dove viene usato |
| --- | --- |
| Express | server, router e API REST |
| Dati in ingresso | `req.body`, `req.params` e `req.query` |
| Middleware | `express.json`, `cookieParser`, `protect`, 404 ed errori |
| Mongoose | schemi, `find`, `findOne`, `findById`, `populate` e `sort` |
| CRUD | lista, creazione, modifica ed eliminazione delle segnalazioni |
| Autenticazione | bcrypt e JWT salvato in un cookie `httpOnly` |
| React | componenti funzionali e props |
| Stato ed eventi | `useState`, `onChange`, `onClick` e `onSubmit` |
| Liste e filtri | `map`, `key` e filtri inviati alle API |
| Effetti e richieste | `useEffect`, `fetch` e `async/await` |
| Real-time | evento semplice con Socket.IO |
| CSS | un solo foglio essenziale scritto da zero |
| Documentazione | relazione, diagramma UML e Swagger |
| Deployment | Render con un semplice Dockerfile |

I file `package-lock.json` sono creati automaticamente da npm e devono rimanere nel progetto. Le cartelle `node_modules` e `dist` non devono essere inserite nel file ZIP della consegna.

## Documentazione

- `docs/RELAZIONE.md`
- `docs/Documentazione-AulaFix.pdf`
- `docs/diagramma-casi-uso.svg`
- `/api-docs` per Swagger

## Deployment con Render

Il servizio Render gia creato continua a usare il `Dockerfile` presente nella cartella principale. Dopo aver copiato questa versione nel repository, eseguire commit e push. Render avviera automaticamente un nuovo deploy.

Le variabili necessarie su Render sono:

- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
