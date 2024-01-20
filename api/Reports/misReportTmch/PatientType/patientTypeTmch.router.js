const { checkToken } = require("../../../../auth/jwtValidation");

const { getpatientTypeDiscountTmch } = require("./patientTypeTmch.controller");

const router = require('express').Router();

router.post('/patientTypeDis', checkToken, getpatientTypeDiscountTmch);

module.exports = router;