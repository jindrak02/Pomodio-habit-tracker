import  { } from "react";
import { useAuth } from "../Contexts/AuthContext";
import LoginScreen from "./LoginScreen";
import TimerSettings from "./TimerSettings";

function App() {
  const { isTokenValid } = useAuth();
  let localToken = localStorage.getItem('token');

  return (
    <div>
      {isTokenValid() ? <TimerSettings/> : <LoginScreen/>}
    </div>
  );
}

export default App;