const app = require('../index')
const request = require('supertest')

describe('GET /', () => {
  it('returns a 200 when HP is called', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
  })

  it('render the HP content with the <div id=app></div> block', async () => {
    const response = await request(app).get('/')
    expect(response.text).toContain('<div id=app></div>')
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
