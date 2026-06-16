import { Menu } from "lucide-react";

export default function Header({ title, onMenuToggle }) {
  return (
    <header className="h-16 bg-bg-card border-b border-border flex items-center px-4 md:px-6 sticky top-0 z-30 gap-3">
      <button
        onClick={onMenuToggle}
        className="md:hidden text-text-secondary hover:text-text-primary cursor-pointer p-1"
      >
        <Menu size={22} />
      </button>
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
    </header>
  );
}
