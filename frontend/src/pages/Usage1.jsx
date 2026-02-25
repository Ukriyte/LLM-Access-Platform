import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Usage() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await API.get("/user/usage");
      setData(res.data);
    } catch {
      alert("Failed to load usage");
    }
  };

  return (
    <div>
      <h2>Usage</h2>
      <button onClick={()=>navigate("/chat")}>Back</button>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Daily: {data.daily_used}/{data.daily_limit}</p>
          <p>Monthly: {data.monthly_used}/{data.monthly_limit}</p>
          <p>Total Requests: {data.total_requests}</p>
          <p>Total Tokens: {data.total_tokens_used}</p>
        </>
      )}
    </div>
  );
}