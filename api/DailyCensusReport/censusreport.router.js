
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { GetElliderCensusCount } = require('./censusreport.controller');
router.post('/elliderData', checkToken, GetElliderCensusCount);
module.exports = router;