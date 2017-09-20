const { argv } = require('yargs');
const app = require('../../server/server.js');
const ngrok = require('ngrok');
const open = require('open');

const port = argv.port || 3000;

const startTunel = (port) => {
  ngrok.connect({
    authtoken: process.env.ngrokToken,
    auth: 'interactive:news',
    subdomain: 'politico',
    addr: port,
  }, (err, url) => { open(url); });
};

module.exports = (cb) => {
  app.startServer(port);

  if (argv.ngrok) {
    startTunel(port);
  }
};
