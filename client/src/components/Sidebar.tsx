import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, FolderOpen, Briefcase, Wrench, Mail } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: User, label: 'About Me', path: '/about' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Briefcase, label: 'Experience', path: '/experience' },
  { icon: Wrench, label: 'Skills', path: '/skills' },
  { icon: Mail, label: 'Contact', path: '/contact' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <nav className="sidebar">
      <ul>
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <li 
              key={item.label} 
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Link to={item.path} className="sidebar-link">
                <IconComponent className="sidebar-icon" size={24} strokeWidth={1.5} />
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
