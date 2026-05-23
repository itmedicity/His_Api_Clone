const {oracledb} = require("../../../../config/oradbconfig");
const getMisincexpmast = async (conn_ora) => {
  const sql = `SELECT * FROM MISINCEXPMAST`;
  const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

const getUngroupedRoomDetl = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital),
                  INCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (NVL (dr.DRN_NURDAYS, 0) * NVL (dr.DRN_NURAMT, 0)) AS Amt,
                      SUM (0) AS Tax,
                      SUM (NVL (dr.DRN_NURDAYS, 0) * NVL (dr.DRN_NURAMT, 0)) AS GrossAmt,
                      SUM (0) AS Discount
                  FROM DISROOMDETL dr
                      JOIN DISBILLMAST dm
                          ON dm.DMC_SLNO = dr.DMC_SLNO
                      JOIN IPPARAM ip
                          ON ip.MH_CODE = dm.MH_CODE
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN INCLUDE_IP gip
                          ON gip.IP_NO = dm.IP_NO
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = ip.IPC_NUCODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                      AND NVL (dr.DMC_CANCEL, 'N') = 'N'
                      AND dm.DMC_CACR <> 'M'
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const getTheaterIncome = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     EXCLUDE_IP
     AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
  SELECT NVL (Dg_desc, 'Ungrouped') AS Dg_desc,
         NVL (Code, 999) AS Code,
         SUM (Amt) AS Amt,
         SUM (Tax) AS Tax,
         SUM (GrossAmt) AS GrossAmt,
         SUM (Discount) AS Discount
    FROM (  
    SELECT mig.DG_DESC AS Dg_desc,
                   mig.DG_GRCODE AS Code,
                   SUM (NVL (ps.SRN_OPERATION, 0) - NVL (ps.SRN_OPERDIS, 0))
                      AS Amt,
                   SUM (NVL (ps.SRN_OPERTOTTAX, 0)) AS Tax,
                   SUM (NVL (ps.SRN_OPERATION, 0)) AS GrossAmt,
                   SUM (NVL (ps.SRN_OPERDIS, 0)) AS Discount
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_OPER AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_OPERATION, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
           SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (NVL (ps.SRN_THEATER, 0) - NVL (ps.SRN_THEARDIS, 0)),
                   SUM (NVL (ps.SRN_THEATTOTTAX, 0)),
                   SUM (NVL (ps.SRN_THEATER, 0)),
                   SUM (NVL (ps.SRN_THEARDIS, 0))
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_THER AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_THEATER, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL 
          SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (NVL (ps.SRN_CHIEF, 0)),
                   SUM (NVL (psrd.SRN_TOTTAX, 0)),
                   SUM (NVL (ps.SRN_CHIEF, 0)),
                   SUM (0)
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_CHIEF AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_CHIEF, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC AS Dg_desc,
                   mig.DG_GRCODE AS Code,
                   SUM (NVL (ps.SRN_1STASST, 0)) AS Amt,
                   SUM (NVL (psrd.SRN_TOTTAX, 0)) AS Tax,
                   SUM (NVL (ps.SRN_1STASST, 0)) AS GrossAmt,
                   0 AS Discount
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_1STASST AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_1STASST, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
           SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (NVL (ps.SRN_2NDASST, 0)),
                   SUM (NVL (psrd.SRN_TOTTAX, 0)),
                   SUM (NVL (ps.SRN_2NDASST, 0)),
                   0
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_2NDASST AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_2NDASST, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
           SELECT mig.DG_DESC AS Dg_desc,
                   mig.DG_GRCODE AS Code,
                   SUM (NVL (ps.SRN_3RDASST, 0)) AS Amt,
                   SUM (NVL (psrd.SRN_TOTTAX, 0)) AS Tax,
                   SUM (NVL (ps.SRN_3RDASST, 0)) AS GrossAmt,
                   0 AS Discount
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_3RDASST AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_3RDASST, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (NVL (ps.SRN_GUEST, 0)),
                   SUM (NVL (psrd.SRN_TOTTAX, 0)),
                   SUM (NVL (ps.SRN_GUEST, 0)),
                   0
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_GUEST AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_GUEST, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (NVL (ps.SRN_ANTEST, 0) - NVL (ps.SRN_ANTDIS, 0)),
                   SUM (NVL (psrd.SRN_TOTTAX, 0)),
                   SUM (NVL (ps.SRN_ANTEST, 0)),
                   SUM (NVL (ps.SRN_ANTDIS, 0))
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_ANEST AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_ANTEST, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC AS Dg_desc,
                   mig.DG_GRCODE AS Code,
                   SUM (NVL (ps.SRN_ANTEST2, 0)) AS Amt,
                   SUM (NVL (psrd.SRN_TOTTAX, 0)) AS Tax,
                   SUM (NVL (ps.SRN_ANTEST2, 0)) AS GrossAmt,
                   0 AS Discount
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURGERYRESOURCESDETL psrd
                      ON psrd.SR_SLNO = ps.SR_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_ANEST2 AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRN_ANTEST2, 0) > 0
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (psot.PDN_AMOUNT),
                   SUM (NVL (psot.PSN_TOTTAX, 0)),
                   SUM (NVL (psot.PDN_AMOUNT, 0) + NVL (psot.SRN_DISCOUNT, 0)),
                   SUM (NVL (psot.SRN_DISCOUNT, 0))
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSUROTHER psot
                      ON psot.SR_SLNO = ps.SR_SLNO
                   JOIN PRODESCRIPTION pd
                      ON pd.PD_CODE = psot.PD_CODE
                   JOIN PROGROUP pg
                      ON pg.PG_CODE = pd.PG_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (psot.SRC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (psd.SRN_AMOUNT - NVL (psd.SRN_DISCOUNT, 0)),
                   SUM (NVL (psd.PSN_TOTTAX, 0)),
                   SUM (psd.SRN_AMOUNT),
                   SUM (NVL (psd.SRN_DISCOUNT, 0))
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURDETL psd
                      ON psd.SR_SLNO = ps.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = psd.PC_CODE AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (psd.SRC_CANCEL, 'N') = 'N'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          UNION ALL
          SELECT mig.DG_DESC,
                   mig.DG_GRCODE,
                   SUM (NVL (cm.CMN_NETAMT, 0) - NVL (cm.CMN_OUTCOLL, 0)),
                   0,
                   SUM (NVL (cm.CMN_NETAMT, 0) - NVL (cm.CMN_OUTCOLL, 0)),
                   0
              FROM CANBILLMAST cm
                   JOIN DISBILLMAST dm
                      ON dm.DMC_SLNO = cm.DMC_SLNO
                   JOIN IPPARAM ip
                      ON ip.MH_CODE = dm.MH_CODE
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN MISINCEXPDTL mid
                      ON mid.PC_CODE = ip.IPC_CANTEENCODE AND mid.DG_TYPE = 'R'
                   LEFT JOIN MISINCEXPGROUP mig
                      ON mig.DG_GRCODE = mid.DG_GRCODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (cm.CMC_CANCEL, 'N') = 'N'
                   AND cm.CMC_CACR = 'I'
                   AND dm.DMC_CACR <> 'M'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
          ) final_data
GROUP BY Dg_desc, Code
ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  // console.log(result.rows);
  return result.rows;
};

