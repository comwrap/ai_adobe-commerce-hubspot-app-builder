const crypto = require('crypto')

/** @constant {string} FINGERPRINT_ALGORITHM - The algorithm used to generate the fingerprint */
const FINGERPRINT_ALGORITHM = 'sha256'

/** @constant {string} FINGERPRINT_ENCODING - The encoding used to generate the fingerprint */
const FINGERPRINT_ENCODING = 'hex'

/** @constant {number} DEFAULT_INFINITE_LOOP_CIRCUIT_BREAKER_TTL - The default time to live for the fingerprint in the lib state */
const DEFAULT_INFINITE_LOOP_CIRCUIT_BREAKER_TTL = 60 // seconds

/**
 * This function checks if there is a potential infinite loop
 *
 * @param {object} state - The state object
 * @param {string} key - The key to store the fingerprint
 * @param {object} data - The data to generate the fingerprint
 * @param {Array} eventTypes - The event types to include in the infinite loop check
 * @param {string} event - The event to check for potential infinite loops
 * @returns {boolean} - Returns true if the event is a potential infinite loop
 */
async function isAPotentialInfiniteLoop (state, key, data, eventTypes, event) {
  if (!eventTypes.includes(event)) {
    return false
  }

  const persistedFingerPrint = await state.get(key) // { value, expiration }
  return persistedFingerPrint && persistedFingerPrint.value === fingerPrint(data)
}

/**
 * This function stores the fingerprint in the state
 *
 * @param {object} state - The state object
 * @param {string} key - The key to store the fingerprint
 * @param {object} data - The data to generate the fingerprint
 * @param {number} [ttl] - The time to live for the fingerprint in the lib state
 */
async function storeFingerPrint (state, key, data, ttl) {
  await state.put(key, fingerPrint(data), { ttl: ttl || DEFAULT_INFINITE_LOOP_CIRCUIT_BREAKER_TTL })
}

/**
 * This function generates a fingerprint for the data
 *
 * @param {object} data - The data to generate the fingerprint
 * @returns {string} - The fingerprint
 */
function fingerPrint (data) {
  const hash = crypto.createHash(FINGERPRINT_ALGORITHM)
  hash.update(JSON.stringify(data))
  return hash.digest(FINGERPRINT_ENCODING)
}

module.exports = {
  isAPotentialInfiniteLoop,
  storeFingerPrint
}
