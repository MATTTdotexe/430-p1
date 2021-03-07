const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./responses.js');
const imageHandler = require('./imageResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getHomePageResponse,
  '/app': htmlHandler.getAppPageResponse,
  '/upload': htmlHandler.getUploadPageResponse,
  '/admin': htmlHandler.getAdminPageResponse,
  '/sign-in': htmlHandler.getSignInPageResponse,
  '/workout-records': jsonHandler.getAllWorkoutsResponse,
  '/users': jsonHandler.getAllUsersResponse,
  '/user-upload': jsonHandler.postNewUser,
  '/user-exists': jsonHandler.postUserExists,
  '/workout-upload': jsonHandler.postNewWorkout,
  '/workout-delete': jsonHandler.deleteWorkout,
  '/default-styles.css': htmlHandler.getDefaultStylesCSSResponse,
  '/logo.png': imageHandler.getLogoResponse,
  '/logo-icon.png': imageHandler.getLogoIconResponse,
  notFound: htmlHandler.get404Response,
};

// 7 - this is the function that will be called every time a client request comes in
const onRequest = (request, response) => {
  // url parsing
  const parsedUrl = url.parse(request.url);
  const { pathname } = parsedUrl;
  const params = query.parse(parsedUrl.query);
  const httpMethod = request.method;

  // get the headers
  let acceptedTypes = request.headers.accept && request.headers.accept.split(',');
  acceptedTypes = acceptedTypes || [];

  if (urlStruct[pathname]) {
    urlStruct[pathname](request, response, params, acceptedTypes, httpMethod);
  } else {
    urlStruct.notFound(request, response);
  }
};

// 8 - create the server, hook up the request handling function, and start listening on `port`
http.createServer(onRequest).listen(port);
// console.log(`Listening on 127.0.0.1: ${port}`);
