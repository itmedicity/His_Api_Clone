const { checkToken } = require('../../../auth/jwtValidation');
const router = require('express').Router();

const { getGstReportTaxAndPharmacy } = require('./taxAndPharmacy.controller');

router.post('/selectreport', checkToken, getGstReportTaxAndPharmacy);

module.exports = router;