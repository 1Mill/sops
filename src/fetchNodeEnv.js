const fetchNodeEnv = name => process && process.env && process.env[name]

module.exports = { fetchNodeEnv }
