'use strict';

const temp = require('temp');
temp.track();
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
const truffleConfig = require('truffle-config');
const Artifactor = require('truffle-artifactor');
const solc = require('solc');
const debug = require('debug')('loopback:connector:web3');
const mkdir = promisify(temp.mkdir.bind(temp));

function compile(options, cb) {
  truffleCompile(options, function(err, jsonInterfaces, files) {
    cb(err, {jsonInterfaces, files});
  });
}

const compileAsync = promisify(compile);

class SolidityProject {
  constructor(rootDir, network = 'development') {
    this.rootDir = path.resolve(rootDir);
    const options = {
      working_directory: this.rootDir,
      contracts_directory: path.resolve(this.rootDir, 'contracts'),
      contracts_build_directory: path.resolve(this.rootDir, 'build/contracts'),
      migrations_directory: path.resolve(this.rootDir, 'migrations'),
      network,
      network_id: '*',
    };
    this.options = truffleConfig.detect(options);
    debug('Options', this.options);
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
    options.resolver = new truffleResolver(options);
    debug('Compile', options);
    return await compileAsync(options);
  }

  async migrate(options) {
    const tempDir = await mkdir('migrate-dry-run-');
    options = this.options.with(options || {});
    options.artifactor = new Artifactor(tempDir);
    options.provider = truffleProvider.create(options);
    options.resolver = new truffleResolver(options);
    debug('Migrate', options);
    return await truffleMigrate(options);
  }
}

module.exports = SolidityProject;
