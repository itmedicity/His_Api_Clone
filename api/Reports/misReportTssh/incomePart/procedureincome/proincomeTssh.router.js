const { checkToken } = require('../../../../../auth/jwtValidation')

const {
    getproIncomePart1Tssh,
    getproIncomePart2Tssh,
    getproIncomePart3Tssh,
    getproIncomePart4Tssh,
    gettheaterIncomeTssh
} = require('./proincomeTssh.controller')

const router = require('express').Router();

router.post('/proincome1', checkToken, getproIncomePart1Tssh);
router.post('/proincome2', checkToken, getproIncomePart2Tssh);
router.post('/proincome3', checkToken, getproIncomePart3Tssh);
router.post('/proincome4', checkToken, getproIncomePart4Tssh);
router.post('/theaterIncome', checkToken, gettheaterIncomeTssh);


module.exports = router;