import { NavLink } from 'react-router-dom';

const navItems = [
  { section: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/campaigns', label: 'Campaigns', icon: '📨' },
    { path: '/conversations', label: 'Conversations', icon: '💬' },
  ]},
  { section: 'Content', items: [
    { path: '/templates', label: 'Templates', icon: '📝' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/ai', label: 'AI Assistant', icon: '🤖' },
  ]},
  { section: 'System', items: [
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]},
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <span className="sidebar-brand">Talha WhatsApp</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
