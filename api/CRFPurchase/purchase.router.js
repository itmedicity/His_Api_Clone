const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getPODetails, getPendingPODetails } = require('./purchase.controller')

router.post('/getpo', checkToken, getPODetails);
router.get('/getpendingpo', checkToken, getPendingPODetails);

module.exports = router;