const router = require('express').Router();
const { checkToken } = require('../../../../auth/jwtValidation');
const { getQtnMastDetails, getQtnDetailDetails, getActiveItems, storeItems, medstore, medDescription, getTotalQtn } = require('./bis_quotation.controller')

router.post('/qtnMastDetails', checkToken, getQtnMastDetails);
router.post('/qtnDetailDetails', checkToken, getQtnDetailDetails);
router.get('/getActiveItems', checkToken, getActiveItems);
router.get('/storeItems', checkToken, storeItems);
router.get('/medstore', checkToken, medstore);
router.get('/medDescription', checkToken, medDescription);
router.get('/getTotalQtn', checkToken, getTotalQtn);

module.exports = router;
