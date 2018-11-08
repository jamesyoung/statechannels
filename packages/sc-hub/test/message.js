describe('/message', function () {
  var server = require('../server/server')
  var request = require('supertest')(server)
  var expect = require('expect.js')

  var Message

  before(function() {
    Message = server.models.Message
  })

  beforeEach(function (done) {
    Message.upsert({
      id: 1
    },
      function() {
        done()
      })
  })

  it('Post a new message', function (done) {
    request.post('/api/messages/message').send({
      from: '0xac59d9c3f5d94becf12afa90b8c1dd3257039334',
      payer: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f'
    }).expect(200, done)
  })
})
