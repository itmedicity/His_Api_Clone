const { checkToken } = require('../../../../../auth/jwtValidation')

const {
    getpharmacySalePart1,
    getpharmacyReturnPart1,
    getphamracySalePart2,
    getphamracyReturnPart2,
    getphamracySalePart3,
    getphamracyReturnPart3
} = require('./pharmacy.controller')


const router = require('express').Router();

router.post('/phaSalePart1', checkToken, getpharmacySalePart1);
router.post('/phaReturnPart1', checkToken, getpharmacyReturnPart1);
router.post('/phaSalePart2', checkToken, getphamracySalePart2);
router.post('/phaReturnPart2', checkToken, getphamracyReturnPart2);
router.post('/phaSalePart3', checkToken, getphamracySalePart3);
router.post('/phaReturnPart3', checkToken, getphamracyReturnPart3);

module.exports = router;