import {} from "react";
import { useAuth } from "../Contexts/AuthContext";
import LoginScreen from "./LoginScreen";
import Timer from "./Timer";
import NavPanel from "./NavPanel";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const { isTokenValid } = useAuth();
  let localToken = localStorage.getItem("token");

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

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/timer" />} />
        <Route path="timer" element={<Timer />} />
        <Route path="chart" element={<h1> Chart </h1>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <NavPanel />
    </>
  );
}

export default App;
