import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BackgroundGrid } from './BackgroundGrid';
import { DiagnosticsWidget } from './DiagnosticsWidget';

export const Layout: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 640) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-body text-slate-800 relative">
      <BackgroundGrid />
      <header className="sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200 z-30">
        <div className="mx-auto max-w-7xl w-full px-3 xs:px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold shadow-soft">BL</div>
            <span className="font-display text-lg font-semibold tracking-tight">Bias Lab</span>
          </div>
          <button className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-slate-100 text-slate-600" aria-label="Toggle menu" onClick={() => setMenuOpen(o => !o)}>
            <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <nav className="hidden sm:flex gap-6 text-sm font-medium">
            <NavLink to="/" className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Narratives</NavLink>
            <NavLink to="/articles" end className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Articles</NavLink>
            <NavLink to="/analyze" className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Analyze</NavLink>
            <NavLink to="/fetch" className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Fetch</NavLink>
          </nav>
          <div className="hidden sm:flex items-center gap-2">
            <a href="https://" className="text-xs text-slate-500 hover:text-slate-700">Docs</a>
          </div>
        </div>
        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-4 flex flex-col gap-3 text-sm font-medium">
            <NavLink onClick={()=>setMenuOpen(false)} to="/" className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Narratives</NavLink>
            <NavLink onClick={()=>setMenuOpen(false)} to="/articles" end className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Articles</NavLink>
            <NavLink onClick={()=>setMenuOpen(false)} to="/analyze" className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Analyze</NavLink>
            <NavLink onClick={()=>setMenuOpen(false)} to="/fetch" className={({isActive}) => isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}>Fetch</NavLink>
          </div>
        )}
      </header>
  <main className="relative mx-auto max-w-7xl w-full px-3 xs:px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>
  <footer className="py-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Bias Lab – Media Bias Intelligence</footer>
  <DiagnosticsWidget />
    </div>
  );
};
