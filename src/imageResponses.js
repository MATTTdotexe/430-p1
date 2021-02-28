const fs = require('fs');

const logo = fs.readFileSync(`${__dirname}/../images/logo.png`);
const logoIcon = fs.readFileSync(`${__dirname}/../images/logo-icon.png`);

const getResponse = (request, response, responseCode, type, page) => {
  response.writeHead(responseCode, { 'Content-Type': type });
  response.write(page);
  response.end();
};

const getLogoResponse = (request, response) => {
  getResponse(request, response, 200, 'image/png', logo);
};

const getLogoIconResponse = (request, response) => {
  getResponse(request, response, 200, 'image/png', logoIcon);
};

module.exports = {
  getLogoResponse,
  getLogoIconResponse,
};
