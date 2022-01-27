const UserValidation = require('../validation');

describe('UserComponent -> validation', () => {
  // Testing email field
  describe('email', () => {
    test('return error message given an empty string', (done) => {
      const profile = { email: '', fullName: 'Tester' };
      expect(UserValidation.create(profile).error.details[0].message).toBe('"email" is not allowed to be empty');
      done();
    });

    test('return error message given a not valid email', (done) => {
      const profile = { email: 'adfgad', fullName: 'Tester' };
      expect(UserValidation.create(profile).error.details[0].message).toBe('"email" must be a valid email');
      done();
    });
  });

  // Testing fullname field
  describe('fullName', () => {
    test('return object given a validate profile', (done) => {
      const profile = { email: 'test@mail.com', fullName: 'Tester tester' };
      expect(UserValidation.create(profile)).toMatchObject({ value: profile });
      done();
    });

    test('return error given an empty string', (done) => {
      const profile = { email: 'test@mail.com', fullName: '' };
      expect(UserValidation.create(profile).error.details[0].message).toBe('"fullName" is not allowed to be empty');
      done();
    });

    test('return error given a length <5 ', (done) => {
      const profile = { email: 'test@mail.com', fullName: 'as s' };
      expect(UserValidation.create(profile).error.details[0].message).toBe('"fullName" length must be at least 5 characters long');
      done();
    });

    test('return error given a name string, but exists number or symbols', (done) => {
      const profile = { email: 'test@mail.com', fullName: 'T3st u#ser' };
      expect(UserValidation.create(profile).error.details[0].message).toBe('"fullName" with value "T3st u#ser" fails to match the required pattern: /^[a-zA-Z ]*$/');
      done();
    });
  });
});
