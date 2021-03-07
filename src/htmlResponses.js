const fs = require('fs');

const homePage = fs.readFileSync(`${__dirname}/../client/homePage.html`);
const appPage = fs.readFileSync(`${__dirname}/../client/appPage.html`);
const uploadPage = fs.readFileSync(`${__dirname}/../client/uploadPage.html`);
const adminPage = fs.readFileSync(`${__dirname}/../client/adminPage.html`);
const signInPage = fs.readFileSync(`${__dirname}/../client/signInPage.html`);
const errorPage = fs.readFileSync(`${__dirname}/../client/error.html`);
const defaultStylesCSS = fs.readFileSync(`${__dirname}/../client/default-styles.css`);

const getResponse = (request, response, responseCode, type, page) => {
  response.writeHead(responseCode, { 'Content-Type': type });
  response.write(page);
  response.end();
};

const getHomePageResponse = (request, response) => {
  getResponse(request, response, 200, 'text/html', homePage);
};

const getAppPageResponse = (request, response) => {
  getResponse(request, response, 200, 'text/html', appPage);
};

const getUploadPageResponse = (request, response) => {
  getResponse(request, response, 200, 'text/html', uploadPage);
};

const getAdminPageResponse = (request, response) => {
  getResponse(request, response, 200, 'text/html', adminPage);
};

const getSignInPageResponse = (request, response) => {
  getResponse(request, response, 200, 'text/html', signInPage);
}

const get404Response = (request, response) => {
  getResponse(request, response, 404, 'text/html', errorPage);
};

const getDefaultStylesCSSResponse = (request, response) => {
  getResponse(request, response, 200, 'text/css', defaultStylesCSS);
};

module.exports = {
  getHomePageResponse,
  getAppPageResponse,
  getUploadPageResponse,
  getAdminPageResponse,
  getSignInPageResponse,
  get404Response,
  getDefaultStylesCSSResponse,
};
