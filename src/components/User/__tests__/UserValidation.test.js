const UserValidation = require('../validation');

describe('UserValidation', () => {
  describe('findById', () => {
    test('return object containing value', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133' };
      expect(UserValidation.findById(data)).toHaveProperty('value');
      expect(UserValidation.findById(data)).not.toHaveProperty('error');
      done();
    });

    test('return object containing value, error', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe981129' };
      expect(UserValidation.findById(data)).toHaveProperty('error');
      expect(UserValidation.findById(data)).toHaveProperty('value');
      done();
    });
  });

  describe('create', () => {
    test('return object success, given a validate data', (done) => {
      expect.assertions(2);
      const data = { email: 'test@mail.com', fullName: 'Tester' };
      expect(UserValidation.create(data)).toMatchObject({ value: data });
      expect(UserValidation.create(data).error).toBeUndefined();
      done();
    });

    test('return object error, an email given is empty string', (done) => {
      expect.assertions(2);
      const data = { email: '', fullName: 'Tester' };
      expect(UserValidation.create(data)).toMatchObject({ value: data });
      expect(UserValidation.create(data).error.details[0].path).toContain('email');
      done();
    });

    test('return object error, given a not valid email', (done) => {
      const data = { email: 'notemail', fullName: 'Tester' };
      expect(UserValidation.create(data)).toMatchObject({ value: data });
      expect(UserValidation.create(data).error.details[0].path).toContain('email');
      done();
    });

    test('return object error, a fullName given is empty string', (done) => {
      const data = { email: 'test@mail.com', fullName: '' };
      expect(UserValidation.create(data)).toMatchObject({ value: data });
      expect(UserValidation.create(data).error.details[0].path).toContain('fullName');
      done();
    });

    test('return object error, a fullName length < 5', (done) => {
      const data = { email: 'test@mail.com', fullName: 'asd' };
      expect(UserValidation.create(data)).toMatchObject({ value: data });
      expect(UserValidation.create(data).error.details[0].path).toContain('fullName');
      done();
    });

    test('return object error, a fullName exists number or symbols', (done) => {
      const data = { email: 'test@mail.com', fullName: 'T3stu#ser' };
      expect(UserValidation.create(data)).toMatchObject({ value: data });
      expect(UserValidation.create(data).error.details[0].path).toContain('fullName');
      done();
    });
  });

  describe('updateById', () => {
    test('return object success, given a validate data', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133', fullName: 'Tester' };
      expect(UserValidation.updateById(data)).toMatchObject({ value: data });
      expect(UserValidation.updateById(data).error).toBeUndefined();
      done();
    });

    test('return object error, given a not valid id', (done) => {
      expect.assertions(2);
      const data = { id: 'noid', fullName: 'Tester' };
      expect(UserValidation.updateById(data)).toMatchObject({ value: data });
      expect(UserValidation.updateById(data).error.details[0].path).toContain('id');
      done();
    });

    test('return object error, a fullName given is empty string', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133', fullName: '' };
      expect(UserValidation.updateById(data)).toMatchObject({ value: data });
      expect(UserValidation.updateById(data).error.details[0].path).toContain('fullName');
      done();
    });

    test('return object error, a fullName length < 5', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133', fullName: 'asd' };
      expect(UserValidation.updateById(data)).toMatchObject({ value: data });
      expect(UserValidation.updateById(data).error.details[0].path).toContain('fullName');
      done();
    });

    test('return object error, a fullName length > 30', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133', fullName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' };
      expect(UserValidation.updateById(data)).toMatchObject({ value: data });
      expect(UserValidation.updateById(data).error.details[0].path).toContain('fullName');
      done();
    });

    test('return object error, a fullName exists number or symbols', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133', fullName: 'T3stu#ser' };
      expect(UserValidation.updateById(data)).toMatchObject({ value: data });
      expect(UserValidation.updateById(data).error.details[0].path).toContain('fullName');
      done();
    });
  });

  describe('deleteById', () => {
    test('return object containing value', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe98112983822b133' };
      expect(UserValidation.deleteById(data)).toHaveProperty('value');
      expect(UserValidation.deleteById(data)).not.toHaveProperty('error');
      done();
    });

    test('return object containing value, error', (done) => {
      expect.assertions(2);
      const data = { id: '61f26cebe981129' };
      expect(UserValidation.deleteById(data)).toHaveProperty('error');
      expect(UserValidation.deleteById(data)).toHaveProperty('value');
      done();
    });
  });
});
