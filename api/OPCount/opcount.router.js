const { checkToken } = require('../../auth/jwtValidation');
const router = require('express').Router();

const { getOpCountDayWise,
    getOpCountMonthWise,
    getOpCountYearWise,
    getOpCountDeptDayWise,
    getOpCountDeptMonthWise,
    getOpCountDeptYearWise,
    getOpDoctortDayWise,
    getOpDoctortMonthWise,
    getOpDoctortYearWise,
    getOpGenderDayWise,
    // getOpGenderMonthWise,
    // getOpGenderYearWise
} = require('./opcount.controller')

router.get('/daycount', checkToken, getOpCountDayWise);
router.get('/monthcount', checkToken, getOpCountMonthWise);
router.get('/yearcount', checkToken, getOpCountYearWise);
router.get('/dptday', checkToken, getOpCountDeptDayWise);
router.get('/dptmonth', checkToken, getOpCountDeptMonthWise);
router.get('/dptyear', checkToken, getOpCountDeptYearWise);
router.get('/drday', checkToken, getOpDoctortDayWise);
router.get('/drmonth', checkToken, getOpDoctortMonthWise);
router.get('/dryear', checkToken, getOpDoctortYearWise);
router.get('/genderday', checkToken, getOpGenderDayWise);
// router.get('/gendermonth', checkToken, getOpGenderMonthWise);
// router.get('/genderyear', checkToken, getOpGenderYearWise);
module.exports = router;