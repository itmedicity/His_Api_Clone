const { checkToken } = require('../../../../auth/jwtValidation');
const {
    getadvanceCollection,
    getAdvanceRefund,
    getAdvanceSettled,
    getcollectionAgainstSaleTotal,
    getcollectionAgainstSaleDeduction,
    getComplimentory,
    getcreditInsuranceBillCollection,
    getipConsolidatedDiscount,
    getipPreviousDayDiscount,
    getunsettledAmount,
    getipPreviousDayCollection,
    getcreditInsuranceBill,
    misGroup,
    getcreditInsuranceBillRefund,
    misGroupMast
} = require('./collection.controller')

const router = require('express').Router();

router.post('/advanceCollection', checkToken, getadvanceCollection);
router.post('/advanceRefund', checkToken, getAdvanceRefund);
router.post('/advanceSettled', checkToken, getAdvanceSettled);
router.post('/collectionagainSaleTotal', checkToken, getcollectionAgainstSaleTotal);
router.post('/collectionagainSaleDeduction', checkToken, getcollectionAgainstSaleDeduction);
router.post('/complimentory', checkToken, getComplimentory);
router.post('/creditInsuranceBillCollection', checkToken, getcreditInsuranceBillCollection);
router.post('/ipConsolidatedDiscount', checkToken, getipConsolidatedDiscount);
router.post('/ipPreviousDayDiscount', checkToken, getipPreviousDayDiscount);
router.post('/unsettledAmount', checkToken, getunsettledAmount);
router.post('/ipPreviousDayCollection', checkToken, getipPreviousDayCollection);
router.post('/creditInsuranceBill', checkToken, getcreditInsuranceBill);
router.post('/creditInsuranceBillRefund', checkToken, getcreditInsuranceBillRefund);
router.get('/misGroup', checkToken, misGroup);
router.get('/misMaster', checkToken, misGroupMast);

module.exports = router;