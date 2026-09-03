export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Richiesta non riuscita");
    error.status = response.status;
    throw error;
  }

  return data;
}
