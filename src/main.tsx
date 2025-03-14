import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./Components/App.tsx";
import { AuthProvider } from "./Contexts/AuthContext.tsx";
import { TimerProvider } from "./Contexts/TimerContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <TimerProvider>
      <BrowserRouter>
        <StrictMode>
          <App />
        </StrictMode>
      </BrowserRouter>
    </TimerProvider>
  </AuthProvider>
);
