const jokesObj = [
  { q: 'What do you call a very small valentine?', a: 'A valen-tiny!' },
  { q: 'What did the dog say when he rubbed his tail on the sandpaper?', a: 'Ruff, Ruff!' },
  { q: "Why don't sharks like to eat clowns?", a: 'Because they taste funny!' },
  { q: 'What did the boy cat say to the girl cat?', a: "You're Purr-fect!" },
  { q: "What is a frog's favorite outdoor sport?", a: 'Fly Fishing!' },
  { q: 'I hate jokes about German sausages.', a: 'Theyre the wurst.' },
  { q: 'Did you hear about the cheese factory that exploded in France?', a: 'There was nothing left but de Brie.' },
  { q: 'Our wedding was so beautiful ', a: 'Even the cake was in tiers.' },
  { q: 'Is this pool safe for diving?', a: 'It deep ends.' },
  { q: 'Dad, can you put my shoes on?', a: 'I dont think theyll fit me.' },
];

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

// Fisher-Yates-Durstenfeld shuffle
// Source: https://stackoverflow.com/questions/3718282/javascript-shuffling-objects-inside-an-object-randomize
// Adjusted to save to a temporary array by MR
const shuffleArray = (array) => {
  const tempArray = array;
  for (let i = 0; i < array.length; i++) {
    const j = i + Math.floor(Math.random() * (array.length - i));

    const temp = tempArray[j];
    tempArray[j] = tempArray[i];
    tempArray[i] = temp;
  }
  return tempArray;
};

// return a random joke
const getRandomJoke = () => {
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

module.exports.getRandomJokeResponse = getRandomJokeResponse;
module.exports.getRandomJokesResponse = getRandomJokesResponse;
