const { getOutlet,
    getNursingStation,
    getRoomType,
    getRoomCategory,
    getRoomDetails,
    getInpatientDetails,
    getPatientDetails,
    getNursingBed,
    getCurrentPatient } = require('./elliderData.service')

module.exports = {
    getOutlet: (req, res) => {
        getOutlet((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getNursingStation: (req, res) => {
        getNursingStation((err, results) => {
            if (err) {
                console.log(err);
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getRoomType: (req, res) => {
        getRoomType((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getRoomCategory: (req, res) => {
        getRoomCategory((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getRoomDetails: (req, res) => {
        getRoomDetails((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },



    getInpatientDetails: (req, res) => {
        const body = req.body;
        getInpatientDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },


    getPatientDetails: (req, res) => {
        getPatientDetails((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,
            });
        });
    },
    getNursingBed: (req, res) => {
        const data = req.body;
        getNursingBed(data, (err, results) => {
            if (err) {
                console.log(err, "err");

                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,
            });
        })
    },
    getCurrentPatient: (req, res) => {
        const body = req.body;
        getCurrentPatient(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found',
                    data: [],
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },
}