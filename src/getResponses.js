const fs = require('fs');
const helperHandler = require('./helper.js');

// responds with html or xml confirming if a user exists in the system
const getUserExistsResponse = (request, response, params, acceptedTypes, httpMethod) => {
  // check if the http method is correct
  if (httpMethod !== 'GET' && httpMethod !== 'HEAD') {
    if (acceptedTypes.includes('text/xml')) {
      const content = '<error>Method not allowed.</error>';
      const length = helperHandler.getBinarySize(content);
      return helperHandler.respond(request, response, 405, content, 'text/xml', length);
    }
    const content = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 405, content, 'text/html', length);
  }

  const { user } = params;
  // check if a user was provided
  if (!user) {
    if (acceptedTypes.includes('text/xml')) {
      const content = '<error>No user provided.</error>';
      const length = helperHandler.getBinarySize(content);
      return helperHandler.respond(request, response, 400, content, 'text/xml', length);
    }
    // return a response that the user was not provided
    const content = '<p style="color:red;" font-weight="bold">No user provided.</p>';
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 400, content, 'text/html', length);
  }

  // check the data for the user
  const userIndex = helperHandler.doesUserExist(user);
  if (userIndex === -1) {
    if (acceptedTypes.includes('text/xml')) {
      const content = `<error>User ${user} does not exist.</error>`;
      const length = helperHandler.getBinarySize(content);
      return helperHandler.respond(request, response, 400, content, 'text/xml', length);
    }
    // return a response that the user does not exist
    const content = `<p style="color:red;" font-weight="bold">User ${user} does not exist.</p>`;
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 200, content, 'text/html', length);
  }

  // check for a HEAD http method
  if (httpMethod === 'HEAD') {
    if (acceptedTypes.includes('text/xml')) {
    // return a response of that the user exists
      const content = `<message>User ${user} does exist.</message>`;
      const length = helperHandler.getBinarySize(content);
      return helperHandler.respondHeaderOnly(request, response, 200, 'text/html', length);
    }
    // return a response of that the user exists
    const content = `<p style="color:green;" font-weight="bold">User ${user} does exist.</p>`;
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respondHeaderOnly(request, response, 200, 'text/html', length);
  }

  // responses for a normal HEAD http type
  if (acceptedTypes.includes('text/xml')) {
    // return a response of that the user exists
    const content = `<message>User ${user} does exist.</message>`;
    const length = helperHandler.getBinarySize(content);
    return helperHandler.respond(request, response, 200, content, 'text/html', length);
  }
  // return a response of that the user exists
  const content = `<p style="color:green;" font-weight="bold">User ${user} does exist.</p>`;
  const length = helperHandler.getBinarySize(content);
  return helperHandler.respond(request, response, 200, content, 'text/html', length);
};

// returns a string of all users in the system of the requested type, either xml or json
const getAllUsers = (type) => {
  // reads in external JSON file where all data is stored
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  if (type === 'json') {
    const responseObjJSON = () => {
      const allUsers = [];
      // loop through all objects and search for the user param
      for (let i = 0; i < data.length; i++) {
        allUsers.push(data[i].user);
      }
      return allUsers;
    };
    return JSON.stringify(responseObjJSON());
  } if (type === 'xml') {
    const responseObjXML = () => {
      let allUsers = '<allUsers>';
      // loop through all objects and search for the user param
      for (let i = 0; i < data.length; i++) {
        allUsers.push(data[i].user);
        allUsers += `<user>${data[i].user}</user>`;
      }
      allUsers += '</allUsers>';
      return allUsers;
    };
    return responseObjXML();
  }
  return '';
};

