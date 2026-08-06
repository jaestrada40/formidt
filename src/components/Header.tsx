import React from 'react';
import { ShieldCheck, FileText, LayoutDashboard, LogOut, UserCog } from 'lucide-react';
import { PortalTab } from '../types';

interface HeaderProps {
  currentTab: PortalTab;
  onSelectTab: (tab: PortalTab) => void;
  isAdminAuthenticated: boolean;
  adminEmail?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAdminAuthenticated,
  adminEmail,
  onLogout,
}) => {
  return (
    <header className="bg-[#ffffff] border-b border-[#c3c6d7]/50 sticky top-0 z-30 shadow-xs">
      {/* Mobile Top Header */}
      <div className="flex lg:hidden justify-between items-center w-full px-4 py-3">
        <span className="text-[18px] font-semibold text-[#004ac6] font-['Work_Sans']">
          Enrollment Portal
        </span>
        <button
          onClick={() => onSelectTab(currentTab === 'form' ? 'admin' : 'form')}
          className="p-1.5 text-[#434655] hover:bg-[#eef4ff] rounded-lg"
          title={currentTab === 'form' ? 'Panel administrador' : 'Formulario'}
        >
          <UserCog className="w-6 h-6 text-[#004ac6]" />
        </button>
      </div>

      {/* Desktop Top Header */}
      <div className="hidden lg:flex justify-between items-center w-full px-8 py-3 max-w-6xl mx-auto">
        <nav className="flex items-center gap-1 bg-[#f8f9ff] p-1 rounded-lg border border-[#c3c6d7]/40">
          <button
            onClick={() => onSelectTab('form')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentTab === 'form'
                ? 'bg-white text-[#004ac6] shadow-xs font-semibold'
                : 'text-[#434655] hover:text-[#121c28] hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Merchant Application</span>
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentTab === 'admin'
                ? 'bg-white text-[#004ac6] shadow-xs font-semibold'
                : 'text-[#434655] hover:text-[#121c28] hover:bg-white/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {isAdminAuthenticated && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-[#434655] bg-[#eef4ff] px-3 py-1 rounded-full border border-[#c3c6d7]/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#004ac6]" />
                <span>{adminEmail}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs text-[#434655] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
