import './App.css';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CharacterPanel from './components/CharacterPanel';

function App() {
  return (
    <div className="app-root">
      <Sidebar />
      <div className="main-content">
        <ChatPanel />
      </div>
      <div className="right-panel">
        <CharacterPanel />
      </div>
    </div>
  );
}

export default App;
