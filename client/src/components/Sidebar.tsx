import './Sidebar.css';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home' },
  { icon: '👤', label: 'About Me' },
  { icon: '📁', label: 'Projects' },
  { icon: '💼', label: 'Experience' },
  { icon: '🛠️', label: 'Skills' },
  { icon: '✉️', label: 'Contact' },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="sidebar-item">
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
