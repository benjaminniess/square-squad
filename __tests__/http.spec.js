const app = require('../build/index')
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
  it('shows the about us page', async () => {
    const response = await request(app).get('/about-us')

    expect(response.status).toBe(200)
  })

  it('render the about page content with the <div id=app></div> block', async () => {
    const response = await request(app).get('/about-us')
    expect(response.text).toContain('<div id=app></div>')
  })
})

describe('GET /env : The /env endpoints gives dynamic public env variables to front end app', () => {
  it('shows the /env json with a 200', async () => {
    const response = await request(app).get('/env')
    expect(response.status).toBe(200)
  })

  it('render the env json and is not null', async () => {
    const response = await request(app).get('/env')

    expect(response.body).not.toBeNull()
    expect(response.headers['content-type']).toBe('application/json')
  })
})

describe('GET /rooms/{room-slug)', () => {
  it('shows a 200 when accessing a single room URL even if room does not exist', async () => {
    const response = await request(app).get('/rooms/room-test')
    expect(response.status).toBe(200)
  })

  it('render the single room page content with the <div id=app></div> block', async () => {
    const response = await request(app).get('/rooms/room-slug')
    expect(response.text).toContain('<div id=app></div>')
  })
})

describe('GET /any-url', () => {
  it('shows the 404 page', async () => {
    const response = await request(app).get('/any-url')
    expect(response.status).toBe(404)
  })
})
