const supertest = require('supertest');
const mongoose = require('mongoose');
const connections = require('../../../config/connection');
const server = require('../../../server/server');
const UserModel = require('../model');

const userId = new mongoose.Types.ObjectId().toString();

const userPayload = {
  _id: userId,
  email: 'john.doe@example.com',
  fullName: 'JohnDoe',
};

const userInput = {
  email: 'test@example.com',
  fullName: 'JohnDoe',
};

/** *************^^^^^^^^^^^^^^^^^^^^^*************** */
/** **************IMPORTS AND CONSTS***************** */
/** ************************************************* */
beforeAll(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await UserModel.deleteMany({});
  await connections.close();
});
describe('UserComponent', () => {
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
            expect(201);
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
        userInput.fullName = 'NewName';
        supertest(server)
          .get(`/v1/users/${newUserId}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(() => {
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

  describe('PUT /v1/users/:id', () => {
    describe('given user payload are valid', (done) => {
      userInput.email = 'newemail@gmail.com';
      test('should return 200 and updated user', (done) => {
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .expect(201)
          .then(() => {
            userInput.fullName = 'updatedNameHere';
            supertest(server)
              .put('/v1/users')
              .set('Accept', 'application/json')
              .type('json')
              .expect(200)
              .then(({ body }) => {
                expect(body.data.acknowledged).toBe(true);
              });
            done();
          })
          .catch((err) => done(err));
      });

      /** ************************************************* */
      /** *****************STOPPED HERE******************** */
      /** ************************************************* */

      test('should return 404 with user not found', (done) => {
        done();
      });
    });

    describe('should return 422, given user payload are not valid', () => {
      test('given fullName cannot be empty', (done) => {
        // use service mock
        // then supertest(server)
        done();
      });

      test('given fullName must be more than 5 characters', (done) => {
        done();
      });

      test('given fullName is more than 30 characters', (done) => {
        done();
      });

      test('given fullName field cannot be contains numbers, symbols and whitespace', (done) => {
        done();
      });
    });
  });
  // PUT id

  describe('DELETE /v1/users/:id', () => {
    describe('given user payload are valid', () => {
      test('should return 200 and check user was not found 404', (done) => {
        // use service mock
        // then supertest(server)
        done();
      });

      test('should return 404 with user not found', (done) => {
        done();
      });
    });
  });
  // DELETE id
});
