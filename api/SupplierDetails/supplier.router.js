
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getSupplierList, getActiveSupplierList, getCommonReport } = require('./supplier.controller');
router.post('/supplier', checkToken, getSupplierList);
router.get('/getsupplier', checkToken, getActiveSupplierList);
router.post('/CommonReport', checkToken, getCommonReport);


module.exports = router;