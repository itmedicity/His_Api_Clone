const router = require('express').Router();
const { getQtnMastDetails, getQtnDetailDetails, getActiveItems, storeItems, medstore, medDescription, getTotalQtn } = require('./bis_quotation.controller')

router.post('/qtnMastDetails', getQtnMastDetails);
router.post('/qtnDetailDetails', getQtnDetailDetails);
router.get('/getActiveItems', getActiveItems);
router.get('/storeItems', storeItems);
router.get('/medstore', medstore);
router.get('/medDescription', medDescription);
router.get('/getTotalQtn', getTotalQtn);

module.exports = router;
