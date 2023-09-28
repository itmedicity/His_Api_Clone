const { checkToken } = require('../../auth/jwtValidation');
const router = require('express').Router();
const {
    getIpCountDayWise,
    getIpCountMonthWise,
    getIpCountYearWise,
    getIpCountDeptDayWise,
    getIpCountDeptMonthWise,
    getIpCountDepYearWise,
    getIpDoctorDayWise,
    getIpDoctorMonthWise,
    getIpDoctorYearWise,
    getIpGenderDayWise,
    getIpGenderMonthWise,
    getIpGenderYearWise,
    getIpRegionDayWise,
    getIpRegionMonthWise,
    getIpRegionYearWise
} = require('./ipcount.controller')
router.get('/daycount', checkToken, getIpCountDayWise);
router.get('/monthcount', checkToken, getIpCountMonthWise);
router.get('/yearcount', checkToken, getIpCountYearWise);
router.get('/dptday', checkToken, getIpCountDeptDayWise);
router.get('/dptmonth', checkToken, getIpCountDeptMonthWise);
router.get('/dptyear', checkToken, getIpCountDepYearWise);
router.get('/drday', checkToken, getIpDoctorDayWise);
router.get('/drmonth', checkToken, getIpDoctorMonthWise);
router.get('/dryear', checkToken, getIpDoctorYearWise);
router.get('/genderday', checkToken, getIpGenderDayWise);
router.get('/gendermonth', checkToken, getIpGenderMonthWise);
router.get('/genderyear', checkToken, getIpGenderYearWise);
router.get('/regionday', checkToken, getIpRegionDayWise);
router.get('/regionmonth', checkToken, getIpRegionMonthWise);
router.get('/regionyear', checkToken, getIpRegionYearWise);
module.exports = router;