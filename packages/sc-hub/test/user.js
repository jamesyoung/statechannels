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
      publicAddress: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2d',
    }, function() {
        done()
      })
  })

  it('Post - a new user', function (done) {
    request.post('/api/users').send({
      email: 'alice@example.com',
      publicAddress: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f',
    }).expect(200, done)
  })

  it('Post - a new user (bob)', function (done) {
    request.post('/api/users').send({
      email: 'bob@example.com',
      publicAddress: '0xac59d9c3f5d94becf12afa90b8c1dd3257039334',
    }).expect(200, done)
  })
})
