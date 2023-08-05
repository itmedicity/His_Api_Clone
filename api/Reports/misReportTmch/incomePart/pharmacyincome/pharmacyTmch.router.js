const { checkToken } = require('../../../../../auth/jwtValidation')

const {
    getpharmacyTmchSalePart1,
    getphamracyTmchReturnPart1,
    getphamracyTmchSalePart2,
    getphamracyTmchReturnPart2,
    getphamracyTmchSalePart3,
    getphamracyTmchReturnPart3
} = require('./pharmacyTmch.controller')


const router = require('express').Router();

router.post('/phaSalePart1', checkToken, getpharmacyTmchSalePart1);
router.post('/phaReturnPart1', checkToken, getphamracyTmchReturnPart1);
router.post('/phaSalePart2', checkToken, getphamracyTmchSalePart2);
router.post('/phaReturnPart2', checkToken, getphamracyTmchReturnPart2);
router.post('/phaSalePart3', checkToken, getphamracyTmchSalePart3);
router.post('/phaReturnPart3', checkToken, getphamracyTmchReturnPart3);

module.exports = router;