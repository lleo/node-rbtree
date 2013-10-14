exports = module.exports = process.env.JSCOV ?
  require('./lib-cov') :
  require('./lib')