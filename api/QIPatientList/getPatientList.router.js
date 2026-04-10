
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { GetElliderPatientList, GetIPPatientList, GetEndoscopyIPInfo, GetInitialAssessmentDetails,
    GetEndoscopyPatientsQI } = require('./getPatientList.controller');
router.post('/patientList', checkToken, GetElliderPatientList);
router.get('/getEndoIp/:id', checkToken, GetEndoscopyIPInfo);
router.post('/assessment', checkToken, GetInitialAssessmentDetails);
router.post('/endotimeupdate', checkToken, GetEndoscopyPatientsQI);

router.post('/ipList', checkToken, GetIPPatientList);
module.exports = router;