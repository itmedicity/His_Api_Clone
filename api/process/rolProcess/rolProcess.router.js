const router = require('express').Router();

const { checkToken } = require('../../../auth/jwtValidation')
const { getAllPharmacySales, getOpCountMonthWise, getIpCountMonthWise } = require('./rolProcess.controller')

router.post('/getsoledqnty', checkToken, getAllPharmacySales);
router.post('/getopcount', checkToken, getOpCountMonthWise);
router.post('/getipcount', checkToken, getIpCountMonthWise);

module.exports = router;