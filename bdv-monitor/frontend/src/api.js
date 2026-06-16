const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem("bdv_user") || "null");
  if (!user) return {};
  return { Authorization: "Basic " + btoa(`${user.username}:${user.password}`) };
}

export async function searchPago(monto, ref) {
  const params = new URLSearchParams();
  if (monto) params.set("monto", monto);
  if (ref) params.set("ref", ref);

  const res = await fetch(`${API_BASE}/search?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al buscar");
  return res.json();
}

export async function getPayments(page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${API_BASE}/payments?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al cargar pagos");
  return res.json();
}

export async function getTasa() {
  const res = await fetch(`${API_BASE}/tasa`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener tasa");
  return res.json();
}

export async function deletePayment(id) {
  const res = await fetch(`${API_BASE}/payments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar");
  return res.json();
}

const VALID_USERS = {
  admin:    { password: "Lucas1812*", role: "admin" },
  operador: { password: "Op3raD0r*25", role: "operador" },
};

export function login(username, password) {
  const user = VALID_USERS[username];
  if (user && password === user.password) {
    localStorage.setItem("bdv_user", JSON.stringify({ username, password, role: user.role }));
    return true;
  }
  return false;
}

export function getRole() {
  const user = JSON.parse(localStorage.getItem("bdv_user") || "null");
  return user?.role || null;
}

export function logout() {
  localStorage.removeItem("bdv_user");
}

export function isLoggedIn() {
  return !!localStorage.getItem("bdv_user");
}
