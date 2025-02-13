import React, {createContext, useContext, useEffect, useState} from "react";

interface AuthContextType {
    token: String | null;
    signInAndGetToken: () => Promise<string>;
    verifyToken: () => Promise<boolean>;
    clearToken: () => void;
    isTokenValid: () => boolean
}

const AuthContext = createContext <AuthContextType | undefined> (undefined);

// Wraper, uvnitř kterého budou dostupné dané funkce
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [token, setToken] = useState <String | null>(null);

    const CLIENT_ID = "1082310563066-i012m4gulkr01asucv0gn452f82hk6kc.apps.googleusercontent.com";
    const SCOPES = "https://www.googleapis.com/auth/drive.file";
    
    interface ExtendedTokenClient extends google.accounts.oauth2.TokenClient {
    callback?: (response: any) => void;
    }
    let client: ExtendedTokenClient;

    // Načtení gsi knihovny a klienta při provtním renderu komponenty
    useEffect(() => {

        const loadGoogleLibrary = function (): Promise<void> {
            return new Promise((resolve) => {
              const script = document.createElement("script");
              script.src = "https://accounts.google.com/gsi/client";
              script.async = true;
              script.defer = true;
              script.onload = () => {
                console.log("Google Identity Services loaded");
                resolve();
              };
              document.head.appendChild(script);
            });
          };

        const initializeGoogleClient = function () {
          client = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response: any) => {
              if (response.error) {
                console.error("Error during token request:", response.error);
              } else {
                setToken(response.access_token);
                saveToken(response.access_token, response.expires_in);
                console.log("Token získán: " + token);
              }
            },
          });
        };

        const init = async () => {
          await loadGoogleLibrary();
          initializeGoogleClient();
        };

        init();

    }, []);

    // Pomocné funkce pro token handling
    const saveToken = (token: string, expiresIn: number) => {
      setToken(token);
      const expiryDate = new Date(Date.now() + expiresIn * 1000);
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiryDate", expiryDate.toISOString());
    };

    const clearToken = () => {
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiryDate");
    };

    const isTokenValid = () => { // Ověření platnsoti expirace tokenu
      const expiryStr = localStorage.getItem("tokenExpiryDate");
      if (!expiryStr) return false;
      return new Date(expiryStr) > new Date();
    };

    const signInAndGetToken = async function (): Promise<string> { // Hlavní autentizační funkce pro vyvolání pop up window s loginem k účtu
      if (!client) {
        throw new Error("Google gsi client not loaded");
      }

      return new Promise((resolve, reject) => {
        client!.callback = (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            setToken(response.access_token);
            saveToken(response.access_token,response.expires_in);
            console.log("Token získán:" + response.access_token);
            resolve(response.access_token);
          }
        };

        client.requestAccessToken({ prompt: "consent" });
      });
    };

    const verifyToken = async function (): Promise<boolean> { // Ověření funkčnosti tokenu vůči google api
        if (!token) return false;
        try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Token je platný:", data);
          return true;
        } else {
          console.warn("Token je neplatný nebo vypršel.");
          return false;
        }
      } catch (error) {
        console.error("Chyba při ověřování tokenu:", error);
        return false;
      }
    };

    return(
        <AuthContext.Provider value={{token, signInAndGetToken, verifyToken, clearToken, isTokenValid}}>
            {children}
        </AuthContext.Provider>
    )
};

// Context, který budeme volat pomocí useAuth pro získání tokenu a funkcí v podřazených komponentách
export const useAuth = function() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}