import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const STARS = Array.from({ length: 100 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: Math.random() * 6 + 8, delay: Math.random() * 8,
}));

const StarField = () => (
  <div className="starfield">
    {STARS.map(s => (
      <div key={s.id} className="star" style={{
        left: `${s.x}%`, top: `${s.y}%`,
        width: `${s.size}px`, height: `${s.size}px`,
        "--dur": `${s.duration}s`, "--delay": `${s.delay}s`,
      }} />
    ))}
  </div>
);

const Bar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const warn = pct > 80;
  return (
    <div className="bar-track">
      <div
        className="bar-fill"
        style={{
          width: `${pct}%`,
          background: warn
            ? "linear-gradient(90deg, #f06292, #e91e63)"
            : color || "linear-gradient(90deg, #7c6af7, #4fc3f7)"
        }}
      />
    </div>
  );
};

export default function Usage({ darkMode, toggleDark }) {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchUsage(); }, []);

  const fetchUsage = async () => {
    try {
      const res = await API.get("/user/usage");
      setData(res.data);
    } catch { alert("Failed to load usage"); }
  };

  const fmtNum = n => n?.toLocaleString() ?? "-";

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          --bg: #06080f; --surface: rgba(255,255,255,0.04);
          --surface-mid: rgba(255,255,255,0.06); --border: rgba(255,255,255,0.08);
          --text: #e8eaf0; --text-muted: rgba(232,234,240,0.45);
          --accent: #7c6af7; --accent-glow: rgba(124,106,247,0.3); --accent2: #4fc3f7;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg); color: var(--text);
          min-height: 100vh; transition: all 0.3s;
        }
        .app-root.light {
          --bg: #f0f2f8; --surface: rgba(0,0,0,0.04);
          --surface-mid: rgba(0,0,0,0.06); --border: rgba(0,0,0,0.1);
          --text: #1a1c2e; --text-muted: rgba(26,28,46,0.5);
          --accent-glow: rgba(124,106,247,0.15);
        }
        .starfield { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
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

        .navbar {
          position: relative; z-index: 10;
          display: flex; align-items: center; padding: 14px 32px; gap: 12px;
          border-bottom: 1px solid var(--border);
          background: rgba(6,8,15,0.7); backdrop-filter: blur(16px);
        }
        .app-root.light .navbar { background: rgba(240,242,248,0.8); }
        .nav-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-right: auto;
        }
        .nav-btn {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text-muted);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 6px 14px; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:hover { border-color: var(--accent); color: var(--text); }

        .page { position: relative; z-index: 1; padding: 40px 32px; max-width: 800px; margin: 0 auto; }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px;
          letter-spacing: -0.5px; margin-bottom: 8px;
        }
        .page-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 36px; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 20px;
          animation: fadeUp 0.5s ease both;
        }
        .stat-card:nth-child(2) { animation-delay: 0.05s; }
        .stat-card:nth-child(3) { animation-delay: 0.1s; }
        .stat-card:nth-child(4) { animation-delay: 0.15s; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: none; } }
        .stat-icon { font-size: 22px; margin-bottom: 10px; }
        .stat-val {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 26px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
        }
        .stat-label { font-size: 12px; color: var(--text-muted); letter-spacing: 0.3px; }

        .limit-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 24px; margin-bottom: 16px;
          animation: fadeUp 0.5s ease 0.2s both;
        }
        .limit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .limit-title { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; }
        .limit-nums { font-size: 13px; color: var(--text-muted); }
        .limit-nums span { color: var(--text); font-weight: 500; }
        .bar-track {
          height: 6px; background: var(--surface-mid); border-radius: 999px; overflow: hidden;
        }
        .bar-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(.4,0,.2,1); }

        .skeleton { background: linear-gradient(90deg, var(--surface) 25%, var(--surface-mid) 50%, var(--surface) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 12px; height: 80px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <StarField />

      <nav className="navbar">
        <span className="nav-brand">Craftifai</span>
        <button className="nav-btn" onClick={toggleDark}>{darkMode ? "☀" : "☾"}</button>
        <button className="nav-btn" onClick={() => navigate("/chat")}>← Back</button>
      </nav>

      <div className="page">
        <h1 className="page-title">Your Usage</h1>
        <p className="page-sub">Token consumption & limits overview</p>

        {!data ? (
          <div className="stats-grid">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔢</div>
                <div className="stat-val">{fmtNum(data.total_requests)}</div>
                <div className="stat-label">Total Requests</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✦</div>
                <div className="stat-val">{fmtNum(data.total_tokens_used)}</div>
                <div className="stat-label">Total Tokens</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-val">{fmtNum(data.daily_used)}</div>
                <div className="stat-label">Tokens Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📆</div>
                <div className="stat-val">{fmtNum(data.monthly_used)}</div>
                <div className="stat-label">Tokens This Month</div>
              </div>
            </div>

            <div className="limit-card">
              <div className="limit-header">
                <span className="limit-title">Daily Limit</span>
                <span className="limit-nums">
                  <span>{fmtNum(data.daily_used)}</span> / {fmtNum(data.daily_limit)}
                </span>
              </div>
              <Bar value={data.daily_used} max={data.daily_limit} />
            </div>

            <div className="limit-card" style={{ animationDelay: "0.25s" }}>
              <div className="limit-header">
                <span className="limit-title">Monthly Limit</span>
                <span className="limit-nums">
                  <span>{fmtNum(data.monthly_used)}</span> / {fmtNum(data.monthly_limit)}
                </span>
              </div>
              <Bar value={data.monthly_used} max={data.monthly_limit} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
