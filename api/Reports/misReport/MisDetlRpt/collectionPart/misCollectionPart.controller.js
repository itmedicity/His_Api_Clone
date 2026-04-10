// @ts-nocheck
const {
  creditInsuranceBillDetlPart1,
  creditInsuranceBillDetlPart2,
  creditInsuranceBillDetlPart3,
  creditInsuranceBillDetlPart4,
  creditInsuranceBillDetlPart5,
  creditInsuranceBillDetlPart6,
  unSettledAmountDetl,
  advanceCollection,
  creditInsuranceBillCollection1,
  creditInsuranceBillCollection2,
} = require("../collectionPart/misCollectionPart.service");

module.exports = {
  creditInsuranceBillDetlPart1: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillDetlPart1(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillDetlPart1",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillDetlPart2: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillDetlPart2(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillDetlPart2",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillDetlPart3: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillDetlPart3(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillDetlPart3",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillDetlPart4: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillDetlPart4(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillDetlPart4",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillDetlPart5: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillDetlPart5(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillDetlPart5",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillDetlPart6: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillDetlPart6(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillDetlPart6",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  unSettledAmountDetl: async (req, res) => {
    try {
      const body = req.body;
      const data = await unSettledAmountDetl(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "unSettledAmountDetl",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  advanceCollection: async (req, res) => {
    try {
      const body = req.body;
      const data = await advanceCollection(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "advanceCollection",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillCollection1: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillCollection1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillCollection1",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  creditInsuranceBillCollection2: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillCollection2(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "creditInsuranceBillCollection2",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
};
