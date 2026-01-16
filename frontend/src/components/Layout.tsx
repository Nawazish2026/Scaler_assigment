import { Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, Link as LinkIcon, Menu, User } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Event Types', href: '/event-types', icon: LinkIcon },
    { name: 'Scheduled Events', href: '/meetings', icon: Calendar },
    { name: 'Availability', href: '/availability', icon: Clock },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-text-primary font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
        <span className="font-bold text-xl tracking-tight">Vantity</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:block",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border hidden md:block">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Vantity
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/event-types?create=true"
              className="flex items-center justify-center w-full px-4 py-2 mb-6 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-blue-500/20"
            >
              + Create
            </Link>

            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-secondary/50 text-white"
                      : "text-text-secondary hover:bg-secondary/30 hover:text-white"
                  )}
                >
                  <item.icon className={clsx("w-5 h-5 mr-3", isActive ? "text-primary" : "text-gray-500")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center px-4 py-2 text-sm text-text-secondary">
              <User className="w-5 h-5 mr-3" />
              <span>Demo User</span>
            </div>
          </div>
        </div>
      </aside >

      {/* Main Content */}
      < main className="flex-1 overflow-y-auto h-screen relative" >
        {/* Top Header (Desktop) */}
        < header className="sticky top-0 z-10 hidden md:flex items-center justify-end px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border" >
          {/* Add user menu or search here later */}
        </header >

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main >

      {/* Overlay for mobile */}
      {
        mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )
      }
    </div >
  );
}
