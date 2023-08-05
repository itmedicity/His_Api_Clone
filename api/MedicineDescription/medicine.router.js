const { checkToken } = require('../../auth/jwtValidation');
const router = require('express').Router();

const { getMedicinesFromOracle,
    medicineImportedDateUpdate,
    getImportedDate,
    getMedicinesFromMysql,
    searchMedicines,
    medicineDetailsUpdate } = require('./medicine.controller')

router.post('/import', checkToken, getMedicinesFromOracle);
router.patch('/update', checkToken, medicineImportedDateUpdate);
router.get('/select', checkToken, getImportedDate);
router.get('/view', checkToken, getMedicinesFromMysql);
router.post('/search', checkToken, searchMedicines);
router.patch('/medupdate', checkToken, medicineDetailsUpdate);

module.exports = router;
