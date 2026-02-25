import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      await API.post("/auth/register", { email, password });
      alert("Registered. Now login.");
    } catch (e) {
      alert(e.response?.data?.error || "Error");
    }
  };

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      // store tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("role", res.data.role);

      navigate("/chat");
    } catch (e) {
      alert(e.response?.data?.error || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <br/>

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={login}>Login</button>
      <button onClick={register}>Register</button>
    </div>
  );
}