const router = require('express').Router();

const { getAllPatientLabResults, getAllIcuBeds } = require('./medlab.controller');


router.get('/getpatientlabresult', getAllPatientLabResults);
router.get('/geticubeds', getAllIcuBeds);


module.exports = router;