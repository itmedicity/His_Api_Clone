const {checkToken} = require("../../../../../auth/jwtValidation");

const {
  bedIncomes,
  nsIncomes,
  roomRentIncomes,
  otherIncomes,
  consultingIncomes,
  anesthetiaIncomes,
  surgeonIncomes,
  theaterIncomes,
  cardiologyIncomes,
  disPosibleItemIncomes,
  icuIncomes,
  icuprocedureIncomes,
  radiologyIncomes,
  laboratoryIncomes,
  mriIncomes,
  dietIncomes,
  pharmacyIncomesPart1,
  pharmacyIncomesPart2,
  pharmacyIncomesPart3,
  pharmacyIncomesPart4,
} = require("./income.controller");

const router = require("express").Router();

router.post("/bedIncome", checkToken, bedIncomes);
router.post("/nsIncome", checkToken, nsIncomes);
router.post("/roomRentIncome", checkToken, roomRentIncomes);
router.post("/otherIncome", checkToken, otherIncomes);
router.post("/consultingIncome", checkToken, consultingIncomes);
router.post("/anesthetiaIncome", checkToken, anesthetiaIncomes);
router.post("/surgeonIncome", checkToken, surgeonIncomes);
router.post("/theaterIncome", checkToken, theaterIncomes);
router.post("/cardiologyIncome", checkToken, cardiologyIncomes);
router.post("/disPosibleItemIncome", checkToken, disPosibleItemIncomes);
router.post("/icuIncome", checkToken, icuIncomes);
router.post("/icuprocedureIncome", checkToken, icuprocedureIncomes);
router.post("/radiologyIncome", checkToken, radiologyIncomes);
router.post("/laboratoryIncome", checkToken, laboratoryIncomes);
router.post("/mriIncome", checkToken, mriIncomes);
router.post("/dietIncome", checkToken, dietIncomes);
router.post("/pharmacyIncomePart1", checkToken, pharmacyIncomesPart1);
router.post("/pharmacyIncomePart2", checkToken, pharmacyIncomesPart2);
router.post("/pharmacyIncomePart3", checkToken, pharmacyIncomesPart3);
router.post("/pharmacyIncomePart4", checkToken, pharmacyIncomesPart4);

module.exports = router;
