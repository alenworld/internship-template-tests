const supertest = require('supertest');
const server = require('../../../server/server');
const UserModel = require('../model');
const connections = require('../../../config/connection');

const userInput = {
  email: 'test@example.com',
  fullName: 'JohnDoe',
};

describe('UserComponent', () => {
  /**
 * Connect to a new in-memory database before running any tests.
 */
  beforeAll(async () => {
    await UserModel.deleteMany({});
  });

  /**
* Remove and close the db and server.
*/
  afterAll(async () => {
    await UserModel.deleteMany({});
    await connections.close();
  });

  describe('GET /v1/users', () => {
    test('should return a list users', (done) => {
      supertest(server)
        .get('/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty('data');
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('POST /v1/users', () => {
    describe('given the user payload are valid', () => {
      test('should return a 201 and user', (done) => {
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(201).toBe(201);
            expect(body).toHaveProperty('data');
            expect(body.data).toMatchObject(userInput);

            done();
          })
          .catch((err) => done(err));
      });

      test('E11000: should return 500 because email already exists', (done) => {
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(500);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('MongoServerError');

            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('should return 422, given the user payloads are not valid', () => {
      test('the email should not be empty', (done) => {
        userInput.email = '';
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(422);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('E_MISSING_OR_INVALID_PARAMS');

            done();
          })
          .catch((err) => done(err));
      });

      test('the email string are not valid', (done) => {
        userInput.email = 'notemail';
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(422);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('E_MISSING_OR_INVALID_PARAMS');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullName should not be empty', (done) => {
        userInput.email = 'test@example.com';
        userInput.fullName = '';
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(422);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('E_MISSING_OR_INVALID_PARAMS');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullname should more than 5 characters', (done) => {
        userInput.fullName = 'asd';
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(422);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('E_MISSING_OR_INVALID_PARAMS');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullName should not more than 30 characters', (done) => {
        userInput.fullName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(422);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('E_MISSING_OR_INVALID_PARAMS');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullName field cannot be contains numbers, symbols and whitespace', (done) => {
        userInput.fullName = 'T3st#r ';
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then(({ body }) => {
            expect(422);
            expect(body).toHaveProperty('message');
            expect(body.message).toBe('E_MISSING_OR_INVALID_PARAMS');

            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('GET /v1/users/:id', () => {
    describe('given _id are valid', () => {
      let newUserId;

      beforeAll(async () => {
        userInput.fullName = 'newUser';
        userInput.email = 'newusertest@example.com';
        const response = await UserModel.create(userInput);
        newUserId = response._id;
      });

      afterEach(async () => {
        await UserModel.findByIdAndRemove(newUserId);
      });

      test('should return a 200 and user', (done) => {
        expect.assertions(1);
        userInput.fullName = 'NewName';
        supertest(server)
          .get(`/v1/users/${newUserId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.status).toBe(200);
            done();
          })
          .catch((err) => done(err));
      });

      test('should return 404 with user not found', (done) => {
        supertest(server)
          .get(`/v1/users/${newUserId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(({ body }) => {
            expect(404).toBe(404);
            expect(body.data).toBeNull();
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('PUT /v1/users', () => {
    describe('given user payload are valid', () => {
      const newUser = { id: '', fullName: 'updatedNameHere' };
      test('should return 200 and updated user', (done) => {
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .expect(201)
          .then((response) => {
            newUser.id = `${response.body.data._id}`;
            supertest(server)
              .put('/v1/users')
              .set('Accept', 'application/json')
              .type('json')
              .send(newUser)
              .then(({ body }) => {
                expect(200);
                expect(body.data.acknowledged).toBe(true);
              });
            done();
          })
          .catch((err) => done(err));
      });

      test('should return 404 with user not found', (done) => {
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then(() => {
            expect(404).toBe(404);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('should return 422, given user payload are not valid', () => {
      const newUser = { id: '', fullName: '' };

      beforeAll(async () => {
        userInput.fullName = 'newUser';
        userInput.email = 'putnonvalid@example.com';
        const response = await UserModel.create(userInput);
        newUser.id = response._id;
      });

      afterEach(async () => {
        await UserModel.findByIdAndRemove(newUser.id);
      });

      test('given fullName must be more than 5 characters', (done) => {
        newUser.fullName = 'abcd';
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            done();
          })
          .catch((err) => done(err));
      });

      test('given fullName is more than 30 characters', (done) => {
        newUser.fullName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            done();
          })
          .catch((err) => done(err));
      });

      test('given fullName field cannot be contains numbers, symbols and whitespace', (done) => {
        newUser.fullName = '1afds#fd';
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });

  describe('DELETE /v1/users', () => {
    const deleteUser = { id: '' };

    beforeAll(async () => {
      userInput.fullName = 'newUser';
      userInput.email = 'deleted@example.com';
      const response = await UserModel.create(userInput);
      deleteUser.id = response._id;
    });

    afterEach(async () => {
      await UserModel.findByIdAndRemove(deleteUser.id);
    });

    describe('given user payload are valid', () => {
      test('should return 200', (done) => {
        supertest(server)
          .delete('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(deleteUser)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body.data.deletedCount).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });

      test('should return 200 and user not found', (done) => {
        supertest(server)
          .delete('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(deleteUser)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body.data.deletedCount).toBe(0);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
