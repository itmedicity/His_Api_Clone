const router = require('express').Router();

const { checkToken } = require('../../../auth/jwtValidation')
const { getAllPharmacySales, getOpCountMonthWise, getIpCountMonthWise } = require('./rolProcess.controller')

router.post('/billdetl', checkToken, getAllPharmacySales);
router.post('/visitmast', checkToken, getOpCountMonthWise);
router.post('/ipadmiss', checkToken, getIpCountMonthWise);

module.exports = router;