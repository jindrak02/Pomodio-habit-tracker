import {} from "react";
import { useAuth } from "../Contexts/AuthContext";
import LoginScreen from "./LoginScreen";
import TimerSettings from "./TimerSettings";
import NavPanel from "./NavPanel";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const { isTokenValid } = useAuth();
  let localToken = localStorage.getItem("token");

  if (!isTokenValid()) {
    return(<LoginScreen/>);
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/timer" />} />
        <Route path="/timer" element={<TimerSettings />} />
      </Routes>

      <NavPanel />
    </>
  );
}

export default App;
