const archiemlPipe = require('archieml-pipe').default;
const path = require('path');

module.exports = (cb) => {
  archiemlPipe({
    googleDocId: process.env.ARCHIEDOC,
    googleClientId: process.env.googleClientId,
    googleClientSecret: process.env.googleClientSecret,
    exportPath: path.join(process.cwd(), 'src/data/archie.json'),
  });
  cb();
};
