import './ChatPanel.css';
import { useState } from 'react';

interface Message {
  sender: 'assistant' | 'user';
  text: string;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: "Hey, I'm Aaron. An ML trained on Aaron. Ask me anything." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Message = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: 'assistant', text: data.reply }]);
    } catch {
      setMessages((msgs) => [...msgs, { sender: 'assistant', text: 'Error: Could not reach server.' }]);
    }
    setInput('');
    setLoading(false);
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}`}>{msg.text}</div>
        ))}
      </div>
      <div className="chat-input-row">
        <button className="mic-btn" title="Mic (placeholder)">🎤</button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
