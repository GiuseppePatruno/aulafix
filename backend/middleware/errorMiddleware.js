export function notFound(req, res) {
  res.status(404).json({ message: "Risorsa non trovata" });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Dati non validi" });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Identificativo non valido" });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Questo valore esiste gia" });
  }

  res.status(500).json({ message: "Errore interno del server" });
}
