const path = require('path');
const expect = require('should/as-function');
const SolidityProject = require('../lib/solidity-project');

describe('SolidityProject', () => {
  const contracts = [
    'Channel',
    'Demo1',
    'Demo2',
    'Demo3',
    'Migrations',
    'SafeMath',
  ];
  let project;

  before(givenSolidityProject);

  it('loads json interfaces', async () => {
    const abis = await project.loadJsonInterfaces();
    const contracts = abis.map(c => c.contractName);
    expect(contracts).eql(contracts);
  });

  it('runs truffle:compile', async () => {
    const result = await project.compile({silent: true});
    expect(Object.keys(result.jsonInterfaces)).eql(contracts);
  });

  it.skip('runs truffle:migrate', async () => {
    const result = await project.migrate({reset: true});
    console.log(result);
  });

  function givenSolidityProject() {
    project = new SolidityProject(
      path.join(__dirname, '../../channel-contracts'),
    );
    return project;
  }
});
