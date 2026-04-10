const {pharmacySalePart1, phamracyReturnPart1, phamracySalePart2, phamracyReturnPart2, phamracySalePart3, phamracyReturnPart3} = require("./pharmacy.service");

module.exports = {
  getpharmacySalePart1: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacySalePart1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getpharmacyReturnPart1: async (req, res) => {
    try {
      const body = req.body;
      const data = await phamracyReturnPart1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getphamracySalePart2: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacySalePart1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getphamracyReturnPart2: async (req, res) => {
    try {
      const body = req.body;
      const data = await phamracyReturnPart1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getphamracySalePart3: async (req, res) => {
    try {
      const body = req.body;
      const data = await phamracySalePart3(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getphamracyReturnPart3: async (req, res) => {
    try {
      const body = req.body;
      const data = await phamracyReturnPart3(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
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
