const {getAllPharmacySales, getOpCountMonthWise, getIpCountMonthWise} = require("./rolProcess.service");

module.exports = {
  getAllPharmacySales: async (req, res) => {
    try {
      const body = req.body;
      const result = await getAllPharmacySales(body);
      if (Object.keys(result).length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
        });
      }
      return res.status(200).json({
        success: 2,
        data: result,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  getOpCountMonthWise: async (req, res) => {
    try {
      const body = req.body;
      const result = await getOpCountMonthWise(body);
      if (Object.keys(result).length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
        });
      }

      return res.status(200).json({
        success: 2,
        data: result,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getIpCountMonthWise: async (req, res) => {
    try {
      const body = req.body;
      const data = await getIpCountMonthWise(body);
      if (Object.keys(data).length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
        });
      }
      return res.status(200).json({
        success: 2,
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
