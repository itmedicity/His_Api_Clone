const { checkToken } = require('../../../auth/jwtValidation');
const { getOrauser } = require('./user.controller');

const router = require('express').Router();

router.get('/', checkToken, getOrauser);

module.exports = router;