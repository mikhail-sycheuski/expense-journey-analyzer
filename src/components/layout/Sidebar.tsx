
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BarChart3, 
  Receipt, 
  PieChart, 
  Wallet, 
  Upload, 
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors",
    "hover:bg-finance-blue/10 hover:text-finance-blue",
    isActive ? "bg-finance-blue/10 text-finance-blue font-medium" : "text-gray-600"
  );

  return (
    <aside className={cn(
      "h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-[70px]" : "w-[250px]",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo and app name */}
      <div className="py-6 px-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-finance-blue flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl">ExpenseTrack</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse}
          className="hidden md:flex h-8 w-8"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <li>
            <NavLink to="/" className={linkClass} onClick={onClose}>
              <Home size={20} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/transactions" className={linkClass} onClick={onClose}>
              <Receipt size={20} />
              {!collapsed && <span>Transactions</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/categories" className={linkClass} onClick={onClose}>
              <PieChart size={20} />
              {!collapsed && <span>Categories</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/budgets" className={linkClass} onClick={onClose}>
              <BarChart3 size={20} />
              {!collapsed && <span>Budgets</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/accounts" className={linkClass} onClick={onClose}>
              <CreditCard size={20} />
              {!collapsed && <span>Accounts</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/import" className={linkClass} onClick={onClose}>
              <Upload size={20} />
              {!collapsed && <span>Import Data</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Settings link */}
      <div className="py-4 border-t border-gray-200">
        <ul className="px-2">
          <li>
            <NavLink to="/settings" className={linkClass} onClick={onClose}>
              <Settings size={20} />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
