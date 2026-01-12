const {unsettledAmountUserWise} = require("./collectionTmc.service");

module.exports = {
  getUnsettledAmountUserWise: async (req, res) => {
    const {fromDate, toDate} = req.body;

    try {
      const results = await unsettledAmountUserWise(fromDate, toDate);
      return res.status(200).json({
        success: 1,
        message: "Unsettled Amount User Wise",
        data: results,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
};
