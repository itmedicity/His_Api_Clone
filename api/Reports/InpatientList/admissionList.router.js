const {checkToken} = require("../../../auth/jwtValidation");
const {
  getIpAdmissionList,
  insertTsshPat,
  getTsshPatientDateWise,
  deleteIPNumberFromTssh,
  getPatientData,
  getIpadmissChecks,
  getTsshPatientList,
  getTotalPatientList,
  getDischargePatientList,
  notDischargedPatientListTssh,
  getLastDischargeUpdateDate,
  updateDischargedPatient,
  updateLastDischargeDate,
  getDischargedipNoFromMysql,
  // getIpadmissChecks,
  removeAsTmchPatient,
  getTsshIpNoFromMysql,
  getIpReceiptPatientInfo,
  getDischargedIpInfoFromMysql,
  getTsshIpNoFromMysqlGrouping,
  getDischargedIpInfoFromMysqlGrouped,
  getGroupedPatientList,
  getTmcIncomeReport,
  getTsshIncomeReport,
  getIpNumberTsshGrouped,
  getDischargedIpInfoFromTMCH,
} = require("./admissionList.controller");

const router = require("express").Router();

router.post("/getIpadmissionList", checkToken, getIpAdmissionList);
router.post("/insertTsshPatient", checkToken, insertTsshPat);
router.post("/TmchGrouping", checkToken, removeAsTmchPatient);
router.post("/getTsshPatientList", checkToken, getTsshPatientDateWise);
router.post("/removePatiet", checkToken, deleteIPNumberFromTssh);
router.get("/patientInfo/:id", getPatientData);

router.get("/getIpadmissChecks/:id", getIpadmissChecks);
router.post("/getTsshPatient", checkToken, getTsshPatientList);
router.post("/getTotalPatientList", checkToken, getTotalPatientList);
router.post("/getDischargePtFromOracle", checkToken, getDischargePatientList);
router.get("/getAdmittedTsshPatient", checkToken, notDischargedPatientListTssh);
router.get("/getLastDischargeUpdatedDate", checkToken, getLastDischargeUpdateDate);
router.post("/updateDischargedPatient", checkToken, updateDischargedPatient);
router.post("/UpdateLastDischargeDates", checkToken, updateLastDischargeDate);
router.post("/getIpNumber", checkToken, getDischargedipNoFromMysql);
router.post("/getIpNumberTssh", checkToken, getTsshIpNoFromMysql);
router.post("/getIpNumberTsshGrouped", checkToken, getIpNumberTsshGrouped);
//Grouped Router
router.post("/getIpNumberTmchGrouped", checkToken, getTsshIpNoFromMysqlGrouping);
router.post("/getGroupedPatientList", checkToken, getGroupedPatientList);

// router.get('/getIpadmissChecks/:id', getIpadmissChecks);

router.post("/getIpReceiptInfo", checkToken, getIpReceiptPatientInfo);

router.post("/getIpDischargedPatientInfoTMCH", checkToken, getDischargedIpInfoFromTMCH);
router.post("/getIpDischargedPatientInfo", checkToken, getDischargedIpInfoFromMysql);
router.post("/getIpDischargedPatientInfoGrouped", checkToken, getDischargedIpInfoFromMysqlGrouped);

router.get("/getIpadmissChecks/:id", getIpadmissChecks);

//GET TMC INCOME
router.post("/getTmcIncome", checkToken, getTmcIncomeReport);
router.post("/getTsshIncome", checkToken, getTsshIncomeReport);
// router.post('/getTsshIncome', checkToken, getTsshIncomeReport);

module.exports = router;
