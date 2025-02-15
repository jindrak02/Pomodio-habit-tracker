import { useEffect, useState } from "react";

interface TimerCountdownProps {
  focusTime: number;
  breakTime: number;
  sections: number;
  taskType: string;
}

export default function TimerCountdown(timerProps: TimerCountdownProps) {

    console.log(timerProps);
    
  
  return (
    <div>
      <h2>Focus Time: {timerProps.focusTime} min</h2>
      <h2>Break Time: {timerProps.breakTime} min</h2>
      <h2>Sections: {timerProps.sections}</h2>
      <h2>Task type: {timerProps.taskType}</h2>
      <button >Zastavit</button>
    </div>
  );
}
