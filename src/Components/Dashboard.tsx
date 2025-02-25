import {
  findFileOnGoogleDrive,
  downloadFileFromGoogleDrive,
} from "../Contexts/googleDriveService";
import { Chart, ChartConfiguration, BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Title, Tooltip);
import { useAuth } from "../Contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Day {
    date: string;
    minutes: number;
}

interface TaskDetails {
    taskType: string;
    totalFocusTime: number;
    days: Array<Day>;
}

const Dashboard = function () {
  const [showSpinner, setShowSpinner] = useState(true);
  const { token, verifyToken, signInAndGetToken} = useAuth();
  const [currentBarChart, setCurrentBarChart] = useState <Chart | null>(null);
  const [currentTaskChart, setCurrentTaskChart] = useState <Chart | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const taskChartRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  const createBarChart = function(xlabels: Array<string>, chartData: Array<number>, xlabel: string, name: string){

    if (barChartRef.current) {
      if (currentBarChart) {
        currentBarChart.destroy();
      }
      // Data a konfigurace grafu
      const data = {
        labels: xlabels,
        datasets: [
          {
            label: xlabel,
            data: chartData,
            backgroundColor: '#6F2BF6',
            borderColor: '#6F2BF6',
            borderWidth: 1,
          },
        ],
      };
    
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: name,
              font: {
                size: 18, // Nastavení velikosti fontu pro název
              },
              color: '#ffffff', // Barva fontu názvu grafu
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#ffffff', // Barva fontu pro osu X
                font: {
                  size: 12, // Velikost fontu pro osu X
                },
              },
              grid: {
                display: false, // Skrytí grid lines pro osu X
              },
            },
            y: {
              ticks: {
                color: '#ffffff', // Barva fontu pro osu Y
                font: {
                  size: 12, // Velikost fontu pro osu Y
                },
              },
              grid: {
                display: false, // Skrytí grid lines pro osu Y
              },
            },
          },
        },
      };
      Chart.register(CategoryScale, LinearScale);
    
      // Vytvoření grafu
      setCurrentBarChart(new Chart(barChartRef.current, config));
    }
  }

  const createDailyChart = function(xlabels: Array<string>, chartData: Array<number>, xlabel: string, name: string){

    if (taskChartRef.current) {
      if (currentTaskChart) {
        currentTaskChart.destroy();
      }
      // Data a konfigurace grafu
      const data = {
        labels: xlabels,
        datasets: [
          {
            label: xlabel,
            data: chartData,
            backgroundColor: '#6F2BF6',
            borderColor: '#6F2BF6',
            borderWidth: 1,
          },
        ],
      };
    
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data,
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: name,
              font: {
                size: 18, // Nastavení velikosti fontu pro název
              },
              color: '#ffffff', // Barva fontu názvu grafu
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#ffffff', // Barva fontu pro osu X
                font: {
                  size: 12, // Velikost fontu pro osu X
                },
              },
              grid: {
                display: false, // Skrytí grid lines pro osu X
              },
            },
            y: {
              ticks: {
                color: '#ffffff', // Barva fontu pro osu Y
                font: {
                  size: 12, // Velikost fontu pro osu Y
                },
              },
              grid: {
                display: false, // Skrytí grid lines pro osu Y
              },
            },
          },
        },
      };
    
      // Vytvoření grafu
      setCurrentTaskChart(new Chart(taskChartRef.current, config));
    }
  
  }

  useEffect(() => {
    const handleDashboard = async function () {
      try {
        let currentToken = token;
        const isTokenValid = await verifyToken();

        if (!isTokenValid) {
          currentToken = await signInAndGetToken();
        }

        const fileId = await findFileOnGoogleDrive(currentToken, "pomodioSessionData.json");
        const data = await downloadFileFromGoogleDrive(currentToken, fileId);

        if (data) {
          console.log(data);
          const xlabels = Object.keys(data.taskTypes).filter(taskType => taskType !== "");

          const chartData = Object.values(data.taskTypes as Record<string, TaskDetails>)
          .filter(details => details.taskType !== "")
          .map(details => details.totalFocusTime / 60).map(Number); // Přepočet na hodiny

          const xlabel = 'Hours';
          const name = 'Total hours by categories';

          createBarChart(xlabels, chartData, xlabel, name);

        } else {
          console.log("File not found");
        }
      } catch (error) {
        console.error("Chyba při načítání:", error);
      } finally {
        setShowSpinner(false);
      }
    };

    handleDashboard();
  }, []);

  const handleDailyChartSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowSpinner(true);
  
    try {
      let taskTypeElement = document.getElementById("taskTypeForChart") as HTMLSelectElement;
      let taskType = taskTypeElement.value;
      console.log("Daily chart task: " + taskType);
  
      let currentToken = token;
      const isTokenValid = await verifyToken();
      if (!isTokenValid) {
        currentToken = await signInAndGetToken();
      }
  
      const fileId = await findFileOnGoogleDrive(currentToken, "pomodioSessionData.json");
      const data = await downloadFileFromGoogleDrive(currentToken, fileId);
  
      if (data && data.taskTypes[taskType]) {
        console.log("File found and downloaded successfully");
  
        const days: Array<Day> = data.taskTypes[taskType].days;
        const xlabels = days.map(day => day.date);
        const chartData = days.map(day => day.minutes / 60); // Přepočet na hodiny
        const xlabel = "Hours";
        const name = "Hours by days";
  
        createDailyChart(xlabels, chartData, xlabel, name);
      } else {
        console.log("File not found or no data for this task type");
      }
    } catch (error) {
      console.error("Chyba při načítání:", error);
    } finally {
      setShowSpinner(false);
      taskChartRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  

  return (
    <>
      <div className="container text-center flexbox" id="dashboard">
        <h2 className="my-5" id="dashboardTitle">
          Dashboard
        </h2>

        <div className="chart-wrapper">
          <canvas ref={barChartRef} id="barChart"></canvas>
        </div>

        <div className="container my-5" id="daily-chart-settings">
          <form id="daily-chart-settings-form" onSubmit={handleDailyChartSubmit}>
            <div className="input-group mb-3">
              <label
                className="input-group-text form-settings-input input-group-custom"
                htmlFor="inputGroupSelect01"
              >
                Task type
              </label>
              <select
                className="form-select form-settings-input input-group-custom"
                id="taskTypeForChart"
                required
              >
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
                Show me
              </button>
            </div>
          </form>
        </div>

        <div className="chart-wrapper my-5">
          <canvas ref={taskChartRef}  className="my-5" id="dailyChart"></canvas>
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
};

export default Dashboard;
