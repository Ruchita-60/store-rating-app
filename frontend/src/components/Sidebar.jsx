import React from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  Star,
  ShoppingBag,
  History,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, onSelectTab, isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'stores', label: 'Stores Directory', icon: Store },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'ratings', label: 'Store Ratings Log', icon: Star },
        ];
      case 'store_owner':
        return [
          { id: 'store_overview', label: 'Store Performance', icon: Store },
          { id: 'customer_ratings', label: 'Customer Ratings', icon: Star },
        ];
      case 'user':
      default:
        return [
          { id: 'explore_stores', label: 'Explore Stores', icon: Store },
          { id: 'my_ratings', label: 'My Ratings History', icon: History },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 z-30 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User brief card */}
          <div className="p-3.5 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-100 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Navigation section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Menu Navigation
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Store Rating App v1.0 • JWT Auth</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
