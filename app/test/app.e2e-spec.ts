import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Content endpoints (public)', () => {
    it('GET /content/movies should return 200 and array', () => {
      return request(app.getHttpServer())
        .get('/content/movies')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /content/series should return 200 and array', () => {
      return request(app.getHttpServer())
        .get('/content/series')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /content/genres should return 200 and array', () => {
      return request(app.getHttpServer())
        .get('/content/genres')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /content/classifications should return 200 and array', () => {
      return request(app.getHttpServer())
        .get('/content/classifications')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /content/movies/search?q=action should return 200', () => {
      return request(app.getHttpServer())
        .get('/content/movies/search')
        .query({ q: 'action' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /content/movies/search without query should return 400', () => {
      return request(app.getHttpServer())
        .get('/content/movies/search')
        .expect(400);
    });

    it('GET /content/movies/999 should return 404', () => {
      return request(app.getHttpServer())
        .get('/content/movies/999')
        .expect(404);
    });

    it('GET /content/series/999 should return 404', () => {
      return request(app.getHttpServer())
        .get('/content/series/999')
        .expect(404);
    });
  });

  describe('Auth endpoints', () => {
    it('POST /auth/register with valid data should return 201', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e@example.com',
          password: 'Test123456',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });
    });

    it('POST /auth/register with invalid email should return 400', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123456',
        })
        .expect(400);
    });

    it('POST /auth/login with valid credentials should return 200 and token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john.doe@streamflix.com',
          password: 'Test123456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('POST /auth/login with invalid credentials should return 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john.doe@streamflix.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Protected endpoints without token', () => {
    it('GET /accounts/me without token should return 401', () => {
      return request(app.getHttpServer()).get('/accounts/me').expect(401);
    });

    it('GET /profiles without token should return 401', () => {
      return request(app.getHttpServer()).get('/profiles').expect(401);
    });

    it('POST /content/movies without token should return 401', () => {
      return request(app.getHttpServer())
        .post('/content/movies')
        .send({
          title: 'Test Movie',
          description: 'Test',
          duration: '02:00:00',
          genreId: 1,
          classificationId: 1,
        })
        .expect(401);
    });
  });

  describe('XML content negotiation', () => {
    it('GET /content/movies with Accept: application/xml should return XML', () => {
      return request(app.getHttpServer())
        .get('/content/movies')
        .set('Accept', 'application/xml')
        .expect(200)
        .expect('Content-Type', /application\/xml/)
        .expect((res) => {
          expect(res.text).toMatch(/<\?xml version="1\.0" encoding="UTF-8"\?>/);
          expect(res.text).toMatch(/<response>/);
        });
    });
  });
});
