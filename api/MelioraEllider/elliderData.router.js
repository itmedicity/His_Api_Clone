const { checkToken } = require('../../auth/jwtValidation');
const router = require('express').Router();

const { getOutlet,
    getNursingStation,
    getRoomType,
    getRoomCategory,
    getRoomDetails,
    getInpatientDetails,
    getPatientDetails,
    getNursingBed,
    getCurrentPatient,
    getDisChargedPatient,
    getInpatientFollowUp,
    getBedMasterDetail
} = require('./elliderData.controller')

// router.get('/outlet', checkToken, getOutlet);
// router.get('/nurse', checkToken, getNursingStation);
// router.post('/ip', checkToken, getInpatientDetails);
router.get('/roomtype', checkToken, getRoomType);
router.get('/roomcat', checkToken, getRoomCategory);
router.get('/rooms', checkToken, getRoomDetails);
router.get('/patient', checkToken, getPatientDetails);

router.post('/ip', getInpatientDetails);
router.get('/outlet', getOutlet);

router.post('/getbed', getNursingBed)
router.post('/inpatientdetil', getCurrentPatient)
router.post('/getdischargepatient', getDisChargedPatient)

router.get('/nurse',checkToken, getNursingStation);
router.post('/getipfollowup', checkToken, getInpatientFollowUp)
router.post('/bed/import', checkToken, getBedMasterDetail)



module.exports = router;