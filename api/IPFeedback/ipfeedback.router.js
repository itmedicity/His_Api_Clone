
const { checkToken } = require('../../auth/jwtValidation');
const { GetIPPatientList } = require('./ipfeedback.controller');
router.post('/ipList', checkToken, GetIPPatientList);
module.exports = router;