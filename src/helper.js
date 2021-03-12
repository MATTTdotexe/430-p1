const fs = require('fs');

const respond = (request, response, status, content, type, length) => {
  response.writeHead(status, { 'Content-Type': type, 'Content-Length': length });
  response.write(content);
  response.end();
};

const respondHeaderOnly = (request, response, status, type, length) => {
  response.writeHead(status, { 'Content-Type': type, 'Content-Length': length });
  response.end();
};

// Source: https://stackoverflow.com/questions/2219526/how-many-bytes-in-a-javascript-string/29955838
// Refactored to an arrow function by ACJ
const getBinarySize = (string) => Buffer.byteLength(string, 'utf8');

// returns the index of the user in the JSON data array, returns -1 if user does not exist
const doesUserExist = (paramUser) => {
  // no user is provided
  if (!paramUser) {
    return -1;
  }

  // reads in external JSON file where all data is stored
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // loop through search for the user
  for (let i = 0; i < data.length; i++) {
    if (data[i].user === paramUser) {
      return i;
    }
  }

  // user cannot be found
  return -1;
};

// returns false if any data is missing from a workout JSON object or if it is badly formatted
const processWorkoutData = (JSONData) => {
  const workout = JSONData;
  const { exercises } = workout;

  // check that the main keys exist
  if (!Object.prototype.hasOwnProperty.call(workout, 'date') || !Object.prototype.hasOwnProperty.call(workout, 'type') || !Object.prototype.hasOwnProperty.call(workout, 'overallDifficulty') || !Object.prototype.hasOwnProperty.call(workout, 'exercises')) {
    return false;
  }

  // check the workout data for empty data
  if (workout.date === '' || workout.type === '' || workout.overallDifficulty === '' || workout.exercises === []) {
    return false;
  }

  // loop through the exercises array
  for (let i = 0; i < exercises.length; i++) {
    const currentExercise = exercises[i];

    // check the keys exist
    if (!Object.prototype.hasOwnProperty.call(currentExercise, 'name') || !Object.prototype.hasOwnProperty.call(currentExercise, 'sets')) {
      return false;
    }

    // check the exercise data for empty data
    if (currentExercise.name === '' || currentExercise.sets === []) {
      return false;
    }

    // loop through the sets array
    for (let j = 0; j < currentExercise.sets.length; j++) {
      const currentSet = currentExercise.sets[j];

      // check the keys exist
      if (!Object.prototype.hasOwnProperty.call(currentSet, 'reps') || !Object.prototype.hasOwnProperty.call(currentSet, 'weight') || !Object.prototype.hasOwnProperty.call(currentSet, 'setDifficulty')) {
        return false;
      }

      // check the set data for empty data
      if (currentSet.reps === '' || currentSet.weight === '' || currentSet.setDifficulty === '') {
        return false;
      }
    } // close set loop
  } // close exercise loop
  // passed all checks, data is formatted correctly with no empty values
  return JSONData;
};

module.exports = {
  respond,
  respondHeaderOnly,
  getBinarySize,
  doesUserExist,
  processWorkoutData,
};
