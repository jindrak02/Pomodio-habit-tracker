import { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useTimerContext } from "../Contexts/TimerContext";
import {
  createNewFileOnGoogleDrive,
  findFileOnGoogleDrive,
  downloadFileFromGoogleDrive,
  updateData,
  updateFileOnGoogleDrive,
} from "../Contexts/googleDriveService";
import Swal from 'sweetalert2';
import TimerSettings from "./TimerSettings";
import TimerCountdown from "./TimerCountdown";

interface TimerSettingsType {
    focusTime: number;
    breakTime: number;
    sections: number;
    taskType: string;
}

type sessionData = {
    focusTime: number;
    taskType: string;
}

const Timer = function () {
  const {isRunning, setIsRunning} = useTimerContext();
  const [timerSettings, setTimerSettings] = useState<TimerSettingsType>({
    focusTime: 0,
    breakTime: 0,
    sections: 0,
    taskType: ""
  });
  const { token, verifyToken, signInAndGetToken } = useAuth();
  const fileName = "pomodioSessionData.json";


  const handleStartTimer = function (timerSettings: TimerSettingsType) {
    setIsRunning(true);
    setTimerSettings(timerSettings);
  };

  const handleFinishTimer = function () {
    setIsRunning(false);
  }

  // Google drive file logic
  const handleGoogleDrive = async function (data: sessionData) {
    let currentToken = token;

    // Verifikuji platnost tokenu vůči google api, pokud není platný vyzvu k přihlášení
    if (await verifyToken() == false) {
        const result = await Swal.fire({
            title: "Your session expired. You need to log in to save data on Google Drive.",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Log in",
          });
      
          if (result.isConfirmed) {
            
            try {
              currentToken = await signInAndGetToken();
              console.log("Přihlášení úspěšné, token získán: " + currentToken);
            } catch (error) {
              console.error("Přihlášení selhalo: ", error);
            // TODO: redirect uživatele pryč   changeScreen([navPanel, timerSettings]);
              return;
            }
      
          } else {
            // Pokud uživatel zamítne login, vrátí se zpět na dokončený timer a data se neuloží!
            console.log("User canceled login.");
            // changeScreen([navPanel, timerSettings]);
            return;
          }
    }

    const fileId = await findFileOnGoogleDrive(currentToken, fileName);

    if (fileId) {
        console.log("File found with id: " + fileId + ". Downloading file...");
        const res = await downloadFileFromGoogleDrive(currentToken, fileId);
        updateData(res, data.taskType, data.focusTime, new Date().toISOString().split('T')[0]);

        console.log(res);

        const updatedFile = new File([JSON.stringify(res, null, 2)], fileName, { type: "application/json" });
        return await updateFileOnGoogleDrive(currentToken, fileId, updatedFile);
    } else {
        createNewFileOnGoogleDrive(currentToken, fileName, data);
        console.log("File not found, creating new one.");
    }
  }
  
  return (
    <>
      {/* Jako props timerProps rozbalím objekt timerSettings, což předá vše jako focusTime, breakTime apod.  */}
      {isRunning ? (
        <TimerCountdown {...timerSettings} onFinish={handleFinishTimer} handleGoogleDrive={handleGoogleDrive}/>
      ) : (
        <TimerSettings onStart={handleStartTimer} />
      )}
    </>
  );
};

export default Timer;
