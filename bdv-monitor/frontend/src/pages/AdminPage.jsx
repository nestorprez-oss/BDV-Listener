import { useState, useEffect } from "react";
import { getPayments, deletePayment } from "../api.js";
import { ChevronLeft, ChevronRight, Shield, AlertCircle, Trash2 } from "lucide-react";
import PaymentCard from "../components/PaymentCard.jsx";

export default function AdminPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPayments(page, limit);
  }, [page, limit]);

  async function loadPayments(p, l) {
    setLoading(true);
    setError("");
    try {
      const data = await getPayments(p, l);
      setPayments(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError("Error al cargar pagos");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePayment(id);
      loadPayments(page, limit);
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
    <div className="space-y-3 md:space-y-4">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base md:text-lg font-semibold text-text-primary">
            Todos los pagos
          </h3>
          <span className="text-xs text-text-muted bg-bg-input px-2 py-0.5 rounded-full">
            {total} total
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <label className="text-xs md:text-sm text-text-secondary flex items-center gap-1 md:gap-2">
            Mostrar
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-bg-input border border-border-input rounded-lg px-2 py-1 text-xs md:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-border-input text-text-secondary hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs md:text-sm text-text-secondary px-1 md:px-2 whitespace-nowrap">
              Pág. {page}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-border-input text-text-secondary hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 md:p-8 text-center text-text-muted">Cargando pagos...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 md:p-8 text-center text-text-muted">
            No hay pagos registrados
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="md:hidden p-3 space-y-2">
              {payments.map((row) => (
                <PaymentCard key={row.id} row={row} isAdmin={true} onDelete={handleDelete} />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[280px]">
              <thead>
                <tr className="border-b border-border bg-bg-base">
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Monto (Bs)
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
                  <th className="px-3 md:px-6 py-2 md:py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider w-16">
                    Acc.
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
