import { createContext, useContext, useState } from "react";

interface TimerContextType {
    isRunning: boolean;
    setIsRunning: (running: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined> (undefined);

export const TimerProvider = ({children} : {children: React.ReactNode}) => {
    const [isRunning, setIsRunning] = useState(false);

    return(
        <TimerContext.Provider value={{isRunning, setIsRunning}}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimerContext = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error("useTimerContext must be used within a TimerProvider.");
    }
    return context;
}