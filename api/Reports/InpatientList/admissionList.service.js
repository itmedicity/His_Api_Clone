// @ts-ignore
const {oracledb, getTmcConnection} = require("../../../config/oradbconfig");
const {query, transaction} = require("../../../config/mysqldbconfig");

module.exports = {
  /**
   * @description ORACLE UPDATION : IP ADMISSION
   */
  ipAdmissionList: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const sql = ` SELECT 
                        IP_NO,
                        PT_NO,
                        PTC_PTNAME,
                        TO_CHAR(IPD_DATE,'YYYY-MM-DD') IPD_DATE,
                        TO_CHAR(IPD_DISC ,'YYYY-MM-DD hh24:mi') DISDATE,
                        DECODE(IPC_STATUS,NULL,'N','Y') DISSTATUS  
                    FROM IPADMISS 
                    WHERE IPD_DATE   >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') 
                    AND IPD_DATE   <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') 
                    AND IPC_PTFLAG = 'N'`;
      const {rows} = await conn_ora.execute(
        sql,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
  /**
   * @param { MYSQL UPDATION } body
   */
  insertTsshPatient: async (body) => {
    const rows = body;
    return transaction(`ellider`, [
      {
        sql: `INSERT INTO tssh_ipadmiss 
                        (date,ip_no,op_no,dis_status,dis_date)
                    VALUES (?)`,
        values: [rows],
      },
    ]);
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Inserts a patient into the tssh_ipadmiss table as a removed tmch patient
   * @param {object} data - contains date, ip_no, op_no, disStatus, disDate, and status
   * @return {Promise} - resolves with the result of the query
   */
  /*******  88c821dc-7565-4527-911e-db5f8a830170  *******/
  insertAsRemoveTmcPatient: async (data) => {
    return query(
      "ellider",
      `INSERT INTO tssh_ipadmiss 
                (date,ip_no,op_no,dis_status,dis_date,tmch_status) 
            VALUES (?,?,?,?,?,?)`,
      [data.date, data.ip_no, data.op_no, data.disStatus, data.disDate, data.status],
    );
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Check if a patient is inserted into tssh_ipadmiss table
   * @param {object} data - contains ip_no
   * @return {Promise} - resolves with the result of the query
   */
  /*******  7ee5f77b-375d-4a59-8d2d-4f5d4d8f653f  *******/
  checkPatientInserted: async (data) => {
    return query("ellider", `SELECT ip_slno FROM tssh_ipadmiss WHERE ip_no = ?`, [data.ip_no]);
  },

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Retrieves all patients from tssh_ipadmiss table on a given date
   * @param {object} data - contains date
   * @return {Promise} - resolves with the result of the query
   */
  /*******  7387c52a-16fd-4065-b8e2-423bacddf6eb  *******/
  getTsshPatientDateWise: async (data) => {
    return query("ellider", `SELECT * FROM tssh_ipadmiss WHERE date = ?`, [data.date]);
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Deletes a patient from tssh_ipadmiss table based on the given ip_slno
   * @param {array} data - an array of ip_slno to be deleted
   * @return {Promise} - resolves with the result of the query
   */
  /*******  9b1e3a73-463b-4767-8bc8-b504dddc008d  *******/
  deleteIPNumberFromTssh: async (data) => {
    return query("ellider", `DELETE FROM tssh_ipadmiss WHERE ip_slno IN (?)`, [data]);
  },
  getPatientData: async (ptno) => {
    let conn_ora = await getTmcConnection();
    try {
      const {rows} = await conn_ora.execute(
        ` SELECT 
                    PT_NO,
                    PTC_PTNAME,
                    PTC_SEX,
                    PTN_YEARAGE,
                    PTC_LOADD1,
                    PTC_LOADD2,
                    PTC_MOBILE
                FROM PATIENT WHERE PT_NO = :ptno  AND PTC_PTFLAG = 'N'`,
        {
          ptno: ptno,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
  getTsshPatientList: async (data) => {
    return query(
      "ellider",
      `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE date BETWEEN ? AND ?`,
      [data.fromDate, data.toDate],
    );
  },
  getTotalPatientList: async (data) => {
    try {
      let conn_ora = await getTmcConnection();
      const sql = `SELECT  
                        IP_NO
                    FROM DISBILLMAST
                        WHERE DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND DMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND DMC_PTFLAG = 'N' AND DMC_CANCEL IS NULL
                    UNION 
                    SELECT
                        IP_NO
                    FROM IPADMISS
                        WHERE IPC_PTFLAG = 'N'
                        AND  IPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND IPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    UNION  
                    SELECT 
                        IP_NO
                    FROM IPADMISS
                        WHERE IPC_PTFLAG = 'N'
                        AND DMD_DATE > TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') 
                        AND IPD_DATE < TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;

      const {rows} = await conn_ora.execute(
        sql,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
  // GET DISCHARGE INFO FROM ORACLE
  getDischargePatientList: async (data) => {
    try {
      let conn_ora = await getTmcConnection();
      const sql = `SELECT 
                        TO_CHAR(DMD_DATE ,'YYYY-MM-DD hh24:mi') DISDATE,
                        IP_NO
                    FROM IPADMISS 
                    WHERE  DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND IPADMISS.IPC_PTFLAG = 'N'`;
      const {rows} = await conn_ora.execute(
        sql,
        {
          fromDate: data.fromDate,
          toDate: data.toDate,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Retrieves a list of patients that have not been discharged from TSSH
   * @param {Function} callBack - callback function to be called after the query has been executed
   * @returns {Promise} - resolves with the result of the query
   */
  /*******  7d7a3e7d-c26c-4a06-b7cc-5ec835b8365f  *******/
  notDischargedPatientListTssh: async () => {
    return query(
      "ellider",
      `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'N'`,
    );
  },
  getLastDischargeUpdateDate: async () => {
    return query(`SELECT Last_dis_updateDate FROM last_dis_updatedate`);
  },
  updateDischargedPatient: async (data) => {
    return transaction(
      `ellider`,
      data.map((val) => ({
        sql: `UPDATE tssh_ipadmiss 
                        SET dis_status = 'Y',
                            dis_date = ?
                        WHERE ip_no = ?`,
        values: [val.DISDATE, val.IP_NO],
      })),
    );
  },
  updateLastDischargeDate: async (data) => {
    return query(`UPDATE last_dis_updatedate SET Last_dis_updateDate = ? WHERE slno = 1`, [data.date]);
  },
  getDischargedipNoFromMysql: (data) => {
    return query(
      "ellider",
      `SELECT
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ?`,
      [data.to, data.to, data.to, data.from, data.to],
    );
  },
  getTsshIpNoFromMysql: async (data) => {
    return query(
      "ellider",
      `SELECT 
				ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            AND tmch_status = 0
			UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            AND tmch_status = 0
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ? AND tmch_status = 0`,
      [data.to, data.to, data.to, data.from, data.to],
    );
  },
  getIpadmissChecks: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const {rows} = await conn_ora.execute(
        `SELECT
                 IP_NO ,IPD_DISC
                  FROM IPADMISS
                   WHERE IP_NO=:ptno AND  IPD_DISC IS NULL  AND IPC_PTFLAG='N'`,
        {
          ptno: data,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
  // GET DISCHARGE INFO FROM ORACLE
  getIpReceiptPatientInfo: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const fromDate = data.from;
      const toDate = data.to;
      const sql = `SELECT 
                        IPADMISS.IP_NO,
                        TO_CHAR(IPADMISS.IPD_DATE,'YYYY-MM-DD hh24:mi:ss' ) ADMISSION
                    FROM IPRECEIPT,IPADMISS
                    WHERE IPRECEIPT.DMC_SLNO =  IPADMISS.DMC_SLNO
                    AND IRC_CANCEL IS NULL
                    AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')  
                    AND  IRD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
      const result = await conn_ora.execute(
        sql,
        {
          fromDate: fromDate,
          toDate: toDate,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * @function getDischargedIpInfoFromMysql
   * @description Fetches all discharged patients from MySQL database between given date range.
   * @param {Object} data - an object containing 'from' and 'to' date properties.
   * @returns {Promise} - a promise that resolves with an array of objects containing 'ip_no'.
   * @throws {Error} - an error if the query fails.
   */
  /*******  f0a66d49-d9cf-40b3-a2cc-7eed6f40532a  *******/
  getDischargedIpInfoFromMysql: async (data) => {
    return query(
      `ellider`,
      `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' 
            AND date BETWEEN ? AND ? AND tmch_status = 0`,
      [data.from, data.to],
    );
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * @function getDischargedIpInfoFromTMCH
   * @description Fetches all discharged patients from TMCH database between given date range.
   * @param {Object} data - an object containing 'from' and 'to' date properties.
   * @returns {Promise} - a promise that resolves with an array of objects containing 'ip_no'.
   * @throws {Error} - an error if the query fails.
   */
  /*******  c44d801c-cd76-4bfb-a608-fa8d384c4c00  *******/
  getDischargedIpInfoFromTMCH: async (data) => {
    return query(
      `ellider`,
      `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' 
            AND date BETWEEN ? AND ?`,
      [data.from, data.to],
    );
  },
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * @function getTsshIpNoFromMysqlGrouping
   * @description Fetches all the IP numbers from MySQL database grouped by discharged status and date range.
   * @param {Object} data - an object containing 'from' and 'to' date properties.
   * @returns {Promise} - a promise that resolves with an array of objects containing 'ip_no' and 'tmch_status'.
   * @throws {Error} - an error if the query fails.
   */
  /*******  23d839d8-2d14-4b65-b9b3-004cf3f2103c  *******/
  getTsshIpNoFromMysqlGrouping: async (data) => {
    return query(
      `ellider`,
      `SELECT 
				ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            AND tmch_status = 1
			      UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            AND tmch_status = 1
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ? AND tmch_status = 1`,
      [data.to, data.to, data.to, data.from, data.to],
    );
  },
  getDischargedIpInfoFromMysqlGrouped: async (data) => {
    return query(
      `ellider`,
      `SELECT 
                ip_no
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' 
            AND date BETWEEN ? AND ?
            AND tmch_status = 1`,
      [data.from, data.to],
    );
  },
  getGroupedPatientList: async (data) => {
    return query(
      "ellider",
      `SELECT 
                date,
                ip_no,
                op_no,
                dis_status,
                dis_date
            FROM medi_ellider.tssh_ipadmiss
            WHERE tmch_status = ? AND date BETWEEN date(?) AND date(?)`,
      [data.status, data.fromDate, data.toDate],
    );
  },
  getTmcIncomeReport: async (data) => {
    return query(
      "ellider",
      `SELECT 
            SUM(bed) bed,
            SUM(ns) ns,
            SUM(room) room,
            SUM(others) others,
            SUM(consulting) consulting,
            SUM(anesthesia) anesthesia,
            SUM(operation) operation,
            SUM(theater) theater,
            SUM(theaterInstment) theaterInstment,
            SUM(cardiology) cardiology,
            SUM(disposible) disposible,
            SUM(icu) icu,
            SUM(icuProc) icuProc,
            SUM(radiology) radiology,
            SUM(lab) lab,
            SUM(bloodbank) bloodbank,
            SUM(mri) mri,
            SUM(diet) diet,
            SUM(pha_sale) pha_sale,
            SUM(pha_discount) pha_discount,
            SUM(pha_tax) pha_tax,
            SUM(pha_gross) pha_gross,
            SUM(ip_consolidate_discount) ip_consolidate_discount,
            SUM(pettycash) pettycash,
            SUM(tax) tax,
            SUM(collectionagainsale) collectionagainsale,
            SUM(advanceSettled) advanceSettled,
            SUM(creditinsurancebill) creditinsurancebill,
            SUM(unsettledAmount) unsettledAmount,
            SUM(roundOff) roundOff,
            SUM(gra_collection) gra_collection,
            SUM(gra_net) gra_net,
            SUM(gra_tax) gra_tax,
            SUM(gra_discount) gra_discount,
            SUM(gra_gross) gra_gross,
            SUM(insuranceBillDisct) insuranceBillDisct,
            SUM(insuranceWriteOff) insuranceWriteOff,
            SUM(Complimentary) Complimentary,
            SUM(previousDayDiscount) previousDayDiscount,
            SUM(advanceRefund) advanceRefund,
            SUM(advanceCollction) advanceCollction,
            SUM(insuranceBillCollection) insuranceBillCollection,
            SUM(previousDayCollection) previousDayCollection,
            SUM(counterCollection) counterCollection,
            SUM(general) general,
            SUM(otherType) otherType,
            SUM(discountTotal) discountTotal
        FROM tmc_income 
        WHERE DATE BETWEEN ? AND ?`,
      [data.from, data.to],
    );
  },
  getTsshIncomeReport: async (data) => {
    return query(
      "ellider",
      `SELECT 
                SUM(bed) bed,
                SUM(ns) ns,
                SUM(room) room,
                SUM(others) others,
                SUM(consulting) consulting,
                SUM(anesthesia) anesthesia,
                SUM(operation) operation,
                SUM(theater) theater,
                SUM(theaterInstment) theaterInstment,
                SUM(cardiology) cardiology,
                SUM(disposible) disposible,
                SUM(icu) icu,
                SUM(icuProc) icuProc,
                SUM(radiology) radiology,
                SUM(lab) lab,
                SUM(bloodbank) bloodbank,
                SUM(mri) mri,
                SUM(diet) diet,
                SUM(pha_sale) pha_sale,
                SUM(pha_discount) pha_discount,
                SUM(pha_tax) pha_tax,
                SUM(pha_gross) pha_gross,
                SUM(ip_consolidate_discount) ip_consolidate_discount,
                SUM(pettycash) pettycash,
                SUM(tax) tax,
                SUM(collectionagainsale) collectionagainsale,
                SUM(advanceSettled) advanceSettled,
                SUM(creditinsurancebill) creditinsurancebill,
                SUM(unsettledAmount) unsettledAmount,
                SUM(roundOff) roundOff,
                SUM(gra_collection) gra_collection,
                SUM(gra_net) gra_net,
                SUM(gra_tax) gra_tax,
                SUM(gra_discount) gra_discount,
                SUM(gra_gross) gra_gross,
                SUM(insuranceBillDisct) insuranceBillDisct,
                SUM(insuranceWriteOff) insuranceWriteOff,
                SUM(Complimentary) Complimentary,
                SUM(previousDayDiscount) previousDayDiscount,
                SUM(advanceRefund) advanceRefund,
                SUM(advanceCollction) advanceCollction,
                SUM(insuranceBillCollection) insuranceBillCollection,
                SUM(previousDayCollection) previousDayCollection,
                SUM(counterCollection) counterCollection,
                SUM(general) general,
                SUM(otherType) otherType,
                SUM(discountTotal) discountTotal
            FROM tssh_income 
            WHERE DATE BETWEEN ? AND ?`,
      [data.from, data.to],
    );
  },
  getIpNumberTsshGrouped: async (data) => {
    return query(
      "ellider",
      `SELECT
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'Y' AND date  <= ? and dis_date > ?
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_status = 'N' AND dis_date IS NULL AND date  < ?
            UNION
            SELECT 
                ip_no,tmch_status
            FROM tssh_ipadmiss
            WHERE dis_date >= ?
            AND dis_date <= ?`,
      [data.to, data.to, data.to, data.from, data.to],
    );
  },
};
