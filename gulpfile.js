const env = require('gulp-env');
const runSequence = require('run-sequence');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const SecureKeys = require('secure-keys');
const gutil = require('gulp-util');
const envFile = require('node-env-file');
const gulp = require('./gulp')([
  'aws',
  'archie',
  'build',
  'dev',
  'dist',
  'html',
  'img',
  
]);

/* Add secure keys to environment */
envFile(path.join(__dirname, '.env'), { overwrite: true }); // Adds PASSPHRASE to env
const secure = new SecureKeys({ secret: process.env.PASSPHRASE });
const keysPath = path.join(os.homedir(), '.dailycal/projects-credentials.json');
const keysObj = fs.readJsonSync(keysPath);
try {
  env.set(secure.decrypt(keysObj));
} catch (e) {
  gutil.log(
    gutil.colors.bgRed('PASSPHRASE ERROR:'),
    'Could not validate keys. Correct PASSPHRASE in .env or run',
    gutil.colors.cyan('yo dailycal-projects:passphrase'),
    'to creare a new key set.'
  );
  gutil.log(e);
  // Exit process if keys don't validate
  process.exit();
}

gulp.task('default', ['dev']);

gulp.task('render', (cb) => {
  runSequence('html', 'img', 'build', cb);
});

gulp.task('preview', (cb) => {
  runSequence('render', 'dist', cb);
});

gulp.task('publish', (cb) => {
  runSequence('render', 'aws', cb);
});
