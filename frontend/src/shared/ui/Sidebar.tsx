import { NavLink } from 'react-router';
import { CalendarDays, ListTodo, RotateCcw, BarChart3, Settings } from 'lucide-react';
import { SyncIndicator } from './SyncIndicator';

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className = '' }: SidebarProps) {
  const navItems = [
    { to: '/today', icon: CalendarDays, label: 'Today' },
    { to: '/queue', icon: ListTodo, label: 'Upsolve Queue' },
    { to: '/reviews', icon: RotateCcw, label: 'Reviews' },
    { to: '/insights', icon: BarChart3, label: 'Insights' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Brand - Desktop Only (Mobile shows it in the top bar) */}
      <div className="hidden md:block p-6 mb-2">
        <span className="font-mono text-lg font-semibold text-[#35634E] lowercase">upsolve</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto md:pt-0 pt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-md text-sm transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#EBF5F0] text-[#35634E] font-medium'
                    : 'text-[#6B7280] hover:bg-[#F0EFEB] hover:text-[#242824]'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto">
        <SyncIndicator />
      </div>
    </div>
  );
}
