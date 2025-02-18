import { useTimer } from "react-timer-hook";
import { useState, useEffect } from "react";

interface TimerCountdownProps {
  focusTime: number;
  breakTime: number;
  sections: number;
  taskType: string;
  onFinish: () => void;
  handleGoogleDrive: (realFocusTime: Number | undefined) => void;
}

export default function TimerCountdown(timerProps: TimerCountdownProps) {
  const [isFocus, setIsFocus] = useState(true); // true = Focus, false = Break
  const [currentSection, setCurrentSection] = useState(1);
  const [pomodoroFinished, setPomodoroFinished] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [realFocusTime, setRealFocusTime] = useState<Number>();

  const getExpiryTime = (minutes: number) => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + minutes * 60); // Přidání minut v sekundách
    return time;
  };

  const { seconds, minutes, isRunning, restart, pause, resume } = useTimer({
    expiryTimestamp: getExpiryTime(timerProps.focusTime),
    onExpire: () => handleExpire(),
  });

  // Logika přepínání focus a break
  const handleExpire = function () {
    if (isFocus) {
      if (currentSection < timerProps.sections) {
        console.log("Focus session done! Actual session: " + currentSection);
        setIsFocus(false);
        setCurrentSection((prevValue) => prevValue + 1);
      } else {
        // Dokončení celého pomodoro
        setPomodoroFinished(true);
      }
    } else {
      console.log("Break session done! Starting session: " + currentSection);
      setIsFocus(true);
    }
  };

  // Ukončení timeru
  useEffect(() => {
    if (pomodoroFinished == true) {
      console.log("Sessions complete! Stoping timer.");
      pause();
      setButtonsDisabled(true);

      const audio = new Audio("../../public/audio/trumpet_fanfare.mp3");
      audio
        .play()
        .catch((error) => console.error("Audio playback failed:", error));

      // Výpočet reálného focus time
      const completedFocusTime =
        (currentSection - 1) * timerProps.focusTime * 60; // Čas dokončených sekcí

      const remainingTime = minutes * 60 + seconds;
      const currentFocusTime = isFocus
        ? timerProps.focusTime * 60 - remainingTime
        : 0; // Čas v probíhající sekci (pouze pokud je ve focus režimu)

      const actualFocusTime = completedFocusTime + currentFocusTime; // Skutečný focus čas

      setRealFocusTime(Math.round(actualFocusTime / 60));
    }
  }, [pomodoroFinished]); // Spustí se vždy, když se změní pomodoroFinished

  // Počkat na aktualizaci realFocusTime a teprve pak zavolat handleGoogleDrive
  useEffect(() => {
    if (pomodoroFinished) {
      timerProps.handleGoogleDrive(realFocusTime);
    }
  }, [realFocusTime]); // Spustí se vždy, když se změní realFocusTime

  // Automatický restart při změně isFocus
  useEffect(() => {
    if (isFocus) {
      restart(getExpiryTime(timerProps.focusTime));
    } else {
      restart(getExpiryTime(timerProps.breakTime));
    }
  }, [isFocus]); // Spustí se vždy, když se změní isFocus

  const pauseButton = document.getElementById("pause") as HTMLButtonElement;

  // Ovládání pause / play timeru
  const handlePauseResume = function (isRunning: boolean) {
    if (isRunning == true) {
      pause();
      pauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" class="bi bi-play" viewBox="0 0 16 16">
        <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
      </svg>`;
    } else {
      resume();
      pauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" class="bi bi-pause" viewBox="0 0 16 16">
        <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>
      </svg>`;
    }
  };

  return (
    <div className="container text-center flexbox-centered" id="timer">
      {pomodoroFinished == true ? (
        <a onClick={() => timerProps.onFinish()} className="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            fill="currentColor"
            className="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
            />
          </svg>
        </a>
      ) : null}

      {/* <Audio src="./public/audio/trumpet_fanfare.mp3" id="finished-timer-audio"></Audio> */}
      <div className="container mb-5">
        <div className="row justify-content-center">
          <div
            className="col-md-8"
            onClick={
              pomodoroFinished == false
                ? () => handlePauseResume(isRunning)
                : undefined
            }
          >
            <div className="card">
              <div className="card-header custom-btn-submit-form text-white">
                <h4 className="mb-0 text-center" id="session-display">
                  Session {currentSection}/{timerProps.sections}
                </h4>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-12">
                    <h3 id="timer-display" className="display-4">
                      {minutes < 10 ? `0${minutes}` : minutes}:
                      {seconds < 10 ? `0${seconds}` : seconds}
                    </h3>
                    <p id="focus-break-display" className="mb-0">
                      {pomodoroFinished == false
                        ? isFocus == true
                          ? "Focus 💪"
                          : "Break 🥱"
                        : "Pomodoro finished! 🥳"}
                      {/* {isFocus == true ? "Focus 💪" : "Break 🥱"} */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container my-5">
          <button
            type="button"
            className="mx-3 btn custom-btn-timer btn-lg"
            onClick={() => handlePauseResume(isRunning)}
            id="pause"
            disabled={buttonsDisabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="white"
              className="bi bi-pause"
              viewBox="0 0 16 16"
            >
              <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5" />
            </svg>
          </button>
          <button
            type="button"
            className="mx-3 btn custom-btn-timer btn-lg"
            id="stop"
            onClick={() => setPomodoroFinished(true)}
            disabled={buttonsDisabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="white"
              className="bi bi-stop"
              viewBox="0 0 16 16"
            >
              <path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11zM5 4.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
