const {
    gstreportsPartOne,
    gstreportsPartTwo,
    gstreportsPartThree,
    gstreportsPartFour,
    gstreportsPartFive
} = require('./gstReports.service');

module.exports = {
    getGstreportsPartOne: (req, res) => {
        const body = req.body;
        gstreportsPartOne(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Gst Reports",
                data: results
            });
        })
    },
    getGstreportsPartTwo: (req, res) => {
        const body = req.body;
        gstreportsPartTwo(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Gst Reports",
                data: results
            });
        })
    },
    getGstreportsPartThree: (req, res) => {
        const body = req.body;
        gstreportsPartThree(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Gst Reports",
                data: results
            });
        })
    },
    getGstreportsPartFour: (req, res) => {
        const body = req.body;
        gstreportsPartFour(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Gst Reports",
                data: results
            });
        })
    },
    getGstreportsPartFive: (req, res) => {
        const body = req.body;
        gstreportsPartFive(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Gst Reports",
                data: results
            });
        })
    },
}