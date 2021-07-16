const app = require('../')
const request = require('supertest')

describe('GET /', function () {
  it('shows the HP', function () {
    return request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .then((response) => {
        //console.log(response.text)
      })
  })
})

describe('GET /admin', function () {
  it('shows the admin page', function () {
    return request(app)
      .get('/admin')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
  })
})

describe('GET /about-us', function () {
  it('shows the about us page', function () {
    return request(app)
      .get('/about-us')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=UTF-8')
  })
})

describe('GET /any-url', function () {
  it('shows the 404 page', function () {
    return request(app)
      .get('/any-url')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=UTF-8')
  })
})
