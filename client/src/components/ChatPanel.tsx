import './ChatPanel.css';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  sender: 'assistant' | 'user';
  text: string;
  typing?: boolean;
}

function TypingMessage({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    if (idx.current >= text.length) {
      onDone();
      return;
    }
    const speed = text[idx.current] === ' ' ? 15 : 25;
    const timer = setTimeout(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayed, text, onDone]);

  return <>{displayed}<span className="typing-cursor">|</span></>;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: "Hey, I'm Aaron — well, an AI trained on Aaron. Ask me anything about my projects, skills, or experience." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(msgs => [...msgs, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'assistant', text: data.reply, typing: true }]);
      setIsTyping(true);
    } catch {
      setMessages(msgs => [...msgs, { sender: 'assistant', text: 'Could not reach the server. Try again in a sec.' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTypingDone(idx: number) {
    setIsTyping(false);
    setMessages(msgs =>
      msgs.map((m, i) => (i === idx ? { ...m, typing: false } : m))
    );
  }

  return (
    <div className="chat-panel">
      {/* Beta badge */}
      <div className="chat-header">
        <span className="chat-beta-badge">BETA</span>
        <span className="chat-header-text">Aaron AI</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}`}>
            {msg.typing ? (
              <TypingMessage text={msg.text} onDone={() => handleTypingDone(i)} />
            ) : (
              msg.text
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant thinking">
            <div className="thinking-dots">
              <span /><span /><span />
            </div>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-hint">First message may take a few seconds to warm up</div>

      <div className="chat-input-row">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={loading || isTyping}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={loading || isTyping || !input.trim()}
        >
          <Send size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
