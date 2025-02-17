import { useState } from "react";
import TimerSettings from "./TimerSettings";
import TimerCountdown from "./TimerCountdown";

interface TimerSettingsType {
    focusTime: number;
    breakTime: number;
    sections: number;
    taskType: string;
}

const Timer = function () {
  const [isRunning, setIsRunning] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettingsType>({
    focusTime: 0,
    breakTime: 0,
    sections: 0,
    taskType: ""
  });

  const handleStartTimer = function (timerSettings: TimerSettingsType) {
    setIsRunning(true);
    setTimerSettings(timerSettings);
  };

  const handleFinishTimer = function () {
    setIsRunning(false);
  } 

  return (
    <>
      {/* Jako props timerProps rozbalím objekt timerSettings, což předá vše jako focusTime, breakTime apod.  */}
      {isRunning ? (
        <TimerCountdown {...timerSettings} onFinish={handleFinishTimer}/>
      ) : (
        <TimerSettings onStart={handleStartTimer} />
      )}
    </>
  );
};

export default Timer;
