const { checkToken } = require('../../../auth/jwtValidation');
const router = require('express').Router();

const {
    getGstReportOfPharmacy,
    getGstReportPharmacyWise,
    getSumOfAmountTaxDisc,
    getInPatientMedReturn,
    getInPatientMedReturnSum,
    getInPatientMedSale,
    getOpCreditPharmSale,
    getGstReportPharmCollection } = require('./taxAndPharmacy.controller');

router.post('/viewreport', checkToken, getGstReportOfPharmacy);

router.post('/selectreport', checkToken, getGstReportPharmacyWise);
router.post('/ipreturn', checkToken, getInPatientMedReturn);
router.post('/ipmedsale', checkToken, getInPatientMedSale);

router.post('/ipreturnsum', checkToken, getInPatientMedReturnSum);
router.post('/selectsum', checkToken, getSumOfAmountTaxDisc);
router.post('/opcredit', checkToken, getOpCreditPharmSale);
router.post('/pharmcollect', checkToken, getGstReportPharmCollection);
module.exports = router;