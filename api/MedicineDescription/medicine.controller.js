const {getMedicinesFromOracle, getMedicinesForUpdates, medicineImportedDateUpdate, getImportedDate, getMedicinesFromMysql, searchMedicines, medicineDetailsUpdate} = require("./medicine.service");

module.exports = {
  getMedicinesFromOracle: async (req, res) => {
    try {
      const body = req.body;
      const medicineData = await getMedicinesFromMysql(body);
      if (medicineData.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "Medicines are Imported",
        });
      }

      await getMedicinesForUpdates(body);

      return res.status(200).json({
        success: 2,
        message: "Medicines are Imported",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }

    // getMedicinesFromMysql((err, results) => {
    //   if (err) {
    //     return res.status(200).json({
    //       success: 0,
    //       message: err,
    //     });
    //   }
    //   const value = JSON.parse(JSON.stringify(results));
    //   if (Object.keys(value).length === 0) {
    //     getMedicinesFromOracle(body, (err, results) => {
    //       if (err) {
    //         return res.status(200).json({
    //           success: 0,
    //           message: err,
    //         });
    //       }
    //       return res.status(200).json({
    //         success: 2,
    //         message: "Medicines are Imported",
    //       });
    //     });
    //   } else {
    //     getMedicinesForUpdates(body, (errr, results) => {
    //       if (errr) {
    //         return res.status(200).json({
    //           success: 0,
    //           message: errr,
    //         });
    //       }
    //       return res.status(200).json({
    //         success: 2,
    //         message: "Medicines are Imported",
    //       });
    //     });
    //   }
    // });
  },
  medicineImportedDateUpdate: async (req, res) => {
    try {
      const body = req.body;
      await medicineImportedDateUpdate(body);

      return res.status(200).json({
        success: 2,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  getImportedDate: async (res) => {
    try {
      const data = await getImportedDate();
      if (Object.keys(data).length === 0) {
        return res.status(200).json({
          success: 1,
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

  getMedicinesFromMysql: async (res) => {
    try {
      const data = await getMedicinesFromMysql();
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

  searchMedicines: async (req, res) => {
    try {
      const body = req.body;
      const data = await searchMedicines(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No data found",
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

  medicineDetailsUpdate: async (req, res) => {
    try {
      const body = req.body;
      const data = await medicineDetailsUpdate(body);
      if (data.affectedRows === 0) {
        return res.status(200).json({
          success: 1,
          message: "Failed to Update",
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Data Updated Successfully",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
};
