import { Link, useLocation } from 'wouter';
import { LayoutDashboard, DollarSign, TrendingUp, Calendar, History } from 'lucide-react';

export default function Navigation() {
  const [location] = useLocation();

  const links = [
    { path: '/', label: 'Operacional', icon: LayoutDashboard },
    { path: '/financeiro', label: 'Financeiro', icon: DollarSign },
    { path: '/produtividade', label: 'Produtividade', icon: TrendingUp },
    { path: '/agenda', label: 'Agenda', icon: Calendar },
    { path: '/historico', label: 'Histórico', icon: History },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 mb-6">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-900">Doctor Auto</span>
          </div>
          
          <div className="flex gap-1">
            {links.map(({ path, label, icon: Icon }) => {
              const isActive = location === path;
              return (
                <Link 
                  key={path} 
                  href={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
