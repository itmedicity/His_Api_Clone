const { checkToken } = require("../../../../auth/jwtValidation");

const { getPatientTypeDiscount } = require("./patientType.controller");

const router = require('express').Router();

router.post('/patientTypeDis', checkToken, getPatientTypeDiscount);

module.exports = router;