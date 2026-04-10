const {pools} = require("../../config/mysqldbconfig");
module.exports = {
  getOPCountYear: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select year, count, yearday from op_count_year WHERE
             yearday between ('${fromDate}')and ('${toDate}') order by yearday`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getIPCountYear: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select year, count, yearday from ip_count_year WHERE
             yearday between ('${fromDate}')and ('${toDate}') order by yearday`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getOPCurrentYear: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select month, count, year from op_count_month where
            month between ('${fromDate}') and ('${toDate}') order by month`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getIPCurrentYear: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select month, count, year from ip_count_month where
            month between ('${fromDate}') and ('${toDate}') order by month`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getOPCountMonth: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select month, count, year from op_count_month where
            month between ('${fromDate}') and ('${toDate}') order by month`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getIPCountMonth: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select month, count, year from ip_count_month where
            month between ('${fromDate}') and ('${toDate}') order by month`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getOPCurrentMonthDayWise: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;

    pool.query(
      `select day, count, year from op_count_day where
            day between ('${fromDate}') and ('${toDate}') order by day`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getIPCurrentMonthDayWise: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select day, count, year from ip_count_day where
            day between ('${fromDate}') and ('${toDate}') order by day`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getOPCountDay: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;

    pool.query(
      `select day, count, year from op_count_day where
            day between ('${fromDate}') and ('${toDate}') order by day`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },

  getIPCountDay: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select day, count, year from ip_count_day where
            day between ('${fromDate}') and ('${toDate}') order by day`,
      {},
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },
};
