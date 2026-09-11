import { Outlet } from 'react-router';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/shared/ui/Sidebar';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-[#F6F5F1] overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-[#E5E2DB] p-4 fixed top-0 left-0 right-0 z-20 h-16">
        <span className="font-mono text-lg font-semibold text-[#35634E] lowercase">upsolve</span>
        <button onClick={toggleMobileMenu} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={24} className="text-[#242824]" /> : <Menu size={24} className="text-[#242824]" />}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[220px] bg-white border-r border-[#E5E2DB] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative flex flex-col ${
          mobileMenuOpen ? 'translate-x-0 mt-16 md:mt-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={closeMobileMenu} />
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden mt-16"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 flex flex-col">
        <DemoBanner />
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
import { useAuth } from '@/features/auth/useAuth';

function DemoBanner() {
  const { isDemoMode } = useAuth();
  if (!isDemoMode) return null;

  return (
    <div className="bg-[#FEF3C7] border-b border-[#D97706] px-4 py-2 text-center text-sm font-medium text-[#D97706]">
      Viewing Demo Mode. Modifications are disabled.
    </div>
  );
}
