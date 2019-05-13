/**
 * Default response error for controllers.
 *
 * @param {string|number} code - Error code
 * @param {string} msg - Error message
 * @param {string|object} [payload=''] - Optional error payload
 * @returns {void}
 */
const responseError = (code, msg, payload = '') => { 
   if (!msg || !code) throw new Error('Missing error information.')
   return { code, msg, payload }
}

module.exports = responseError
