const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getPODetails, getPendingPODetails, getItemGrnDetails, getPODetailsBySupplier, getItemDetails } = require('./purchase.controller')

router.post('/getpo', checkToken, getPODetails);
router.post('/getpendingpo', checkToken, getPendingPODetails);
router.post('/getGrnDetails', checkToken, getItemGrnDetails);
router.get('/getPoDetails/:id', checkToken, getPODetailsBySupplier);

router.post('/items', checkToken, getItemDetails);

module.exports = router;