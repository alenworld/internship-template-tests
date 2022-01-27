require('dotenv').config();
const { Error } = require('mongoose');
const UserModel = require('../model');
const connections = require('../../../config/connection');

const userData = { email: 'testedemail@mail.com', fullName: 'Tester Test' };

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

describe('UserComponent -> model', () => {
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

  test('create & save user successfully', async () => {
    const validUser = await UserModel.create(userData);

    expect(validUser._id).toBeDefined();
    expect(validUser.fullName).toBe(userData.fullName);
    expect(validUser.email).toBe(userData.email);
  });

  test('insert user successfully, but the field does not defined in schema should be undefined', async () => {
    const userWithInvalidField = await UserModel.create({ email: 'tester@mail.com', fullName: 'Good Name', nickname: 'testerusername' });

    expect(userWithInvalidField._id).toBeDefined();
    expect(userWithInvalidField.nickname).toBeUndefined();
  });

  test('create user without required field should failed', async () => {
    let err;
    try {
      const error = await UserModel.create({ email: 'tester@mail.com' });
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(Error.ValidationError);
    expect(err.errors.fullName).toBeDefined();
  });
});
