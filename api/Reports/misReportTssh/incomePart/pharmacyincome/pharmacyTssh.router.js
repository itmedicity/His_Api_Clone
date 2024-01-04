const { checkToken } = require('../../../../../auth/jwtValidation')

const {
    getpharmacyTsshSalePart1,
    getphamracyTsshReturnPart1,
    getphamracyTsshSalePart2,
    getphamracyTsshReturnPart2,
    getphamracyTsshSalePart3,
    getphamracyTsshReturnPart3,
    pharmacyRoundOffAmntTssh
} = require('./pharmacyTssh.controller')


const router = require('express').Router();

router.post('/phaSalePart1', checkToken, getpharmacyTsshSalePart1);
router.post('/phaReturnPart1', checkToken, getphamracyTsshReturnPart1);
router.post('/phaSalePart2', checkToken, getphamracyTsshSalePart2);
router.post('/phaReturnPart2', checkToken, getphamracyTsshReturnPart2);
router.post('/phaSalePart3', checkToken, getphamracyTsshSalePart3);
router.post('/phaReturnPart3', checkToken, getphamracyTsshReturnPart3);
router.post('/roundOffTssh', checkToken, pharmacyRoundOffAmntTssh);

module.exports = router;