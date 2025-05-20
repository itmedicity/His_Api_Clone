
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getAntibiotic,  } = require('./Ams.controller');

router.post('/getAntibiotic', checkToken, getAntibiotic);


module.exports = router;