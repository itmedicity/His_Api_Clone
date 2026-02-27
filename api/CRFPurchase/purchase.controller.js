const {getPODetails, getPendingPODetails, getItemGrnDetails, getPODetailsBySupplier, getItemDetails} = require("./purchase.service");

module.exports = {
  getPODetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await getPODetails(body);
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

  getPendingPODetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await getPendingPODetails(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
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

  getItemGrnDetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await getItemGrnDetails(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
        });
      }
      return res.status(200).json({
        success: 1,
        elliderdata: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  getPODetailsBySupplier: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await getPODetailsBySupplier(id);
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

  getItemDetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await getItemDetails(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
        });
      }
      return res.status(200).json({
        success: 1,
        ellData: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  // getPendingPODetails: (req, res) => {
  //     const { offset, limit } = req.query;
  //     getPendingPODetails(parseInt(offset, 10), parseInt(limit, 10), (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (!results || results.length === 0) {
  //             return res.status(200).json({
  //                 success: 1
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 2,
  //             data: results
  //         });
  //     });
  // },
};
