"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const app = require('../');
const request = require('supertest');
describe('GET /', () => {
    it('returns a 200 when HP is called', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/');
        expect(response.status).toBe(200);
    }));
    it('render the HP content with the <div id=app></div> block', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/');
        expect(response.text).toContain('<div id=app></div>');
    }));
});
describe('GET /admin', () => {
    it('returns a 400 when calling admin URL with no secret key', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/admin');
        expect(response.status).toBe(401);
    }));
    it('returns a 400 when calling admin URL with an incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app)
            .get('/admin')
            .auth('admin', process.env.ADMIN_PASSWORD + '1');
        expect(response.status).toBe(401);
    }));
    it('returns a 200 when calling admin URL with a correct password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app)
            .get('/admin')
            .auth('admin', process.env.ADMIN_PASSWORD);
        expect(response.status).toBe(200);
    }));
    it('returns a json when calling admin URL with a correct password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app)
            .get('/admin')
            .auth('admin', process.env.ADMIN_PASSWORD);
        expect(response.headers['content-type']).toBe('application/json');
        expect(response.body).not.toBeNull();
    }));
});
describe('GET /about-us', () => {
    it('shows the about us page', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/about-us');
        expect(response.status).toBe(200);
    }));
    it('render the about page content with the <div id=app></div> block', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/about-us');
        expect(response.text).toContain('<div id=app></div>');
    }));
});
describe('GET /env : The /env endpoints gives dynamic public env variables to front end app', () => {
    it('shows the /env json with a 200', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/env');
        expect(response.status).toBe(200);
    }));
    it('render the env json and is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/env');
        expect(response.body).not.toBeNull();
        expect(response.headers['content-type']).toBe('application/json');
    }));
});
describe('GET /rooms/{room-slug)', () => {
    it('shows a 200 when accessing a single room URL even if room does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/rooms/room-test');
        expect(response.status).toBe(200);
    }));
    it('render the single room page content with the <div id=app></div> block', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/rooms/room-slug');
        expect(response.text).toContain('<div id=app></div>');
    }));
});
describe('GET /any-url', () => {
    it('shows the 404 page', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/any-url');
        expect(response.status).toBe(404);
    }));
});
