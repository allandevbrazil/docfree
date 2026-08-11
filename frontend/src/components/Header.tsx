import { Icon } from "./Icon";

export type PageKey = "dashboard" | "clients" | "quotes";

interface HeaderProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const NAV_LINKS: { key: PageKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "quotes", label: "Orçamentos" },
  { key: "clients", label: "Clientes" },
];

export function Header({ activePage, onNavigate }: HeaderProps) {
  return (
    <header className="w-full bg-surface-container-lowest border-b border-outline-variant py-md px-margin-mobile md:px-margin-desktop sticky top-0 z-50 shadow-sm">
      <div className="max-w-max-width mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            DocuPrático
          </span>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex gap-lg font-body-md text-body-md">
          {NAV_LINKS.map((link) =>
            activePage === link.key ? (
              <a
                key={link.key}
                className="text-primary font-bold border-b-2 border-primary pb-1"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.key);
                }}
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.key}
                className="text-secondary hover:text-primary hover:bg-surface-container transition-colors rounded-DEFAULT px-2 py-1"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.key);
                }}
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => onNavigate("quotes")}
            className="bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-DEFAULT hover:opacity-90 transition-opacity font-medium shadow-sm flex items-center gap-xs text-white"
          >
            <Icon name="add" size={18} />
            NOVO ORÇAMENTO
          </button>
        </div>
      </div>
    </header>
  );
}