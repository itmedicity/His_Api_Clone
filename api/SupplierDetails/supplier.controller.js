const { getSupplierList, getActiveSupplierList, getCommonReport, getBedStatusReport, getCreditReceipt, getBedCleaningReport, getrequisitionCommonReport } = require("./supplier.service");
module.exports = {
  getSupplierList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getSupplierList(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Data Found",
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
  getActiveSupplierList: async (req, res) => {
    try {
      const data = await getActiveSupplierList();
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Data Found",
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

  getCommonReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getCommonReport(body);

      if (!data) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Fetched GRN Datas",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },



  getBedStatusReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getBedStatusReport(body);

      if (!data) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
          data: [],
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Fetched Bed Status Datas",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },



  getCreditReceiptReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getCreditReceipt(body);

      if (!data || data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
          data: [],
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Fetched Credit Receipt Datas",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error?.message || error,
      });
    }
  },

  getBedCleaningReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getBedCleaningReport(body);

      if (!data || data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
          data: [],
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Fetched Bed Cleaning Datas",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error?.message || error,
      });
    }
  },

  getrequisitionCommonReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getrequisitionCommonReport(body);

      if (!data) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
          data: [],
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Fetched GRN Datas",
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
