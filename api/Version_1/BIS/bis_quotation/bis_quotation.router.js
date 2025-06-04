const router = require('express').Router();
const { getQtnMastDetails, getQtnDetailDetails } = require('./bis_quotation.controller')

router.post('/qtnMastDetails', getQtnMastDetails);
router.post('/qtnDetailDetails', getQtnDetailDetails);
module.exports = router;
