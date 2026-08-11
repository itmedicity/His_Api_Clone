const {pools} = require("../../config/mysqldbconfig");

// NOTE: every function below calls `pool.query(...)`, but `pool` is never
// imported or defined in this file (only `pools`, plural, is imported above
// and unused) — every one of these currently throws `ReferenceError: pool is
// not defined` before the SQL below ever runs. routes/index.js already flags
// this router "// not corrected". Left as-is rather than guessing which of
// pools.meliora / pools.bis / pools.ellider these op_count_*/ip_count_* MySQL
// tables actually live in — no cron job in this repo populates them, so that
// needs a decision from someone who knows the intended schema.
module.exports = {
  getOPCountYear: (data, callBack) => {
    const fromDate = data.from;
    const toDate = data.to;
    pool.query(
      `select year, count, yearday from op_count_year WHERE
             yearday between (?) and (?) order by yearday`,
      [fromDate, toDate],
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
             yearday between (?) and (?) order by yearday`,
      [fromDate, toDate],
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
            month between (?) and (?) order by month`,
      [fromDate, toDate],
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
            month between (?) and (?) order by month`,
      [fromDate, toDate],
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
            month between (?) and (?) order by month`,
      [fromDate, toDate],
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
            month between (?) and (?) order by month`,
      [fromDate, toDate],
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
            day between (?) and (?) order by day`,
      [fromDate, toDate],
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
            day between (?) and (?) order by day`,
      [fromDate, toDate],
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
            day between (?) and (?) order by day`,
      [fromDate, toDate],
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
            day between (?) and (?) order by day`,
      [fromDate, toDate],
      (err, results, fields) => {
        if (err) {
          return callBack(err);
        }
        return callBack(null, results);
      },
    );
  },
};
