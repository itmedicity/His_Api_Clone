
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getSupplierList } = require('./supplier.controller');
router.post('/supplier', checkToken, getSupplierList);

module.exports = router;