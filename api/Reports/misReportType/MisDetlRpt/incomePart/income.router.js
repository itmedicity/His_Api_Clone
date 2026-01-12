const { checkToken } = require('../../../../../auth/jwtValidation');

const {
    bedIncome,
    nsIncome,
    roomRentIncome,
    otherIncome,
    consultingIncome,
    anesthetiaIncome,
    surgeonIncome,
    theaterIncome,
    cardiologyIncome,
    disPosibleItemIncome,
    icuIncome,
    icuprocedureIncome,
    radiologyIncome,
    laboratoryIncome,
    mriIncome,
    dietIncome,
    pharmacyIncomePart1,
    pharmacyIncomePart2,
    pharmacyIncomePart3,
    pharmacyIncomePart4
} = require('./income.controller');

const router = require('express').Router();

router.post('/bedIncome', checkToken, bedIncome);
router.post('/nsIncome', checkToken, nsIncome);
router.post('/roomRentIncome', checkToken, roomRentIncome);
router.post('/otherIncome', checkToken, otherIncome);
router.post('/consultingIncome', checkToken, consultingIncome);
router.post('/anesthetiaIncome', checkToken, anesthetiaIncome);
router.post('/surgeonIncome', checkToken, surgeonIncome);
router.post('/theaterIncome', checkToken, theaterIncome);
router.post('/cardiologyIncome', checkToken, cardiologyIncome);
router.post('/disPosibleItemIncome', checkToken, disPosibleItemIncome);
router.post('/icuIncome', checkToken, icuIncome);
router.post('/icuprocedureIncome', checkToken, icuprocedureIncome);
router.post('/radiologyIncome', checkToken, radiologyIncome);
router.post('/laboratoryIncome', checkToken, laboratoryIncome);
router.post('/mriIncome', checkToken, mriIncome);
router.post('/dietIncome', checkToken, dietIncome);
router.post('/pharmacyIncomePart1', checkToken, pharmacyIncomePart1);
router.post('/pharmacyIncomePart2', checkToken, pharmacyIncomePart2);
router.post('/pharmacyIncomePart3', checkToken, pharmacyIncomePart3);
router.post('/pharmacyIncomePart4', checkToken, pharmacyIncomePart4);

module.exports = router;