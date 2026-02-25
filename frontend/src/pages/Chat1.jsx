import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [usage, setUsage] = useState(null);
  const [model, setModel] = useState("");
  const [models, setModels] = useState([]);

  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await API.get("/model/models");
      setModels(res.data.models);
      if (res.data.models.length > 0)
        setModel(res.data.models[0]);
    } catch {}
  };

  const send = async () => {
    try {
      const res = await API.post("/model/chat", {
        model,
        prompt
      });

      setResponse(res.data.response);
      setUsage(res.data.usage);

    } catch (e) {
      alert(e.response?.data?.error || "Error");
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await API.post("/auth/logout", { refreshToken });
      }
    } catch {}

    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h2>Chat</h2>

      {role === "admin" && (
        <button onClick={()=>navigate("/admin")}>
          Admin
        </button>
      )}

      <button onClick={()=>navigate("/usage")}>
        Usage
      </button>

      <button onClick={logout}>Logout</button>

      <br/><br/>

      <select value={model} onChange={e=>setModel(e.target.value)}>
        {models.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <br/><br/>

      <textarea
        rows="5"
        cols="60"
        value={prompt}
        onChange={e=>setPrompt(e.target.value)}
      />

      <br/>
      <button onClick={send}>Send</button>

      <h3>Response:</h3>
      <div>{response}</div>

      {usage && (
        <>
          <h3>Usage</h3>
          <div>Input: {usage.input}</div>
          <div>Output: {usage.output}</div>
          <div>Total: {usage.total}</div>
        </>
      )}
    </div>
  );
}