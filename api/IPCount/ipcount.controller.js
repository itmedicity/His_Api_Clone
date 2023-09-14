const {
    getIpCountDayWise,
    getIpCountMonthWise,
    getIpCountYearWise,
    getIpCountDeptDayWise,
    getIpCountDeptMonthWise,
    getIpCountDepYearWise,
    getIpDoctorDayWise,
    getIpDoctorMonthWise,
    getIpDoctorYearWise,
    getIpGenderDayWise,
    getIpGenderMonthWise,
    getIpGenderYearWise,
    getIpRegionDayWise,
    getIpRegionMonthWise,
    getIpRegionYearWise
} = require('./ipcount.service')

module.exports = {
    getIpCountDayWise: (req, res) => {
        getIpCountDayWise((err, results) => {
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
                message: "IP Count Updated"
            });
        });
    },

    getIpCountMonthWise: (req, res) => {
        getIpCountMonthWise((err, results) => {
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
                message: "IP Count Updated"
            });
        });
    },

    getIpCountYearWise: (req, res) => {
        getIpCountYearWise((err, results) => {
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
                message: "IP Count Updated"
            });
        });
    },
    getIpCountDeptDayWise: (req, res) => {
        getIpCountDeptDayWise((err, results) => {
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
                message: "IP Count Updated"
            });
        });
    },
    getIpCountDeptMonthWise: (req, res) => {
        getIpCountDeptMonthWise((err, results) => {
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
                message: "IP Count Updated"
            });
        });
    },


    getIpCountDepYearWise: (req, res) => {
        getIpCountDepYearWise((err, results) => {
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
                message: "IP Count Updated"
            });
        });
    },

    getIpDoctorDayWise: (req, res) => {
        getIpDoctorDayWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },

    getIpDoctorMonthWise: (req, res) => {
        getIpDoctorMonthWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },

    getIpDoctorYearWise: (req, res) => {
        getIpDoctorYearWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },



    getIpGenderDayWise: (req, res) => {
        getIpGenderDayWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },


    getIpGenderMonthWise: (req, res) => {
        getIpGenderMonthWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },


    getIpGenderYearWise: (req, res) => {
        getIpGenderYearWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },

    getIpRegionDayWise: (req, res) => {
        getIpRegionDayWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },

    getIpRegionMonthWise: (req, res) => {
        getIpRegionMonthWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },
    getIpRegionYearWise: (req, res) => {
        getIpRegionYearWise((err, results) => {
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
                message: "Ip Count Updated"
            });
        });
    },



}