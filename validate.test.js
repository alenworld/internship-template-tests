const { validateEmail, validateFullName } = require('./validator');

// Testing fullname field

test('return false given an empty string', () => {
  expect(validateFullName('')).toBe(false);
});

test('return true given a name 5 characters or longer, a letter [a-zA-Z]', () => {
  expect(validateFullName('Vasya')).toBe(true);
});

test('return false given a password that is 5 characters long, but exists number or symbols', () => {
  expect(validateFullName('Va2ya')).toBe(false);
});

test('return false given a password that is 5 characters long, but exists symbols', () => {
  expect(validateFullName('Va#ya')).toBe(false);
});

// Testing email field

// code here
