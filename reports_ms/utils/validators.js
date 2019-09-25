module.exports = {
  validateEmail(email) {
    let re = /\S+@\S+/;
    return re.test(email);
  }
};
