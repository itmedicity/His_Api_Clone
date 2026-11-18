
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getSupplierList, getActiveSupplierList, getCommonReport, getBedStatusReport, getCreditReceiptReport, getBedCleaningReport, getrequisitionCommonReport } = require('./supplier.controller');
router.post('/supplier', checkToken, getSupplierList);
router.get('/getsupplier', checkToken, getActiveSupplierList);
router.post('/CommonReport', checkToken, getCommonReport);
router.post('/BedStatus', checkToken, getBedStatusReport);
router.post('/CreditReceipt', checkToken, getCreditReceiptReport);
router.post('/BedCleaning', checkToken, getBedCleaningReport);
router.post('/requisitionReport', checkToken, getrequisitionCommonReport);

module.exports = router;