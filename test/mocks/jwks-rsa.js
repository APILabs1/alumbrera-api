module.exports = {
  passportJwtSecret: () => (_req, _rawJwtToken, done) => done(null, 'mock-secret'),
};
