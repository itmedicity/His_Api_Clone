const {
  ipAdmissionList,
  insertTsshPatient,
  checkPatientInserted,
  getTsshPatientDateWise,
  deleteIPNumberFromTssh,
  getPatientData,
  getIpadmissChecks,
  getTsshPatientList,
  getTotalPatientList,
  getDischargePatientList,
  notDischargedPatientListTssh,
  getLastDischargeUpdateDate,
  updateDischargedPatient,
  updateLastDischargeDate,
  getDischargedipNoFromMysql,
  // getIpadmissChecks,
  insertAsRemoveTmcPatient,
  getTsshIpNoFromMysql,
  getIpReceiptPatientInfo,
  getDischargedIpInfoFromMysql,
  getTsshIpNoFromMysqlGrouping,
  getDischargedIpInfoFromMysqlGrouped,
  getGroupedPatientList,
  getTmcIncomeReport,
  getTsshIncomeReport,
  getIpNumberTsshGrouped,
  getDischargedIpInfoFromTMCH,
} = require("./admissionList.service");

module.exports = {
  getIpAdmissionList: async (req, res) => {
    try {
      const body = req.body;
      const data = await ipAdmissionList(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Admission List",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  insertTsshPat: async (req, res) => {
    try {
      const body = req.body;
      const data = await checkPatientInserted(body);
      if (data.length === 0) {
        await insertTsshPatient(body);
        return res.status(200).json({
          success: 1,
          message: "Patient Transfer To TSSH",
        });
      }
      return res.status(200).json({
        success: 2,
        message: "Patient Already Transfer",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  removeAsTmchPatient: async (req, res) => {
    try {
      const body = req.body;
      const excist = await checkPatientInserted(body);
      if (excist.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "Patient Already Grouped",
        });
      }
      await insertAsRemoveTmcPatient(body);
      return res.status(200).json({
        success: 1,
        message: "Patient Grouped From TMCH",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getTsshPatientDateWise: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTsshPatientDateWise(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Tssh Patient List",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  deleteIPNumberFromTssh: async (req, res) => {
    try {
      const body = req.body;
      await deleteIPNumberFromTssh(body);

      return res.status(200).json({
        succ: 1,
        msage: "Patient Removed From TSSH ",
        data: [],
      });
    } catch (error) {
      return res.status(200).json({
        succ: 0,
        msage: error,
      });
    }
  },
  getPatientData: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await getPatientData(id);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Patient Infomation",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getTsshPatientList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTsshPatientList(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Get Tssh Patient List",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getTotalPatientList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTotalPatientList(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "GET TOTAL PATIENT LIST",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getDischargePatientList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getDischargePatientList(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Get The Discharged Patient List",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  notDischargedPatientListTssh: async (req, res) => {
    try {
      const data = await notDischargedPatientListTssh();
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Get The Discharged Patient List",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getLastDischargeUpdateDate: async (req, res) => {
    try {
      const data = await getLastDischargeUpdateDate();
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Last discharge updated dates",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  updateDischargedPatient: async (req, res) => {
    try {
      const body = req.body;
      if (!Array.isArray(body) || body.length === 0) {
        return res.status(200).json({
          success: 0,
          message: "Invalid or empty request body",
        });
      }
      await updateDischargedPatient(body);

      return res.status(200).json({
        success: 1,
        message: "Discharged patients updated successfully",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.sqlMessage || error.message || "Update failed",
      });
    }
  },
  updateLastDischargeDate: async (req, res) => {
    try {
      const body = req.body;
      await updateLastDischargeDate(body);

      return res.status(200).json({
        success: 1,
        message: "Update The last dicharge uipdated date",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getDischargedipNoFromMysql: async (req, res) => {
    try {
      const body = req.body;
      const data = await getDischargedipNoFromMysql(body);
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
  getTsshIpNoFromMysql: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTsshIpNoFromMysql(body);
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
  getIpadmissChecks: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await getIpadmissChecks(id);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Patient Infomation",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getIpReceiptPatientInfo: async (req, res) => {
    try {
      const body = req.body;
      const data = await getIpReceiptPatientInfo(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "ip receipt details",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getDischargedIpInfoFromMysql: async (req, res) => {
    try {
      const body = req.body;
      const data = await getDischargedIpInfoFromMysql(body);
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
  getDischargedIpInfoFromTMCH: async (req, res) => {
    try {
      const body = req.body;
      const data = await getDischargedIpInfoFromTMCH(body);
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
  getTsshIpNoFromMysqlGrouping: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTsshIpNoFromMysqlGrouping(body);
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
  getDischargedIpInfoFromMysqlGrouped: async (req, res) => {
    try {
      const body = req.body;
      const data = await getDischargedIpInfoFromMysqlGrouped(body);
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
  getGroupedPatientList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getGroupedPatientList(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "GET GROUPED PATIENT LIST",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getTmcIncomeReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTmcIncomeReport(body);
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
  getTsshIncomeReport: async (req, res) => {
    try {
      const body = req.body;
      const data = await getTsshIncomeReport(body);
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
  getIpNumberTsshGrouped: async (req, res) => {
    try {
      const body = req.body;
      const data = await getIpNumberTsshGrouped(body);
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
};
