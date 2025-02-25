type TaskTypeData = {
    taskType: string;
    totalFocusTime: number;
    days: Array<string>;
}

type TaskTypeAccumulator = {
    [key: string]: TaskTypeData;
}

type sessionData = {
    focusTime: number;
    taskType: string;
}

export const updateData = function(data: any, taskType: string, focusTime: number, date: string) {
    const task = data.taskTypes[taskType];
  
    if (task) {
      task.totalFocusTime += focusTime;
  
      type day = {
        date: string,
        minutes:  number
      }
  
      type days = Array<day>
  
      const days: days = data.taskTypes[taskType].days;
      const day = days.find(day => day.date == date);
  
      if (day) {
        day.minutes += focusTime;
      } else {
        task.days.push({date, minutes: focusTime});  
      }
  
    } else {
      console.log("Task not found when updating data ...");
    }  
};

export const createNewFileOnGoogleDrive = async function (accessToken: string | null, fileName: string, fileContent: sessionData) {

    // Inicializace prázného objektu sessionData pro následné naplnění a upload
    const tasksString = ["Studying", "Work", "Exercise", "Learning new skill", "Coding", "Reading", "Meditation", "Other"];
    const data = {
        taskTypes: tasksString.reduce( (acc: TaskTypeAccumulator, taskType: string) => {
          acc[taskType] = {
            taskType,
            totalFocusTime: 0,
            days: []
          };
          return acc;
        }, {} as TaskTypeAccumulator),
      };
    
    updateData(data, fileContent.taskType, fileContent.focusTime, new Date().toISOString().split('T')[0]);

    // console.log(accessToken);
    // console.log(fileName);
    // console.log(fileContent);
    console.log(data);
    
    const metadata = {
      name: fileName,
      mimeType: "appliaction/json",
    };

    const fileBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", fileBlob);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to upload file to google drive: " + response.statusText
      );
    }

    const res = await response.json();
    console.log("File uploaded successfully: " + res);
    return res;
};

export const findFileOnGoogleDrive = async function ( accessToken: string | null, fileName: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&fields=files(id,name)`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to search file: ${response.statusText}`);
  }

  const data = await response.json();
  const file = data.files && data.files.length > 0 ? data.files[0] : null;

  if (file) {
    return file.id;
  } else {
    return null;
  }
};

export const downloadFileFromGoogleDrive = async function (accessToken: string | null, fileId: string) {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

export const updateFileOnGoogleDrive = async function (accessToken: string | null, fileId: string, file: File) {
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files/"+fileId+"?uploadType=media",
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": file.type,
        },
        body: file,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to upload file to Google Drive: " + response.statusText
      );
    }

    const result = await response.json();
    console.log("File uploaded on Google Drive successfully: ", result);
    return result;
}