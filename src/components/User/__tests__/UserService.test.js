const mongoose = require('mongoose');
const UserService = require('../service');

jest.mock('../model');
const UserModel = require('../model');

const userInput = {
  email: 'test@example.com',
  fullName: 'JohnDoe',
};

describe('UserComponent -> service', () => {
  describe('findAll', () => {
    test('when return a array with no users', (done) => {
      UserModel.find.mockResolvedValue([]);
      UserService.findAll({})
        .then((data) => {
          expect(data).toBeInstanceOf(Array);
          expect(data.length).toBe(0);
          done();
        })
        .catch((err) => done(err));
    });

    test('when return a array with users more than 0', (done) => {
      const uid = new mongoose.Types.ObjectId();
      const userOne = {
        fullName: 'dgfdadsx',
        email: 'asgfdaf@mail.com',
        _id: uid,
      };
      UserModel.find.mockResolvedValue([userOne]);
      UserService.findAll({})
        .then((data) => {
          expect(data).toBeInstanceOf(Array);
          expect(data.length).not.toBe(0);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('create', () => {
    describe('given the user payload are valid', () => {
      test('should return created user', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const userOne = {
          fullName: userInput.fullName,
          email: userInput.email,
          _id: uid,
        };
        UserModel.create.mockResolvedValue(userOne);
        UserService.create(userInput)
          .then((data) => {
            expect(data).toMatchObject(userOne);
            done();
          })
          .catch((err) => done(err));
      });
      test('E11000: should return error because email already exists', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const userOne = {
          fullName: userInput.fullName,
          email: userInput.email,
          _id: uid,
        };
        UserModel.create.mockResolvedValue(userOne);
        UserService.create(userInput)
          .then((data) => {
            expect(data).toMatchObject(userOne);
            done();
          })
          .catch((err) => done(err));
      });
    });
    describe('given the user payload are not valid', () => {
      test('should the email not be empty', (done) => {
        done();
      });
      test('the email string are not valid', (done) => {
        done();
      });
      test('the fullName should not be empty', (done) => {
        done();
      });
      test('the fullname should more than 5 characters', (done) => {
        done();
      });
      test('the fullName should not more than 30 characters', (done) => {
        done();
      });
      test('the fullName field cannot be contains numbers, symbols and whitespace', (done) => {
        done();
      });
    });
  });

  describe('findById', () => {
    describe('given id are valid', () => {
      test('should return user', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const userOne = {
          fullName: userInput.fullName,
          email: userInput.email,
          _id: uid,
        };
        UserModel.findById.mockResolvedValue(userOne);
        UserService.findById(uid)
          .then((data) => {
            expect(data).toMatchObject(userOne);
            done();
          })
          .catch((err) => done(err));
      });
      test('should return user not found', (done) => {
        const uid = new mongoose.Types.ObjectId();
        UserModel.findById.mockResolvedValue(null);
        UserService.findById(uid)
          .then((data) => {
            expect(data).toBeNull();
            done();
          })
          .catch((err) => done(err));
      });
    });
    describe('given id are not valid', () => {
      test('should return error', (done) => {
        done();
      });
    });
  });

  describe('updateById', () => {
    describe('given user payload are valid', () => {
      test('should return update info', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const userOne = {
          fullName: userInput.fullName,
        };
        const mockResolved = {
          acknowledged: true,
          modifiedCount: 1,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 1,
        };
        UserModel.updateOne.mockResolvedValue(mockResolved);
        UserService.updateById(uid, userOne)
          .then((data) => {
            expect(data.matchedCount).toBe(1);
            expect(data.modifiedCount).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });

      test('should return user not found', (done) => {
        const uid = new mongoose.Types.ObjectId();
        const userOne = {
          fullName: userInput.fullName,
        };
        const mockResolved = {
          acknowledged: true,
          modifiedCount: 0,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 0,
        };
        UserModel.updateOne.mockResolvedValue(mockResolved);
        UserService.updateById(uid, userOne)
          .then((data) => {
            expect(data.matchedCount).toBe(0);
            done();
          })
          .catch((err) => done(err));
      });
    });

    describe('given user payload are not valid', () => {
      const uid = new mongoose.Types.ObjectId();
      test('given id must not be empty', (done) => {
        const userPayload = {
          id: uid,
          fullName: 'Tester',
        };
        UserModel.updateOne.mockResolvedValue(mongoose.Error.ValidatorError);
        UserService.updateById({ _id: userPayload.id }, userPayload)
          .then((data) => {
            expect(data).toBe(mongoose.Error.ValidatorError);
            done();
          })
          .catch((err) => done(err));
      });
      test('given id must be are valid', (done) => {
        done();
      });
      test('given fullName must not be empty', (done) => {
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

  describe('deleteById', () => {
    describe('given user payload are valid', () => {
      test('should return deleteCount 1', (done) => {
        const uid = new mongoose.Types.ObjectId();
        UserModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
        UserService.deleteById({ id: uid })
          .then((data) => {
            expect(data).toHaveProperty('deletedCount');
            expect(data.deletedCount).toBe(1);
            done();
          })
          .catch((err) => done(err));
      });
      test('should return deleteCount 0', (done) => {
        const uid = new mongoose.Types.ObjectId();
        UserModel.deleteOne.mockResolvedValue({ deletedCount: 0 });
        UserService.deleteById({ id: uid })
          .then((data) => {
            expect(data).toHaveProperty('deletedCount');
            expect(data.deletedCount).toBe(0);
            done();
          })
          .catch((err) => done(err));
      });
    });
    describe('given user payload are not valid', () => {
      test('should return validation error', (done) => {
        done();
      });
    });
  });
});
