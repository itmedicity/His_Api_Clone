
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { GetElliderPatientList, GetIPPatientList, GetEndoscopyIPInfo } = require('./getPatientList.controller');
router.post('/patientList', checkToken, GetElliderPatientList);
router.post('/ipList', checkToken, GetIPPatientList);
router.get('/getEndoIp/:id', checkToken, GetEndoscopyIPInfo);
module.exports = router;