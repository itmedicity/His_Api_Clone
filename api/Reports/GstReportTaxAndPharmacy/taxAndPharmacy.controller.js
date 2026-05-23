// @ts-nocheck
const {getTmcConnection} = require("../../../config/oradbconfig");
const {
  getGstReportOfPharmacy,
  getGstReportPharmacyWise,
  getSumOfAmountTaxDisc,
  getInPatientMedReturn,
  getInPatientMedReturnSum,
  getInPatientMedSale,
  getOpCreditPharmSale,
  getGstReportPharmCollection,
  tsshPharmacyGstRptOne,
  tsshPharmacyGstRptTwo,
  tsshPharmacyGstRptthree,
  tsshPharmacyGstRptFour,
  collectionTmch,
  pharmacySaleGst,
  tmchGstReport,
  tsshGstReports,
} = require("./taxAndPharmacy.service");

module.exports = {
  getGstReportOfPharmacy: async (req, res) => {
    try {
      const body = req.body;
      const gstReportFromOra = await getGstReportOfPharmacy(body);
      if (gstReportFromOra.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: gstReportFromOra,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  getGstReportPharmacyWise: async (req, res) => {
    try {
      const body = req.body;
      const data = await getGstReportPharmacyWise(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getInPatientMedSale: async (req, res) => {
    try {
      const body = req.body;
      const data = await getInPatientMedSale(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getInPatientMedReturn: async (req, res) => {
    try {
      const body = req.body;
      const data = await getInPatientMedReturn(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getSumOfAmountTaxDisc: async (req, res) => {
    try {
      const body = req.body;
      const data = await getSumOfAmountTaxDisc(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getInPatientMedReturnSum: async (req, res) => {
    try {
      const body = req.body;
      const data = await getInPatientMedReturnSum(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getOpCreditPharmSale: async (req, res) => {
    try {
      const body = req.body;
      const data = await getOpCreditPharmSale(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getGstReportPharmCollection: async (req, res) => {
    try {
      const body = req.body;
      const data = await getGstReportPharmCollection(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  // TSSH PHARMACY REPORTS
  tsshPharmacyGstRptOne: async (req, res) => {
    try {
      const body = req.body;
      const data = await tsshPharmacyGstRptOne(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  tsshPharmacyGstRptTwo: async (req, res) => {
    try {
      const body = req.body;
      const data = await tsshPharmacyGstRptTwo(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  tsshPharmacyGstRptthree: async (req, res) => {
    try {
      const body = req.body;
      const data = await tsshPharmacyGstRptthree(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  tsshPharmacyGstRptFour: async (req, res) => {
    try {
      const body = req.body;
      const data = await tsshPharmacyGstRptFour(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Gst Reports",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  //COLLECTION TMCH
  collectionTmch: async (req, res) => {
    try {
      const body = req.body;
      const data = await collectionTmch(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
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
  pharmacySaleGst: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacySaleGst(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
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
  tmchGstReport: async (req, res) => {
    let ora_conn;
    try {
      ora_conn = await getTmcConnection();
      const body = req.body;
      const {status, message, data} = await tmchGstReport(ora_conn, body);
      console.log(status, message);

      if (status === 0) {
        return res.status(200).json({
          success: 0,
          message: message,
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
    } finally {
      if (ora_conn) {
        await ora_conn.close();
      }
    }
  },
  tsshGstReport: async (req, res) => {
    let ora_conn;
    ora_conn = await getTmcConnection();
    try {
      const body = req.body;
      const {status, message, data} = await tsshGstReports(ora_conn, body);
      if (status === 1) {
        return res.status(200).json({
          success: 1,
          data: data,
        });
      } else {
        return res.status(200).json({
          success: 0,
          message: message,
        });
      }
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    } finally {
      if (ora_conn) {
        await ora_conn.close();
      }
    }
  },
};
