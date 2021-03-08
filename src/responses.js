const fs = require('fs');
const helperHandler = require('./helper.js');

const respond = (request, response, status, content, type, length) => {
  response.writeHead(status, { 'Content-Type': type, 'Content-Length': length });
  response.write(content);
  response.end();
};

const respondHeaderOnly = (request, response, status, type, length) => {
  response.writeHead(status, { 'Content-Type': type, 'Content-Length': length });
  response.end();
};

// returns all users in the system
const getAllUsers = () => {
  // reads in external JSON file where all data is stored
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  const responseObj = () => {
    let allUsers = [];
    // loop through all objects and search for the user param
    for (let i = 0; i < data.length; i++) {
      allUsers.push(data[i].user);
    }
    return allUsers;
  };
  return JSON.stringify(responseObj());
}

const getAllUsersResponse = (request, response) => {
  const allUsersResponse = getAllUsers();
  return respond(request, response, 200, allUsersResponse, 'application/json', helperHandler.getBinarySize(allUsersResponse));
}

// returns all workouts for a user, defaults to me if no user param exists
const getAllWorkouts = (paramUser = 'matthewroberts117') => {
  // reads in external JSON file where all data is stored
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  const responseObj = () => {
    // loop through all objects and search for the user param
    for (let i = 0; i < data.length; i++) {
      if (data[i].user === paramUser) {
        return data[i];
      }
    }
    // executes if the user param cannot be found
    return `User ${paramUser} does not exist.`;
  };
  return JSON.stringify(responseObj());
};

const getAllWorkoutsResponse = (request, response, params, acceptedTypes, httpMethod) => {
  if (acceptedTypes.includes("text/xml")) {
    const { workouts } = JSON.parse(getAllWorkouts(params.user));
    let responseXML = '<workouts>';

    // write XML for each workout
    for (let i = 0; i < Object.keys(workouts).length; i++) {
      const { exercises } = workouts[i];
      responseXML
       += `<workout>
         <date>${workouts[i].date}</date>
         <type>${workouts[i].type}</type>
         <overallDifficulty>${workouts[i].overallDifficulty}</overallDifficulty>
       `;

      // write XML for each exercise
      for (let j = 0; j < Object.keys(exercises).length; j++) {
        const { sets } = exercises[j];
        responseXML
         += `<exercise>
           <name>${exercises[j].name}</name>
         `;

        // write XML for each set
        for (let k = 0; k < Object.keys(sets).length; k++) {
          responseXML
           += `<set>
             <reps>${sets[k].reps}</reps>
             <weight>${sets[k].weight}</weight>
             <setDifficulty>${sets[k].setDifficulty}</setDifficulty>
            </set>
           `;
        }
        responseXML
         += `</exercise>
         `;
      }
      responseXML
         += `</workout>
         `;
    }
    responseXML
    += `</workouts>
    `;

    // XML HEAD request
    if (httpMethod === 'HEAD') {
      return respondHeaderOnly(request, response, 200, 'text/xml', helperHandler.getBinarySize(responseXML));
    // XML GET request
    }
    return respond(request, response, 200, responseXML, 'text/xml', helperHandler.getBinarySize(responseXML));
  }

  // JSON HEAD request
  if (httpMethod === 'HEAD') {
    return respondHeaderOnly(request, response, 200, 'application/json', helperHandler.getBinarySize(getAllWorkouts(params.user)));
  // JSON GET request
  }
  const workoutResponse = getAllWorkouts(params.user);
  // const workoutResponse = "test string";
  return respond(request, response, 200, workoutResponse, 'application/json', helperHandler.getBinarySize(workoutResponse));
};

