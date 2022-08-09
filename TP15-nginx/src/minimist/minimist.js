const parseArgs = require('minimist')

const options = {
    alias: {
        p: 'puerto'
    },
    default: {
        puerto: 8080
    }
}

const { puerto } = parseArgs(process.argv.slice(2), options)

const datosArgs = { puerto }

module.exports = { datosArgs }

console.log({ puerto })