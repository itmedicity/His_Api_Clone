const {getTmcConnection} = require("../../../../config/oradbconfig");
const {collectionReports001} = require("./collectionTmc.service");

const getCollectionReports = async (req, res) => {
  const {fromDate, toDate} = req.body;

  let ora_conn;
  try {
    ora_conn = await getTmcConnection();
    const bind = {fromDate: fromDate, toDate: toDate};

    const collection_One = await collectionReports001(ora_conn, bind);

    const results = {
      collection_one: collection_one,
      collection_two: collection_two,
    };

    return res.status(200).json({
      success: 1,
      message: "Unsettled Amount User Wise",
      data: results,
    });
  } catch (error) {
    return res.status(200).json({
      success: 0,
      message: error.message,
    });
  } finally {
    if (ora_conn) {
      try {
        await ora_conn.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};

module.exports = getCollectionReports;
