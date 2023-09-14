const { checkToken } = require('../../auth/jwtValidation');
const router = require('express').Router();
const { getOpCountDayWise,
    getOpCountMonthWise,
    getOpCountYearWise,
    getOpCountDeptDayWise,
    getOpCountDeptMonthWise,
    getOpCountDeptYearWise,
    getOpDoctorDayWise,
    getOpDoctorMonthWise,
    getOpDoctorYearWise,
    getOpGenderDayWise,
    getOpGenderMonthWise,
    getOpGenderYearWise,
    getOpRegionDayWise,
    getOpRegionMonthWise,
    getOpRegionYearWise
} = require('./opcount.controller')
router.get('/daycount', checkToken, getOpCountDayWise);
router.get('/monthcount', checkToken, getOpCountMonthWise);
router.get('/yearcount', checkToken, getOpCountYearWise);
router.get('/dptday', checkToken, getOpCountDeptDayWise);
router.get('/dptmonth', checkToken, getOpCountDeptMonthWise);
router.get('/dptyear', checkToken, getOpCountDeptYearWise);
router.get('/drday', checkToken, getOpDoctorDayWise);
router.get('/drmonth', checkToken, getOpDoctorMonthWise);
router.get('/dryear', checkToken, getOpDoctorYearWise);
router.get('/genderday', checkToken, getOpGenderDayWise);
router.get('/gendermonth', checkToken, getOpGenderMonthWise);
router.get('/genderyear', checkToken, getOpGenderYearWise);
router.get('/regionday', checkToken, getOpRegionDayWise);
router.get('/regionmonth', checkToken, getOpRegionMonthWise);
router.get('/regionyear', checkToken, getOpRegionYearWise);
module.exports = router;