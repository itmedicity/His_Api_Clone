
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getSupplierList, getActiveSupplierList, getCommonReport,getBedStatusReport } = require('./supplier.controller');
router.post('/supplier', checkToken, getSupplierList);
router.get('/getsupplier', checkToken, getActiveSupplierList);
router.post('/CommonReport', checkToken, getCommonReport);
router.post('/BedStatus', checkToken, getBedStatusReport);


module.exports = router;