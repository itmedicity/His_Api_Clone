const { checkToken } = require('../../../../auth/jwtValidation');
const {
    getadvanceCollectionTmch,
    getadvanceRefundTmch,
    getadvanceSettledTmch,
    getcollectionAgainstSalePart1Tmch,
    getcollectionAgainstSalePart2Tmch,
    getcomplimentoryTmch,
    getcreditInsuranceBillCollectionTmch,
    getcreditInsuranceBillTmch,
    getipConsolidatedDiscountTmch,
    getipPreviousDayDiscountTmch,
    getipPreviousDayCollectionTmch,
    getunsettledAmount,
    misGroup,
    misGroupMast
} = require('./collectionTmch.controller')

const router = require('express').Router();

router.post('/advanceCollection', getadvanceCollectionTmch);
router.post('/advanceRefund', checkToken, getadvanceRefundTmch);
router.post('/advanceSettled', checkToken, getadvanceSettledTmch);
router.post('/collectionagainSaleTotal', checkToken, getcollectionAgainstSalePart1Tmch);
router.post('/collectionagainSaleDeduction', checkToken, getcollectionAgainstSalePart2Tmch);
router.post('/complimentory', checkToken, getcomplimentoryTmch);
router.post('/creditInsuranceBillCollection', checkToken, getcreditInsuranceBillCollectionTmch);
router.post('/ipConsolidatedDiscount', checkToken, getipConsolidatedDiscountTmch);
router.post('/ipPreviousDayDiscount', checkToken, getipPreviousDayDiscountTmch);
router.post('/unsettledAmount', checkToken, getunsettledAmount);
router.post('/ipPreviousDayCollection', checkToken, getipPreviousDayCollectionTmch);
router.post('/creditInsuranceBill', checkToken, getcreditInsuranceBillTmch);
router.get('/misGroup', checkToken, misGroup);
router.get('/misMaster', checkToken, misGroupMast);

module.exports = router;