// checks for any missing fields just in case
const processWorkoutData = (JSONData) => {
  let workout = JSONData;
  let exercises = workout.exercises;

  // check the workout data for empty data
  if (workout.date === "" || workout.type === "" || workout.overallDifficulty === "") {
    return false;
  }

  // check the exercises array for empty data
  for (let i = 0; i < exercises.length; i++) {
    let currentExercise = exercises[i];
    if (currentExercise.name) {
      // check the set for empty data
      for (let j = 0; j < currentExercise.sets.length; j++) {
        let currentSet = currentExercise.sets[j];
        if (!currentSet.reps || currentSet.weight === "" || !currentSet.setDifficulty) {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  return JSONData;
}

const postNewWorkout = (request, response, params) => {
  // get the params and parse the JSON
  let user = params.user;
  let workout = processWorkoutData(JSON.parse(params.data));
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));
  let newData = data;
  // did the data pass server side validation?
  if (!newData) {
    let content = `<p style="color:red;" font-weight="bold">Data Upload Failed!</p>`;
    let length = helperHandler.getBinarySize(content);

    return respond(request, response, 201, content, 'text/html', length);
  }

  for (let i = 0; i < data.length; i++) {
    if (data[i].user === user) {
      newData[i].workouts.push(workout);
    }
  }

  const newDataString = JSON.stringify(newData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  let content = `<p style="color:green;" font-weight="bold">Data Upload Successful!</p>`;
  let length = helperHandler.getBinarySize(content);

  return respond(request, response, 201, content, 'text/html', length);
}

const postNewUser = (request, response, params) => {
  let user = params.user;
  // check the data for the user
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));
  const newData = data;

  // loop through the data to check for users
  for (let i = 0; i < data.length; i++) {
    if (data[i].user === user) { // the user exists already
      // break out and return an error response
      let content = `<p style="color:red;" font-weight="bold">Error uploading user! User already exists.</p>`;
      let length = helperHandler.getBinarySize(content);
      return respond(request, response, 201, content, 'text/html', length);
    }
  }

  // user does not exist, write it to the data
  let newUser = { "user": user, "workouts": [] };
  newData.push(newUser);
  const newDataString = JSON.stringify(newData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // return a successful response
  let content = `<p style="color:green;" font-weight="bold">User upload successful! Please sign in now.</p>`;
  let length = helperHandler.getBinarySize(content);
  return respond(request, response, 201, content, 'text/html', length);
}

const postUserExists = (request, response, params) => {
  let user = params.user;
  // check the data for the user
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // loop through the data to check for users
  for (let i = 0; i < data.length; i++) {
    if (data[i].user === user) { // the user exists already
      // break out and return a response of true
      let content = { "userExists": true };
      content = JSON.stringify(content);
      let length = helperHandler.getBinarySize(content);
      return respond(request, response, 201, content, 'application/JSON', length);
    }
  }

  // break out and return a response of false
  let content = { "userExists": false };
  content = JSON.stringify(content);
  let length = helperHandler.getBinarySize(content);
  return respond(request, response, 201, content, 'application/JSON', length);
}

const deleteWorkout = (request, response, params) => {
  // were all parameters sent?
  if (!params.user || !params.workoutIndex) {
    // missings params, return an error
    let content = { "missingParams": true };
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 400, content, 'application/JSON', length);
  }

  let user = params.user;
  let workoutIndex = parseInt(params.workoutIndex, 10);
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // validate user exists and get their data
  let userData = "";
  let userIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].user === user) {
      userData = data[i];
      userIndex = i;
    }
  }
  if (!userData) {
    // user does not exist, return an error
    let content = `<p style="color:red;" font-weight="bold">User ${user} does not exist.</p>`;
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 201, content, 'text/html', length);
  }

  // get the user's workout data
  const workouts = userData.workouts;
  // check if the requested index to delete is valid
  if (workoutIndex > workouts.length - 1 || workoutIndex < 0) {
    // workout index to delete is not valid, return an error
    let content = `<p style="color:red;" font-weight="bold">Workout index invalid.</p>`;
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 201, content, 'test/html', length);
  }

  // remove the item from the array of workouts
  const updatedWorkouts = workouts;
  updatedWorkouts.splice(workoutIndex, 1);
  // update the user's data
  let updatedUserData = userData;
  updatedUserData.workouts = updatedWorkouts;
  // update the overall data
  let updatedData = data;
  updatedData[userIndex] = updatedUserData;

  // write back to the file
  const newDataString = JSON.stringify(updatedData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // return a success
  let content = "";
  content = JSON.stringify(content);
  let length = helperHandler.getBinarySize(content);
  return respond(request, response, 204, content, 'text/html', length);
}

const deleteExercise = (request, response, params) => {
  // were all parameters sent?
  if (!params.user || !params.workoutIndex || !params.exerciseIndex) {
    // missings params, return an error
    let content = { "missingParams": true };
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 400, content, 'application/JSON', length);
  }

  let user = params.user;
  let workoutIndex = parseInt(params.workoutIndex, 10);
  let exerciseIndex = parseInt(params.exerciseIndex, 10);
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // validate user exists and get their data
  let userData = "";
  let userIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].user === user) {
      userData = data[i];
      userIndex = i;
    }
  }
  if (!userData) {
    // user does not exist, return an error
    let content = { "userExists": false };
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 201, content, 'application/JSON', length);
  }

  // get the user's workout data
  const workouts = userData.workouts;
  // check if the requested index to delete is valid
  if (workoutIndex > workouts.length - 1 || workoutIndex < 0) {
    // workout index to delete is not valid, return an error
    let content = { "workoutIndexValid": false };
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 201, content, 'application/JSON', length);
  }

  // get the user's exercise data for the selected workout
  const exercises = workouts[workoutIndex].exercises;
  // check if the requested index to delete is valid
  if (exerciseIndex > exercises.length - 1 || exerciseIndex < 0) {
    // workout index to delete is not valid, return an error
    let content = { "exerciseIndexValid": false };
    content = JSON.stringify(content);
    let length = helperHandler.getBinarySize(content);
    return respond(request, response, 201, content, 'application/JSON', length);
  }

  // remove the item from the array of exercises
  const updatedExercises = exercises;
  updatedExercises.splice(exerciseIndex, 1);

  // update the array of workouts
  let updatedWorkouts = workouts;
  updatedWorkouts[workoutIndex].exercises = updatedExercises;
  // update the user's data
  let updatedUserData = userData;
  updatedUserData.workouts = updatedWorkouts;
  // update the overall data
  let updatedData = data;
  updatedData[userIndex] = updatedUserData;

  // write back to the file
  const newDataString = JSON.stringify(updatedData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // return a success
  let content = `<p style="color:green;" font-weight="bold">Exercise deleted.</p>`;
  content = JSON.stringify(content);
  let length = helperHandler.getBinarySize(content);
  return respond(request, response, 204, content, 'text/html', length);
}

module.exports = {
  getAllUsersResponse,
  getAllWorkoutsResponse,
  postNewWorkout,
  postNewUser,
  postUserExists,
  deleteWorkout,
  deleteExercise
};
