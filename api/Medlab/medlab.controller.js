const {getAllPatientLabResults, getAllIcuBeds} = require("./medlab.service");

module.exports = {
  getAllPatientLabResults: async (req, res) => {
    try {
      const data = await getAllPatientLabResults();
      if (!data) {
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
  getAllIcuBeds: async (req, res) => {
    try {
      const data = await getAllIcuBeds();
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Data Found",
          data: [],
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
