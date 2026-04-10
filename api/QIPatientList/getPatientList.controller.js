const {GetElliderPatientList, GetIPPatientList, GetEndoscopyIPInfo, GetInitialAssessmentDetails, GetEndoscopyPatientsQI} = require("./getPatientsList.service");
module.exports = {
  GetElliderPatientList: async (req, res) => {
    try {
      const body = req.body;
      const data = await GetElliderPatientList(body);
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

  GetEndoscopyIPInfo: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await GetEndoscopyIPInfo(id);
      if (!data) {
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
    // GetEndoscopyIPInfo(id, (err, results) => {
    //   if (err) {
    //   }
    //   if (Object.keys(results).length === 0) {
    //     return res.status(200).json({
    //       success: 2,
    //       message: "No Result",
    //       data: [],
    //     });
    //   }
    // });
  },

  GetInitialAssessmentDetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await GetInitialAssessmentDetails(body);
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

  GetEndoscopyPatientsQI: async (req, res) => {
    try {
      const body = req.body;
      const data = await GetEndoscopyPatientsQI(body);
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

  // get inpatient details
  GetIPPatientList: async (req, res) => {
    try {
      const body = req.body;
      const data = await GetIPPatientList(body);
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
};
