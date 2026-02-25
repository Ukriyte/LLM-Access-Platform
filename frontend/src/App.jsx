import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Usage from "./pages/Usage";
import Admin from "./pages/Admin";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const toggleDark = () => setDarkMode(d => !d);

  const sharedProps = { darkMode, toggleDark };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login {...sharedProps} />} />
        <Route path="/chat" element={
          <PrivateRoute><Chat {...sharedProps} /></PrivateRoute>
        } />
        <Route path="/usage" element={
          <PrivateRoute><Usage {...sharedProps} /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute><Admin {...sharedProps} /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
