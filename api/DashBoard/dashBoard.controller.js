const {
    getOPCountYear,
    getIPCountYear,
    getOPCountMonth,
    getIPCountMonth,
    getOPCountDay,
    getIPCountDay,
    getOPCurrentYear,
    getIPCurrentYear,
    getOPCurrentMonthDayWise,
    getIPCurrentMonthDayWise } = require('./dashBoard.service')

module.exports = {

    getOPCountYear: (req, res) => {
        const body = req.body;
        getOPCountYear(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

    getIPCountYear: (req, res) => {
        const body = req.body;
        getIPCountYear(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

    getOPCurrentYear: (req, res) => {
        const body = req.body;
        getOPCurrentYear(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },
    getIPCurrentYear: (req, res) => {
        const body = req.body;
        getIPCurrentYear(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })
    },
    getOPCountMonth: (req, res) => {
        const body = req.body;
        getOPCountMonth(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },
    getIPCountMonth: (req, res) => {
        const body = req.body;
        getIPCountMonth(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

    getOPCurrentMonthDayWise: (req, res) => {
        const body = req.body;
        getOPCurrentMonthDayWise(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

    getIPCurrentMonthDayWise: (req, res) => {
        const body = req.body;
        getIPCurrentMonthDayWise(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

    getOPCountDay: (req, res) => {
        const body = req.body;
        getOPCountDay(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

    getIPCountDay: (req, res) => {
        const body = req.body;
        getIPCountDay(body, (err, results) => {

            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    data: []
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        })

    },

}