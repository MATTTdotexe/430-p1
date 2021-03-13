const fs = require('fs');
const helperHandler = require('./helper.js');

// writes a new workout to the data
const postNewWorkoutResponse = (request, response, params, acceptedTypes, httpMethod) => {
  const { user } = params;

  // check if the http method is valid
  if (httpMethod !== 'POST') {
    const errorContent = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    return helperHandler.respond(request, response, 405, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // check if the user exists
  const userIndex = helperHandler.doesUserExist(user);
  if (userIndex === -1) {
    const content = '<p style="color:red;" font-weight="bold">Workout Upload Failed! User does not exist.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 200, content, 'text/html', length);
  }

  // validate the data param
  // check if it is valid JSON
  let validData = helperHandler.isValidJSONString(params.data);
  if (!validData) {
    const content = '<p style="color:red;" font-weight="bold">Workout Upload Failed! Data formatted incorrectly. Not valid JSON.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  const workout = helperHandler.processWorkoutData(JSON.parse(params.data));
  if (!workout) {
    const content = '<p style="color:red;" font-weight="bold">Workout Upload Failed! Data formatted incorrectly.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  // read in the file
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));
  const newData = data;

  // push the workout onto the workout array of the user's data object
  newData[userIndex].workouts.push(workout);

  // write back onto the file
  const newDataString = JSON.stringify(newData);
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // respond back to the client with a positive response
  const content = '<p style="color:green;" font-weight="bold">Workout upload successful.</p>';
  const length = helperHandler.getBinarySize(content);
  return helperHandler.respond(request, response, 201, content, 'text/html', length);
};

// writes a new user to the data
const postNewUserResponse = (request, response, params, acceptedTypes, httpMethod) => {
  const { user } = params;

  // check if the http method is valid
  if (httpMethod !== 'POST') {
    const errorContent = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    return helperHandler.respond(request, response, 405, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // check if a user was provided
  if (!user) {
    // return a bad request error
    const content = '<p style="color:red;" font-weight="bold">New user creation failed! No user provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  // read in the data from the file
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // check if the user already exists
  const userIndex = helperHandler.doesUserExist(user);
  // return an error message and do not create a new user if the user already exists
  if (userIndex !== -1) {
    const content = '<p style="color:red;" font-weight="bold">New user creation failed! User already exists.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 200, content, 'text/html', length);
  }

  const newData = data;
  // user does not exist, create a new object
  const newUser = { user, workouts: [] };
  newData.push(newUser);
  const newDataString = JSON.stringify(newData);
  // write to the file
  fs.writeFileSync(`${__dirname}/../data/data.json`, newDataString);

  // return a successful response
  const content = '<p style="color:green;" font-weight="bold">New user creation successful!</p>';
  const length = helperHandler.getBinarySize(content);
  return helperHandler.respond(request, response, 201, content, 'text/html', length);
};

module.exports = {
  postNewWorkoutResponse,
  postNewUserResponse,
};
