const validateFullName = (password) => {
  const validLength = password.length >= 2;
  const containsLetter = /[a-zA-Z]/g.test(password);
  const containsNumberOrSymbols = /[0-9'!#$%&'*+/=?^_`{|}~-]/g.test(password);

  return validLength && containsLetter && !containsNumberOrSymbols;
};

const validateEmail = () => {

};

module.exports = {
  validateFullName,
  validateEmail,
};
