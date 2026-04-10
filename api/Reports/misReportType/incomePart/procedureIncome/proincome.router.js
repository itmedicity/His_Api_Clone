const { checkToken } = require('../../../../../auth/jwtValidation')

const {
    getproIncomePart1,
    getproIncomePart2,
    getproIncomePart3,
    getproIncomePart4,
    gettheaterIncome
} = require('./proincome.controller')

const router = require('express').Router();

router.post('/proincome1', checkToken, getproIncomePart1);
router.post('/proincome2', checkToken, getproIncomePart2);
router.post('/proincome3', checkToken, getproIncomePart3);
router.post('/proincome4', checkToken, getproIncomePart4);
router.post('/theaterIncome', checkToken, gettheaterIncome);


module.exports = router;