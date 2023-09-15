
const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const {
    getOPCountYear,
    getIPCountYear,
    getOPCountMonth,
    getIPCountMonth,
    getOPCountDay,
    getIPCountDay,
    getOPCurrentYear,
    getIPCurrentYear,
    getOPCurrentMonthDayWise,
    getIPCurrentMonthDayWise } = require('./dashBoard.controller')

router.post('/opyear', checkToken, getOPCountYear);
router.post('/ipyear', checkToken, getIPCountYear);
router.post('/opcurrentyear', checkToken, getOPCurrentYear);
router.post('/ipcurrentyear', checkToken, getIPCurrentYear);
router.post('/opmonth', checkToken, getOPCountMonth);
router.post('/ipmonth', checkToken, getIPCountMonth);
router.post('/opcurrentmonth', checkToken, getOPCurrentMonthDayWise);
router.post('/ipcurrentmonth', checkToken, getIPCurrentMonthDayWise);
router.post('/opday', checkToken, getOPCountDay);
router.post('/ipday', checkToken, getIPCountDay);

module.exports = router;