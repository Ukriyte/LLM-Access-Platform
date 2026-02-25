import { useState, useEffect, useRef } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const STARS = Array.from({ length: 150 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 6 + 8,
  delay: Math.random() * 8,
}));

const StarField = () => (
  <div className="starfield">
    {STARS.map((star) => (
      <div
        key={star.id}
        className="star"
        style={{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          "--dur": `${star.duration}s`,
          "--delay": `${star.delay}s`,
        }}
      />
    ))}
  </div>
);

export default function Chat({ darkMode, toggleDark }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [usage, setUsage] = useState(null);
  const [model, setModel] = useState("");
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => { fetchModels(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchModels = async () => {
    try {
      const res = await API.get("/model/models");
      setModels(res.data.models);
      if (res.data.models.length > 0) setModel(res.data.models[0]);
    } catch {}
  };

  const send = async () => {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setPrompt("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post("/model/chat", { model, prompt: userMsg });
      setMessages(prev => [...prev, { role: "ai", text: res.data.response, usage: res.data.usage }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "error", text: e.response?.data?.error || "Error" }]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) await API.post("/auth/logout", { refreshToken });
    } catch {}
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          --bg: #06080f;
          --surface: rgba(255,255,255,0.04);
          --surface-mid: rgba(255,255,255,0.06);
          --surface-hover: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.08);
          --text: #e8eaf0;
          --text-muted: rgba(232,234,240,0.45);
          --accent: #7c6af7;
          --accent-glow: rgba(124,106,247,0.3);
          --accent2: #4fc3f7;
          --bubble-user: linear-gradient(135deg, #7c6af7, #9c6af7);
          --bubble-ai: rgba(255,255,255,0.05);
          --danger: #f06292;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.3s;
        }
        .app-root.light {
          --bg: #f0f2f8;
          --surface: rgba(0,0,0,0.04);
          --surface-mid: rgba(0,0,0,0.06);
          --surface-hover: rgba(0,0,0,0.08);
          --border: rgba(0,0,0,0.1);
          --text: #1a1c2e;
          --text-muted: rgba(26,28,46,0.5);
          --accent-glow: rgba(124,106,247,0.15);
          --bubble-ai: rgba(0,0,0,0.05);
        }

        /* Stars */
        .starfield {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          overflow: hidden;
        }
        .star {
          position: absolute; border-radius: 50%; background: white;
          animation:
            starFade var(--dur) ease-in-out var(--delay) infinite,
            starDriftX calc(var(--dur) * 2.5) ease-in-out var(--delay) infinite alternate,
            starDriftY calc(var(--dur) * 3.1) ease-in-out calc(var(--delay) + 1s) infinite alternate;
        }
        .app-root.light .star { background: #7c6af7; }
        @keyframes starFade { 0%,100% { opacity:0.05; } 50% { opacity:0.75; } }
        @keyframes starDriftX { from { transform: translateX(0); } to { transform: translateX(18px); } }
        @keyframes starDriftY { from { transform: translateY(0); } to { transform: translateY(14px); } }

        /* Layout */
        .navbar {
          position: relative; z-index: 10;
          display: flex; align-items: center;
          padding: 14px 24px; gap: 12px;
          border-bottom: 1px solid var(--border);
          background: rgba(6,8,15,0.7);
          backdrop-filter: blur(16px);
        }
        .app-root.light .navbar { background: rgba(240,242,248,0.8); }
        .nav-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-right: auto;
        }

        .model-select {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 6px 12px; outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .model-select:focus { border-color: var(--accent); }
        .model-select option { background: #06080f; }

        .nav-btn {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text-muted);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 6px 14px; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .nav-btn:hover { border-color: var(--accent); color: var(--text); }
        .nav-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

        /* Messages */
        .messages-area {
          flex: 1; overflow-y: auto;
          padding: 32px 24px;
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 20px;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 40px;
          opacity: 0.5;
        }
        .empty-icon {
          font-size: 48px; margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .empty-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 20px; margin-bottom: 8px;
        }
        .empty-sub { font-size: 14px; color: var(--text-muted); }

        .msg-row {
          display: flex; gap: 12px; animation: msgIn 0.3s ease both;
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-row.user { flex-direction: row-reverse; }
        .msg-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
          background: var(--surface); border: 1px solid var(--border);
        }
        .msg-row.user .msg-avatar {
          background: linear-gradient(135deg, var(--accent), #9c6af7);
          border: none;
        }
        .msg-bubble {
          max-width: 70%; padding: 14px 18px;
          border-radius: 16px; font-size: 14px; line-height: 1.6;
        }
        .msg-row.user .msg-bubble {
          background: var(--bubble-user);
          color: white; border-bottom-right-radius: 4px;
        }
        .msg-row.ai .msg-bubble {
          background: var(--bubble-ai);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }
        .msg-row.error .msg-bubble {
          background: rgba(240,98,146,0.1);
          border: 1px solid rgba(240,98,146,0.3);
          color: var(--danger);
        }
        .usage-pills {
          display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;
        }
        .pill {
          font-size: 11px; padding: 3px 8px; border-radius: 20px;
          background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.2);
          color: var(--accent);
        }

        .typing {
          display: flex; gap: 5px; padding: 14px 18px;
          background: var(--bubble-ai); border: 1px solid var(--border);
          border-radius: 16px; border-bottom-left-radius: 4px;
          width: fit-content;
        }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,80%,100% { transform: scale(0.8); } 40% { transform: scale(1.2); } }

        /* Input */
        .input-wrap {
          position: relative; z-index: 10;
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border);
          background: rgba(6,8,15,0.7);
          backdrop-filter: blur(16px);
        }
        .app-root.light .input-wrap { background: rgba(240,242,248,0.8); }
        .input-row {
          display: flex; gap: 10px; align-items: flex-end;
          background: var(--surface-mid);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 10px 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-row:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .chat-input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text); font-family: 'DM Sans', sans-serif;
          font-size: 14px; resize: none; max-height: 150px;
          line-height: 1.5;
        }
        .chat-input::placeholder { color: var(--text-muted); }
        .send-btn {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), #9c6af7);
          border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: all 0.2s;
          box-shadow: 0 4px 14px var(--accent-glow);
        }
        .send-btn:hover { transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }
      `}</style>

      <StarField darkMode={darkMode} />

      <nav className="navbar">
        <span className="nav-brand">Craftifai</span>
        <select
          className="model-select"
          value={model}
          onChange={e => setModel(e.target.value)}
        >
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {role === "admin" && (
          <button className="nav-btn" onClick={() => navigate("/admin")}>⚙ Admin</button>
        )}
        <button className="nav-btn" onClick={() => navigate("/usage")}>📊 Usage</button>
        <button className="nav-btn" onClick={toggleDark}>{darkMode ? "☀" : "☾"}</button>
        <button className="nav-btn danger" onClick={logout}>Logout</button>
      </nav>

      <div className="messages-area">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <div className="empty-title">Start a conversation</div>
            <div className="empty-sub">Select a model above and type your message</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === "user" ? "U" : msg.role === "ai" ? "✦" : "!"}
            </div>
            <div className="msg-bubble">
              {msg.text}
              {msg.usage && (
                <div className="usage-pills">
                  <span className="pill">↑ {msg.usage.input}</span>
                  <span className="pill">↓ {msg.usage.output}</span>
                  <span className="pill">Σ {msg.usage.total}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-row ai">
            <div className="msg-avatar">✦</div>
            <div className="typing">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-wrap">
        <div className="input-row">
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Type a message..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <button className="send-btn" onClick={send} disabled={loading || !prompt.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