const getConsultingIncome = async (conn_ora, bind) => {
  // INCLUDEDrs
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    INCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                  SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                        NVL (mig.DG_GRCODE, 999) AS Code,
                        SUM (NVL (pv.VSN_RATE, 0) - NVL (pv.VSN_DISAMT, 0)) AS Amt,
                        SUM (NVL (pv.VSN_TOTTAX, 0)) AS Tax,
                        SUM (NVL (pv.VSN_RATE, 0)) AS GrossAmt,
                        SUM (NVL (pv.VSN_DISAMT, 0)) AS Discount
                    FROM PATVISIT pv
                        JOIN DISBILLMAST dm ON dm.DMC_SLNO = pv.DMC_SLNO
                        JOIN IPPARAM ip ON ip.MH_CODE = dm.MH_CODE
                        JOIN MH ON MH.MH_CODE = dm.MH_CODE
                        JOIN INCLUDE_IP gip ON gip.IP_NO = dm.IP_NO
                        LEFT JOIN MISINCEXPDTL mid ON mid.PC_CODE = ip.IPC_VSCODE AND mid.DG_TYPE = 'R'
                        LEFT JOIN MISINCEXPGROUP mig ON mig.DG_GRCODE = mid.DG_GRCODE
                        CROSS JOIN date_params dp
                  WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                        AND NVL (pv.VSC_CANCEL, 'N') = 'N'
                        AND dm.DMC_CACR <> 'M'
                        AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                GROUP BY mig.DG_GRCODE, mig.DG_DESC
                ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const getIpRefundDetl = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital),
                  INCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (NVL (rid.RIN_NETAMT, 0)) * -1 AS Amt,
                      SUM (NVL (rid.RIN_TOTTAX, 0)) * -1 AS Tax,
                      SUM (NVL (rid.RIN_NETAMT, 0) + NVL (rid.RIN_DISAMT, 0)) * -1
                          AS GrossAmt,
                      SUM (NVL (rid.RIN_DISAMT, 0)) * -1 AS Discount
                  FROM IPREFUNDMAST rm
                      JOIN IPREFUNDITEMDETL rid
                          ON rid.RIC_SLNO = rm.RIC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = rm.MH_CODE
                      JOIN INCLUDE_IP gip
                          ON gip.IP_NO = rm.IP_NO
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = rid.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     rid.RIC_TYPE <> 'PHY'
                      AND rm.RIC_CACR IN ('C', 'R')
                      AND NVL (rm.RIC_CANCEL, 'N') = 'N'
                      AND rm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const getIpincomeSection_one = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital),
                  INCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM ( NVL (dr.RDN_AMOUNT * CASE
                                  WHEN NVL (rd.DMC_HOUR, 'N') = 'N' THEN dr.RDN_DAYS
                                  WHEN NVL (rd.DMC_MINHOURTAKEN, 'N') = 'Y' THEN 1
                                  ELSE dr.RDN_DAYS
                              END,
                            0))
                      - SUM (NVL (dr.RDN_DISAMT, 0))
                          AS Amt,
                      SUM (NVL (dr.RDN_TOTTAX, 0)) AS Tax,
                      SUM (NVL ( dr.RDN_AMOUNT * CASE
                                  WHEN NVL (rd.DMC_HOUR, 'N') = 'N' THEN dr.RDN_DAYS
                                  WHEN NVL (rd.DMC_MINHOURTAKEN, 'N') = 'Y' THEN 1 
                                  ELSE dr.RDN_DAYS
                              END,
                            0))
                          AS GrossAmt,
                      SUM (NVL (dr.RDN_DISAMT, 0)) AS Discount
                  FROM DISRMRENTDETL dr
                      JOIN DISBILLMAST dm ON dm.DMC_SLNO = dr.DMC_SLNO
                      JOIN DISROOMDETL rd ON rd.DMC_SLNO = dr.DMC_SLNO
                            AND rd.RM_SLNO = dr.RM_SLNO
                            AND rd.RT_CODE = dr.RT_CODE
                            AND rd.BD_CODE = dr.BD_CODE
                      JOIN MH ON MH.MH_CODE = dm.MH_CODE
                      JOIN INCLUDE_IP gip ON gip.IP_NO = dm.IP_NO
                      LEFT JOIN MISINCEXPDTL mid ON mid.PC_CODE = dr.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE NVL (dm.DMC_CANCEL, 'N') = 'N' AND dm.DMC_CACR <> 'M' AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const getIpincomeSection_two = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    INCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                  SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                        NVL (mig.DG_GRCODE, 999) AS Code,
                        SUM (NVL (ps.SVN_QTY * ps.SVN_RATE, 0) - NVL (ps.SVN_DISAMT, 0))
                            AS Amt,
                        SUM (NVL (ps.SVN_TOTTAX, 0)) AS Tax,
                        SUM (NVL (ps.SVN_QTY * ps.SVN_RATE, 0)) AS GrossAmt,
                        SUM (NVL (ps.SVN_DISAMT, 0)) AS Discount
                    FROM PATSERVICE ps
                        JOIN DISBILLMAST dm ON dm.DMC_SLNO = ps.DMC_SLNO
                        JOIN PRODESCRIPTION pd ON pd.PD_CODE = ps.PD_CODE
                        JOIN PROGROUP pg ON pg.PG_CODE = pd.PG_CODE
                        JOIN MH ON MH.MH_CODE = dm.MH_CODE
                        JOIN INCLUDE_IP gip ON gip.IP_NO = dm.IP_NO
                        LEFT JOIN MISINCEXPDTL mid ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                        LEFT JOIN MISINCEXPGROUP mig ON mig.DG_GRCODE = mid.DG_GRCODE
                        CROSS JOIN date_params dp
                  WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                        AND NVL (ps.SVC_CANCEL, 'N') = 'N'
                        AND dm.DMC_CACR <> 'M'
                        AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                GROUP BY mig.DG_GRCODE, mig.DG_DESC
                ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const getMisincexpgroup = async (conn_ora) => {
  const sql = `SELECT * FROM Misincexpgroup`;
  const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

const getTheaterIncome_two = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                  SELECT NVL (Dg_desc, 'Ungrouped') AS Dg_desc,
                        NVL (Code, 999) AS Code,
                        SUM (Amt) AS Amt,
                        SUM (Tax) AS Tax,
                        SUM (GrossAmt) AS GrossAmt,
                        SUM (Discount) AS Discount
                    FROM (
                            SELECT mig.DG_DESC AS Dg_desc,
                                  mig.DG_GRCODE AS Code,
                                  SUM (NVL (ps.SRN_OPERATION, 0) - NVL (ps.SRN_OPERDIS, 0))
                                      AS Amt,
                                  SUM (NVL (ps.SRN_OPERTOTTAX, 0)) AS Tax,
                                  SUM (NVL (ps.SRN_OPERATION, 0)) AS GrossAmt,
                                  SUM (NVL (ps.SRN_OPERDIS, 0)) AS Discount
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.OPERATION_OPSLNO = ob.OPC_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_OPER AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND NVL (ps.SRN_OPERATION, 0) > 0
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC AS Dg_desc,
                                  mig.DG_GRCODE AS Code,
                                  SUM (NVL (ps.SRN_THEATER, 0) - NVL (ps.SRN_THEARDIS, 0)),
                                  SUM (NVL (ps.SRN_THEATTOTTAX, 0)),
                                  SUM (NVL (ps.SRN_THEATER, 0)),
                                  SUM (NVL (ps.SRN_THEARDIS, 0))
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.THEATER_OPSLNO = ob.OPC_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_THER AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND NVL (ps.SRN_THEATER, 0) > 0
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC AS Dg_desc,
                                  mig.DG_GRCODE AS Code,
                                  SUM (NVL (ps.SRN_CHIEF, 0)),
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)),
                                  SUM (NVL (ps.SRN_CHIEF, 0)),
                                  0
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.CHIEF_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_CHIEF AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND NVL (ps.SRN_CHIEF, 0) > 0
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC AS Dg_desc,
                                  mig.DG_GRCODE AS Code,
                                  SUM (NVL (ps.SRN_1STASST, 0)) Amt,
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)) Tax,
                                  SUM (NVL (ps.SRN_1STASST, 0)) GrossAmt,
                                  0 Discount
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.D1STASST_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_1STASST AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRN_1STASST, 0) > 0
                                  AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC,
                                  mig.DG_GRCODE,
                                  SUM (NVL (ps.SRN_2NDASST, 0)),
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)),
                                  SUM (NVL (ps.SRN_2NDASST, 0)),
                                  0
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.D2NDASST_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_2NDASST AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRN_2NDASST, 0) > 0
                                  AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC,
                                  mig.DG_GRCODE,
                                  SUM (NVL (ps.SRN_3RDASST, 0)),
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)),
                                  SUM (NVL (ps.SRN_3RDASST, 0)),
                                  0
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.D3RDASST_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_3RDASST AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRN_3RDASST, 0) > 0
                                  AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC,
                                  mig.DG_GRCODE,
                                  SUM (NVL (ps.SRN_GUEST, 0)),
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)),
                                  SUM (NVL (ps.SRN_GUEST, 0)),
                                  0
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.GUEST_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_GUEST AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRN_GUEST, 0) > 0
                                  AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC,
                                  mig.DG_GRCODE,
                                  SUM (NVL (ps.SRN_ANTEST, 0) - NVL (ps.SRN_ANTDIS, 0)),
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)),
                                  SUM (NVL (ps.SRN_ANTEST, 0)),
                                  SUM (NVL (ps.SRN_ANTDIS, 0))
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.ANTEST_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_ANEST AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRN_ANTEST, 0) > 0
                                  AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC AS Dg_desc,
                                  mig.DG_GRCODE AS Code,
                                  SUM (NVL (ps.SRN_ANTEST2, 0)) AS Amt,
                                  SUM (NVL (psrd.SRN_TOTTAX, 0)) AS Tax,
                                  SUM (NVL (ps.SRN_ANTEST2, 0)) AS GrossAmt,
                                  0 AS Discount
                              FROM OPBILLMAST ob
                                  JOIN PATSURGERY ps
                                      ON ps.ANTEST2_OPSLNO = ob.OPC_SLNO
                                  JOIN PATSURGERYRESOURCESDETL psrd
                                      ON psrd.SR_SLNO = ps.SR_SLNO
                                  JOIN OPPARAM op
                                      ON 1 = 1
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = op.OPC_ANEST2 AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRN_ANTEST2, 0) > 0
                                  AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC,
                                  mig.DG_GRCODE,
                                  SUM (psot.PDN_AMOUNT),
                                  SUM (NVL (psot.PSN_TOTTAX, 0)),
                                  SUM (NVL (psot.PDN_AMOUNT, 0) + NVL (psot.SRN_DISCOUNT, 0)),
                                  SUM (NVL (psot.SRN_DISCOUNT, 0))
                              FROM OPBILLMAST ob
                                  JOIN PATSUROTHER psot
                                      ON psot.OPC_SLNO = ob.OPC_SLNO
                                  JOIN PATSURGERY ps
                                      ON ps.SR_SLNO = psot.SR_SLNO
                                  JOIN PRODESCRIPTION pd
                                      ON pd.PD_CODE = psot.PD_CODE
                                  JOIN PROGROUP pg
                                      ON pg.PG_CODE = pd.PG_CODE
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (psot.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          UNION ALL
                          SELECT mig.DG_DESC,
                                  mig.DG_GRCODE,
                                  SUM (psd.SRN_AMOUNT - NVL (psd.SRN_DISCOUNT, 0)),
                                  SUM (NVL (psd.PSN_TOTTAX, 0)),
                                  SUM (psd.SRN_AMOUNT),
                                  SUM (NVL (psd.SRN_DISCOUNT, 0))
                              FROM OPBILLMAST ob
                                  JOIN PATSURDETL psd
                                      ON psd.OPC_SLNO = ob.OPC_SLNO
                                  JOIN PATSURGERY ps
                                      ON ps.SR_SLNO = psd.SR_SLNO
                                  JOIN MH
                                      ON MH.MH_CODE = ob.MH_CODE
                                  JOIN EXCLUDE_IP ex
                                      ON ex.IP_NO = ps.IP_NO
                                  LEFT JOIN MISINCEXPDTL mid
                                      ON mid.PC_CODE = psd.PC_CODE AND mid.DG_TYPE = 'R'
                                  LEFT JOIN MISINCEXPGROUP mig
                                      ON mig.DG_GRCODE = mid.DG_GRCODE
                                  CROSS JOIN date_params dp
                            WHERE     NVL (ps.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (psd.SRC_CANCEL, 'N') = 'N'
                                  AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                                  AND ob.OPC_CACR <> 'M'
                                  AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          GROUP BY mig.DG_GRCODE, mig.DG_DESC
                          ) final_data
                GROUP BY Dg_desc, Code
                ORDER BY Dg_desc`;

  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getPharmacyCollection_One = async (conn_ora, bind) => {
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital)
SELECT SUM (A.Billamt) AS Amt,
       SUM (A.GrossAmt) AS GrossAmt,
       SUM (A.Discount) AS Discount,
       SUM (A.Comp) AS Comp,
       SUM (A.TAX) AS TAX
  FROM (
        SELECT SUM ( CASE WHEN pm.BMC_CACR IN ('C', 'R') THEN NVL (pd.BDN_AMOUNT, 0) ELSE 0 END) AS Billamt,
               SUM ( CASE WHEN pm.BMC_CACR IN ('C', 'R') THEN NVL (pd.BDN_AMOUNT, 0) + NVL (pd.BMN_DISAMT, 0) ELSE 0 END) AS GrossAmt,
               SUM ( CASE WHEN pm.BMC_CACR IN ('C', 'R') THEN NVL (pd.BMN_DISAMT, 0) ELSE 0 END) AS Discount,
               SUM ( CASE WHEN pm.BMC_CACR = 'M' THEN NVL (pd.BDN_AMOUNT, 0) ELSE 0 END) AS Comp,
               SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS TAX
          FROM PBILLMAST pm
               JOIN PBILLDETL pd ON pd.BMC_SLNO = pm.BMC_SLNO
               JOIN MH ON MH.MH_CODE = pm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     pm.BMC_COLLCNCODE IS NULL
               AND NVL (pm.BMC_CANCEL, 'N') IN ('N', 'P')
               AND pm.BMC_CACR IN ('C', 'R', 'M')
               AND pm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        SELECT SUM (NVL (md.MRN_AMOUNT, 0) - NVL (md.MRN_DISAMT, 0)) * -1 AS Billamt,
               SUM (NVL (md.MRN_AMOUNT, 0)) * -1 AS GrossAmt,
               SUM (NVL (md.MRN_DISAMT, 0)) * -1 AS Discount,
               0 AS Comp,
               SUM (NVL (md.MRN_CESS, 0) + NVL (md.MRN_SALETAX, 0)) * -1 AS TAX
          FROM MRETDETL md
               JOIN MRETMAST mm ON mm.MRC_SLNO = md.MRC_SLNO
               JOIN PBILLDETL pd ON     pd.BMC_SLNO = md.BMC_SLNO
                     AND pd.IT_CODE = md.IT_CODE
                     AND pd.ITC_DOCNO = md.ITC_DOCNO
                     AND pd.ITC_DOCTYPE = md.ITC_DOCTYPE
                     AND pd.ITC_SLNO = md.ITC_SLNO
               JOIN MH ON MH.MH_CODE = md.MH_CODE
               CROSS JOIN date_params dp
         WHERE     mm.MRC_RETCNCODE IS NULL
               AND NVL (md.MRC_CANCEL, 'N') <> 'Y'
               AND NVL (mm.MRC_CANCEL, 'N') <> 'Y'
               AND md.MRC_CACR IN ('C', 'R')
               AND md.MRD_DATE BETWEEN dp.from_date AND dp.TO_DATE) A`;

  /***
                * 
                *                -- PBILL
CREATE INDEX IDX_PBILL_DATE ON PBILLMAST (MH_CODE, BMD_DATE);

-- RETURNS
CREATE INDEX IDX_MRET_DATE ON MRETDETL (MH_CODE, MRD_DATE);

-- JOIN SUPPORT
CREATE INDEX IDX_PBILLDETL_SLNO ON PBILLDETL (BMC_SLNO);
CREATE INDEX IDX_MRET_LINK ON MRETDETL (BMC_SLNO, IT_CODE, ITC_DOCNO);
                * 
                * 
                * 
                */

  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getIpRefundDetl_one = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital)
                SELECT SUM (NVL (rid.RIN_NETAMT, 0)) * -1 AS Amt,
                      SUM (NVL (rid.RIN_NETAMT, 0) + NVL (rid.RIN_DISAMT, 0)) * -1
                          AS GrossAmt,
                      SUM (NVL (rid.RIN_DISAMT, 0)) * -1 AS Discount,
                      0 AS Comp,
                      0 AS Tax
                  FROM IPREFUNDMAST rm
                      JOIN IPREFUNDITEMDETL rid
                          ON rid.RIC_SLNO = rm.RIC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = rm.MH_CODE
                      CROSS JOIN date_params dp
                WHERE     rid.RIC_TYPE = 'PHY'
                      AND rm.RIC_CACR IN ('C', 'R')
                      AND NVL (rm.RIC_CANCEL, 'N') = 'N'
                      AND rm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getIpincomeSection_three = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (
                          CASE WHEN rm.RPC_CACR IN ('C', 'R') THEN rd.RPN_NETAMT ELSE 0 END)
                          AS Amt,
                      SUM (NVL (rd.RPN_TOTTAX, 0)) AS Tax,
                      SUM (
                          CASE WHEN rm.RPC_CACR IN ('C', 'R') THEN rd.RPN_NETAMT ELSE 0 END
                          + NVL (rd.RPN_DISAMT, 0))
                          AS GrossAmt,
                      SUM (CASE WHEN rm.RPC_CACR = 'M' THEN rd.RPN_NETAMT ELSE 0 END)
                          AS Comp,
                      SUM (NVL (rd.RPN_DISAMT, 0)) AS Discount
                  FROM RECEIPTMAST rm
                      JOIN RECEIPTDETL rd
                          ON rm.RPC_SLNO = rd.RPC_SLNO
                      JOIN PRODESCRIPTION pd
                          ON pd.PD_CODE = rd.PD_CODE
                      JOIN PROGROUP pg
                          ON pg.PG_CODE = pd.PG_CODE
                      JOIN MH
                          ON MH.MH_CODE = rm.MH_CODE
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     rm.RPC_COLLCNCODE IS NULL
                      AND NVL (rm.RPC_CANCEL, 'N') <> 'C'
                      AND rm.RPC_CACR IN ('C', 'R', 'M')
                      AND rm.RPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getProcedureIncomeSection_one = async (conn_ora, bind) => {
  const sql = `WITH date_params
                AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                MH AS (SELECT MH_CODE FROM multihospital),
                EXCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
              SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                    NVL (mig.DG_GRCODE, 999) AS Code,
                    SUM ( (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)) AS Amt,
                    SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.BDN_TOTCESS, 0)) AS Tax,
                    SUM (bd.PDN_RATE * bd.PDN_QTY) AS GrossAmt,
                    0 AS Comp,
                    SUM (NVL (bd.BMN_DISAMT, 0)) AS Discount
                FROM BILLMAST bm
                    JOIN BILLDETL bd ON bm.BMC_SLNO = bd.BMC_SLNO
                    JOIN OPBILLMAST ob ON bd.OPC_SLNO = ob.OPC_SLNO
                    JOIN PRODESCRIPTION pd ON pd.PD_CODE = bd.PD_CODE
                    JOIN PROGROUP pg ON pg.PG_CODE = pd.PG_CODE
                    JOIN MH ON MH.MH_CODE = bm.MH_CODE
                    JOIN EXCLUDE_IP ex ON ex.IP_NO = bm.IP_NO
                    LEFT JOIN MISINCEXPDTL mid ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                    LEFT JOIN MISINCEXPGROUP mig ON mig.DG_GRCODE = mid.DG_GRCODE
                    CROSS JOIN date_params dp
              WHERE     ob.OPC_CACR <> 'M'
                    AND bm.BMC_CACR = 'O'
                    AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                    AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                    AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
            GROUP BY mig.DG_GRCODE, mig.DG_DESC
            ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getPharamcyReturnSection_one = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital)
                SELECT SUM (NVL (md.MRN_AMOUNT, 0) - NVL (md.MRN_DISAMT, 0)) * -1 AS Amt,
                      SUM (NVL (md.MRN_AMOUNT, 0)) * -1 AS GrossAmt,
                      SUM (NVL (md.MRN_DISAMT, 0)) * -1 AS Discount,
                      0 AS Comp,
                      SUM (NVL (md.MRN_CESS, 0) + NVL (md.MRN_SALETAX, 0)) * -1 AS Tax
                  FROM MRETDETL md
                      JOIN PBILLDETL pd
                          ON     pd.BMC_SLNO = md.BMC_SLNO
                            AND pd.IT_CODE = md.IT_CODE
                            AND pd.ITC_DOCNO = md.ITC_DOCNO
                            AND pd.ITC_DOCTYPE = md.ITC_DOCTYPE
                            AND pd.ITC_SLNO = md.ITC_SLNO
                      JOIN OPBILLMAST ob
                          ON pd.OPC_SLNO = ob.OPC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = ob.MH_CODE
                      CROSS JOIN date_params dp
                WHERE     NVL (md.MRC_CANCEL, 'N') = 'N'
                      AND md.MRC_CACR = 'O'
                      AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                      AND ob.OPC_CACR <> 'M'
                      AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getReceiptmasterSection_one = async (conn_ora, bind) => {
  const sql = `WITH date_params
              AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
              MH AS (SELECT MH_CODE FROM multihospital)
            SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                  NVL (mig.DG_GRCODE, 999) AS Code,
                  SUM ( CASE WHEN rm.RPC_CACR IN ('C', 'R') THEN rd.RPN_NETAMT ELSE 0 END) AS Amt,
                  SUM (NVL (rd.RPN_TOTTAX, 0)) AS Tax,
                  SUM ( CASE WHEN rm.RPC_CACR IN ('C', 'R') THEN rd.RPN_NETAMT ELSE 0 END + NVL (rd.RPN_DISAMT, 0)) AS GrossAmt,
                  SUM (CASE WHEN rm.RPC_CACR = 'M' THEN rd.RPN_NETAMT ELSE 0 END) AS Comp,
                  SUM (NVL (rd.RPN_DISAMT, 0)) AS Discount
              FROM RECEIPTMAST rm
                  JOIN RECEIPTDETL rd ON rm.RPC_SLNO = rd.RPC_SLNO
                  JOIN PRODESCRIPTION pd ON pd.PD_CODE = rd.PD_CODE
                  JOIN PROGROUP pg ON pg.PG_CODE = pd.PG_CODE
                  JOIN MH ON MH.MH_CODE = rm.MH_CODE
                  LEFT JOIN MISINCEXPDTL mid ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                  LEFT JOIN MISINCEXPGROUP mig ON mig.DG_GRCODE = mid.DG_GRCODE
                  CROSS JOIN date_params dp
            WHERE     rm.RPC_COLLCNCODE IS NOT NULL
                  AND NVL (rm.RPC_CANCEL, 'N') = 'N'
                  AND rm.RPC_CACR IN ('C', 'R', 'M')
                  AND rm.RPD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY mig.DG_GRCODE, mig.DG_DESC
            HAVING SUM ( CASE WHEN rm.RPC_CACR IN ('C', 'R') THEN rd.RPN_NETAMT ELSE 0 END) <> 0
          ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getPharmacyCollection_Two = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT SUM (NVL (pd.BDN_AMOUNT, 0)) AS Amt,
                      SUM (NVL (pd.BDN_AMOUNT, 0) + NVL (pd.BMN_DISAMT, 0)) AS GrossAmt,
                      SUM (NVL (pd.BMN_DISAMT, 0)) AS Discount,
                      0 AS Comp,
                      SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS Tax
                  FROM PBILLMAST pm
                      JOIN PBILLDETL pd ON pd.BMC_SLNO = pm.BMC_SLNO
                      JOIN OPBILLMAST ob ON pd.OPC_SLNO = ob.OPC_SLNO
                      JOIN MH ON MH.MH_CODE = ob.MH_CODE
                      JOIN EXCLUDE_IP ex ON ex.IP_NO = pm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     NVL (pm.BMC_CANCEL, 'N') = 'N'
                      AND pm.BMC_CACR = 'O'
                      AND ob.OPC_CACR <> 'M'
                      AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                      AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getIpRefundReceiptDetlSection_Two = async (conn_ora, bind) => {
  const sql = `WITH date_params
                AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                            TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                      FROM DUAL),
                MH AS (SELECT MH_CODE FROM multihospital)
              SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                    NVL (mig.DG_GRCODE, 999) AS Code,
                    SUM (rfd.RPN_NETAMT) * -1 AS Amt,
                    SUM (NVL (rfd.RFN_TOTTAX, 0)) * -1 AS Tax,
                    SUM (NVL (rfd.RPN_NETAMT, 0) + NVL (rfd.RPN_DISAMT, 0)) * -1
                        AS GrossAmt,
                    0 AS Comp,
                    SUM (NVL (rfd.RPN_DISAMT, 0)) * -1 AS Discount
                FROM REFUNDRECEIPTMAST rfm
                    JOIN REFUNDRECEIPTDETL rfd
                        ON rfm.RFC_SLNO = rfd.RFC_SLNO
                    JOIN RECEIPTDETL rd
                        ON rd.RPC_SLNO = rfd.RPC_SLNO AND rd.RPC_CNT = rfd.RPC_CNT
                    JOIN OPBILLMAST ob
                        ON rd.OPC_SLNO = ob.OPC_SLNO
                    JOIN PRODESCRIPTION pd
                        ON pd.PD_CODE = rfd.PD_CODE
                    JOIN PROGROUP pg
                        ON pg.PG_CODE = pd.PG_CODE
                    JOIN MH
                        ON MH.MH_CODE = ob.MH_CODE
                    LEFT JOIN MISINCEXPDTL mid
                        ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                    LEFT JOIN MISINCEXPGROUP mig
                        ON mig.DG_GRCODE = mid.DG_GRCODE
                    CROSS JOIN date_params dp
              WHERE     NVL (ob.OPN_CANCEL, 'N') = 'N'
                    AND NVL (rfd.RFC_CANCEL, 'N') = 'N'
                    AND rfm.RFC_CACR = 'O'
                    AND ob.OPC_CACR <> 'M'
                    AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
            GROUP BY mig.DG_GRCODE, mig.DG_DESC
            ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getPharamcyCollection_three = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital)
                SELECT SUM (A.Billamt) AS Amt,
                      SUM (A.GrossAmt) AS GrossAmt,
                      SUM (A.Discount) AS Discount,
                      SUM (A.Comp) AS Comp,
                      SUM (A.Tax) AS Tax
                  FROM (SELECT SUM (
                                  CASE WHEN pm.BMC_CACR IN ('C', 'R')
                                    THEN NVL (pd.BDN_AMOUNT, 0)
                                    ELSE 0
                                  END) AS Billamt,
                              SUM ( 
                                  CASE
                                    WHEN pm.BMC_CACR IN ('C', 'R')
                                    THEN NVL (pd.BDN_AMOUNT, 0) + NVL (pd.BMN_DISAMT, 0)
                                    ELSE 0
                                  END) AS GrossAmt,
                              SUM (
                                  CASE
                                    WHEN pm.BMC_CACR IN ('C', 'R')
                                    THEN NVL (pd.BMN_DISAMT, 0)
                                    ELSE 0 
                                  END) AS Discount,
                              SUM (
                                  CASE
                                    WHEN pm.BMC_CACR = 'M' THEN NVL (pd.BDN_AMOUNT, 0)
                                    ELSE 0
                                  END)
                                  AS Comp,
                              SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS Tax
                          FROM PBILLMAST pm
                              JOIN PBILLDETL pd
                                  ON pd.BMC_SLNO = pm.BMC_SLNO
                              JOIN MH
                                  ON MH.MH_CODE = pm.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     pm.BMC_COLLCNCODE IS NOT NULL
                              AND NVL (pm.BMC_CANCEL, 'N') = 'N'
                              AND pm.BMC_CACR IN ('C', 'R', 'M')
                              AND pm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        SELECT SUM (NVL (md.MRN_AMOUNT, 0) - NVL (md.MRN_DISAMT, 0)) * -1
                                  AS Billamt,
                              SUM (NVL (md.MRN_AMOUNT, 0)) * -1 AS GrossAmt,
                              SUM (NVL (md.MRN_DISAMT, 0)) * -1 AS Discount,
                              0 AS Comp,
                              SUM (NVL (md.MRN_CESS, 0) + NVL (md.MRN_SALETAX, 0)) * -1
                                  AS Tax
                          FROM MRETDETL md
                              JOIN MRETMAST mm
                                  ON mm.MRC_SLNO = md.MRC_SLNO
                              JOIN PBILLDETL pd
                                  ON     pd.BMC_SLNO = md.BMC_SLNO
                                    AND pd.IT_CODE = md.IT_CODE
                                    AND pd.ITC_DOCNO = md.ITC_DOCNO
                                    AND pd.ITC_DOCTYPE = md.ITC_DOCTYPE
                                    AND pd.ITC_SLNO = md.ITC_SLNO
                              JOIN MH
                                  ON MH.MH_CODE = md.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     mm.MRC_RETCNCODE IS NOT NULL
                              AND NVL (md.MRC_CANCEL, 'N') = 'N'
                              AND NVL (mm.MRC_CANCEL, 'N') = 'N'
                              AND md.MRC_CACR IN ('C', 'R')
                              AND mm.MRD_RETDATE BETWEEN dp.from_date AND dp.TO_DATE) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getIpincomeSection_four = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code, 
                      SUM (
                        CASE
                          WHEN bm.BMC_CACR IN ('C', 'R')
                          THEN
                              (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)
                          ELSE
                              0
                        END)
                        AS Amt,
                        SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.BDN_TOTCESS, 0)) AS Tax,
                        SUM (
                        CASE
                          WHEN bm.BMC_CACR IN ('C', 'R') THEN (bd.PDN_RATE * bd.PDN_QTY)
                          ELSE 0
                        END)
                        AS GrossAmt,
                        SUM (
                        CASE
                          WHEN bm.BMC_CACR = 'M'
                          THEN
                              (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)
                          ELSE
                              0
                        END)
                        AS Comp,
                        SUM (
                        CASE
                          WHEN bm.BMC_CACR IN ('C', 'R') THEN NVL (bd.BMN_DISAMT, 0)
                          ELSE 0
                        END)
                        AS Discount
                FROM BILLMAST bm
                    JOIN BILLDETL bd
                        ON bm.BMC_SLNO = bd.BMC_SLNO
                    JOIN PRODESCRIPTION pd
                        ON pd.PD_CODE = bd.PD_CODE
                    JOIN PROGROUP pg
                        ON pg.PG_CODE = pd.PG_CODE
                    JOIN MH
                        ON MH.MH_CODE = bm.MH_CODE
                    LEFT JOIN MISINCEXPDTL mid
                        ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                    LEFT JOIN MISINCEXPGROUP mig
                        ON mig.DG_GRCODE = mid.DG_GRCODE
                    CROSS JOIN date_params dp
              WHERE     bm.BMC_COLLCNCODE IS NULL
                    AND bm.BMC_CACR IN ('C', 'R', 'M')
                    AND NVL (bm.BMC_CANCEL, 'N') <> 'C'
                    AND bm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
            GROUP BY mig.DG_GRCODE, mig.DG_DESC`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getPharmacyReturnSection_three = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT SUM (NVL (md.MRN_AMOUNT, 0) - NVL (md.MRN_DISAMT, 0)) * -1 AS Amt,
                      SUM (NVL (md.MRN_AMOUNT, 0)) * -1 AS GrossAmt,
                      SUM (NVL (md.MRN_DISAMT, 0)) * -1 AS Discount,
                      0 AS Comp,
                      SUM (NVL (md.MRN_CESS, 0) + NVL (md.MRN_SALETAX, 0)) * -1 AS Tax
                  FROM MRETDETL md
                      JOIN PBILLMAST pm
                          ON pm.BMC_SLNO = md.BMC_SLNO
                      JOIN DISBILLMAST dm
                          ON pm.DMC_SLNO = dm.DMC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     md.MRC_CACR = 'I'
                      AND NVL (md.MRC_CANCEL, 'N') = 'N'
                      AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                      AND dm.DMC_CACR <> 'M'
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getProcedureIncomeSecition_two = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (
                          CASE
                            WHEN bm.BMC_CACR IN ('C', 'R')
                            THEN
                                (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)
                            ELSE
                                0
                          END)
                          AS Amt,
                          SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.BDN_TOTCESS, 0)) AS Tax,
                          SUM (
                          CASE
                            WHEN bm.BMC_CACR IN ('C', 'R') THEN (bd.PDN_RATE * bd.PDN_QTY)
                            ELSE 0
                          END)
                          AS GrossAmt,
                          SUM (
                          CASE
                            WHEN bm.BMC_CACR = 'M'
                            THEN
                                (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)
                            ELSE
                                0
                          END)
                          AS Comp,
                          SUM (
                          CASE
                            WHEN bm.BMC_CACR IN ('C', 'R') THEN NVL (bd.BMN_DISAMT, 0)
                            ELSE 0
                          END)
                          AS Discount
                  FROM BILLMAST bm
                      JOIN BILLDETL bd
                          ON bm.BMC_SLNO = bd.BMC_SLNO
                      JOIN PRODESCRIPTION pd
                          ON pd.PD_CODE = bd.PD_CODE
                      JOIN PROGROUP pg
                          ON pg.PG_CODE = pd.PG_CODE
                      JOIN MH
                          ON MH.MH_CODE = bm.MH_CODE
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     bm.BMC_COLLCNCODE IS NOT NULL
                      AND bm.BMC_CACR IN ('C', 'R', 'M')
                      AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                      AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getPharmacyCollection_four = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (NVL (pd.BDN_AMOUNT, 0)) AS Amt,
                      SUM (NVL (pd.BDN_AMOUNT, 0) + NVL (pd.BMN_DISAMT, 0)) AS GrossAmt,
                      SUM (NVL (pd.BMN_DISAMT, 0)) AS Discount,
                      0 AS Comp,
                      SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS Tax
                  FROM PBILLMAST pm
                      JOIN PBILLDETL pd
                          ON pd.BMC_SLNO = pm.BMC_SLNO
                      JOIN DISBILLMAST dm
                          ON pm.DMC_SLNO = dm.DMC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     NVL (pm.BMC_CANCEL, 'N') = 'N'
                      AND pm.BMC_CACR = 'I'
                      AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                      AND dm.DMC_CACR <> 'M'
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getIpRefundDetlSection_three = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (rfd.RPN_NETAMT) * -1 AS Amt,
                      SUM (NVL (rfd.RFN_TOTTAX, 0)) * -1 AS Tax,
                      SUM (NVL (rfd.RPN_NETAMT, 0) + NVL (rfd.RPN_DISAMT, 0)) * -1
                          AS GrossAmt,
                      0 AS Comp,
                      SUM (NVL (rfd.RPN_DISAMT, 0)) * -1 AS Discount
                  FROM REFUNDRECEIPTMAST rfm
                      JOIN REFUNDRECEIPTDETL rfd
                          ON rfm.RFC_SLNO = rfd.RFC_SLNO
                      JOIN PRODESCRIPTION pd
                          ON pd.PD_CODE = rfd.PD_CODE
                      JOIN PROGROUP pg
                          ON pg.PG_CODE = pd.PG_CODE
                      JOIN MH
                          ON MH.MH_CODE = rfm.MH_CODE
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     NVL (rfm.RFC_CANCEL, 'N') <> 'C'
                      AND rfm.RFC_CACR IN ('C', 'R')
                      AND rfd.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getIpincomeSection_five = async (conn_ora, bind) => {
  const sql = `WITH date_params
                AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                            TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                      FROM DUAL),
                MH AS (SELECT MH_CODE FROM multihospital),
                EXCLUDE_IP
                AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
              SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                    NVL (mig.DG_GRCODE, 999) AS Code,
                    SUM ( (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)) AS Amt,
                    SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.BDN_TOTCESS, 0)) AS Tax,
                    SUM (bd.PDN_RATE * bd.PDN_QTY) AS GrossAmt,
                    0 AS Comp,
                    SUM (NVL (bd.BMN_DISAMT, 0)) AS Discount
                FROM BILLMAST bm
                    JOIN BILLDETL bd
                        ON bm.BMC_SLNO = bd.BMC_SLNO
                    JOIN DISBILLMAST dm
                        ON bm.DMC_SLNO = dm.DMC_SLNO
                    JOIN PRODESCRIPTION pd
                        ON pd.PD_CODE = bd.PD_CODE
                    JOIN PROGROUP pg
                        ON pg.PG_CODE = pd.PG_CODE
                    JOIN MH
                        ON MH.MH_CODE = bm.MH_CODE
                    JOIN EXCLUDE_IP ex
                        ON ex.IP_NO = dm.IP_NO
                    LEFT JOIN MISINCEXPDTL mid
                        ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                    LEFT JOIN MISINCEXPGROUP mig
                        ON mig.DG_GRCODE = mid.DG_GRCODE
                    CROSS JOIN date_params dp
              WHERE     dm.DMC_CACR <> 'M'
                    AND bm.BMC_CACR = 'I'
                    AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                    AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                    AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
            GROUP BY mig.DG_GRCODE, mig.DG_DESC
            ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getIpRefundDetlSection_four = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (rbd.RFN_NETAMT) * -1 AS Amt,
                      SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.RFN_TOTCESS, 0)) * -1 AS Tax,
                      SUM (NVL (rbd.RFN_NETAMT, 0) + NVL (rbd.RFN_DISAMT, 0)) * -1
                          AS GrossAmt,
                      0 AS Comp,
                      SUM (NVL (rbd.RFN_DISAMT, 0)) * -1 AS Discount
                  FROM REFUNDBILLMAST rbm
                      JOIN REFUNDBILLDETL rbd
                          ON rbm.RFC_SLNO = rbd.RFC_SLNO
                      JOIN BILLMAST bm
                          ON bm.BMC_SLNO = rbm.BMC_SLNO
                      JOIN PRODESCRIPTION pd
                          ON pd.PD_CODE = rbd.PD_CODE
                      JOIN PROGROUP pg
                          ON pg.PG_CODE = pd.PG_CODE
                      JOIN MH
                          ON MH.MH_CODE = bm.MH_CODE
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     NVL (rbm.RFC_CANCEL, 'N') <> 'C'
                      AND rbm.RFC_CACR IN ('C', 'R')
                      AND rbd.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getCollectionPortion_one = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT SUM (
                            NVL (ir.IRN_AMOUNT, 0)
                          + NVL (ir.IRN_CARD, 0)
                          + NVL (ir.IRN_CHEQUE, 0)
                          + NVL (ir.IRN_NEFT, 0))
                      - SUM (
                              NVL (ir.IRN_BALANCE, 0)
                            + NVL (ir.IRN_REFCHEQ, 0)
                            + NVL (ir.IRN_REFCARD, 0))
                          AS Amt
                  FROM IPRECEIPT ir
                      JOIN DISBILLMAST dm
                          ON dm.DMC_SLNO = ir.DMC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     ir.DMC_TYPE IN ('C', 'R')
                      AND ir.IRC_CANCEL IS NULL
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                      AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED BUT NOT PRESENT FOR THE REPORT
const getCollectionPortion_two = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL)
                SELECT IP_NO, SUM (Amt) AS Amt, SUM (Tax) AS Tax
                  FROM (  /* ================= IP RECEIPT ================= */
                          SELECT dm.IP_NO,
                                SUM (
                                      NVL (ir.IRN_AMOUNT, 0)
                                    + NVL (ir.IRN_CHEQUE, 0)
                                    + NVL (ir.IRN_CARD, 0)
                                    + NVL (ir.IRN_NEFT, 0)
                                    - (  NVL (ir.IRN_BALANCE, 0)
                                      + NVL (ir.IRN_REFCHEQ, 0)
                                      + NVL (ir.IRN_REFCARD, 0)))
                                    AS Amt,
                                0 AS Tax
                            FROM IPRECEIPT ir
                                JOIN DISBILLMAST dm
                                    ON dm.DMC_SLNO = ir.DMC_SLNO
                                CROSS JOIN date_params dp
                          WHERE     dm.DMD_DATE < dp.from_date
                                AND ir.DMC_TYPE IN ('C', 'R')
                                AND ir.IRC_CANCEL IS NULL
                                AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        GROUP BY dm.IP_NO
                        UNION ALL
                          /* ================= BILL COLLECTION ================= */
                          SELECT bm.IP_NO,
                                SUM (
                                    CASE
                                      WHEN bm.BMC_CACR IN ('C', 'R')
                                      THEN
                                            NVL (bm.BMN_CASH, 0)
                                          + NVL (bm.BMN_CHEQUE, 0)
                                          + NVL (bm.BMN_CARD, 0)
                                      ELSE
                                          0
                                    END)
                                    AS Amt,
                                0 AS Tax
                            FROM BILLMAST bm CROSS JOIN date_params dp
                          WHERE     NVL (bm.BMC_CANCEL, 'N') = 'N'
                                AND bm.BMC_COLLCNCODE IS NOT NULL
                                AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
                                AND bm.BMD_DATE < TRUNC (dp.TO_DATE)
                        GROUP BY bm.IP_NO
                        UNION ALL
                          /* ================= REFUND BILL ================= */
                          SELECT bm.IP_NO,
                                SUM (
                                    CASE
                                      WHEN rbm.RFC_CACR IN ('C', 'R')
                                      THEN
                                            NVL (rbm.RFN_CASH, 0)
                                          + NVL (rbm.RFN_CHEQUE, 0)
                                          + NVL (rbm.RFN_CARD, 0)
                                      ELSE
                                          0
                                    END)
                                * -1
                                    AS Amt,
                                0 AS Tax
                            FROM REFUNDBILLMAST rbm
                                JOIN BILLMAST bm
                                    ON bm.BMC_SLNO = rbm.BMC_SLNO
                                CROSS JOIN date_params dp
                          WHERE     NVL (rbm.RFC_CANCEL, 'N') = 'N'
                                AND rbm.RFC_RETCNCODE IS NOT NULL
                                AND rbm.ROC_SLNO IS NULL
                                AND rbm.RFD_RETDATE BETWEEN dp.from_date AND dp.TO_DATE
                                AND rbm.RFD_DATE < TRUNC (dp.TO_DATE)
                        GROUP BY bm.IP_NO) A
              GROUP BY IP_NO`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// FOR DISABLED - NOT DISABLED
const getPerttyCash = async (conn_ora, bind) => {
  const sql = `WITH date_params
                      AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                  TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                            FROM DUAL),
                      MH AS (SELECT MH_CODE FROM multihospital)
                  SELECT SUM (Amt) AS Amt
                    FROM (/* ================= IP PETTY ================= */
                          SELECT SUM (
                                    CASE
                                      WHEN ipc.PCC_TYPE = 'R'
                                      THEN
                                          NVL (ipc.PCN_AMOUNT, 0)
                                      WHEN ipc.PCC_TYPE = 'P'
                                      THEN
                                          NVL (ipc.PCN_AMOUNT, 0) * -1
                                      ELSE
                                          0
                                    END)
                                    AS Amt
                            FROM IPPETTYCASH ipc
                                JOIN MH
                                    ON MH.MH_CODE = ipc.ITC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE     NVL (ipc.PCC_CANCEL, 'N') = 'N'
                                AND NVL (ipc.PCN_AMOUNT, 0) <> 0
                                AND ipc.PCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          UNION ALL
                          /* ================= OP PETTY ================= */
                          SELECT SUM (
                                    CASE
                                      WHEN opc.PCC_TYPE = 'R'
                                      THEN
                                          NVL (opc.PCN_AMOUNT, 0)
                                      WHEN opc.PCC_TYPE = 'P'
                                      THEN
                                          NVL (opc.PCN_AMOUNT, 0) * -1
                                      ELSE
                                          0
                                    END)
                                    AS Amt
                            FROM OPPETTYCASH opc
                                JOIN MH
                                    ON MH.MH_CODE = opc.PCC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE     NVL (opc.PCC_CANCEL, 'N') = 'N'
                                AND NVL (opc.PCN_AMOUNT, 0) <> 0
                                AND opc.PCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          UNION ALL
                          /* ================= BILL PETTY ================= */
                          SELECT SUM (
                                    CASE
                                      WHEN bpc.PCC_TYPE = 'R'
                                      THEN
                                          NVL (bpc.PCN_AMOUNT, 0)
                                      WHEN bpc.PCC_TYPE = 'P'
                                      THEN
                                          NVL (bpc.PCN_AMOUNT, 0) * -1
                                      ELSE
                                          0
                                    END)
                                    AS Amt
                            FROM BILLPETTYCASH bpc
                                JOIN MH
                                    ON MH.MH_CODE = bpc.PCC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE     NVL (bpc.PCC_CANCEL, 'N') = 'N'
                                AND NVL (bpc.PCN_AMOUNT, 0) <> 0
                                AND bpc.PCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          UNION ALL
                          /* ================= PHARMACY PETTY ================= */
                          SELECT SUM (
                                    CASE
                                      WHEN ppc.PCC_TYPE = 'R'
                                      THEN
                                          NVL (ppc.PCN_AMOUNT, 0)
                                      WHEN ppc.PCC_TYPE = 'P'
                                      THEN
                                          NVL (ppc.PCN_AMOUNT, 0) * -1
                                      ELSE
                                          0
                                    END)
                                    AS Amt
                            FROM PHPETTYCASH ppc
                                JOIN MH
                                    ON MH.MH_CODE = ppc.PCC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE     NVL (ppc.PCC_CANCEL, 'N') = 'N'
                                AND NVL (ppc.PCN_AMOUNT, 0) <> 0
                                AND ppc.PCD_DATE BETWEEN dp.from_date AND dp.TO_DATE)`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
/*******************
 *
 *  only query in the group with
 *  SELECT IP_NO FROM GTT_EXCLUDE_IP G WHERE G.STATUS = 2
 */
const getCollectionPortion_three = async (conn_ora, bind) => {
  const sql = `WITH date_params AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
      MH AS (SELECT MH_CODE FROM multihospital),
      INCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 2),
      VALID_RCC AS (
              SELECT DISTINCT rcd.RCC_SLNO
              FROM RECPCOLLECTIONDETL rcd JOIN INCLUDE_IP ip ON ip.IP_NO = rcd.IP_NO
                  CROSS JOIN date_params dp
              WHERE rcd.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                  AND rcd.MODULES = 'IPC')
  SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
    FROM (
    SELECT SUM (
                      NVL (rcm.RCN_CASH, 0)
                    + NVL (rcm.RCN_CHK, 0)
                    + NVL (rcm.RCN_DD, 0)
                    + NVL (rcm.RCN_CARD, 0)
                    + NVL (rcm.RCN_NEFT, 0))
                    AS Amt,
                0 AS Tax
            FROM RECPCOLLECTIONMAST rcm
                JOIN MH
                    ON MH.MH_CODE = rcm.MH_CODE
                JOIN VALID_RCC vr
                    ON vr.RCC_SLNO = rcm.RCC_SLNO
                CROSS JOIN date_params dp
          WHERE NVL (rcm.RCC_CANCEL, 'N') = 'N'
                AND rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          HAVING SUM (
                      NVL (rcm.RCN_CASH, 0)
                    + NVL (rcm.RCN_CHK, 0)
                    + NVL (rcm.RCN_DD, 0)
                    + NVL (rcm.RCN_CARD, 0)
                    + NVL (rcm.RCN_NEFT, 0)) > 0
          UNION ALL
          SELECT (  SUM (NVL (rcm.RFN_CASH, 0))
                  + SUM (NVL (rcm.RFN_CHK, 0))
                  + SUM (NVL (rcm.RFN_DD, 0))
                  + SUM (NVL (rcm.RFN_CARD, 0)))
                * -1
                    AS Amt,
                0 AS Tax
            FROM RECPCOLLECTIONMAST rcm
                JOIN MH
                    ON MH.MH_CODE = rcm.MH_CODE
                JOIN VALID_RCC vr
                    ON vr.RCC_SLNO = rcm.RCC_SLNO
                CROSS JOIN date_params dp
          WHERE NVL (rcm.RCC_CANCEL, 'N') = 'N'
                AND rcm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE) final_data`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

/*******************
 *
 *  only query in the group with
 *  SELECT IP_NO FROM GTT_EXCLUDE_IP G WHERE G.STATUS = 2
 */
// INCLUDED
const getIpRefundDetlSection_five = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP)
                SELECT SUM (
                            NVL (irf.IRF_CASH, 0)
                          + NVL (irf.IRF_CARD, 0)
                          + NVL (irf.IRF_CHEQUE, 0))
                      * -1
                          AS Amt,
                      0 AS Tax
                  FROM IPRECEIPTREFUND irf
                      JOIN MH
                          ON MH.MH_CODE = irf.IRC_MHCODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = irf.IP_NO
                      CROSS JOIN date_params dp
                WHERE irf.IRF_CACR = 'C' AND irf.IRF_CANCEL IS NULL
                      AND (   NVL (irf.IRF_CASH, 0) > 0
                            OR NVL (irf.IRF_CARD, 0) > 0
                            OR NVL (irf.IRF_CHEQUE, 0) > 0)
                      AND irf.IRF_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getCollectionPortion_four = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT SUM (NVL (dm.DMN_NETAMT, 0)) AS Amt,
                      SUM (
                          CASE
                            WHEN NVL (dm.DMC_CANCEL, 'N') = 'N'
                            THEN
                                  NVL (dm.DMN_SALESTAXCH, 0)
                                + NVL (dm.DMN_SALESTAXCR, 0)
                                + NVL (dm.DMN_CESSCH, 0)
                                + NVL (dm.DMN_CESSCR, 0)
                            ELSE
                                0
                          END)
                          AS Tax
                  FROM DISBILLMAST dm
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     dm.DMC_CACR = 'M'
                      AND dm.DMC_CANCEL IS NULL
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getDiscount = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (Discount) AS Discount
                  FROM (
                        SELECT SUM (NVL (rcm.RCN_DISCOUNT, 0)) AS Discount
                          FROM RECPCOLLECTIONMAST rcm
                              JOIN RECPCOLLECTIONDETL rcd
                                  ON rcd.RCC_SLNO = rcm.RCC_SLNO
                              JOIN MH
                                  ON MH.MH_CODE = rcm.MH_CODE
                              JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = rcd.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND rcd.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND NVL (rcm.RCC_CANCEL, 'N') = 'N'
                              AND rcd.MODULES = 'IPC'
                        HAVING SUM (NVL (rcm.RCN_DISCOUNT, 0)) > 0
                        UNION ALL
                        SELECT SUM (NVL (rcm.RCN_DISCOUNT, 0)) * -1 AS Discount
                          FROM RECPCOLLECTIONMAST rcm
                              JOIN RECPCOLLECTIONDETL rcd
                                  ON rcd.RCC_SLNO = rcm.RCC_SLNO
                              JOIN MH
                                  ON MH.MH_CODE = rcm.MH_CODE
                              JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = rcd.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     rcm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND rcd.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND NVL (rcm.RCC_CANCEL, 'N') = 'N'
                        HAVING SUM (NVL (rcm.RCN_DISCOUNT, 0)) > 0)`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getIpincomeSection_six = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital),
                  EXCLUDE_IP AS (SELECT DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                      NVL (mig.DG_GRCODE, 999) AS Code,
                      SUM (rbd.RFN_NETAMT) * -1 AS Amt,
                      SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.RFN_TOTCESS, 0)) * -1 AS Tax,
                      SUM (NVL (rbd.RFN_NETAMT, 0) + NVL (rbd.RFN_DISAMT, 0)) * -1
                          AS GrossAmt,
                      0 AS Comp,
                      SUM (NVL (rbd.RFN_DISAMT, 0)) * -1 AS Discount
                  FROM REFUNDBILLDETL rbd
                      JOIN REFUNDBILLMAST rbm
                          ON rbm.RFC_SLNO = rbd.RFC_SLNO
                      JOIN BILLMAST bm
                          ON bm.BMC_SLNO = rbd.BMC_SLNO
                      JOIN DISBILLMAST dm
                          ON bm.DMC_SLNO = dm.DMC_SLNO
                      JOIN PRODESCRIPTION pd
                          ON pd.PD_CODE = rbd.PD_CODE
                      JOIN PROGROUP pg
                          ON pg.PG_CODE = pd.PG_CODE
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      LEFT JOIN MISINCEXPDTL mid
                          ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                      LEFT JOIN MISINCEXPGROUP mig
                          ON mig.DG_GRCODE = mid.DG_GRCODE
                      CROSS JOIN date_params dp
                WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                      AND NVL (rbd.RFC_CANCEL, 'N') = 'N'
                      AND rbm.RFC_CACR = 'I'
                      AND dm.DMC_CACR <> 'M'
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
              GROUP BY mig.DG_GRCODE, mig.DG_DESC
              ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getDiscount_one = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital)
                  SELECT dm.IP_NO, SUM (NVL (ir.IRN_DISCOUNT, 0)) AS Discount
                    FROM IPRECEIPT ir
                        JOIN DISBILLMAST dm
                            ON ir.DMC_SLNO = dm.DMC_SLNO
                        JOIN MH
                            ON MH.MH_CODE = dm.MH_CODE
                        CROSS JOIN date_params dp
                  WHERE     dm.DMD_DATE < dp.from_date
                        AND ir.DMC_TYPE IN ('C', 'R')
                        AND NVL (ir.IRC_CANCEL, 'N') = 'N'
                        AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                GROUP BY dm.IP_NO`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getCollectionPortion_five = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital),
                  EXCLUDE_IP
                  AS (SELECT DISTINCT IP_NO
                        FROM GTT_EXCLUDE_IP
                        WHERE STATUS = 1)
              SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
                FROM (/* ================= OP ADVANCE ================= */
                      SELECT SUM (NVL (op.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                        FROM OPADVANCE op
                            JOIN MH
                                ON MH.MH_CODE = op.MH_CODE
                            JOIN EXCLUDE_IP ex
                                ON ex.IP_NO = op.IP_NO
                            CROSS JOIN date_params dp
                      WHERE NVL (op.ARC_CANCEL, 'N') = 'N'
                            AND op.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                      UNION ALL
                      /* ================= IP ADVANCE ================= */
                      SELECT SUM (NVL (ip.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                        FROM IPADVANCE ip
                            JOIN MH
                                ON MH.MH_CODE = ip.IAC_MHCODE
                            JOIN EXCLUDE_IP ex
                                ON ex.IP_NO = ip.IP_NO
                            CROSS JOIN date_params dp
                      WHERE NVL (ip.ARC_CANCEL, 'N') = 'N'
                            AND ip.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                      UNION ALL
                      /* ================= GENERAL ADVANCE ================= */
                      SELECT SUM (NVL (ae.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                        FROM ADVANCEENTRY ae
                            JOIN MH
                                ON MH.MH_CODE = ae.ARC_MHCODE
                            CROSS JOIN date_params dp
                      WHERE NVL (ae.ARC_CANCEL, 'N') = 'N'
                            AND ae.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getCollectionPortion_six = async (conn_ora, bind) => {
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     EXCLUDE_IP
     AS (SELECT DISTINCT IP_NO
           FROM GTT_EXCLUDE_IP
          WHERE STATUS = 1)
SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
  FROM (/* ================= PBILL (NO COLLECTION) ================= */
        SELECT SUM (NVL (pbm.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
          FROM PBILLMAST pbm
               JOIN MH
                  ON MH.MH_CODE = pbm.MH_CODE
               JOIN EXCLUDE_IP ex
                  ON ex.IP_NO = pbm.IP_NO
               CROSS JOIN date_params dp
         WHERE     NVL (pbm.BMC_CANCEL, 'N') = 'N'
               AND pbm.BMC_COLLCNCODE IS NULL
               AND pbm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= DISBILL ================= */
        SELECT SUM (NVL (dm.DMN_ADVANCE, 0)) AS Amt, 0 AS Tax
          FROM DISBILLMAST dm
               JOIN MH
                  ON MH.MH_CODE = dm.MH_CODE
               JOIN EXCLUDE_IP ex
                  ON ex.IP_NO = dm.IP_NO
               CROSS JOIN date_params dp
         WHERE NVL (dm.DMC_CANCEL, 'N') = 'N'
               AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= BILL (NO COLLECTION) ================= */
        SELECT SUM (NVL (bm.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
          FROM BILLMAST bm
               JOIN MH
                  ON MH.MH_CODE = bm.MH_CODE
               JOIN EXCLUDE_IP ex
                  ON ex.IP_NO = bm.IP_NO
               CROSS JOIN date_params dp
         WHERE     NVL (bm.BMC_CANCEL, 'N') = 'N'
               AND bm.BMC_COLLCNCODE IS NULL
               AND bm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= PBILL (COLLECTION) ================= */
        SELECT SUM (NVL (pbm.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
          FROM PBILLMAST pbm
               JOIN MH
                  ON MH.MH_CODE = pbm.MH_CODE
               JOIN EXCLUDE_IP ex
                  ON ex.IP_NO = pbm.IP_NO
               CROSS JOIN date_params dp
         WHERE     NVL (pbm.BMC_CANCEL, 'N') = 'N'
               AND pbm.BMC_COLLCNCODE IS NOT NULL
               AND pbm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= BILL (COLLECTION) ================= */
        SELECT SUM (NVL (bm.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
          FROM BILLMAST bm
               JOIN MH
                  ON MH.MH_CODE = bm.MH_CODE
               JOIN EXCLUDE_IP ex
                  ON ex.IP_NO = bm.IP_NO
               CROSS JOIN date_params dp
         WHERE     NVL (bm.BMC_CANCEL, 'N') = 'N'
               AND bm.BMC_COLLCNCODE IS NOT NULL
               AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED - NOT INCLUIDED
const getIpRefundDetlSection_six = async (conn_ora, bind) => {
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital)
SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
  FROM (/* ================= RECEIPT REFUND ================= */
        SELECT SUM (NVL (rrm.RPN_RTCREDIT, 0)) * -1 AS Amt,
               SUM (NVL (rrm.RFN_TOTTAX, 0)) * -1 AS Tax
          FROM REFUNDRECEIPTMAST rrm
               JOIN MH
                  ON MH.MH_CODE = rrm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     rrm.RFC_CACR = 'R'
               AND NVL (rrm.RFC_CANCEL, 'N') <> 'C'
               AND NVL (rrm.RPN_RTCREDIT, 0) > 0
               AND rrm.ROC_SLNO IS NULL
               AND rrm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= BILL REFUND (NO RETCN) ================= */
        SELECT SUM (NVL (rbm.BMN_RTCREDIT, 0)) * -1 AS Amt,
               SUM (NVL (rbm.RFN_TOTTAX, 0) + NVL (rbm.RFN_TOTCESS, 0)) * -1
                  AS Tax
          FROM REFUNDBILLMAST rbm
               JOIN MH
                  ON MH.MH_CODE = rbm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     rbm.RFC_CACR = 'R'
               AND NVL (rbm.RFC_CANCEL, 'N') <> 'C'
               AND rbm.RFC_RETCNCODE IS NULL
               AND NVL (rbm.BMN_RTCREDIT, 0) > 0
               AND rbm.ROC_SLNO IS NULL
               AND rbm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= PHARMACY RETURN (NO RETCN) ================= */
        SELECT SUM (
                    NVL (mrm.BMN_RTCREDIT, 0)
                  + NVL (mrm.MRN_SALETAXCR, 0)
                  + NVL (mrm.MRN_CESSCR, 0))
               * -1
                  AS Amt,
               SUM (
                    NVL (mrm.MRN_SALETAXCH, 0)
                  + NVL (mrm.MRN_SALETAXCR, 0)
                  + NVL (mrm.MRN_CESSCH, 0)
                  + NVL (mrm.MRN_CESSCR, 0))
               * -1
                  AS Tax
          FROM MRETMAST mrm
               JOIN MH
                  ON MH.MH_CODE = mrm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     mrm.MRC_CACR = 'R'
               AND NVL (mrm.MRC_CANCEL, 'N') <> 'Y'
               AND NVL (mrm.BMN_RTCREDIT, 0) > 0
               AND mrm.MRC_RETCNCODE IS NULL
               AND mrm.MRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= OP BILL REFUND ================= */
        SELECT SUM (
                  CASE
                     WHEN obrm.ROC_CACR = 'R' THEN NVL (obrm.RON_CREDIT, 0)
                     ELSE 0
                  END)
               * -1
                  AS Amt,
               SUM (NVL (obrm.RON_TOTTAX, 0)) * -1 AS Tax
          FROM OPBILLREFUNDMAST obrm
               JOIN MH
                  ON MH.MH_CODE = obrm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     NVL (obrm.ROC_CANCEL, 'N') = 'N'
               AND obrm.ROD_DATE BETWEEN dp.from_date AND dp.TO_DATE
               AND NVL (obrm.RON_CREDIT, 0) <> 0
        UNION ALL
        /* ================= IP REFUND ================= */
        SELECT SUM (NVL (irm.RIN_CREDIT, 0)) * -1 AS Amt,
               SUM (NVL (irm.RIN_TOTTAX, 0)) * -1 AS Tax
          FROM IPREFUNDMAST irm
               JOIN MH
                  ON MH.MH_CODE = irm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     irm.RIC_CACR = 'R'
               AND NVL (irm.RIC_CANCEL, 'N') = 'N'
               AND irm.DMC_SLNO IS NOT NULL
               AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= BILL REFUND (WITH RETCN) ================= */
        SELECT SUM (NVL (rbm.BMN_RTCREDIT, 0)) * -1 AS Amt,
               SUM (NVL (rbm.RFN_TOTTAX, 0) + NVL (rbm.RFN_TOTCESS, 0)) * -1
                  AS Tax
          FROM REFUNDBILLMAST rbm
               JOIN MH
                  ON MH.MH_CODE = rbm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     rbm.RFC_CACR = 'R'
               AND NVL (rbm.RFC_CANCEL, 'N') = 'N'
               AND rbm.RFC_RETCNCODE IS NOT NULL
               AND NVL (rbm.BMN_RTCREDIT, 0) <> 0
               AND rbm.ROC_SLNO IS NULL
               AND rbm.RFD_RETDATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        /* ================= PHARMACY RETURN (WITH RETCN) ================= */
        SELECT SUM (
                    NVL (mrm.BMN_RTCREDIT, 0)
                  + NVL (mrm.MRN_SALETAXCR, 0)
                  + NVL (mrm.MRN_CESSCR, 0))
               * -1
                  AS Amt,
               SUM (
                    NVL (mrm.MRN_SALETAXCH, 0)
                  + NVL (mrm.MRN_SALETAXCR, 0)
                  + NVL (mrm.MRN_CESSCH, 0)
                  + NVL (mrm.MRN_CESSCR, 0))
               * -1
                  AS Tax
          FROM MRETMAST mrm
               JOIN MH
                  ON MH.MH_CODE = mrm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     mrm.MRC_CACR = 'R'
               AND NVL (mrm.MRC_CANCEL, 'N') = 'N'
               AND NVL (mrm.BMN_RTCREDIT, 0) <> 0
               AND mrm.MRC_RETCNCODE IS NOT NULL
               AND mrm.MRD_RETDATE BETWEEN dp.from_date AND dp.TO_DATE) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getAdvanceRefund = async (conn_ora, bind) => {
  const sql = `WITH date_params
                      AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                  TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                            FROM DUAL),
                      MH AS (SELECT MH_CODE FROM multihospital),
                      EXCLUDE_IP
                      AS (SELECT DISTINCT IP_NO
                            FROM GTT_EXCLUDE_IP
                            WHERE STATUS = 1)
                  SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
                    FROM (/* ================= OP ADVANCE REFUND ================= */
                          SELECT SUM (NVL (roa.RFN_AMT, 0)) AS Amt, 0 AS Tax
                            FROM REFUNDOPADVANCE roa
                                JOIN OPADVANCE oa
                                    ON oa.AR_SLNO = roa.AR_SLNO
                                JOIN EXCLUDE_IP ex
                                    ON ex.IP_NO = oa.IP_NO
                                JOIN MH
                                    ON MH.MH_CODE = roa.MH_CODE
                                CROSS JOIN date_params dp
                          WHERE roa.RFC_CANCEL = 'N'
                                AND roa.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          UNION ALL
                          /* ================= GENERAL ADVANCE REFUND ================= */
                          SELECT SUM (NVL (ra.RFN_AMT, 0)) AS Amt, 0 AS Tax
                            FROM REFUNDADVANCE ra
                                JOIN OPADVANCE oa
                                    ON oa.AR_SLNO = ra.AR_SLNO
                                JOIN EXCLUDE_IP ex
                                    ON ex.IP_NO = oa.IP_NO
                                JOIN MH
                                    ON MH.MH_CODE = ra.RFC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE NVL (ra.RFC_CANCEL, 'N') = 'N'
                                AND ra.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          UNION ALL
                          /* ================= IP RECEIPT ADJUSTMENT ================= */
                          SELECT SUM (
                                      NVL (ir.IRN_BALANCE, 0)
                                    + NVL (ir.IRN_REFCHEQ, 0)
                                    + NVL (ir.IRN_REFCARD, 0))
                                    AS Amt,
                                0 AS Tax
                            FROM IPRECEIPT ir
                                JOIN DISBILLMAST dm
                                    ON dm.DMC_SLNO = ir.DMC_SLNO
                                JOIN EXCLUDE_IP ex
                                    ON ex.IP_NO = dm.IP_NO
                                JOIN MH
                                    ON MH.MH_CODE = ir.IPC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE     ir.DMC_TYPE = 'A'
                                AND ir.IRC_CANCEL IS NULL
                                AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                                AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          UNION ALL
                          /* ================= ADVANCE RETURN ================= */
                          SELECT SUM (NVL (ar.RAN_AMT, 0)) AS Amt, 0 AS Tax
                            FROM ADVANCERETURN ar
                                JOIN OPADVANCE oa
                                    ON oa.AR_SLNO = ar.AR_SLNO
                                JOIN EXCLUDE_IP ex
                                    ON ex.IP_NO = oa.IP_NO
                                JOIN MH
                                    ON MH.MH_CODE = ar.RAC_MHCODE
                                CROSS JOIN date_params dp
                          WHERE NVL (ar.RAC_CANCEL, 'N') = 'N'
                                AND ar.RAD_DATE BETWEEN dp.from_date AND dp.TO_DATE) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED - CORRECTED
const getCollectionPortion_seven = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (NVL (dm.DMN_FINALCREDIT, 0) + NVL (dm.DMN_COPAYDED_CREDIT, 0))
                          AS Amt,
                      SUM (
                          CASE
                            WHEN NVL (dm.DMC_CANCEL, 'N') = 'N'
                            THEN
                                  NVL (dm.DMN_SALESTAXCH, 0)
                                + NVL (dm.DMN_SALESTAXCR, 0)
                                + NVL (dm.DMN_CESSCH, 0)
                                + NVL (dm.DMN_CESSCR, 0)
                            ELSE
                                0
                          END)
                          AS Tax
                  FROM DISBILLMAST dm
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     dm.DMC_CACR = 'R'
                      AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getCollectionPortion_eight = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT DISTINCT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (A.Payable) AS Amt, SUM (A.Tax) AS Tax
                  FROM (/* ================= DISBILL PAYABLE ================= */
                        SELECT SUM (NVL (dm.DMN_FINALPTPAYABLE, 0)) AS Payable,
                              SUM (
                                  CASE
                                    WHEN NVL (dm.DMC_CANCEL, 'N') = 'N'
                                    THEN
                                          NVL (dm.DMN_SALESTAXCH, 0)
                                        + NVL (dm.DMN_SALESTAXCR, 0)
                                        + NVL (dm.DMN_CESSCH, 0)
                                        + NVL (dm.DMN_CESSCR, 0)
                                    ELSE
                                        0
                                  END)
                                  AS Tax
                          FROM DISBILLMAST dm
                              JOIN MH
                                  ON MH.MH_CODE = dm.MH_CODE
                              JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     dm.DMC_CACR IN ('C', 'R')
                              AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                              AND NVL (dm.DMN_FINALPTPAYABLE, 0) <> 0
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        /* ================= RECEIPT ADJUSTMENT ================= */
                        SELECT SUM (
                                  (  NVL (ir.IRN_AMOUNT, 0)
                                  + NVL (ir.IRN_CHEQUE, 0)
                                  + NVL (ir.IRN_CARD, 0)
                                  + NVL (ir.IRN_NEFT, 0))
                                  - (  NVL (ir.IRN_BALANCE, 0)
                                    + NVL (ir.IRN_REFCHEQ, 0)
                                    + NVL (ir.IRN_REFCARD, 0))
                                  + NVL (ir.IRN_DISCOUNT, 0))
                              * -1
                                  AS Payable,
                              SUM (
                                  CASE
                                    WHEN NVL (dm.DMC_CANCEL, 'N') = 'N'
                                    THEN
                                          NVL (dm.DMN_SALESTAXCH, 0)
                                        + NVL (dm.DMN_SALESTAXCR, 0)
                                        + NVL (dm.DMN_CESSCH, 0)
                                        + NVL (dm.DMN_CESSCR, 0)
                                    ELSE
                                        0
                                  END)
                              * -1
                                  AS Tax
                          FROM IPRECEIPT ir
                              JOIN DISBILLMAST dm
                                  ON dm.DMC_SLNO = ir.DMC_SLNO
                              JOIN MH
                                  ON MH.MH_CODE = ir.IPC_MHCODE
                              JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     ir.DMC_TYPE IN ('C', 'R')
                              AND ir.IRC_CANCEL IS NULL
                              AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ( (  NVL (ir.IRN_AMOUNT, 0)
                                      + NVL (ir.IRN_CHEQUE, 0)
                                      + NVL (ir.IRN_CARD, 0)
                                      + NVL (ir.IRN_NEFT, 0))
                                    - (  NVL (ir.IRN_BALANCE, 0)
                                      + NVL (ir.IRN_REFCHEQ, 0)
                                      + NVL (ir.IRN_REFCARD, 0))
                                    + NVL (ir.IRN_DISCOUNT, 0)) <> 0) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getIpRefundDetlSection_seven = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital)
                  SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                        NVL (mig.DG_GRCODE, 999) AS Code,
                        SUM (rbd.RFN_NETAMT) * -1 AS Amt,
                        SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.RFN_TOTCESS, 0)) * -1 AS Tax,
                        SUM (NVL (rbd.RFN_NETAMT, 0) + NVL (rbd.RFN_DISAMT, 0)) * -1
                            AS GrossAmt,
                        0 AS Comp,
                        SUM (NVL (rbd.RFN_DISAMT, 0)) * -1 AS Discount
                    FROM REFUNDBILLDETL rbd
                        JOIN REFUNDBILLMAST rbm
                            ON rbm.RFC_SLNO = rbd.RFC_SLNO
                        JOIN BILLDETL bd
                            ON bd.BMC_SLNO = rbd.BMC_SLNO AND bd.BMC_CNT = rbd.BMC_CNT
                        JOIN OPBILLMAST obm
                            ON obm.OPC_SLNO = bd.OPC_SLNO
                        JOIN PRODESCRIPTION pd
                            ON pd.PD_CODE = rbd.PD_CODE
                        JOIN PROGROUP pg
                            ON pg.PG_CODE = pd.PG_CODE
                        LEFT JOIN MISINCEXPDTL mid
                            ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                        LEFT JOIN MISINCEXPGROUP mig
                            ON mig.DG_GRCODE = mid.DG_GRCODE
                        JOIN MH
                            ON MH.MH_CODE = obm.MH_CODE
                        CROSS JOIN date_params dp
                  WHERE     rbm.RFC_CACR = 'O'
                        AND NVL (obm.OPN_CANCEL, 'N') = 'N'
                        AND NVL (rbd.RFC_CANCEL, 'N') = 'N'
                        AND obm.OPC_CACR <> 'M'
                        AND obm.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                GROUP BY mig.DG_GRCODE, mig.DG_DESC
                ORDER BY Dg_desc`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// DISABLED
const getWriteoffamnt = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (recpcollectiondetl.RCN_DISPUT, 0)) AS writeoffamt
                FROM RECPCOLLECTIONMAST, recpcollectiondetl
                WHERE RECPCOLLECTIONDETL.RCC_SLNO = RECPCOLLECTIONMAST.RCC_SLNO
                    AND RECPCOLLECTIONMAST.RCD_DATE >=TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECPCOLLECTIONMAST.RCD_DATE <=TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND NVL (RECPCOLLECTIONMAST.RCC_CANCEL, 'N') = 'N'
                HAVING SUM (NVL (recpcollectiondetl.RCN_DISPUT, 0)) > 0
                UNION ALL
                SELECT SUM (NVL (recpcollectiondetl.RCN_DISPUT, 0)) * -1 AS writeoffamt
                FROM Recpcollectionmast, recpcollectiondetl
                WHERE RECPCOLLECTIONDETL.RCC_SLNO = RECPCOLLECTIONMAST.RCC_SLNO
                    AND Recpcollectionmast.Rfd_Date >=TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Recpcollectionmast.Rfd_Date <=TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND NVL (RECPCOLLECTIONMAST.Rcc_Cancel, 'N') = 'N'
                HAVING SUM (NVL (recpcollectiondetl.RCN_DISPUT, 0)) > 0`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};
// INCLUDED
const getDiscount_three = async (conn_ora, bind) => {
  const sql = `WITH date_params
                  AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                              TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                        FROM DUAL),
                  MH AS (SELECT MH_CODE FROM multihospital),
                  EXCLUDE_IP
                  AS (SELECT DISTINCT IP_NO
                        FROM GTT_EXCLUDE_IP
                        WHERE STATUS = 1)
              SELECT SUM (NVL (ir.IRN_DISCOUNT, 0)) AS Discount
                FROM IPRECEIPT ir
                    JOIN DISBILLMAST dm
                        ON dm.DMC_SLNO = ir.DMC_SLNO
                    JOIN MH
                        ON MH.MH_CODE = dm.MH_CODE
                    JOIN EXCLUDE_IP ex
                        ON ex.IP_NO = dm.IP_NO
                    CROSS JOIN date_params dp
              WHERE     NVL (ir.IRC_CANCEL, 'N') = 'N'
                    AND ir.DMC_TYPE IN ('C', 'R')
                    AND dm.DMC_CACR <> 'M'
                    AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                    AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                    AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                    AND NVL (ir.IRN_DISCOUNT, 0) > 0`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const getTypeDiscount = async (conn_ora, bind) => {
  const sql = `WITH BASE_BILL
                  AS (SELECT /*+ LEADING(bb) USE_NL */
                            d.DMC_SLNO, d.IP_NO, d.PT_NO
                        FROM DISBILLMAST d JOIN MULTIHOSPITAL mh ON mh.MH_CODE = d.MH_CODE
                        WHERE (d.DMC_CANCEL = 'N' OR d.DMC_CANCEL IS NULL)
                              AND d.DMC_CACR <> 'M'
                              AND d.DMD_DATE BETWEEN TO_DATE (:fromDate,
                                                              'dd/MM/yyyy hh24:mi:ss')
                                                AND TO_DATE (:toDate,
                                                              'dd/MM/yyyy hh24:mi:ss')
                              AND EXISTS
                                    (SELECT 1
                                        FROM GTT_EXCLUDE_IP g
                                      WHERE g.IP_NO = d.IP_NO AND g.STATUS = 1)),SURGERY_DISC
                  AS (  SELECT ps.DMC_SLNO,
                                SUM (
                                    NVL (ps.SRN_OPERDIS, 0)
                                  + NVL (ps.SRN_THEARDIS, 0)
                                  + NVL (ps.SRN_ANTDIS, 0))
                                  DISCOUNT
                          FROM PATSURGERY ps JOIN BASE_BILL bb ON bb.DMC_SLNO = ps.DMC_SLNO
                          WHERE (ps.SRC_CANCEL = 'N' OR ps.SRC_CANCEL IS NULL)
                      GROUP BY ps.DMC_SLNO),
                  SURGERY_DETL_DISC
                  AS (  SELECT ps.DMC_SLNO, SUM (NVL (psd.SRN_DISCOUNT, 0)) DISCOUNT
                          FROM PATSURGERY ps
                                JOIN BASE_BILL bb
                                  ON bb.DMC_SLNO = ps.DMC_SLNO
                                JOIN PATSURDETL psd
                                  ON ps.SR_SLNO = psd.SR_SLNO
                          WHERE (ps.SRC_CANCEL = 'N' OR ps.SRC_CANCEL IS NULL)
                      GROUP BY ps.DMC_SLNO),
                  SURGERY_OTHER_DISC
                  AS (  SELECT ps.DMC_SLNO, SUM (NVL (pso.SRN_DISCOUNT, 0)) DISCOUNT
                          FROM PATSURGERY ps
                                JOIN BASE_BILL bb
                                  ON bb.DMC_SLNO = ps.DMC_SLNO
                                JOIN PATSUROTHER pso
                                  ON ps.SR_SLNO = pso.SR_SLNO
                          WHERE (ps.SRC_CANCEL = 'N' OR ps.SRC_CANCEL IS NULL)
                      GROUP BY ps.DMC_SLNO),
                      BILL_DISC
                  AS (  SELECT bm.DMC_SLNO, SUM (NVL (bd.BMN_DISAMT, 0)) DISCOUNT
                          FROM BILLMAST bm
                                JOIN BASE_BILL bb
                                  ON bb.DMC_SLNO = bm.DMC_SLNO
                                JOIN BILLDETL bd
                                  ON bm.BMC_SLNO = bd.BMC_SLNO
                          WHERE (bm.BMC_CANCEL = 'N' OR bm.BMC_CANCEL IS NULL)
                      GROUP BY bm.DMC_SLNO),
                  PHARM_DISC
                  AS (  SELECT pb.DMC_SLNO, SUM (NVL (pb.BMN_DISAMT, 0)) DISCOUNT
                          FROM PBILLMAST pb JOIN BASE_BILL bb ON bb.DMC_SLNO = pb.DMC_SLNO
                          WHERE (pb.BMC_CANCEL = 'N' OR pb.BMC_CANCEL IS NULL)
                      GROUP BY pb.DMC_SLNO),
                  REFUND_BILL
                  AS (  SELECT rbm.DMC_SLNO, SUM (NVL (rbd.RFN_DISAMT, 0)) * -1 DISCOUNT
                          FROM REFUNDBILLMAST rbm
                                JOIN BASE_BILL bb
                                  ON bb.DMC_SLNO = rbm.DMC_SLNO
                                JOIN REFUNDBILLDETL rbd
                                  ON rbm.RFC_SLNO = rbd.RFC_SLNO
                          WHERE (rbm.RFC_CANCEL = 'N' OR rbm.RFC_CANCEL IS NULL)
                      GROUP BY rbm.DMC_SLNO),
                  PHARM_RETURN
                  AS (  SELECT pb.DMC_SLNO, SUM (NVL (mrd.MRN_DISAMT, 0)) * -1 DISCOUNT
                          FROM MRETMAST mrm
                                JOIN MRETDETL mrd
                                  ON mrm.MRC_SLNO = mrd.MRC_SLNO
                                JOIN PBILLMAST pb
                                  ON mrd.BMC_SLNO = pb.BMC_SLNO
                                JOIN BASE_BILL bb
                                  ON bb.DMC_SLNO = pb.DMC_SLNO
                          WHERE (mrm.MRC_CANCEL = 'N' OR mrm.MRC_CANCEL IS NULL)
                      GROUP BY pb.DMC_SLNO),
                  IP_RECEIPT_DISC
                  AS (  SELECT ip.DMC_SLNO, SUM (NVL (ip.IRN_DISCOUNT, 0)) DISCOUNT
                          FROM IPRECEIPT ip JOIN BASE_BILL bb ON bb.DMC_SLNO = ip.DMC_SLNO
                          WHERE (ip.IRC_CANCEL = 'N' OR ip.IRC_CANCEL IS NULL)
                      GROUP BY ip.DMC_SLNO),
                  ALL_DISC
                  AS (  SELECT DMC_SLNO, SUM (DISCOUNT) DISCOUNT
                          FROM (SELECT * FROM SURGERY_DISC
                                UNION ALL
                                SELECT * FROM SURGERY_DETL_DISC
                                UNION ALL
                                SELECT * FROM SURGERY_OTHER_DISC
                                UNION ALL
                                SELECT * FROM BILL_DISC
                                UNION ALL
                                SELECT * FROM PHARM_DISC
                                UNION ALL
                                SELECT * FROM REFUND_BILL
                                UNION ALL
                                SELECT * FROM PHARM_RETURN
                                UNION ALL
                                SELECT * FROM IP_RECEIPT_DISC)
                      GROUP BY DMC_SLNO)
                SELECT INITCAP (pt.PTC_DESC) AS PTC_DESC,
                      SUM (NVL (ad.DISCOUNT, 0)) AS DISCOUNT,
                      0 AS TAX
                  FROM BASE_BILL bb
                      LEFT JOIN PATIENT p
                          ON p.PT_NO = bb.PT_NO
                      LEFT JOIN PATTYPE pt
                          ON pt.PT_CODE = p.PT_CODE
                      LEFT JOIN ALL_DISC ad
                          ON ad.DMC_SLNO = bb.DMC_SLNO
              GROUP BY INITCAP (pt.PTC_DESC)
              ORDER BY 1`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const get_CreditInsuranceBillCollection = async (conn_ora, bind) => {
  const sql = `SELECT BillNo,
                    Cash,
                    Cheque,
                    DD,
                    Card,
                    Bankamt,
                    Bank,
                    Customer,
                    UserName
                FROM (/* ===== COLLECTION ===== */
                        SELECT X.Rc_no BillNo,
                            NVL (X.Rcn_cash, 0) Cash,
                            NVL (X.Rcn_chk, 0) Cheque,
                            NVL (X.Rcn_dd, 0) DD,
                            NVL (X.Rcn_Card, 0) Card,
                            NVL (X.RCN_NEFT, 0) Bankamt,
                            INITCAP (X.Rcc_Bank) Bank,
                            INITCAP (Y.Cuc_name) Customer,
                            INITCAP (Z.Usc_name) UserName
                        FROM Recpcollectionmast X
                            JOIN Customer Y
                                ON X.Cu_code = Y.Cu_code
                            LEFT JOIN Users Z
                                ON X.Us_code = Z.Us_code
                            LEFT JOIN Recpcollectiondetl R
                                ON R.RCC_SLNO = X.RCC_SLNO
                            JOIN multihospital mh
                                ON mh.MH_CODE = X.MH_CODE
                            JOIN GTT_EXCLUDE_IP GTT
                                ON GTT.IP_NO = R.IP_NO AND GTT.STATUS = 1
                        WHERE NVL (X.Rcc_cancel, 'N') = 'N'
                            AND X.Rcd_date BETWEEN TO_DATE (:fromDate,
                                                            'DD/MM/YYYY HH24:MI:SS')
                                                AND TO_DATE (:toDate,
                                                            'DD/MM/YYYY HH24:MI:SS')
                        UNION ALL
                        /* ===== REFUND ===== */
                        SELECT X.Rc_no,
                            NVL (X.Rfn_Cash, 0),
                            NVL (X.Rfn_Chk, 0),
                            NVL (X.Rfn_Dd, 0),
                            NVL (X.Rfn_Card, 0), 0,
                            INITCAP (X.Rcc_Bank),
                            INITCAP (Y.Cuc_name),
                            INITCAP (Z.Usc_name)
                        FROM Recpcollectionmast X
                            JOIN Customer Y
                                ON X.Cu_code = Y.Cu_code
                            LEFT JOIN Users Z
                                ON X.Us_code = Z.Us_code
                            JOIN Recpcollectiondetl R
                                ON R.RCC_SLNO = X.RCC_SLNO
                            JOIN multihospital mh
                                ON mh.MH_CODE = X.MH_CODE
                            JOIN GTT_EXCLUDE_IP GTT
                                ON GTT.IP_NO = R.IP_NO AND GTT.STATUS = 1
                        WHERE NVL (X.Rcc_cancel, 'N') = 'N'
                            AND X.Rfd_Date BETWEEN TO_DATE (:fromDate, 'DD/MM/YYYY HH24:MI:SS')
                                                AND TO_DATE (:toDate,'DD/MM/YYYY HH24:MI:SS')) A`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

const get_CreditInsuranceBill = async (conn_ora, bind) => {
  const sql = `SELECT PtName,
         PtNo,
         BillNo,
         SUM (Amt) Amt,
         SUM (Taxamt) Taxamt,
         Customer,
         UserName
    FROM (  /* ================= DISBILL ================= */
            SELECT INITCAP (Ptc_ptname) PtName,
                   Disbillmast.Pt_no PtNo,
                   Dm_no BillNo,
                   SUM (NVL (DMN_FINALCREDIT, 0))
                   + SUM (NVL (dmn_copayded_credit, 0))
                      Amt,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Taxamt,
                   INITCAP (Cuc_name) Customer,
                   INITCAP (Usc_Name) UserName
              FROM Disbillmast,
                   Patient,
                   Customer,
                   Users
             WHERE     Disbillmast.Pt_no = Patient.Pt_no(+)
                   AND Disbillmast.Us_code = Users.Us_code
                   AND Disbillmast.Cu_code = Customer.Cu_code
                   AND dmc_slno NOT IN (SELECT dmc_slno
                                          FROM DISBILLPAYEEALLOC
                                         WHERE NVL (dpc_cancel, 'N') = 'N')
                   AND Dmc_cacr = 'R'
                   AND Dmd_date BETWEEN TO_DATE (:fromDate,
                                                 'DD/MM/YYYY HH24:MI:SS')
                                    AND TO_DATE (:toDate,
                                                 'DD/MM/YYYY HH24:MI:SS')
                   AND NVL (Dmc_cancel, 'N') = 'N'
                   AND EXISTS
                          (SELECT 1
                             FROM GTT_EXCLUDE_IP GTT
                            WHERE GTT.IP_NO = Disbillmast.IP_NO AND STATUS = 1)
                   AND Disbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Ptc_ptname,
                   Disbillmast.Pt_no,
                   Dm_no,
                   Cuc_name,
                   Usc_Name
            HAVING SUM (NVL (Dmn_credit, 0)) <> 0
          UNION ALL
            /* ================= PBILL NORMAL ================= */
            SELECT INITCAP (Ptc_ptname),
                   Pbillmast.Pt_no,
                   Bm_no,
                   SUM (
                        NVL (Bmn_credit, 0)
                      + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                      + NVL (PBILLMAST.BMN_CESSCR, 0))
                   + SUM (NVL (Bmn_Copayded_Credit, 0)),
                   SUM (
                        NVL (BMN_SALETAXCH, 0)
                      + NVL (BMN_SALETAXCR, 0)
                      + NVL (BMN_CESSCH, 0)
                      + NVL (BMN_CESSCR, 0)),
                   INITCAP (Cuc_name),
                   INITCAP (Usc_Name)
              FROM Pbillmast,
                   Patient,
                   Customer,
                   Users
             WHERE     Pbillmast.Pt_no = Patient.Pt_no(+)
                   AND Pbillmast.Us_code = Users.Us_code
                   AND Pbillmast.Cu_code = Customer.Cu_code(+)
                   AND NVL (Bmn_credit, 0) <> 0
                   AND Bmd_date BETWEEN TO_DATE (:fromDate,
                                                 'DD/MM/YYYY HH24:MI:SS')
                                    AND TO_DATE (:toDate,
                                                 'DD/MM/YYYY HH24:MI:SS')
                   AND Pbillmast.BMC_COLLCNCODE IS NULL
                   AND Pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                   AND Bmc_cacr = 'R'
                   AND NVL (Bmc_cancel, 'N') <> 'Y'
                   AND EXISTS
                          (SELECT 1
                             FROM GTT_EXCLUDE_IP GTT
                            WHERE GTT.IP_NO = PBILLMAST.IP_NO AND STATUS = 1)
          GROUP BY Ptc_ptname,
                   Pbillmast.Pt_no,
                   Bm_no,
                   Cuc_name,
                   Usc_Name
            HAVING SUM (NVL (Bmn_credit, 0)) <> 0
          UNION ALL
            /* ================= PBILL COLLECTION ================= */
            SELECT INITCAP (Ptc_ptname),
                   Pbillmast.Pt_no,
                   Bm_no,
                   SUM (
                        NVL (Bmn_credit, 0)
                      + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                      + NVL (PBILLMAST.BMN_CESSCR, 0))
                   + SUM (NVL (Bmn_Copayded_Credit, 0)),
                   SUM (
                        NVL (BMN_SALETAXCH, 0)
                      + NVL (BMN_SALETAXCR, 0)
                      + NVL (BMN_CESSCH, 0)
                      + NVL (BMN_CESSCR, 0)),
                   INITCAP (Cuc_name),
                   INITCAP (Usc_Name)
              FROM Pbillmast,
                   Patient,
                   Customer,
                   Users
             WHERE     Pbillmast.Pt_no = Patient.Pt_no(+)
                   AND Pbillmast.BMC_COLLUSCODE = Users.Us_code
                   AND Pbillmast.Cu_code = Customer.Cu_code(+)
                   AND NVL (Bmn_credit, 0) <> 0
                   AND BMD_COLLDATE BETWEEN TO_DATE (:fromDate,
                                                     'DD/MM/YYYY HH24:MI:SS')
                                        AND TO_DATE (:toDate,
                                                     'DD/MM/YYYY HH24:MI:SS')
                   AND Pbillmast.BMC_COLLCNCODE IS NOT NULL
                   AND Pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                   AND Bmc_cacr = 'R'
                   AND NVL (Bmc_cancel, 'N') <> 'Y'
                   AND EXISTS
                          (SELECT 1
                             FROM GTT_EXCLUDE_IP GTT
                            WHERE GTT.IP_NO = PBILLMAST.IP_NO AND STATUS = 1)
          GROUP BY Ptc_ptname,
                   Pbillmast.Pt_no,
                   Bm_no,
                   Cuc_name,
                   Usc_Name
            HAVING SUM (NVL (Bmn_credit, 0)) <> 0) A
GROUP BY PtName,
         PtNo,
         BillNo,
         Customer,
         UserName
  HAVING SUM (Amt) <> 0`;
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  return result.rows;
};

module.exports = {
  getMisincexpmast,
  getMisincexpgroup,
  getUngroupedRoomDetl,
  getTheaterIncome,
  getTheaterIncome_two,
  getConsultingIncome,
  getIpRefundDetl,
  getIpRefundDetl_one,
  getIpRefundReceiptDetlSection_Two,
  getIpRefundDetlSection_three,
  getIpRefundDetlSection_four,
  getIpRefundDetlSection_five,
  getIpRefundDetlSection_six,
  getIpRefundDetlSection_seven,
  getIpincomeSection_one,
  getIpincomeSection_two,
  getIpincomeSection_three,
  getIpincomeSection_four,
  getIpincomeSection_five,
  getIpincomeSection_six,
  getProcedureIncomeSection_one,
  getProcedureIncomeSecition_two,
  getReceiptmasterSection_one,
  getPharmacyCollection_One,
  getPharmacyCollection_Two,
  getPharamcyCollection_three,
  getPharmacyCollection_four,
  getPharamcyReturnSection_one,
  getPharmacyReturnSection_three,
  getCollectionPortion_one,
  getCollectionPortion_two,
  getCollectionPortion_three,
  getCollectionPortion_four,
  getCollectionPortion_five,
  getCollectionPortion_six,
  getCollectionPortion_seven,
  getCollectionPortion_eight,
  getDiscount,
  getDiscount_one,
  getDiscount_three,
  getAdvanceRefund,
  getWriteoffamnt,
  getTypeDiscount,
  getPerttyCash,
  get_CreditInsuranceBillCollection,
  get_CreditInsuranceBill,
};
