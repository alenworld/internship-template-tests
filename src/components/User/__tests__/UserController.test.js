require('dotenv').config();
const supertest = require('supertest');
const connections = require('../../../config/connection');
const server = require('../../../server/server');
const UserModel = require('../model');

process.env.NODE_ENV = test;

describe('UserComponent -> controller', () => {
  beforeAll(async () => {
    await UserModel.deleteMany({}).catch((err) => {
      console.error(err);
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({}).catch((err) => {
      console.error(err);
    });
    await connections.close().catch((err) => {
      console.error(err);
    });
  });

  describe('findAll', () => {
    test('when users list is empty', (done) => {
      supertest(server)
        .get('/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('data');
          expect(body.data.length).toBe(0);
          done();
        })
        .catch((err) => done(err));
    });

    test('when users list length >= 1', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: 'test@test.com', fullName: 'TestName' })
        .then((response) => {
          expect(response.status).toEqual(201);
        });
      supertest(server)
        .get('/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('data');
          expect(body.data.length).not.toBe(0);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('create', () => {
    test('when body validate', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: 'test@test.com', fullName: 'TestName' })
        .then(({ body }) => {
          expect(201);
          expect(body).toHaveProperty('data');
          expect(body.data.email).toBe('test@test.com');

          done();
        })
        .catch((err) => done(err));
    });

    test('when email not valid', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: 'testcom', fullName: 'Testame' })
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"email" must be a valid email');

          done();
        })
        .catch((err) => done(err));
    });

    test('when email is empty', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: '', fullName: 'Test' })
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"email" is not allowed to be empty');

          done();
        })
        .catch((err) => done(err));
    });

    test('when fullname length < 5 ', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: 'test@gmail.com', fullName: 'a' })
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"fullName" length must be at least 5 characters long');

          done();
        })
        .catch((err) => done(err));
    });

    test('when fullname length > 30 ', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: 'test@gmail.com', fullName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"fullName" length must be less than or equal to 30 characters long');

          done();
        })
        .catch((err) => done(err));
    });

    test('when fullname is empty', (done) => {
      supertest(server)
        .post('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send({ email: 'test@gmail.com', fullName: '' })
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"fullName" is not allowed to be empty');

          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('findById', () => {
    let response;
    const data = {};

    beforeAll(async () => {
      data.email = 'tester@mail.com';
      data.fullName = 'Tester';
      JSON.stringify(data);
      response = await supertest(server).post('/v1/users').set('Accept', 'application/json').type('json')
        .send(data);
    });

    test('/v1/users/:id', (done) => {
      supertest(server)
        .get(`/v1/users/${response.body.data._id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('data');
          expect(body.data).toMatchObject(data);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('updateById', () => {
    let response;
    const data = {};

    beforeAll(async () => {
      data.email = 'testerupdate@mail.com';
      data.fullName = 'TesterNotUpdated';
      JSON.stringify(data);
      response = await supertest(server).post('/v1/users').set('Accept', 'application/json').type('json')
        .send(data);
    });

    test('when user returned and updated successfully', (done) => {
      const newData = {};
      newData.id = response.body.data.id;
      newData.fullName = 'UpdatedName';
      JSON.stringify(newData);
      supertest(server)
        .put('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send(newData)
        .then(({ body }) => {
          expect(body).toHaveProperty('data');
          expect(body.data.acknowledged).toBe(true);
          done();
        })
        .catch((err) => done(err));
    });

    test('when updated field is empty', (done) => {
      const newData = {};
      newData.id = response.body.data.id;
      newData.fullName = '';
      JSON.stringify(newData);
      supertest(server)
        .put('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send(newData)
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"fullName" is not allowed to be empty');
          done();
        })
        .catch((err) => done(err));
    });

    test('when updated field is too long', (done) => {
      const newData = {};
      newData.id = response.body.data.id;
      newData.fullName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      JSON.stringify(newData);
      supertest(server)
        .put('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send(newData)
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"fullName" length must be less than or equal to 30 characters long');
          done();
        })
        .catch((err) => done(err));
    });

    test('when updated field length must be more than 5 characters', (done) => {
      const newData = {};
      newData.id = response.body.data.id;
      newData.fullName = 'aaa';
      JSON.stringify(newData);
      supertest(server)
        .put('/v1/users')
        .set('Accept', 'application/json')
        .type('json')
        .send(newData)
        .then(({ body }) => {
          expect(422);
          expect(body).toHaveProperty('details');
          expect(body.details[0].message).toBe('"fullName" length must be at least 5 characters long');
          done();
        })
        .catch((err) => done(err));
    });
  });
});
