const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getPurchaseMastDatas, getGrmDetails } = require('./StoreReport.controller')

router.post('/getPurchaseMastDatas', checkToken, getPurchaseMastDatas);
router.post('/getGrmDetails', checkToken, getGrmDetails);

module.exports = router;


