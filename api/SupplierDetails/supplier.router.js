
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getSupplierList, getActiveSupplierList } = require('./supplier.controller');
router.post('/supplier', checkToken, getSupplierList);
router.get('/getsupplier', checkToken, getActiveSupplierList);


module.exports = router;