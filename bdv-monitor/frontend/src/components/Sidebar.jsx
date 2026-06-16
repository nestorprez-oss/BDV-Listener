import { Search, LayoutDashboard, Shield, LogOut, X } from "lucide-react";

export default function Sidebar({ activePage, onNavigate, onLogout, isOpen, onClose, role }) {
  const allItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
    { id: "search", label: "Consulta", icon: Search, roles: ["admin", "operador"] },
    { id: "admin", label: "Panel Admin", icon: Shield, roles: ["admin"] },
  ];

  const items = allItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={
          "w-64 h-screen bg-bg-sidebar border-r border-border flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 " +
          "hidden md:flex " +
          (isOpen ? "translate-x-0 !flex" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="inline-block w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-extrabold text-sm">
              B
            </span>
            BDV Monitor
          </h1>
          <button
            onClick={onClose}
            className="md:hidden text-text-muted hover:text-text-primary cursor-pointer p-1"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer " +
                  (isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary")
                }
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
