'use strict';

const solc = require('solc');
const fs = require('fs');

function getSolSourceFile(fileName) {
  return fs.readFileSync(fileName, {encoding: 'utf-8'});
}

function compileSolSourceFile(sourceStr) {
  return solc.compile(sourceStr, 1);
}

function getAbi(compiledContract, contractName) {
  return JSON.parse(compiledContract.contracts[contractName].interface);
}

function getBytecode(compiledContract, contractName) {
  return compiledContract.contracts[contractName].bytecode;
}

function loadContract(solFile, contractName) {
  const contractStr = getSolSourceFile(solFile);
  const compiledContract = compileSolSourceFile(contractStr);
  const abi = getAbi(compiledContract, contractName);
  const bytecode = getBytecode(compiledContract, contractName);
  return {
    abi,
    bytecode,
  };
}

module.exports = {
  getAbi,
  getBytecode,
  getSolSourceFile,
  compileSolSourceFile,
  loadContract,
};
