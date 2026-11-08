import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Images, CalendarDays, MapPin, LogOut, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const nav = useNavigate();
  async function logout() {
    await supabase.auth.signOut();
    nav('/login');
  }
  return (
    <div className="app-shell">
      <div className="romance-bg" />
      <header className="topbar">
        <a className="brand" href="/" onClick={() => nav('/')}>
          <span className="brand-mark">
            <Heart size={17} />
          </span>
          <span>
            <span className="brand-name">our little archive</span>
            <small>just the two of us</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            <Images size={17} />
            Memories
          </NavLink>
          <NavLink to="/dates">
            <CalendarDays size={17} />
            Dates
          </NavLink>
          <NavLink to="/map">
            <MapPin size={17} />
            Map
          </NavLink>
        </nav>
        <button className="icon-button" onClick={logout} title="Sign out">
          <LogOut size={18} />
        </button>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer>Made of little moments, kept together.</footer>
    </div>
  );
}