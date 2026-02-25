import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [modelUsage, setModelUsage] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/chat");
      return;
    }

    fetchUsers();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch {
      alert("Admin access required");
      navigate("/chat");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, dailyRes, topUsersRes, modelsRes] =
        await Promise.all([
          API.get("/admin/analytics/overview"),
          API.get("/admin/analytics/daily"),
          API.get("/admin/analytics/top-users"),
          API.get("/admin/analytics/models")
        ]);

      setOverview(overviewRes.data);

      setDailyUsage(
        dailyRes.data.map(d => ({
          day: d.day,
          tokens: Number(d.tokens)
        }))
      );

      setTopUsers(
        topUsersRes.data.map(u => ({
          email: u.email,
          tokens: Number(u.tokens)
        }))
      );

      setModelUsage(
        modelsRes.data.map(m => ({
          model: m.model,
          tokens: Number(m.tokens)
        }))
      );

    } catch {
      console.log("Analytics load failed");
    }
  };

  const updateLimits = async (userId) => {
    const daily = prompt("Daily limit:");
    const monthly = prompt("Monthly limit:");
    if (!daily || !monthly) return;

    await API.post("/admin/limits", {
      userId,
      dailyLimit: Number(daily),
      monthlyLimit: Number(monthly)
    });

    fetchUsers();
  };

  const resetUsage = async (userId) => {
    await API.post("/admin/reset", { userId });
    fetchUsers();
  };

  const toggleUser = async (userId, isActive) => {
    await API.post("/admin/toggle", {
      userId,
      isActive: !isActive
    });
    fetchUsers();
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <button onClick={()=>navigate("/chat")}>Back</button>

      <h3>Overview</h3>
      {overview && (
        <>
          <p>Total Users: {overview.total_users}</p>
          <p>Active Users: {overview.active_users}</p>
          <p>Total Requests: {overview.total_requests}</p>
          <p>Total Tokens: {overview.total_tokens}</p>
        </>
      )}

      <h3>Daily Usage</h3>
      {dailyUsage.map(d => (
        <div key={d.day}>
          {d.day} : {d.tokens}
        </div>
      ))}

      <h3>Top Users</h3>
      {topUsers.map(u => (
        <div key={u.email}>
          {u.email} : {u.tokens}
        </div>
      ))}

      <h3>Model Usage</h3>
      {modelUsage.map(m => (
        <div key={m.model}>
          {m.model} : {m.tokens}
        </div>
      ))}

      <h3>User Management</h3>
      {users.map(u => (
        <div key={u.id} style={{marginBottom:"10px"}}>
          <b>{u.email}</b> | {u.daily_used}/{u.daily_limit} | {u.is_active ? "Active" : "Disabled"}

          <br/>
          <button onClick={()=>updateLimits(u.id)}>Limits</button>
          <button onClick={()=>resetUsage(u.id)}>Reset</button>
          <button onClick={()=>toggleUser(u.id, u.is_active)}>
            {u.is_active ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}