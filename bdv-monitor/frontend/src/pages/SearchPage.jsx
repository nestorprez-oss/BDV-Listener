import { useState } from "react";
import { searchPago, deletePayment, getRole } from "../api.js";
import { Search, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import PaymentCard from "../components/PaymentCard.jsx";

export default function SearchPage() {
  const [monto, setMonto] = useState("");
  const [ref, setRef] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const isAdmin = getRole() === "admin";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!monto.trim() && !ref.trim()) {
      setError("Ingresa monto o referencia para buscar");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const data = await searchPago(monto.trim(), ref.trim());
      setResults(data.results || []);
      if (data.results.length === 0) {
        setError("Pago no encontrado");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePayment(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError("Error al eliminar el pago");
    }
  }

  function formatMonto(monto) {
    if (!monto) return "";
    const parts = monto.split(",");
    let entero = parts[0];
    const decimal = parts[1] || "00";
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${entero},${decimal}`;
  }

  function formatDate(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      {/* Search Form */}
      <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Buscar pago
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Monto
              </label>
              <input
                type="text"
                placeholder="Ej: 1025,00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-input border border-border-input rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Referencia (completa o últimos 4-6 dígitos)
              </label>
              <input
                type="text"
                placeholder="Ej: 312438232670"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-input border border-border-input rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? "Buscando..." : "Buscar Pago"}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && searched && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {results.length} pago{results.length > 1 ? "s" : ""} encontrado
              {results.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden p-3 space-y-2">
            {results.map((row) => (
              <PaymentCard key={row.id} row={row} isAdmin={isAdmin} onDelete={handleDelete} />
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    USD
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Fecha
                  </th>
                  {isAdmin && (
                    <th className="px-3 md:px-6 py-2 md:py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider w-16">
                      Acc.
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-b-0 hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-3 md:px-6 py-2 md:py-3 text-sm font-medium text-primary">
                      Bs {formatMonto(row.monto)}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-sm text-emerald-400">
                      {row.usd ? `$ ${Number(row.usd).toFixed(2)}` : "-"}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-sm font-mono text-text-secondary">
                      {row.referencia}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm text-text-muted whitespace-nowrap">
                      {row.received_at
                        ? formatDate(new Date(row.received_at).getTime())
                        : formatDate(row.timestamp)}
                    </td>
                    {isAdmin && (
                      <td className="px-3 md:px-6 py-2 md:py-3 text-center">
                        <button
                          onClick={async () => {
                            if (window.confirm("¿Eliminar este pago de forma permanente?")) {
                              await handleDelete(row.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
