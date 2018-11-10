describe('/application', function () {
  var server = require('../server/server')
  var request = require('supertest')(server)
  var expect = require('expect.js')

  var Application

  before(function() {
    Application = server.models.Application
  })

  beforeEach(function (done) {
    Application.upsert({
      id: 1,
      name: 'My App',
      description: 'A cool app',
      webhook: 'http:://localhost',
      publicAddress: '0x6ffc892eb903bcfe8dcd0b0fa7e1db8291bcacc7',
      userId: 1
    },
      function() {
        done()
      })
  })

  it('Post - a new application', function (done) {
    request.post('/api/applications').send({
      name: 'My App',
      description: 'A cool app',
      webhook: 'http:://localhost',
      publicAddress: '0x6ffc892eb903bcfe8dcd0b0fa7e1db8291bcacc7',
      userId: 1
    }).expect(200, done)
  })
})
