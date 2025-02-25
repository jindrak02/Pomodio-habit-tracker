import {} from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useTimerContext } from "../Contexts/TimerContext";
import LoginScreen from "./LoginScreen";
import Timer from "./Timer";
import Dashboard from "./Dashboard";
import NavPanel from "./NavPanel";
import ManualEntry from "./ManualEntry";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const { isTokenValid } = useAuth();
  const { isRunning } = useTimerContext();

  if (!isTokenValid()) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  }

  console.log(isRunning);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/timer" />} />
        <Route path="timer" element={<Timer />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manual_entry" element={<ManualEntry />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {isRunning ? null : <NavPanel />}
    </>
  );
}

export default App;
