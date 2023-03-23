const env = process.env.NODE_ENV || 'development'
const credentials = require(`./.credentials.${env}`)
const domen = 'simple.loc'
const protocol = 'http'
module.exports = { credentials , domen, protocol}
