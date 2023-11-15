const { checkToken } = require('../../../auth/jwtValidation');
const {
    getIpAdmissionList,
    insertTsshPat,
    getTsshPatientDateWise,
    deleteIPNumberFromTssh,
    getPatientData,
    getTsshPatientList,
    getTotalPatientList,
    getDischargePatientList,
    notDischargedPatientListTssh,
    getLastDischargeUpdateDate,
    updateDischargedPatient,
    updateLastDischargeDate,
    getDischargedipNoFromMysql,
    getIpadmissChecks,
    removeAsTmchPatient,
    getTsshIpNoFromMysql,
    getIpReceiptPatientInfo,
    getDischargedIpInfoFromMysql,
    getTsshIpNoFromMysqlGrouping,
    getDischargedIpInfoFromMysqlGrouped
} = require('./admissionList.controller');

const router = require('express').Router();

router.post('/getIpadmissionList', checkToken, getIpAdmissionList);
router.post('/insertTsshPatient', checkToken, insertTsshPat);
router.post('/TmchGrouping', checkToken, removeAsTmchPatient);
router.post('/getTsshPatientList', checkToken, getTsshPatientDateWise);
router.post('/removePatiet', checkToken, deleteIPNumberFromTssh);
router.get('/patientInfo/:id', getPatientData);

router.post('/getTsshPatient', checkToken, getTsshPatientList);
router.post('/getTotalPatientList', checkToken, getTotalPatientList);
router.post('/getDischargePtFromOracle', checkToken, getDischargePatientList);
router.get('/getAdmittedTsshPatient', checkToken, notDischargedPatientListTssh);
router.get('/getLastDischargeUpdatedDate', checkToken, getLastDischargeUpdateDate);
router.post('/updateDischargedPatient', checkToken, updateDischargedPatient);
router.post('/UpdateLastDischargeDates', checkToken, updateLastDischargeDate);
router.post('/getIpNumber', checkToken, getDischargedipNoFromMysql);
router.post('/getIpNumberTssh', checkToken, getTsshIpNoFromMysql);
//Grouped Router
router.post('/getIpNumberTmchGrouped', checkToken, getTsshIpNoFromMysqlGrouping);
router.post('/getIpDischargedPatientInfo', checkToken, getDischargedIpInfoFromMysql);

router.post('/getIpReceiptInfo', checkToken, getIpReceiptPatientInfo);
router.post('/getIpDischargedPatientInfoGrouped', checkToken, getDischargedIpInfoFromMysqlGrouped);

router.get('/getIpadmissChecks/:id', getIpadmissChecks);



module.exports = router;