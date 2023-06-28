const { checkToken } = require('../../../auth/jwtValidation');
const {
    getIpAdmissionList,
    insertTsshPat,
    getTsshPatientDateWise,
    deleteIPNumberFromTssh,
    getPatientData
} = require('./admissionList.controller');

const router = require('express').Router();

router.post('/getIpadmissionList', checkToken, getIpAdmissionList);
router.post('/insertTsshPatient', checkToken, insertTsshPat);
router.post('/getTsshPatientList', checkToken, getTsshPatientDateWise);
router.post('/removePatiet', checkToken, deleteIPNumberFromTssh);
router.get('/patientInfo/:id', getPatientData);

module.exports = router;