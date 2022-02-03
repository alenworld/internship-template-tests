const supertest = require('supertest');
const mongoose = require('mongoose');
const server = require('../../../server/server');

jest.mock('../service');
const UserService = require('../service');

jest.mock('../validation');
const UserValidation = require('../validation');
const ValidationError = require('../../../error/ValidationError');

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

    test('should return error 500', (done) => {
      expect.assertions(0);
      UserService.findAll.mockImplementation(() => {
        throw new Error('Internal Server Error');
      });
      supertest(server)
        .get('/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500, done);
    });
  });

  describe('POST /v1/users', () => {
    describe('given the user payload are valid', () => {
      test('should return a 201 and user', (done) => {
        UserValidation.create.mockReturnValue({ value: userInput });
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

      test('E11000: should return 500 because email already exists', (done) => {
        expect.assertions(3);
        UserValidation.create.mockReturnValue({ value: userInput });
        UserService.create.mockImplementation(() => {
          throw new mongoose.mongo.MongoServerError('E11000: duplicate');
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('MongoServerError');

            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('should return 422, given the user payloads are not valid', () => {
      test('the email should not be empty', (done) => {
        expect.assertions(4);
        userInput.email = '';
        UserValidation.create.mockReturnValue({
          error: {
            _original: { email: '', fullName: 'Tester' },
            details: [{
              message: '"email" is not allowed to be empty', path: ['email'], type: 'string.empty', context: { label: 'email', value: '', key: 'email' },
            }],
          },
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('E_MISSING_OR_INVALID_PARAMS');
            expect(response.body.details[0].type).toBe('string.empty');

            done();
          })
          .catch((err) => done(err));
      });

      test('the email string are not valid', (done) => {
        expect.assertions(4);
        userInput.email = 'notemail';
        UserValidation.create.mockReturnValue({
          error: {
            _original: { email: 'notemail', fullName: 'Tester' },
            details: [{
              message: '"email" must be a valid email',
              path: ['email'],
              type: 'string.email',
              context: {
                value: 'notemail', invalids: ['notemail'], label: 'email', key: 'email',
              },
            }],
          },
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('E_MISSING_OR_INVALID_PARAMS');
            expect(response.body.details[0].type).toBe('string.email');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullName should not be empty', (done) => {
        expect.assertions(4);
        userInput.email = 'test@example.com';
        userInput.fullName = '';
        UserValidation.create.mockReturnValue({
          error: {
            _original: { email: 'test@example.com', fullName: '' },
            details: [{
              message: '"fullName" is not allowed to be empty', path: ['fullName'], type: 'string.empty', context: { label: 'fullName', value: '', key: 'fullName' },
            }],
          },
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('E_MISSING_OR_INVALID_PARAMS');
            expect(response.body.details[0].type).toBe('string.empty');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullname should more than 5 characters', (done) => {
        expect.assertions(4);
        userInput.fullName = 'asdf';
        UserValidation.create.mockReturnValue({
          error: {
            _original: { email: 'test@example.com', fullName: 'asdf' },
            details: [{
              message: '"fullName" length must be at least 5 characters long',
              path: ['fullName'],
              type: 'string.min',
              context: {
                limit: 5, value: 'asdf', label: 'fullName', key: 'fullName',
              },
            }],
          },
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('E_MISSING_OR_INVALID_PARAMS');
            expect(response.body.details[0].type).toBe('string.min');

            done();
          })
          .catch((err) => done(err));
      });

      test('the fullName should not more than 30 characters', (done) => {
        expect.assertions(4);
        userInput.fullName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        UserValidation.create.mockReturnValue({
          error: {
            _original: { email: 'asgfda@fmail.com', fullName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
            details: [{
              message: '"fullName" length must be less than or equal to 30 characters long',
              path: ['fullName'],
              type: 'string.max',
              context: {
                limit: 30, value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', label: 'fullName', key: 'fullName',
              },
            }],
          },
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('E_MISSING_OR_INVALID_PARAMS');
            expect(response.body.details[0].type).toBe('string.max');

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
        UserValidation.findById.mockReturnValue({ value: userInput });
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

      test('should return 200 with user not found', (done) => {
        const uid = new mongoose.Types.ObjectId();
        UserValidation.findById.mockReturnValue({ value: { id: uid } });
        UserService.findById.mockResolvedValue(null);
        expect.assertions(2);
        supertest(server)
          .get(`/v1/users/${uid}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body.data).toBeNull();
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('422 given _id are not valid', () => {
      test('should return error', (done) => {
        const uid = new mongoose.Types.ObjectId();
        UserValidation.findById.mockImplementation(() => {
          throw new ValidationError('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
        });
        UserService.findById.mockResolvedValue(null);
        supertest(server)
          .get(`/v1/users/${uid}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(422, done);
      });
    });

    describe('500 return Internal Server Error', () => {
      test('Internal Server Error', (done) => {
        expect.assertions(1);
        UserValidation.create.mockReturnValue({ value: userInput });
        UserService.create.mockImplementation(() => {
          throw new Error('Internal Server Error');
        });
        supertest(server)
          .post('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(userInput)
          .then((response) => {
            expect(response.status).toBe(500);
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
        UserValidation.updateById.mockReturnValue({ value: newUser });
        UserService.updateById.mockResolvedValue({
          acknowledged: true,
          modifiedCount: 1,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 1,
        });
        expect.assertions(4);
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.matchedCount).toBe(1);
            expect(response.body.data.modifiedCount).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });

      test('should return 200 with user not found', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const newUser = { id: uid, fullName: 'updatedNameHere' };
        UserValidation.updateById.mockReturnValue({ value: newUser });
        UserService.updateById.mockResolvedValue({
          acknowledged: true,
          modifiedCount: 0,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 0,
        });
        expect.assertions(3);
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.matchedCount).toBe(0);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('should return 422, given user payload are not valid', () => {
      const uid = new mongoose.Types.ObjectId();
      const newUser = { id: uid, fullName: '' };

      test('given fullName must not be empty', (done) => {
        newUser.fullName = '';
        UserValidation.updateById.mockReturnValue({
          error: {
            _original: { id: '61fba7d07cfd4aa1c4156ece', fullName: '' },
            details: [{
              message: '"fullName" is not allowed to be empty', path: ['fullName'], type: 'string.empty', context: { label: 'fullName', value: '', key: 'fullName' },
            }],
          },
        });
        expect.assertions(3);
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.details[0].type).toBe('string.empty');
            done();
          })
          .catch((err) => done(err));
      });

      test('given fullName must be more than 5 characters', (done) => {
        newUser.fullName = 'asd';
        UserValidation.updateById.mockReturnValue({
          error: {
            _original: { id: '61fba7d07cfd4aa1c4156ece', fullName: 'asd' },
            details: [{
              message: '"fullName" length must be at least 5 characters long',
              path: ['fullName'],
              type: 'string.min',
              context: {
                limit: 5, value: 'asd', label: 'fullName', key: 'fullName',
              },
            }],
          },
        });
        expect.assertions(3);
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.details[0].type).toBe('string.min');
            done();
          })
          .catch((err) => done(err));
      });

      test('given fullName is more than 30 characters', (done) => {
        newUser.fullName = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        UserValidation.updateById.mockReturnValue({
          error: {
            _original: { id: '61fba7d07cfd4aa1c4156ece', fullName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
            details: [{
              message: '"fullName" length must be less than or equal to 30 characters long',
              path: ['fullName'],
              type: 'string.max',
              context: {
                limit: 30, value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', label: 'fullName', key: 'fullName',
              },
            }],
          },
        });
        expect.assertions(2);
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body.details[0].type).toBe('string.max');
            done();
          })
          .catch((err) => done(err));
      });

      test('given fullName field cannot be contains numbers, symbols and whitespace', (done) => {
        newUser.fullName = '1afds#fd';
        UserValidation.updateById.mockReturnValue({
          error: {
            _original: { id: '61fba7d07cfd4aa1c4156ece', fullName: '#a1sdf' },
            details: [{
              message: '"fullName" with value "#a1sdf" fails to match the required pattern: /^[a-zA-Z]*$/',
              path: ['fullName'],
              type: 'string.pattern.base',
              context: {
                regex: {}, value: '#a1sdf', label: 'fullName', key: 'fullName',
              },
            }],
          },
        });
        expect.assertions(2);
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body.details[0].type).toBe('string.pattern.base');
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('should return error 500', () => {
      test('Internal Server Error', (done) => {
        expect.assertions(1);
        const uid = new mongoose.Types.ObjectId();
        const newUser = { id: uid, fullName: 'updatedNameHere' };
        UserValidation.updateById.mockReturnValue({ value: newUser });
        UserService.updateById.mockImplementation(() => {
          throw new Error('Internal Server Error');
        });
        supertest(server)
          .put('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(newUser)
          .then((response) => {
            expect(response.status).toBe(500);
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
        UserValidation.deleteById.mockReturnValue({ value: deleteUser });
        UserService.deleteById.mockResolvedValue({
          deletedCount: 1,
        });
        expect.assertions(2);
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
        UserValidation.deleteById.mockReturnValue({ value: deleteUser });
        UserService.deleteById.mockResolvedValue({
          deletedCount: 0,
        });
        expect.assertions(2);
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

      test('should return 500', (done) => {
        UserValidation.deleteById.mockReturnValue({ value: deleteUser });
        UserService.deleteById.mockImplementation(() => {
          throw new Error('Internal Server Error');
        });
        expect.assertions(1);
        supertest(server)
          .delete('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send(deleteUser)
          .then((response) => {
            expect(response.status).toBe(500);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('given user payload are not valid', () => {
      test('should return error payload not valid', (done) => {
        UserValidation.deleteById.mockReturnValue({
          error: {
            _original: { id: '1234' },
            details: [{
              message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters',
              path: ['id'],
              type: 'objectId.base',
              context: { label: 'id', value: '1234', key: 'id' },
            }],
          },
        });
        expect.assertions(3);
        supertest(server)
          .delete('/v1/users')
          .set('Accept', 'application/json')
          .type('json')
          .send({ id: '1234' })
          .then((response) => {
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
            expect(response.body.details[0].type).toBe('objectId.base');
            done();
          })
          .catch((err) => done(err));
      });
    });
  });
});
