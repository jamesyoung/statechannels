const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const boot = require('loopback-boot');

const b = browserify({
  basedir: path.resolve(__dirname, '../client/loopback')
});

b.require(path.resolve(__dirname, '../client/loopback/index.js'), {expose: 'loopback-app'});

try {
  boot.compileToBrowserify({
    appRootDir: path.resolve(__dirname, '../client/loopback')
  }, b);
} catch(error) {
  throw error;
}

const target = fs.createWriteStream(path.resolve(__dirname, '../client/build/loopback.bundle.js'));

target
  .on('error', done)
  .on('close', done);

b.bundle().pipe(target);

function done(error, response) {
  if (error) {
    console.error(error);
  }
}
