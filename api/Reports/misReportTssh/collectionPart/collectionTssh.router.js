const { checkToken } = require('../../../../auth/jwtValidation');
const {
    getadvanceCollectionTssh,
    getadvanceRefundTssh,
    getadvanceSettledTssh,
    getcollectionAgainstSalePart1Tssh,
    getcollectionAgainstSalePart2Tssh,
    getcomplimentoryTssh,
    getcreditInsuranceBillCollectionTssh,
    getcreditInsuranceBillTssh,
    getipConsolidatedDiscountTssh,
    getipPreviousDayDiscountTssh,
    getipPreviousDayCollectionTssh,
    getunsettledAmount,
    misGroup,
    misGroupMast
} = require('./collectionTssh.controller')

const router = require('express').Router();

router.post('/advanceCollection', getadvanceCollectionTssh);
router.post('/advanceRefund', checkToken, getadvanceRefundTssh);
router.post('/advanceSettled', checkToken, getadvanceSettledTssh);
router.post('/collectionagainSaleTotal', checkToken, getcollectionAgainstSalePart1Tssh);
router.post('/collectionagainSaleDeduction', checkToken, getcollectionAgainstSalePart2Tssh);
router.post('/complimentory', checkToken, getcomplimentoryTssh);
router.post('/creditInsuranceBillCollection', checkToken, getcreditInsuranceBillCollectionTssh);
router.post('/ipConsolidatedDiscount', checkToken, getipConsolidatedDiscountTssh);
router.post('/ipPreviousDayDiscount', checkToken, getipPreviousDayDiscountTssh);
router.post('/unsettledAmount', checkToken, getunsettledAmount);
router.post('/ipPreviousDayCollection', checkToken, getipPreviousDayCollectionTssh);
router.post('/creditInsuranceBill', checkToken, getcreditInsuranceBillTssh);
router.get('/misGroup', checkToken, misGroup);
router.get('/misMaster', checkToken, misGroupMast);

module.exports = router;