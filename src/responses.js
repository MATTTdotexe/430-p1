const fs = require('fs');
const helperHandler = require('./helper.js');

const data = JSON.parse(fs.readFileSync(`${__dirname}/../data/data.json`));

const respond = (request, response, content, type, length) => {
  response.writeHead(200, { 'Content-Type': type, 'Content-Length': length });
  response.write(content);
  response.end();
};

const respondHeaderOnly = (request, response, type, length) => {
  response.writeHead(200, { 'Content-Type': type, 'Content-Length': length });
  response.end();
};

// returns all workouts for a user, defaults to me :)
const getAllWorkouts = (paramUser = "matthewroberts117") => {
  const responseObj = () => { 
    for (let i = 0; i <= data.length; i++) {
      if (data[i].user === paramUser) {
        return data[i];
      }
    }
  };
  return JSON.stringify(responseObj());
};

const getAllWorkoutsResponse = (request, response, params, acceptedTypes, httpMethod) => {
  if (acceptedTypes[0] === 'text/xml') {
    const workouts = JSON.parse(getAllWorkouts(params.user)).workouts;
    let responseXML = `<workouts>`;

    // write XML for each workout
    for (let i = 0; i < Object.keys(workouts).length; i++) {
      let exercises = workouts[i]["exercises"];
      responseXML += 
       `<workout>
         <date>${workouts[i].date}</date>
         <type>${workouts[i].type}</type>
         <overallDifficulty>${workouts[i].overallDifficulty}</overallDifficulty>
       `;

      // write XML for each exercise
      for (let j = 0; j < Object.keys(exercises).length; j++) {
        let sets = exercises[j]["sets"];
        responseXML += 
         `<exercise>
           <name>${exercises[j].name}</name>
         `;

        // write XML for each set
        for (let k = 0; k < Object.keys(sets).length; k++) {
          responseXML += 
           `<set>
             <reps>${sets[k].reps}</reps>
             <weight>${sets[k].weight}</weight>
             <setDifficulty>${sets[k].setDifficulty}</setDifficulty>
            </set>
           `;
        }
        responseXML += 
         `</exercise>
         `;
      }
      responseXML += 
         `</workout>
         `;
    }
    responseXML += 
    `</workouts>
    `;

    if (httpMethod === 'HEAD') {
      return respondHeaderOnly(request, response, 'text/xml', helperHandler.getBinarySize(responseXML));
    }
    return respond(request, response, responseXML, 'text/xml', helperHandler.getBinarySize(responseXML));
  }

  if (httpMethod === 'HEAD') {
    return respondHeaderOnly(request, response, 'application/json', helperHandler.getBinarySize(getAllWorkouts(params.user)));
  }

  const workoutResponse = getAllWorkouts(params.user);
  // const workoutResponse = "test string";
  return respond(request, response, workoutResponse, 'application/json', helperHandler.getBinarySize(workoutResponse));
};

module.exports = {
  getAllWorkoutsResponse
};