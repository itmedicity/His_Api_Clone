const { checkToken } = require("../../../../auth/jwtValidation");

const { getpatientTypeDiscountTssh } = require("./patientTypeTssh.controller");

const router = require('express').Router();

router.post('/patientTypeDis', checkToken, getpatientTypeDiscountTssh);

module.exports = router;