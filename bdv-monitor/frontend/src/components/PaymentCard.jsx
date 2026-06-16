import { Trash2 } from "lucide-react";

export default function PaymentCard({ row, isAdmin, onDelete }) {
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

  function handleDelete() {
    if (window.confirm("¿Eliminar este pago de forma permanente?")) {
      onDelete(row.id);
    }
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 space-y-2 hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-primary">
          Bs {formatMonto(row.monto)}
        </span>
        <span className="text-base font-semibold text-emerald-400">
          {row.usd ? `$ ${Number(row.usd).toFixed(2)}` : "-"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-text-secondary">
          Ref: {row.referencia}
        </span>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 cursor-pointer p-1"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="text-xs text-text-muted">
        {row.received_at
          ? formatDate(new Date(row.received_at).getTime())
          : formatDate(row.timestamp)}
      </div>
    </div>
  );
}
