const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getPurchaseMastDatas, getGrmDetails, getpendingApprovalQtn, getPurchaseDetails, getItemDetails } = require('./StoreReport.controller')

router.post('/getPurchaseMastDatas', checkToken, getPurchaseMastDatas);
router.post('/getGrmDetails', checkToken, getGrmDetails);
router.get('/getpendingApprovalQtn', checkToken, getpendingApprovalQtn);
router.get('/getPurchaseDetails/:id', checkToken, getPurchaseDetails);
router.get('/getItemDetails/:id', checkToken, getItemDetails);

module.exports = router;




