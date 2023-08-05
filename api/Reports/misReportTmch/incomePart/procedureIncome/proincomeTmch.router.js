const { checkToken } = require('../../../../../auth/jwtValidation')

const {
    getproIncomePart1Tmch,
    getproIncomePart2Tmch,
    getproIncomePart3Tmch,
    getproIncomePart4Tmch,
    gettheaterIncomeTmch
} = require('./proincomeTmch.controller')

const router = require('express').Router();

router.post('/proincome1', checkToken, getproIncomePart1Tmch);
router.post('/proincome2', checkToken, getproIncomePart2Tmch);
router.post('/proincome3', checkToken, getproIncomePart3Tmch);
router.post('/proincome4', checkToken, getproIncomePart4Tmch);
router.post('/theaterIncome', checkToken, gettheaterIncomeTmch);


module.exports = router;