import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const STARS = Array.from({ length: 120 }, (_, i) => ({
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

export default function Login({ darkMode, toggleDark }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    try {
      setLoading(true);
      await API.post("/auth/register", { email, password });
      alert("Registered. Now login.");
    } catch (e) {
      alert(e.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("role", res.data.role);
      navigate("/chat");
    } catch (e) {
      alert(e.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          --bg: #06080f;
          --surface: rgba(255,255,255,0.04);
          --surface-hover: rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.08);
          --text: #e8eaf0;
          --text-muted: rgba(232,234,240,0.45);
          --accent: #7c6af7;
          --accent-glow: rgba(124,106,247,0.35);
          --accent2: #4fc3f7;
          --danger: #f06292;
          --success: #81c784;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          transition: all 0.3s;
        }
        .app-root.light {
          --bg: #f0f2f8;
          --surface: rgba(0,0,0,0.04);
          --surface-hover: rgba(0,0,0,0.07);
          --border: rgba(0,0,0,0.1);
          --text: #1a1c2e;
          --text-muted: rgba(26,28,46,0.5);
          --accent-glow: rgba(124,106,247,0.2);
        }

        /* Stars */
        .starfield {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
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

        /* Dark mode toggle */
        .dark-toggle {
          position: fixed; top: 20px; right: 24px; z-index: 100;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 50px; padding: 6px 14px;
          color: var(--text-muted); font-size: 13px; cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px;
        }
        .dark-toggle:hover { border-color: var(--accent); color: var(--text); }

        /* Login wrapper */
        .login-wrap {
          position: relative; z-index: 1;
          min-height: 100vh; display: flex;
          align-items: center; justify-content: center;
          padding: 24px;
        }
        .login-card {
          width: 100%; max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 48px 40px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px var(--accent-glow), 0 24px 60px rgba(0,0,0,0.3);
          animation: fadeUp 0.6s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-logo {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 28px; letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .login-subtitle {
          font-size: 13px; color: var(--text-muted);
          margin-bottom: 36px; letter-spacing: 0.3px;
        }
        .field-label {
          font-size: 11px; font-weight: 500; letter-spacing: 1px;
          text-transform: uppercase; color: var(--text-muted);
          margin-bottom: 8px; display: block;
        }
        .field {
          width: 100%; background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px; padding: 13px 16px;
          color: var(--text); font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; margin-bottom: 20px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .field::placeholder { color: var(--text-muted); }
        .btn-row { display: flex; gap: 12px; margin-top: 8px; }
        .btn {
          flex: 1; padding: 13px 20px;
          border-radius: 10px; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; border: none;
          transition: all 0.2s; letter-spacing: 0.2px;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--accent), #9c6af7);
          color: white;
          box-shadow: 0 4px 20px var(--accent-glow);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px var(--accent-glow); }
        .btn-ghost {
          background: var(--surface); color: var(--text);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover { background: var(--surface-hover); border-color: var(--accent); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <StarField />
        
      <button className="dark-toggle" onClick={toggleDark}>
        {darkMode ? "☀ Light" : "☾ Dark"}
      </button>

      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">Craftifai</div>
          <p className="login-subtitle">AI Access Management Platform</p>

          <label className="field-label">Email</label>
          <input
            className="field"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label className="field-label">Password</label>
          <input
            className="field"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />

          <div className="btn-row">
            <button className="btn btn-primary" onClick={login} disabled={loading}>
              {loading ? "..." : "Login"}
            </button>
            <button className="btn btn-ghost" onClick={register} disabled={loading}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
