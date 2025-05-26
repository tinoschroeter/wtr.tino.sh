const request = require('supertest');
const app = require('../index');

describe('GET /health', function () {
  it('responds with OK', function (done) {
    request(app)
      .get('/health')
      .expect(200)
      .expect('OK', done);
  });
});
