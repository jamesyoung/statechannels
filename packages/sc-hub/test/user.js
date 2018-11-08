describe('/user', function () {
  var server = require('../server/server')
  var request = require('supertest')(server)
  var expect = require('expect.js')

  var User

  before(function() {
    User = server.models.User
  })

  beforeEach(function (done) {
    User.upsert({
      id: 1,
      email: 'alice1@example.com',
      publicAddress: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f',
    },
      function() {
        done()
      })
  })

  it('Post - a new user', function (done) {
    request.post('/api/users').send({
      email: 'alice@example.com',
      publicAddress: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f',
    }).expect(200, done)
  })
})
