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

describe('GET /admin', () => {
  it('returns a 400 when calling admin URL with no secret key', async () => {
    const response = await request(app).get('/admin')
    expect(response.status).toBe(401)
  })

  it('returns a 400 when calling admin URL with an incorrect password', async () => {
    const response = await request(app)
      .get('/admin')
      .auth('admin', process.env.ADMIN_PASSWORD + '1')

    expect(response.status).toBe(401)
  })

  it('returns a 200 when calling admin URL with a correct password', async () => {
    const response = await request(app)
      .get('/admin')
      .auth('admin', process.env.ADMIN_PASSWORD)

    expect(response.status).toBe(200)
  })

  it('returns a json when calling admin URL with a correct password', async () => {
    const response = await request(app)
      .get('/admin')
      .auth('admin', process.env.ADMIN_PASSWORD)

    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body).not.toBeNull()
  })
})

describe('GET /about-us', () => {
  it('shows the about us page', () => {
    return request(app)
      .get('/about-us')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=UTF-8')
  })
})

describe('GET /any-url', () => {
  it('shows the 404 page', () => {
    return request(app)
      .get('/any-url')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=UTF-8')
  })
})
