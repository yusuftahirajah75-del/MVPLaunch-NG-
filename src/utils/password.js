/**
 * MVPLaunch NG - Password Hashing Utility
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash plain password
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain password against bcrypt hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};
