const { checkToken } = require('../../../../../auth/jwtValidation');

const {
    creditInsuranceBillDetlPart1,
    creditInsuranceBillDetlPart2,
    creditInsuranceBillDetlPart3,
    creditInsuranceBillDetlPart4,
    creditInsuranceBillDetlPart5,
    creditInsuranceBillDetlPart6,
    unSettledAmountDetl,
    advanceCollection,
    creditInsuranceBillCollection1,
    creditInsuranceBillCollection2

} = require('./misCollectionPart.controller');

const router = require('express').Router();

router.post('/creditInsuranceBillDetlPart1', checkToken, creditInsuranceBillDetlPart1);
router.post('/creditInsuranceBillDetlPart2', checkToken, creditInsuranceBillDetlPart2);
router.post('/creditInsuranceBillDetlPart3', checkToken, creditInsuranceBillDetlPart3);
router.post('/creditInsuranceBillDetlPart4', checkToken, creditInsuranceBillDetlPart4);
router.post('/creditInsuranceBillDetlPart5', checkToken, creditInsuranceBillDetlPart5);
router.post('/creditInsuranceBillDetlPart6', checkToken, creditInsuranceBillDetlPart6);
router.post('/unSettledAmountDetl', checkToken, unSettledAmountDetl);
router.post('/advanceCollection', checkToken, advanceCollection);
router.post('/creditInsuranceBillCollection1', checkToken, creditInsuranceBillCollection1);
router.post('/creditInsuranceBillCollection2', checkToken, creditInsuranceBillCollection2);

module.exports = router;