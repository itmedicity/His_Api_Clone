const { getOpCountDayWise,
    getOpCountMonthWise,
    getOpCountYearWise,
    getOpCountDeptDayWise,
    getOpCountDeptMonthWise,
    getOpCountDeptYearWise,
    getOpDoctortDayWise,
    getOpDoctortMonthWise,
    getOpDoctortYearWise,
    getOpGenderDayWise,

} = require('./opcount.service')

module.exports = {
    getOpCountDayWise: (req, res) => {
        // const body = req.body;
        getOpCountDayWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },


    getOpCountMonthWise: (req, res) => {
        getOpCountMonthWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },


    getOpCountYearWise: (req, res) => {
        getOpCountYearWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },

    getOpCountDeptDayWise: (req, res) => {
        getOpCountDeptDayWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },


    getOpCountDeptMonthWise: (req, res) => {
        getOpCountDeptMonthWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },

    getOpCountDeptYearWise: (req, res) => {
        getOpCountDeptYearWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },

    getOpDoctortDayWise: (req, res) => {
        getOpDoctortDayWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },

    getOpDoctortMonthWise: (req, res) => {
        getOpDoctortMonthWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },

    getOpDoctortYearWise: (req, res) => {
        getOpDoctortYearWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },



    getOpGenderDayWise: (req, res) => {
        getOpGenderDayWise((err, results) => {
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
                message: "Op Count Updated"
            });
        });
    },


    // getOpGenderMonthWise: (req, res) => {
    //     getOpGenderMonthWise((err, results) => {
    //         if (err) {
    //             return res.status(200).json({
    //                 success: 0,
    //                 message: err
    //             })
    //         }
    //         if (Object.keys(results).length === 0) {
    //             return res.status(200).json({
    //                 success: 1,
    //                 message: 'No Data Found'
    //             })
    //         }
    //         return res.status(200).json({
    //             success: 2,
    //             message: "Op Count Updated"
    //         });
    //     });
    // },


    // getOpGenderYearWise: (req, res) => {
    //     getOpGenderYearWise((err, results) => {
    //         if (err) {
    //             return res.status(200).json({
    //                 success: 0,
    //                 message: err
    //             })
    //         }
    //         if (Object.keys(results).length === 0) {
    //             return res.status(200).json({
    //                 success: 1,
    //                 message: 'No Data Found'
    //             })
    //         }
    //         return res.status(200).json({
    //             success: 2,
    //             message: "Op Count Updated"
    //         });
    //     });
    // },



}
