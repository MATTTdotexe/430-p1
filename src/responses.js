const fs = require('fs');

const data = fs.readFileSync(`${__dirname}/../data/data.json`);

const respond = (request, response, content, type, length) => {
  response.writeHead(200, { 'Content-Type': type, 'Content-Length': length });
  response.write(content);
  response.end();
};

const respondHeaderOnly = (request, response, type, length) => {
  response.writeHead(200, { 'Content-Type': type, 'Content-Length': length });
  response.end();
};

// Source: https://stackoverflow.com/questions/2219526/how-many-bytes-in-a-javascript-string/29955838
// Refactored to an arrow function by ACJ
const getBinarySize = (string) => Buffer.byteLength(string, 'utf8');

const getExercise = () => {
  const number = Math.floor(Math.random() * jokesObj.length);
  const responseObj = jokesObj[number];

  return JSON.stringify(responseObj);
};

const getRandomJokes = (paramLimit = 1) => {
  shuffleArray(jokesObj);

  let limit = Number(paramLimit);
  limit = !limit ? 1 : limit;
  limit = limit < 1 ? 1 : limit;
  limit = limit > jokesObj.length ? jokesObj.length : limit;

  const responseObj = [];
  for (let i = 0; i <= limit - 1; i++) {
    responseObj[i] = jokesObj[i];
  }

  return JSON.stringify(responseObj);
};

const getRandomJokeResponse = (request, response, acceptedTypes, httpMethod) => {
  if (acceptedTypes[0] === 'text/xml') {
    // get the joke back in JSON form from a string
    const joke = JSON.parse(getRandomJoke());
    const responseXML = `
     <jokes>
      <joke>
       <q>${joke.q}</q>
       <a>${joke.a}</a>
      </joke>
     </jokes>
    `;

    if (httpMethod === 'HEAD') {
      return respondHeaderOnly(request, response, 'text/xml', getBinarySize(responseXML));
    }
    return respond(request, response, responseXML, 'text/xml', getBinarySize(responseXML));
  }
  if (httpMethod === 'HEAD') {
    return respondHeaderOnly(request, response, 'application/json', getBinarySize(getRandomJoke()));
  }
  const jokeResponse = getRandomJoke();
  return respond(request, response, jokeResponse, 'application/json', getBinarySize(jokeResponse));
};

const getRandomJokesResponse = (request, response, params, acceptedTypes, httpMethod) => {
  if (acceptedTypes[0] === 'text/xml') {
    const jokes = JSON.parse(getRandomJokes(params.limit));
    let responseXML = `
     <jokes>
    `;
    for (let i = 0; i < params.limit; i++) {
      responseXML += ` 
        <joke>
         <q>${jokes[i].q}</q>
         <a>${jokes[i].a}</a>
        </joke>
      `;
    }
    responseXML += `
     </jokes>
    `;
    // console.log(responseXML);

    if (httpMethod === 'HEAD') {
      return respondHeaderOnly(request, response, 'text/xml', getBinarySize(responseXML));
    }
    return respond(request, response, responseXML, 'text/xml', getBinarySize(responseXML));
  }
  if (httpMethod === 'HEAD') {
    return respondHeaderOnly(request, response, 'application/json', getBinarySize(getRandomJokes(params.limit)));
  }
  const jokeResponse = getRandomJokes(params.limit);
  return respond(request, response, jokeResponse, 'application/json', getBinarySize(jokeResponse));
};

const getWorkoutRecordsResponse = (request, response, params, acceptedTypes, httpMethod) => {

};

module.exports = {
  getWorkoutRecordsResponse
}