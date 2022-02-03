const supertest = require('supertest');
const mongoose = require('mongoose');
const server = require('../../../server/server');

jest.mock('../service');
const UserService = require('../service');

const userInput = {
  email: 'test@example.com',
  fullName: 'JohnDoe',
};

describe('UserComponent -> controller', () => {
  describe('GET /v1/users', () => {
    test('should return a list users', (done) => {
      UserService.findAll.mockResolvedValue([]);
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
        UserService.create.mockResolvedValue(userInput);
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

      test.skip('E11000: should return 500 because email already exists', (done) => {
        // ???
        UserService.create.mockResolvedValue();
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
      test('should return a 200 and user', (done) => {
        const uid = new mongoose.Types.ObjectId();
        userInput.fullName = 'NewName';
        UserService.findById.mockResolvedValue({
          id: uid, fullName: userInput.fullName, email: userInput.email,
        });
        expect.assertions(1);
        supertest(server)
          .get(`/v1/users/${uid}`)
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
        const uid = new mongoose.Types.ObjectId();
        UserService.findById.mockResolvedValue(null);
        supertest(server)
          .get(`/v1/users/${uid}`)
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
      test('should return 200 and updated user', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const newUser = { id: uid, fullName: 'updatedNameHere' };
        UserService.updateById.mockResolvedValue({
          acknowledged: true,
          modifiedCount: 1,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 1,
        });
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then(({ body }) => {
            expect(body).toHaveProperty('data');
            expect(body.data.matchedCount).toBe(1);
            expect(body.data.modifiedCount).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });

      test('should return 404 with user not found', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const newUser = { id: uid, fullName: 'updatedNameHere' };
        UserService.updateById.mockResolvedValue({
          acknowledged: true,
          modifiedCount: 0,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 0,
        });
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
      const uid = new mongoose.Types.ObjectId();
      const newUser = { id: uid, fullName: '' };

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
    const uid = new mongoose.Types.ObjectId();
    const deleteUser = { id: uid };

    describe('given user payload are valid', () => {
      test('should return 200', (done) => {
        UserService.deleteById.mockResolvedValue({
          deletedCount: 1,
        });
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
        UserService.deleteById.mockResolvedValue({
          deletedCount: 0,
        });
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

    describe.skip('given user payload are not valid', () => {
      test('should return error payload not valid', (done) => {
        // mock error
        UserService.deleteById.mockResolvedValue({
          deletedCount: 1,
        });
        supertest(server)
          .delete('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send({ id: '1234' })
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body.data.deletedCount).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
