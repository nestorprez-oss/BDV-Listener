import { useState, useEffect } from "react";
import { getPayments, getTasa, deletePayment, getRole } from "../api.js";
import { DollarSign, Receipt, Calendar, TrendingUp, Clock, Database, Trash2 } from "lucide-react";
import PaymentCard from "../components/PaymentCard.jsx";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalToday: 0, usdToday: 0, totalAll: 0, usdAll: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasa, setTasa] = useState(null);
  const isAdmin = getRole() === "admin";

  useEffect(() => {
    async function load() {
      try {
        const data = await getPayments(1, 50);
        const payments = data.results || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalToday = 0;
        let usdToday = 0;
        let totalAll = 0;
        let usdAll = 0;

        payments.forEach((p) => {
          const montoNum = parseMontoToNumber(p.monto);
          const usdVal = p.usd ? Number(p.usd) : 0;

          totalAll += montoNum;
          usdAll += usdVal;

          const pDate = new Date(p.received_at || p.timestamp);
          if (pDate >= today) {
            totalToday += montoNum;
            usdToday += usdVal;
          }
        });

        setStats({ totalToday, usdToday, totalAll, usdAll });
        setRecent(payments.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function fetchTasa() {
      try {
        const data = await getTasa();
        if (data && typeof data.tasa === "number") {
          setTasa(data);
        }
      } catch (err) {
        console.error("Tasa fetch error:", err.message);
      }
    }
    fetchTasa();
  }, []);

  function parseMontoToNumber(montoStr) {
    if (!montoStr) return 0;
    const cleaned = montoStr.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  async function handleDelete(id) {
    try {
      await deletePayment(id);
      setRecent((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  }

  function formatMonto(monto) {
    if (!monto) return "-";
    const parts = monto.split(",");
    let entero = parts[0];
    const decimal = parts[1] || "00";
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${entero},${decimal}`;
  }

  function formatDate(ts) {
    if (!ts) return "-";
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
    <div className="space-y-4 md:space-y-6">
      {/* BCV Rate Banner */}
      {tasa && (
        <div className="bg-bg-card rounded-xl border border-border p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider mb-0.5">
                  Tasa BCV Vigente
                </div>
                <div className="text-xl md:text-2xl font-bold text-text-primary">
                  Bs {tasa.tasa.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-normal text-text-secondary ml-1">/ USD</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Clock className="w-3 h-3" />
                Actualizado: {formatDate(new Date(tasa.fecha).getTime())}
              </div>
              <span
                className={
                  "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit " +
                  (tasa.fuente === "cache"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-emerald-500/15 text-emerald-400")
                }
              >
                <Database className="w-3 h-3" />
                {tasa.fuente === "cache" ? "Cache" : "En vivo"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Receipt className="w-5 h-5 text-primary" />}
          label="Pagos hoy"
          value={`Bs ${formatMonto(stats.totalToday.toFixed(2).replace(".", ","))}`}
          sub={"Monto total recibido hoy"}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          label="USD hoy"
          value={`$ ${stats.usdToday.toFixed(2)}`}
          sub={"Equivalente en dólares"}
        />
        <StatCard
          icon={<Receipt className="w-5 h-5 text-primary" />}
          label="Total histórico (Bs)"
          value={`Bs ${formatMonto(stats.totalAll.toFixed(2).replace(".", ","))}`}
          sub={"Todos los pagos"}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          label="Total histórico (USD)"
          value={`$ ${stats.usdAll.toFixed(2)}`}
          sub={"Equivalente acumulado"}
        />
      </div>

      {/* Recent Payments */}
      <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Últimos pagos recibidos
          </h3>
        </div>

        {loading ? (
          <div className="p-6 md:p-8 text-center text-text-muted">Cargando...</div>
        ) : recent.length === 0 ? (
          <div className="p-6 md:p-8 text-center text-text-muted">
            No hay pagos registrados aún
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="md:hidden p-3 space-y-2">
              {recent.map((row) => (
                <PaymentCard key={row.id} row={row} isAdmin={isAdmin} onDelete={handleDelete} />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[280px]">
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
              {recent.map((row) => (
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
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <div className="text-xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-xs text-text-muted">{sub}</div>
    </div>
  );
}
