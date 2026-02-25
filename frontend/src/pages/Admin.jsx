import { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

// Stars are memoized at module level so they never change between renders
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: Math.random() * 6 + 8,   // slower: 8–14s
  delay: Math.random() * 8,
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

// Generic bar chart (no labels beneath)
const MiniChart = ({ data, color = "#7c6af7" }) => {
  if (!data || data.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No data</div>;
  const max = Math.max(...data.map(d => d.tokens), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", height: `${(d.tokens / max) * 52}px`,
            background: color, borderRadius: "4px 4px 0 0", opacity: 0.85,
            minHeight: 2, transition: "height 0.5s ease",
          }} title={`${d.model || d.email}: ${d.tokens}`} />
        </div>
      ))}
    </div>
  );
};

// Daily chart with token count + short date label below each bar
const DailyChart = ({ data, color = "#7c6af7" }) => {
  if (!data || data.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No data</div>;
  const max = Math.max(...data.map(d => d.tokens), 1);

  const fmtDay = (str) => {
    if (!str) return "";
    // Accepts "2024-06-01" or similar; show "Jun 1"
    try {
      const d = new Date(str);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return str.slice(-5); }
  };

  const fmtTokens = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, overflowX: "auto", paddingBottom: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{
          flex: "0 0 auto", minWidth: 36, display: "flex",
          flexDirection: "column", alignItems: "center", gap: 0,
        }}>
          {/* token count above bar */}
          <div style={{
            fontSize: 9, color: "var(--text-muted)", marginBottom: 3,
            whiteSpace: "nowrap", letterSpacing: "0.2px",
          }}>
            {fmtTokens(d.tokens)}
          </div>
          {/* bar */}
          <div style={{
            width: "100%", height: `${(d.tokens / max) * 80}px`,
            background: color,
            borderRadius: "4px 4px 0 0", opacity: 0.85,
            minHeight: 3, transition: "height 0.6s ease",
          }} />
          {/* date label below bar */}
          <div style={{
            fontSize: 9, color: "var(--text-muted)", marginTop: 5,
            whiteSpace: "nowrap", transform: "rotate(-35deg)",
            transformOrigin: "top center", letterSpacing: "0.2px",
          }}>
            {fmtDay(d.day)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Admin({ darkMode, toggleDark }) {
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [modelUsage, setModelUsage] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") { navigate("/chat"); return; }
    fetchUsers(); fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch { alert("Admin access required"); navigate("/chat"); }
  };

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, dailyRes, topUsersRes, modelsRes] = await Promise.all([
        API.get("/admin/analytics/overview"),
        API.get("/admin/analytics/daily"),
        API.get("/admin/analytics/top-users"),
        API.get("/admin/analytics/models"),
      ]);
      setOverview(overviewRes.data);
      setDailyUsage(dailyRes.data.map(d => ({ day: d.day, tokens: Number(d.tokens) })));
      setTopUsers(topUsersRes.data.map(u => ({ email: u.email, tokens: Number(u.tokens) })));
      setModelUsage(modelsRes.data.map(m => ({ model: m.model, tokens: Number(m.tokens) })));
    } catch { console.log("Analytics load failed"); }
  };

  const updateLimits = async (userId) => {
    const daily = prompt("Daily limit:");
    const monthly = prompt("Monthly limit:");
    if (!daily || !monthly) return;
    await API.post("/admin/limits", { userId, dailyLimit: Number(daily), monthlyLimit: Number(monthly) });
    fetchUsers();
  };

  const resetUsage = async (userId) => {
    await API.post("/admin/reset", { userId });
    fetchUsers();
  };

  const toggleUser = async (userId, isActive) => {
    await API.post("/admin/toggle", { userId, isActive: !isActive });
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`app-root ${darkMode ? "dark" : "light"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          --bg: #06080f; --surface: rgba(255,255,255,0.04);
          --surface-mid: rgba(255,255,255,0.06); --surface-hover: rgba(255,255,255,0.08);
          --border: rgba(255,255,255,0.08);
          --text: #e8eaf0; --text-muted: rgba(232,234,240,0.45);
          --accent: #7c6af7; --accent-glow: rgba(124,106,247,0.3); --accent2: #4fc3f7;
          --danger: #f06292; --success: #81c784;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg); color: var(--text);
          min-height: 100vh; transition: all 0.3s;
        }
        .app-root.light {
          --bg: #f0f2f8; --surface: rgba(0,0,0,0.04);
          --surface-mid: rgba(0,0,0,0.06); --surface-hover: rgba(0,0,0,0.08);
          --border: rgba(0,0,0,0.1); --text: #1a1c2e;
          --text-muted: rgba(26,28,46,0.5); --accent-glow: rgba(124,106,247,0.15);
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
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; padding: 14px 32px; gap: 12px;
          border-bottom: 1px solid var(--border);
          background: rgba(6,8,15,0.8); backdrop-filter: blur(16px);
        }
        .app-root.light .navbar { background: rgba(240,242,248,0.9); }
        .nav-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-right: auto;
        }
        .nav-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; padding: 3px 8px;
          background: rgba(124,106,247,0.15); border: 1px solid rgba(124,106,247,0.3);
          border-radius: 20px; color: var(--accent);
        }
        .nav-btn {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; color: var(--text-muted);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 6px 14px; cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:hover { border-color: var(--accent); color: var(--text); }

        .page { position: relative; z-index: 1; padding: 36px 32px; max-width: 1100px; margin: 0 auto; }

        .section-title {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 16px;
        }

        /* Overview grid */
        .overview-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr));
          gap: 14px; margin-bottom: 36px;
        }
        .overview-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          animation: fadeUp 0.4s ease both;
        }
        .overview-card:nth-child(2) { animation-delay: .05s; }
        .overview-card:nth-child(3) { animation-delay: .1s; }
        .overview-card:nth-child(4) { animation-delay: .15s; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }
        .ov-val {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .ov-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

        /* Charts */
        .charts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 14px; margin-bottom: 36px; }
        .chart-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
          animation: fadeUp 0.5s ease 0.2s both;
        }
        .chart-title { font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 16px; }

        /* User table */
        .search-input {
          width: 100%; max-width: 320px; background: var(--surface);
          border: 1px solid var(--border); border-radius: 10px;
          color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 9px 14px; outline: none; margin-bottom: 16px;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: var(--accent); }
        .search-input::placeholder { color: var(--text-muted); }

        .user-table { width: 100%; border-collapse: collapse; }
        .user-table th {
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          color: var(--text-muted); font-weight: 500;
          padding: 10px 14px; text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .user-table td {
          padding: 14px; font-size: 13px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .user-table tr:last-child td { border-bottom: none; }
        .user-table tr { transition: background 0.15s; }
        .user-table tbody tr:hover { background: var(--surface-hover); }
        .user-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
          animation: fadeUp 0.5s ease 0.3s both;
        }

        .badge {
          display: inline-block; padding: 3px 9px; border-radius: 20px;
          font-size: 11px; font-weight: 500;
        }
        .badge-active { background: rgba(129,199,132,0.15); color: var(--success); border: 1px solid rgba(129,199,132,0.3); }
        .badge-disabled { background: rgba(240,98,146,0.1); color: var(--danger); border: 1px solid rgba(240,98,146,0.25); }

        .progress-mini { height: 4px; background: var(--surface-mid); border-radius: 999px; overflow: hidden; width: 80px; }
        .progress-mini-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }

        .action-btn {
          background: none; border: 1px solid var(--border);
          border-radius: 6px; color: var(--text-muted);
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          padding: 5px 10px; cursor: pointer; transition: all 0.15s; margin-right: 6px;
        }
        .action-btn:hover { border-color: var(--accent); color: var(--text); }
        .action-btn.red:hover { border-color: var(--danger); color: var(--danger); }
      `}</style>

      <StarField />

      <nav className="navbar">
        <span className="nav-brand">Craftifai</span>
        <span className="nav-badge">Admin</span>
        <button className="nav-btn" onClick={toggleDark}>{darkMode ? "☀" : "☾"}</button>
        <button className="nav-btn" onClick={() => navigate("/chat")}>← Chat</button>
      </nav>

      <div className="page">
        {/* Overview */}
        <p className="section-title">Overview</p>
        <div className="overview-grid">
          {[
            { val: overview?.total_users, label: "Total Users", icon: "👤" },
            { val: overview?.active_users, label: "Active Users", icon: "✅" },
            { val: overview?.total_requests, label: "Total Requests", icon: "🔢" },
            { val: overview?.total_tokens, label: "Total Tokens", icon: "✦" },
          ].map((c, i) => (
            <div key={i} className="overview-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
              <div className="ov-val">{c.val?.toLocaleString() ?? "—"}</div>
              <div className="ov-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <p className="section-title">Analytics</p>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">Daily Token Usage</div>
            <div style={{ overflowX: "auto", paddingBottom: 24 }}>
              <DailyChart data={dailyUsage.slice(-14)} color="#7c6af7" />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Top Users by Tokens</div>
            <MiniChart data={topUsers.slice(0, 8)} color="#4fc3f7" />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {topUsers.slice(0, 5).map((u, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{u.email}</span>
                  <span style={{ color: "var(--accent2)" }}>{u.tokens.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-title">Model Usage</div>
            <MiniChart data={modelUsage} color="#81c784" />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {modelUsage.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                  <span>{m.model}</span>
                  <span style={{ color: "var(--success)" }}>{m.tokens.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users */}
        <p className="section-title" style={{ marginTop: 8 }}>User Management</p>
        <input
          className="search-input"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="user-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Daily Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const pct = u.daily_limit > 0 ? Math.min((u.daily_used / u.daily_limit) * 100, 100) : 0;
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.email}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {u.daily_used?.toLocaleString()} / {u.daily_limit?.toLocaleString()}
                        </span>
                        <div className="progress-mini">
                          <div className="progress-mini-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "badge-active" : "badge-disabled"}`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" onClick={() => updateLimits(u.id)}>Limits</button>
                      <button className="action-btn" onClick={() => resetUsage(u.id)}>Reset</button>
                      <button className={`action-btn ${u.is_active ? "red" : ""}`} onClick={() => toggleUser(u.id, u.is_active)}>
                        {u.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
