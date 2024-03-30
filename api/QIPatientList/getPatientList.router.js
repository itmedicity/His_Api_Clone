
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { GetElliderPatientList } = require('./getPatientList.controller');
router.post('/patientList', checkToken, GetElliderPatientList);

module.exports = router;