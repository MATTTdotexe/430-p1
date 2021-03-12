const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const getHandler = require('./getResponses.js');
const postHandler = require('./postResponses.js');
const deleteHandler = require('./deleteResponses.js');

const imageHandler = require('./imageResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getHomePageResponse,
  '/app': htmlHandler.getAppPageResponse,
  '/upload': htmlHandler.getUploadPageResponse,
  '/admin': htmlHandler.getAdminPageResponse,
  '/sign-in': htmlHandler.getSignInPageResponse,
  '/default-styles.css': htmlHandler.getDefaultStylesCSSResponse,

  '/user-exists': getHandler.getUserExistsResponse,
  '/users': getHandler.getAllUsersResponse,
  '/workout-records': getHandler.getAllWorkoutsResponse,

  '/user-upload': postHandler.postNewUserResponse,
  '/workout-upload': postHandler.postNewWorkoutResponse,

  '/workout-delete': deleteHandler.deleteWorkoutResponse,
  '/exercise-delete': deleteHandler.deleteExerciseResponse,

  '/logo.png': imageHandler.getLogoResponse,
  '/logo-icon.png': imageHandler.getLogoIconResponse,

  notFound: htmlHandler.get404Response,
};

const onRequest = (request, response) => {
  // get the parameters from the URL
  const parsedUrl = url.parse(request.url);
  const { pathname } = parsedUrl;
  const params = query.parse(parsedUrl.query);
  const httpMethod = request.method;
  // get the headers and pass them in
  let acceptedTypes = request.headers.accept && request.headers.accept.split(',');
  acceptedTypes = acceptedTypes || [];

  if (urlStruct[pathname]) {
    urlStruct[pathname](request, response, params, acceptedTypes, httpMethod);
  } else {
    urlStruct.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);
