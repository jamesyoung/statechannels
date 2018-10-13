'use strict';

const promisify = require('util').promisify;
const glob = promisify(require('glob'));
const path = require('path');

const truffleCompile = require('truffle-compile').all;
const truffleMigrate = promisify(require('truffle-migrate').run);
const truffleResolver = require('truffle-resolver');
const truffleProvider = require('truffle-provider');
const artifactor = require('truffle-artifactor');
const solc = require('solc');

function compile(options, cb) {
  truffleCompile(options, function(err, jsonInterfaces, files) {
    cb(err, {jsonInterfaces, files});
  });
}

const compileAsync = promisify(compile);

class SolidityProject {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.options = {
      working_directory: this.rootDir,
      contracts_directory: path.join(this.rootDir, 'contracts'),
      contracts_build_directory: path.join(this.rootDir, 'build'),
      migrations_directory: path.join(this.rootDir, 'migrations'),
      network: '*',
      network_id: '*',
    };
    this.options.resolver = new truffleResolver(this.options);
    try {
      const networks = require(path.join(this.rootDir, 'truffle.js')).networks;
      networks = networks || {};
      Object.assign(this.options, Object.values(networks)[0]);
    } catch (err) {
      // Ignore
    }
  }

  async loadJsonInterfaces() {
    const build = this.options.contracts_build_directory;
    const files = await glob('**/*.json', {
      cwd: build,
      nodir: true,
      dot: false,
    });
    return files.map(f => require(path.resolve(build, f)));
  }

  async compile(options) {
    options = Object.assign(
      {
        solc,
      },
      this.options,
      options,
    );
    return await compileAsync(options);
  }

  async migrate(options) {
    options = Object.assign(
      {
        artifactor,
        provider: truffleProvider.create(options || {}),
      },
      this.options,
      options,
    );
    return await truffleMigrate(options);
  }
}

module.exports = SolidityProject;
