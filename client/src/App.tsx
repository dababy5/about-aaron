import './App.css';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CharacterPanel from './components/CharacterPanel';
import ContactPage from './components/ContactPage';
import ExperiencePage from './components/ExperiencePage';
import AboutPage from './components/AboutPage';
import ProjectsPage from './components/ProjectsPage';
import SkillsPage from './components/SkillsPage';

// Home page component
function HomePage() {
  return (
    <>
      <div className="background-layer">
        <CharacterPanel />
      </div>
      <div className="ui-layer">
        <Sidebar />
        <ChatPanel />
      </div>
    </>
  );
}

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  );
}

export default App;
