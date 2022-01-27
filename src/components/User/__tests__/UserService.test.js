const UserModel = require('../model');
const UserService = require('../service');

describe('UserComponent -> service', () => {
  beforeAll(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
  });

  test('findAll', (done) => {
    UserService.findAll()
      .then((data) => {
        expect(data).toBeInstanceOf(Array);
        done();
      })
      .catch((err) => done(err));
  });

  test('create', (done) => {
    const profile = { email: 'test@gmail.com', fullName: 'Tester Name' };
    UserService.create(profile)
      .then((data) => {
        expect(data).toMatchObject(profile);
        done();
      })
      .catch((err) => done(err));
  });
});