// responds with a list of all users back to the client, json string or xml, no parameters
const getAllUsersResponse = (request, response, params, acceptedTypes, httpMethod) => {
  // check http method
  if (httpMethod !== 'GET' && httpMethod !== 'HEAD') {
    if (acceptedTypes.includes('text/xml')) {
      const errorContent = '<erro>Method not allowed.</error>';
      return helperHandler.respond(request, response, 405, errorContent, 'text/xml', helperHandler.getBinarySize(errorContent));
    }
    const errorContent = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    return helperHandler.respond(request, response, 405, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // HEAD method responses
  if (httpMethod === 'HEAD') {
    if (acceptedTypes.includes('text/xml')) {
      const allUsersResponse = getAllUsers('xml');
      return helperHandler.respondHeaderOnly(request, response, 200, 'text/xml', helperHandler.getBinarySize(allUsersResponse));
    }
    const allUsersResponse = getAllUsers('json');
    return helperHandler.respondHeaderOnly(request, response, 200, 'application/json', helperHandler.getBinarySize(allUsersResponse));
  }

  // GET method responses
  if (acceptedTypes.includes('text/xml')) {
    const allUsersResponse = getAllUsers('xml');
    return helperHandler.respond(request, response, 200, allUsersResponse, 'text/xml', helperHandler.getBinarySize(allUsersResponse));
  }
  const allUsersResponse = getAllUsers('json');
  return helperHandler.respond(request, response, 200, allUsersResponse, 'application/json', helperHandler.getBinarySize(allUsersResponse));
};

// returns a string of all workout data at a given index, default to 0
const getAllWorkouts = (userIndex = 0) => {
  // reads in external JSON file where all data is stored
  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

  // check if the index is valid
  if (userIndex < 0 || userIndex >= data.length) {
    return '';
  }

  return JSON.stringify(data[userIndex]);
};

// responds with a string of all workout data for a user back to the client
// supports GET and HEAD request headers and XML http request type
const getAllWorkoutsResponse = (request, response, params, acceptedTypes, httpMethod) => {
  const { user } = params;

  // check for a request for XML, otherwise will return json
  const returnXML = acceptedTypes.includes('text/xml');

  // check the http method is valid
  if (httpMethod !== 'GET' && httpMethod !== 'HEAD') {
    if (returnXML) {
      const errorContent = '<error>Method not allowed.</error>';
      return helperHandler.respond(request, response, 405, errorContent, 'text/xml', helperHandler.getBinarySize(errorContent));
    }
    const errorContent = '<p style="color:red;" font-weight="bold">Method not allowed.</p>';
    return helperHandler.respond(request, response, 405, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // returns a bad request error if no user parameter was passed in
  if (!user && returnXML) {
    const errorContent = '<error>You must provide a user.</error>';
    return helperHandler.respond(request, response, 400, errorContent, 'text/xml', helperHandler.getBinarySize(errorContent));
  } if (!user) {
    const errorContent = '<p style="color:red;" font-weight="bold">You must provide a user.</p>';
    return helperHandler.respond(request, response, 400, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // check if the provided user exists
  const userExists = helperHandler.doesUserExist(user);

  // returns an error message if the user does not exist
  if (userExists === -1 && returnXML) {
    const errorContent = `<error>User ${user} does not exist.</error>`;
    return helperHandler.respond(request, response, 200, errorContent, 'text/xml', helperHandler.getBinarySize(errorContent));
  } if (userExists === -1) {
    const errorContent = `<p style="color:red;" font-weight="bold">User ${user} does not exist.</p>`;
    return helperHandler.respond(request, response, 200, errorContent, 'text/html', helperHandler.getBinarySize(errorContent));
  }

  // structures XML if it is a requested type
  if (returnXML) {
    const { workouts } = JSON.parse(getAllWorkouts(userExists));
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
      return helperHandler.respondHeaderOnly(request, response, 200, 'text/xml', helperHandler.getBinarySize(responseXML));
    // XML GET request
    }
    return helperHandler.respond(request, response, 200, responseXML, 'text/xml', helperHandler.getBinarySize(responseXML));
  }

  // JSON HEAD request
  if (httpMethod === 'HEAD') {
    return helperHandler.respondHeaderOnly(request, response, 200, 'application/json', helperHandler.getBinarySize(getAllWorkouts(userExists)));
  }

  // JSON GET request
  const workoutContent = getAllWorkouts(userExists);
  return helperHandler.respond(request, response, 200, workoutContent, 'application/json', helperHandler.getBinarySize(workoutContent));
};

module.exports = {
  getUserExistsResponse,
  getAllUsersResponse,
  getAllWorkoutsResponse,
};
