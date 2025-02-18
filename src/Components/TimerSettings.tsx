import { useState } from "react";

interface TimerSettingsType {
    focusTime: number;
    breakTime: number;
    sections: number;
    taskType: string;
}

interface TimerSettingsProps {
    onStart: (TimerSettings: TimerSettingsType) => void;
}

const TimerSettings = function ({onStart}: TimerSettingsProps) {
  const [formData, setFormData] = useState({
    focusTime: 0,
    breakTime: 0,
    sections: 0,
    taskType: "",
  });

  const handleChange = function (e:  React.ChangeEvent<HTMLSelectElement>) {
    setFormData({
      ...formData,
      [e.target.id] : e.target.value
    });
  };

  const handleCancel = function () {
    setFormData({
      focusTime: 0,
      breakTime: 0,
      sections: 0,
      taskType: "",
    });
  };

  return (
    <div className="container text-center flexbox-centered" id="timer-settings">
      <div className="container mt-4 mb-5" id="heading">
        <h1>Set new timer</h1>
      </div>

      <div className="container my-5" id="settings">
        <form id="timer-settings-form" onSubmit={(e) => {
            e.preventDefault();
            onStart(formData);
        }}>
          <div className="input-group mb-3">
                <label
                className="input-group-text form-settings-input input-group-custom"
                htmlFor="inputGroupSelect01"
                >
                Focus time
                </label>
                <select
                value={formData.focusTime}
                onChange={handleChange}
                className="form-select form-settings-input input-group-custom"
                id="focusTime"
                required
                >
                <option></option>
                <option value="0.5">0,5 min</option>
                <option value="1">1 min</option>
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                </select>
          </div>

          <div className="input-group mb-3">
                <label
                className="input-group-text form-settings-input input-group-custom"
                htmlFor="inputGroupSelect01"
                >
                Break time
                </label>
                <select
                value={formData.breakTime}
                onChange={handleChange}
                className="form-select form-settings-input input-group-custom"
                id="breakTime"
                required
                >
                <option></option>
                <option value="0.05">0,05 min</option>
                <option value="1">1 min</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                </select>
          </div>

          <div className="input-group mb-3">
                <label
                className="input-group-text form-settings-input input-group-custom"
                htmlFor="inputGroupSelect01"
                >
                Sections
                </label>
                <select
                value={formData.sections}
                onChange={handleChange}
                className="form-select form-settings-input input-group-custom"
                id="sections"
                required
                >
                <option></option>
                <option value="1">1 section</option>
                <option value="2">2 sections</option>
                <option value="3">3 sections</option>
                <option value="4">4 sections</option>
                <option value="5">5 sections</option>
                </select>
          </div>

          <div className="input-group mb-3">
                <label
                className="input-group-text form-settings-input input-group-custom"
                htmlFor="inputGroupSelect01"
                >
                Task type
                </label>
                <select
                value={formData.taskType}
                onChange={handleChange}
                className="form-select form-settings-input input-group-custom"
                id="taskType"
                required
                >
                <option></option>
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
              type="button"
              className="mx-3 btn custom-btn-cancel-form btn-lg"
              id="cancel-form"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mx-3 btn custom-btn-submit-form btn-lg"
            >
              Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimerSettings;
