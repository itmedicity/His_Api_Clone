const {patientTypeDiscount} = require("../../misReport/PatientType/patientType.service");

module.exports = {
  getPatientTypeDiscount: async (req, res) => {
    try {
      const body = req.body;
      const data = await patientTypeDiscount(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Patient Type Discount",
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
