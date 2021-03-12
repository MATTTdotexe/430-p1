const fs = require('fs');
const helperHandler = require('./helper.js');

// deletes a workout from the data
const deleteWorkoutResponse = (request, response, params, acceptedTypes, httpMethod) => {
  // check if the http method is valid (head and get will be treated as delete)
  if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpMethod !== 'DELETE') {
    const errorContent = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    return helperHandler.respond(request, response, 405, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // were all parameters sent?
  if (!params.user) {
    // missings params, return an error
    const content = '<p style="color:red;" font-weight="bold">Workout delete failed! No user provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  if (!params.workoutIndex) {
    // missings params, return an error
    const content = '<p style="color:red;" font-weight="bold">Workout delete failed! No workout index provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  const { user } = params;
  const workoutIndex = parseInt(params.workoutIndex, 10);
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // validate user exists and get their data
  let userData = '';
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
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  // get the user's workout data
  const { workouts } = userData;
  // check if the requested index to delete is valid
  if (workoutIndex > workouts.length - 1 || workoutIndex < 0) {
    // workout index to delete is not valid, return an error
    let content = '<p style="color:red;" font-weight="bold">Workout index invalid.</p>';
    content = JSON.stringify(content);
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'test/html', length);
  }

  // remove the item from the array of workouts
  const updatedWorkouts = workouts;
  updatedWorkouts.splice(workoutIndex, 1);
  // update the user's data
  const updatedUserData = userData;
  updatedUserData.workouts = updatedWorkouts;
  // update the overall data
  const updatedData = data;
  updatedData[userIndex] = updatedUserData;

  // write back to the file
  const newDataString = JSON.stringify(updatedData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // return a success
  return helperHandler.respondHeaderOnly(request, response, 204, 'text/html', 0);
};

// deletes an exercise from the data
const deleteExerciseResponse = (request, response, params, acceptedTypes, httpMethod) => {
  // check if the http method is valid (head and get will be treated as delete)
  if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpMethod !== 'DELETE') {
    const errorContent = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    return helperHandler.respond(request, response, 405, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // were all parameters sent?
  if (!params.user) {
    // missings params, return an error
    const content = '<p style="color:red;" font-weight="bold">Exercise delete failed! No user provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  if (!params.workoutIndex) {
    // missings params, return an error
    const content = '<p style="color:red;" font-weight="bold">Exercise delete failed! No workout index provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  if (!params.exerciseIndex) {
    // missings params, return an error
    const content = '<p style="color:red;" font-weight="bold">Exercise delete failed! No exercise index provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  const { user } = params;
  const workoutIndex = parseInt(params.workoutIndex, 10);
  const exerciseIndex = parseInt(params.exerciseIndex, 10);
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // validate user exists and get their data
  let userData = '';
  let userIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].user === user) {
      userData = data[i];
      userIndex = i;
    }
  }
  if (!userData) {
    // user does not exist, return an error
    let content = `<p style="color:red;" font-weight="bold">Exercise delete failed! User ${user} does not exist.</p>`;
    content = JSON.stringify(content);
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  // get the user's workout data
  const { workouts } = userData;
  // check if the requested index to delete is valid
  if (workoutIndex > workouts.length - 1 || workoutIndex < 0) {
    // workout index to delete is not valid, return an error
    let content = '<p style="color:red;" font-weight="bold">Exercise delete failed! Workout index invalid.</p>';
    content = JSON.stringify(content);
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'test/html', length);
  }

  // get the user's exercise data for the selected workout
  const { exercises } = workouts[workoutIndex];
  // check if the requested index to delete is valid
  if (exerciseIndex > exercises.length - 1 || exerciseIndex < 0) {
    // exercise index to delete is not valid, return an error
    let content = '<p style="color:red;" font-weight="bold">Exercise delete failed! Exercise index invalid.</p>';
    content = JSON.stringify(content);
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'test/html', length);
  }

  // remove the item from the array of exercises
  const updatedExercises = exercises;
  updatedExercises.splice(exerciseIndex, 1);

  // update the array of workouts
  const updatedWorkouts = workouts;
  updatedWorkouts[workoutIndex].exercises = updatedExercises;
  // update the user's data
  const updatedUserData = userData;
  updatedUserData.workouts = updatedWorkouts;
  // update the overall data
  const updatedData = data;
  updatedData[userIndex] = updatedUserData;

  // write back to the file
  const newDataString = JSON.stringify(updatedData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // return a success
  return helperHandler.respondHeaderOnly(request, response, 204, 'text/html', 0);
};

module.exports = {
  deleteWorkoutResponse,
  deleteExerciseResponse,
};
