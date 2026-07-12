import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-left">
        <button className="btn btn-secondary btn-sm" onClick={onMenuToggle}>
          ☰
        </button>
      </div>
      <div className="header-right">
        <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {user?.firstName} {user?.lastName}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
