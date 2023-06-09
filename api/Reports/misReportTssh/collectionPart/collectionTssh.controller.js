const {
    advanceCollectionTssh,
} = require('./collectionTssh.service')

module.exports = {
    advanceCollectionTssh: (req, res) => {
        const body = req.body;
        advanceCollectionTssh(body, (err, results) => {
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
                message: "advance Collection",
                data: results
            });
        })
    },

}