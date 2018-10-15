'use strict';

const promisify = require('util').promisify;
const glob = promisify(require('glob'));
const path = require('path');

const truffleCompile = require('truffle-compile').all;
const truffleMigrateModule = require('truffle-migrate');
const truffleMigrate = promisify(
  truffleMigrateModule.run.bind(truffleMigrateModule),
);
const truffleResolver = require('truffle-resolver');
const truffleProvider = require('truffle-provider');
const artifactor = require('truffle-artifactor');
const solc = require('solc');
const debug = require('debug')('loopback:connector:web3');

function compile(options, cb) {
  truffleCompile(options, function(err, jsonInterfaces, files) {
    cb(err, {jsonInterfaces, files});
  });
}

const compileAsync = promisify(compile);

class SolidityProject {
  constructor(rootDir) {
    this.rootDir = path.resolve(rootDir);
    this.options = {
      working_directory: this.rootDir,
      contracts_directory: path.resolve(this.rootDir, 'contracts'),
      contracts_build_directory: path.resolve(this.rootDir, 'build/contracts'),
      migrations_directory: path.resolve(this.rootDir, 'migrations'),
      network: '*',
      network_id: '*',
    };
    this.options.resolver = new truffleResolver(this.options);
    try {
      const truffleJs = path.resolve(this.rootDir, 'truffle.js');
      const truffleConfig = require(truffleJs);
      let networks = truffleConfig.networks;
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
    debug('Contract json files:', files);
    return files.map(f => require(path.resolve(build, f)));
  }

  syncLoadJsonInterfaces() {
    const build = this.options.contracts_build_directory;
    const files = glob.sync('**/*.json', {
      cwd: build,
      nodir: true,
      dot: false,
    });
    debug('Contract json files:', files);
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
      },
      this.options,
      options,
    );
    options.provider = truffleProvider.create(options || {});
    return await truffleMigrate(options);
  }
}

module.exports = SolidityProject;
