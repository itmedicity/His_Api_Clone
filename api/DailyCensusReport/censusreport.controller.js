const {GetElliderCensusCount} = require("./censusreport.service");
module.exports = {
  GetElliderCensusCount: async (req, res) => {
    try {
      const body = req.body;
      const data = await GetElliderCensusCount(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Report Found",
        });
      }

      return res.status(200).json({
        success: 1,
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
};
