import React, { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import {
  createNewFileOnGoogleDrive,
  findFileOnGoogleDrive,
  downloadFileFromGoogleDrive,
  updateData,
  updateFileOnGoogleDrive,
} from "../Contexts/googleDriveService";

interface Day {
  date: string;
  minutes: number;
}

type sessionData = {
  focusTime: number;
  taskType: string;
}

function ManualEntry() {
  const [totalFocusTime, setTotalFocusTime] = useState<string>("");
  const [date, setDate] = useState("");
  const [taskType, setTaskType] = useState("");
  const { token, signInAndGetToken, verifyToken } = useAuth();
  const [showSpinner, setShowSpinner] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      let isTokenValid = await verifyToken();
      let accessToken = token;

      if (!isTokenValid) {
        try {
          accessToken = await signInAndGetToken();
          console.log("Přihlášení úspěšné, token získán: " + accessToken);
          isTokenValid = true;
        } catch (error) {
          console.error("Přihlášení selhalo: ", error);
          return; // Chyba při přihlášení
        }
      }

      setShowSpinner(true);// Zobrazí spinner

      const fileId = await findFileOnGoogleDrive(
        accessToken,
        "pomodioSessionData.json"
      );

      if (fileId) {
        const res = await downloadFileFromGoogleDrive(accessToken, fileId);
        console.log("File found and downloaded, updating file ...");

        const focusTimeValue = totalFocusTime.trim() ? Number(totalFocusTime) : 0;
        updateData(res, taskType, focusTimeValue, date);
        res.taskTypes[taskType].days.sort(
          (a: Day, b: Day) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        console.log(res);

        const updatedFile = new File(
          [JSON.stringify(res, null, 2)],
          "pomodioSessionData.json",
          { type: "application/json" }
        );
        await updateFileOnGoogleDrive(accessToken, fileId, updatedFile);
      } else {
        console.log("File not found, creating new one ...");

        const sessionData: sessionData = {
          focusTime: totalFocusTime.trim() ? Number(totalFocusTime) : 0,
          taskType: taskType
        };
        
        await createNewFileOnGoogleDrive(
            accessToken,
          "pomodioSessionData.json",
          sessionData
        );
      }
    } catch (error) {
      console.error("Chyba při načítání:", error);
    } finally {
        setShowSpinner(false);// Skrýt spinner
    }
  };

  return (
    <>
      <div className="container text-center flexbox-centered" id="manual-entry">
        <div className="container mt-4 mb-5" id="heading">
          <h1>Add your habits manually</h1>
        </div>

        <div className="container my-5" id="manual-entry-wrapper">
          <form id="manual-entry-form" onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <span
                className="input-group-text input-group-custom form-settings-input"
                id="basic-addon1"
              >
                Date
              </span>
              <input
                type="date"
                className="form-control input-group-custom form-settings-input"
                id="manualDate"
                aria-label="Username"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span
                className="input-group-text input-group-custom form-settings-input"
                id="basic-addon1"
              >
                Total focus time in Minutes
              </span>
              <input
                type="number"
                className="form-control input-group-custom form-settings-input"
                id="manualTotalFocusTime"
                aria-label="Username"
                value={totalFocusTime}
                onChange={(e) => setTotalFocusTime(e.target.value)}
                required
              />
            </div>

            <div className="input-group mb-3">
              <label
                className="input-group-text form-settings-input input-group-custom"
                htmlFor="inputGroupSelect01"
              >
                Task type
              </label>
              <select
                className="form-select form-settings-input input-group-custom"
                id="manualTaskType"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a task
                </option>
                <option value="Studying">Studying</option>
                <option value="Work">Work</option>
                <option value="Exercise">Exercise</option>
                <option value="Learning new skill">Learning new skill</option>
                <option value="Coding">Coding</option>
                <option value="Reading">Reading</option>
                <option value="Meditation">Meditation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="container my-5">
              <button
                type="submit"
                className="mx-3 btn custom-btn-submit-form btn-lg"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
      <div id="loading-spinner" className={showSpinner == true ? "" : "hidden"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    </>
  );
}

export default ManualEntry;
