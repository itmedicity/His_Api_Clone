const {oracledb} = require("../../../../config/oradbconfig");
const getMisincexpmast = async (conn_ora) => {
  const sql = `SELECT * FROM MISINCEXPMAST`;
  const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

const getUngroupedRoomDetl = async (conn_ora, bind) => {
  // Code optimised
  const sql = `SELECT NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
                        NVL (g.Dg_grcode, 999) AS Code,
                        SUM (NVL (r.drn_nurdays, 0) * NVL (r.drn_nuramt, 0)) AS Amt,
                        0 AS tax,
                        SUM (NVL (r.drn_nurdays, 0) * NVL (r.drn_nuramt, 0)) AS GrossAmt,
                        0 AS Discount
                    FROM Disbillmast d
                        JOIN Disroomdetl r ON d.Dmc_Slno = r.Dmc_Slno
                        JOIN Ipparam ip ON d.Mh_code = ip.Mh_Code
                        LEFT JOIN Misincexpdtl md ON ip.Ipc_Nucode = md.Pc_Code AND md.Dg_Type = 'R'
                        LEFT JOIN Misincexpgroup g ON md.Dg_Grcode = g.Dg_Grcode
                        JOIN multihospital mh ON mh.MH_CODE = d.MH_CODE
                  WHERE     NVL (d.Dmc_cancel, 'N') = 'N'
                        AND NVL (r.Dmc_Cancel, 'N') = 'N'
                        AND d.Dmc_Cacr <> 'M'
                        AND d.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND d.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND NOT EXISTS (SELECT 1 FROM MEDIWARE.GTT_EXCLUDE_IP gtt WHERE gtt.IP_NO = d.IP_NO AND gtt.STATUS = 1)
                GROUP BY g.Dg_grcode, g.Dg_desc
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
  const sql = `WITH EXCLUDE_IP AS(
                    SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1
                ),
                CTE_DISBILL AS (
                    SELECT d.*
                    FROM DISBILLMAST d
                    JOIN MULTIHOSPITAL mh  ON mh.MH_CODE = d.MH_CODE
                    LEFT JOIN EXCLUDE_IP ON EXCLUDE_IP.IP_NO = d.IP_NO
                    WHERE NVL(d.DMC_CANCEL, 'N') = 'N'
                      AND d.DMC_CACR <> 'M'
                      AND d.DMD_DATE >= TO_DATE(:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND d.DMD_DATE <= TO_DATE(:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXCLUDE_IP.IP_NO IS NULL
                )
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (srn_operation, 0) - (NVL (Patsurgery.srn_operdis, 0))) Amt,
                        SUM (NVL (Patsurgery.SRN_OPERTOTTAX, 0)) tax,
                        SUM (NVL (srn_operation, 0)) GrossAmt,
                        SUM (NVL (Patsurgery.srn_operdis, 0)) Discount
                    FROM CTE_DISBILL DS
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DS.Dmc_Slno
                    JOIN Ipparam ON DS.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.ipc_oper
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                  AND NVL (Patsurgery.srn_operation, 0) > 0
                  AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_THEATER, 0) - (NVL (Patsurgery.SRN_THEARDIS, 0))) Amt,
                        SUM (NVL (Patsurgery.SRN_THEATTOTTAX, 0)) tax,
                        SUM (NVL (SRN_THEATER, 0)) GrossAmt,
                        SUM (NVL (SRN_THEARDIS, 0)) Discount
                    FROM CTE_DISBILL DM
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.ipc_ther
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                        AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_CHIEF, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_CHIEF, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM CTE_DISBILL DM  
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.ipc_CHIEF
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                        AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_1STASST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_1STASST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM CTE_DISBILL DM
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.ipc_1stasst
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                  AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                  AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_2NDASST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_2NDASST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM CTE_DISBILL DM
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.Ipc_2NDASST
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                        AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_3RDASST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_3RDASST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM CTE_DISBILL DM 
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.Ipc_3RDASST
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                  AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_GUEST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_GUEST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM CTE_DISBILL DM
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.Ipc_GUEST
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE     Misincexpdtl.Dg_type = 'R'
                        AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_ANTEST, 0) - NVL (Srn_antdis, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_ANTEST, 0)) GrossAmt,
                        SUM (NVL (Srn_antdis, 0)) Discount
                    FROM CTE_DISBILL DM 
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.ipc_ANEST
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type  = 'R'
                  AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                  AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_ANTEST2, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_ANTEST2, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM CTE_DISBILL DM
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURGERYRESOURCESDETL ON PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.Ipc_ANEST2
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                        AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (PATSUROTHER.Pdn_Amount) Amt,
                        SUM (NVL (PATSUROTHER.PSN_TOTTAX, 0)) tax,
                        SUM (NVL (PATSUROTHER.Pdn_Amount, 0) + NVL (PATSUROTHER.SRN_discount, 0)) GrossAmt,
                        SUM (NVL (PATSUROTHER.SRN_discount, 0)) Discount
                    FROM CTE_DISBILL DM 
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN patsurother ON Patsurother.SR_SLNO = Patsurgery.SR_SLNO
                    JOIN Prodescription ON patsurother.pd_code = Prodescription.pd_code
                    JOIN Progroup ON Prodescription.pg_Code = Progroup.pg_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    WHERE     Misincexpdtl.Dg_type = 'R'
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (PATSURDETL.SRN_AMOUNT - NVL (patsurdetl.srn_discount, 0)) Amt,
                        SUM (NVL (Patsurdetl.PSN_TOTTAX, 0)) tax,
                        SUM (PATSURDETL.SRN_AMOUNT) GrossAmt,
                        SUM (NVL (patsurdetl.srn_discount, 0)) Discount
                    FROM CTE_DISBILL DM 
                    JOIN Patsurgery ON Patsurgery.Dmc_Slno = DM.Dmc_Slno
                    JOIN PATSURDETL ON PATSURDETL.SR_SLNO = Patsurgery.SR_SLNO
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = PATSURDETL.PC_CODE
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    WHERE Misincexpdtl.Dg_type = 'R'
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                  SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (Cmn_Netamt, 0) - NVL (Cmn_Outcoll, 0)) Amt,
                        0 tax,
                        SUM (NVL (Cmn_Netamt, 0) - NVL (Cmn_Outcoll, 0)) GrossAmt,
                        SUM (0) AS Discount
                    FROM CTE_DISBILL DM 
                    JOIN Canbillmast ON Canbillmast.Dmc_Slno = DM.Dmc_Slno 
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Ipparam.Ipc_Canteencode = Misincexpdtl.Pc_Code
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode
                  WHERE Misincexpdtl.Dg_Type = 'R'
                  AND NVL (Canbillmast.Cmc_Cancel, 'N') = 'N'
                  AND Canbillmast.Cmc_Cacr = 'I'
                GROUP BY Misincexpgroup.Dg_Grcode, Misincexpgroup.Dg_Desc
                ORDER BY Dg_desc`;
  // console.log(sql);
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
  const sql = `WITH EXCLUDE_IP AS(
                    SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1
                ),
                CTE_DISBILL AS (
                    SELECT d.*
                    FROM DISBILLMAST d
                    JOIN MULTIHOSPITAL mh  ON mh.MH_CODE = d.MH_CODE
                    LEFT JOIN EXCLUDE_IP ON EXCLUDE_IP.IP_NO = d.IP_NO
                    WHERE NVL(d.DMC_CANCEL, 'N') = 'N'
                      AND d.DMC_CACR <> 'M'
                      AND d.DMD_DATE >= TO_DATE(:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND d.DMD_DATE <= TO_DATE(:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXCLUDE_IP.IP_NO IS NULL
                )
                SELECT 
                        NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL ( (VSN_RATE), 0) - NVL (Vsn_disamt, 0)) Amt,
                        SUM (NVL (PATVISIT.VSN_TOTTAX, 0)) tax,
                        SUM (NVL ( (VSN_RATE), 0)) GrossAmt,
                        SUM (NVL (Vsn_disamt, 0)) Discount
                    FROM PATVISIT
                    JOIN CTE_DISBILL DM ON PATVISIT.Dmc_Slno = DM.Dmc_Slno
                    JOIN Ipparam ON DM.Mh_code = Ipparam.Mh_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Ipparam.Ipc_vscode
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                  WHERE Misincexpdtl.Dg_type = 'R'
                        AND NVL (DM.Dmc_Cancel, 'N') = 'N'
                        AND NVL (VSC_CANCEL, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                    NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                    SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                    SUM (NVL (Iprefunditemdetl.RIN_TOTTAX, 0)) * -1 tax,
                    SUM (
                        NVL (Iprefunditemdetl.Rin_Netamt, 0)
                        + NVL (Iprefunditemdetl.Rin_Disamt, 0))
                    * -1
                        GrossAmt,
                    SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount
                FROM Misincexpgroup,
                    Misincexpdtl,
                    Iprefunditemdetl,
                    Iprefundmast
            WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                    AND Iprefunditemdetl.Pc_Code = Misincexpdtl.Pc_Code(+)
                    AND Misincexpgroup.Dg_Grcode(+) = Misincexpdtl.Dg_Grcode
                    AND Misincexpdtl.Dg_Type(+) = 'R'
                    AND Iprefunditemdetl.Ric_Type <> 'PHY'
                    AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                    AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                    AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = IPREFUNDMAST.IP_NO AND G.STATUS = 1)
            GROUP BY Misincexpgroup.Dg_Grcode, Misincexpgroup.Dg_Desc
            ORDER BY Dg_Desc`;
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
  const sql = `WITH EXCLUDE_IP AS(
                    SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1
                ),
                CTE_DISBILL AS (
                    SELECT d.*
                    FROM DISBILLMAST d
                    JOIN MULTIHOSPITAL mh  ON mh.MH_CODE = d.MH_CODE
                    LEFT JOIN EXCLUDE_IP ON EXCLUDE_IP.IP_NO = d.IP_NO
                    WHERE NVL(d.DMC_CANCEL, 'N') = 'N'
                      AND d.DMC_CACR <> 'M'
                      AND d.DMD_DATE >= TO_DATE(:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND d.DMD_DATE <= TO_DATE(:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXCLUDE_IP.IP_NO IS NULL
                )
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                                    NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                                    SUM ((NVL (Rdn_Amount * DECODE ( NVL (Dmc_Hour, 'N'),'N', Rdn_Days, DECODE (NVL (Dmc_Minhourtaken, 'N'), 'Y', 1, Rdn_Days)),0))) - SUM (NVL (Rdn_Disamt, 0)) Amt,
                                    SUM (NVL (DISRMRENTDETL.RDN_TOTTAX, 0)) tax,
                                    SUM ((NVL (Rdn_Amount * DECODE ( NVL (Dmc_Hour, 'N'), 'N', Rdn_Days, DECODE (NVL (Dmc_Minhourtaken, 'N'), 'Y', 1, Rdn_Days)), 0))) GrossAmt,
                                    SUM (NVL (Rdn_Disamt, 0)) Discount
                                FROM DISRMRENTDETL
                                JOIN CTE_DISBILL DM ON DISRMRENTDETL.Dmc_Slno = DM.Dmc_Slno
                                JOIN Disroomdetl ON Disrmrentdetl.Rm_Slno = Disroomdetl.Rm_Slno
                                LEFT JOIN Misincexpdtl ON DISRMRENTDETL.pc_code = Misincexpdtl.pc_code
                                LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                WHERE Disrmrentdetl.Rt_Code = Disroomdetl.Rt_Code
                                    AND Disrmrentdetl.Bd_Code = Disroomdetl.Bd_Code
                                    AND Disrmrentdetl.Dmc_Slno = Disroomdetl.Dmc_Slno
                                    AND Misincexpdtl.Dg_type = 'R'
                            GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
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
  const sql = `WITH EXCLUDE_IP AS(
                    SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1
                ),
                CTE_DISBILL AS (
                    SELECT d.*
                    FROM DISBILLMAST d
                    JOIN MULTIHOSPITAL mh  ON mh.MH_CODE = d.MH_CODE
                    LEFT JOIN EXCLUDE_IP ON EXCLUDE_IP.IP_NO = d.IP_NO
                    WHERE NVL(d.DMC_CANCEL, 'N') = 'N'
                      AND d.DMC_CACR <> 'M'
                      AND d.DMD_DATE >= TO_DATE(:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND d.DMD_DATE <= TO_DATE(:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXCLUDE_IP.IP_NO IS NULL
                )
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SVN_QTY * SVN_RATE, 0) - NVL (SVN_DISAMT, 0)) Amt,
                        SUM (NVL (PATSERVICE.SVN_TOTTAX, 0)) tax,
                        SUM (NVL (SVN_QTY * SVN_RATE, 0)) GrossAmt,
                        SUM (NVL (SVN_DISAMT, 0)) Discount
                    FROM PATSERVICE 
                    JOIN CTE_DISBILL DM ON PATSERVICE.Dmc_Slno = DM.Dmc_Slno
                    JOIN Prodescription ON PATSERVICE.pd_code = Prodescription.pd_code
                    JOIN Progroup ON Prodescription.pg_Code = Progroup.pg_Code
                    LEFT JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                    LEFT JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    WHERE Misincexpdtl.Dg_type = 'R'
                    AND NVL (SVC_CANCEL, 'N') = 'N'
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (srn_operation, 0) - (NVL (Patsurgery.srn_operdis, 0))) Amt,
                        SUM (NVL (Patsurgery.SRN_OPERTOTTAX, 0)) tax,
                        SUM (NVL (srn_operation, 0)) GrossAmt,
                        SUM (NVL (Patsurgery.srn_operdis, 0)) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup
                WHERE     Patsurgery.OPERATION_OPSLNO = Opbillmast.Opc_Slno
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_oper
                        AND NVL (Patsurgery.srn_operation, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_THEATER, 0) - (NVL (Patsurgery.SRN_THEARDIS, 0))) Amt,
                        SUM (NVL (Patsurgery.SRN_THEATTOTTAX, 0)) tax,
                        SUM (NVL (SRN_THEATER, 0)) GrossAmt,
                        SUM (NVL (SRN_THEARDIS, 0)) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup
                WHERE     Patsurgery.THEATER_OPSLNO = Opbillmast.Opc_Slno
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_ther
                        AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_CHIEF, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_CHIEF, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.CHIEF_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_CHIEF
                        AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_1STASST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_1STASST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.D1STASST_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_1stasst
                        AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_2NDASST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_2NDASST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.D2NDASST_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_2NDASST
                        AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_3RDASST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_3RDASST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.D3RDASST_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_3RDASST
                        AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_GUEST, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_GUEST, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.GUEST_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_GUEST
                        AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_ANTEST, 0) - NVL (Srn_antdis, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_ANTEST, 0)) GrossAmt,
                        SUM (NVL (Srn_antdis, 0)) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.ANTEST_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_ANEST
                        AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL (SRN_ANTEST2, 0)) Amt,
                        SUM (NVL (SRN_TOTTAX, 0)) tax,
                        SUM (NVL (SRN_ANTEST2, 0)) GrossAmt,
                        SUM (0) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Opparam,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURGERYRESOURCESDETL
                WHERE     Patsurgery.ANTEST2_OPSLNO = Opbillmast.Opc_Slno
                        AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Opparam.Opc_ANEST2
                        AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (PATSUROTHER.Pdn_Amount) Amt,
                        SUM (NVL (PATSUROTHER.PSN_TOTTAX, 0)) tax,
                        SUM (
                            NVL (PATSUROTHER.Pdn_Amount, 0) + NVL (PATSUROTHER.SRN_discount, 0))
                            GrossAmt,
                        SUM (NVL (PATSUROTHER.SRN_discount, 0)) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Misincexpdtl,
                        Misincexpgroup,
                        patsurother,
                        Prodescription,
                        Progroup
                WHERE     PATSUROTHER.Opc_Slno = Opbillmast.Opc_Slno
                        AND Patsurother.SR_SLNO = Patsurgery.SR_SLNO
                        AND patsurother.pd_code = Prodescription.pd_code
                        AND Prodescription.pg_Code = Progroup.pg_Code
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NVL (PATSUROTHER.Src_Cancel, 'N') = 'N'
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                UNION ALL
                SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (PATSURDETL.SRN_AMOUNT - NVL (patsurdetl.srn_discount, 0)) Amt,
                        SUM (NVL (Patsurdetl.PSN_TOTTAX, 0)) tax,
                        SUM (PATSURDETL.SRN_AMOUNT) GrossAmt,
                        SUM (NVL (patsurdetl.srn_discount, 0)) Discount
                    FROM Opbillmast,
                        Patsurgery,
                        Misincexpdtl,
                        Misincexpgroup,
                        PATSURDETL
                WHERE     patsurdetl.Opc_Slno = Opbillmast.Opc_Slno
                        AND PATSURDETL.SR_SLNO = Patsurgery.SR_SLNO
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = PATSURDETL.PC_CODE
                        AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                        AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                        AND Opbillmast.OPC_CACR <> 'M'
                        AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND NVL (PATSURDETL.Src_Cancel, 'N') = 'N'
                        AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Patsurgery.IP_NO AND G.STATUS = 1)
                GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
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

const getPharmacyCollection_One = async (conn_ora, bind) => {
  const sql = `SELECT SUM (A.Billamt) AS Amt,
                    SUM (A.GrossAmt) AS GrossAmt,
                    SUM (A.Discount) AS Discount,
                    SUM (A.Comp) AS Comp,
                    SUM (A.Tax) AS Tax
                FROM (
                      SELECT 
                              SUM (CASE WHEN pm.Bmc_Cacr IN ('R', 'C') THEN pd.Bdn_amount ELSE 0 END) AS Billamt,
                              SUM (CASE WHEN pm.Bmc_Cacr IN ('R', 'C') THEN pd.Bdn_amount + NVL (pd.Bmn_disamt, 0) ELSE 0 END) AS GrossAmt,
                              SUM (CASE WHEN pm.Bmc_Cacr IN ('R', 'C') THEN NVL (pd.Bmn_disamt, 0) ELSE 0 END) AS Discount,
                              SUM (CASE WHEN pm.Bmc_Cacr = 'M' THEN pd.Bdn_amount ELSE 0 END) AS Comp,
                              SUM (NVL (pd.Bmn_cess, 0) + NVL (pd.Bmn_saletax, 0)) AS Tax
                        FROM Pbillmast pm JOIN Pbilldetl pd ON pd.Bmc_Slno = pm.Bmc_Slno
                        WHERE pm.BMC_COLLCNCODE IS NULL
                            AND (pm.Bmc_cancel IS NULL OR pm.Bmc_cancel IN ('N','P'))
                            AND pm.Bmc_Cacr IN ('C', 'R', 'M')
                            AND PM.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND PM.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND EXISTS (SELECT 1 FROM multihospital m WHERE m.MH_CODE = pm.MH_CODE)
                      UNION ALL
                      SELECT 
                              SUM ( (mr.MRN_AMOUNT - NVL (mr.MRN_DISAMT, 0)) * -1) AS Billamt,
                              SUM (mr.MRN_AMOUNT * -1) AS GrossAmt,
                              SUM (NVL (mr.MRN_DISAMT, 0) * -1) AS Discount, 0 AS Comp,
                              SUM ( (NVL (mr.MRN_CESS, 0) + NVL (mr.MRN_SALETAX, 0)) * -1) AS Tax
                        FROM Mretdetl mr
                            JOIN Pbilldetl pd ON pd.Bmc_Slno = mr.Bmc_Slno
                                  AND pd.IT_CODE = mr.It_code
                                  AND pd.ITC_DOCNO = mr.Itc_docno
                                  AND pd.ITC_DOCTYPE = mr.Itc_Doctype
                                  AND pd.Itc_Slno = mr.Itc_slno
                            JOIN Mretmast mm
                                ON mm.mrc_slno = mr.mrc_slno
                      WHERE     mm.mrc_retcncode IS NULL
                            AND mr.Mrc_Cancel <> 'Y'
                            AND mm.Mrc_Cancel <> 'Y'
                            AND mr.MRC_CACR IN ('C', 'R')
                            AND MR.MRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')  
                            AND MR.Mrd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND EXISTS (SELECT 1 FROM multihospital m WHERE m.MH_CODE = mr.MH_CODE)) A`;

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
//  -------> CHECKED
const getIpRefundDetl_one = async (conn_ora, bind) => {
  const sql = `SELECT 
                        SUM (ir.Rin_Netamt) * -1 AS Amt,
                        SUM (ir.Rin_Netamt + NVL (ir.Rin_Disamt, 0)) * -1 AS GrossAmt,
                        SUM (NVL (ir.Rin_Disamt, 0)) * -1 AS Discount,
                        0 AS Comp,
                        0 AS Tax
                FROM Iprefunditemdetl ir 
                JOIN Iprefundmast im ON im.Ric_Slno = ir.Ric_Slno
                WHERE ir.Ric_Type = 'PHY' 
                    AND im.Ric_Cacr IN ('C', 'R') -- Removed NVL for index usage
                    AND im.Ric_Cancel = 'N'
                    AND im.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND im.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND EXISTS (SELECT 1 FROM multihospital m WHERE m.MH_CODE = im.MH_CODE)`;
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

const getIpincomeSection_three = async (conn_ora, bind) => {
  const sql = `SELECT 
                      NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
                      NVL (g.Dg_grcode, 999) AS Code,
                      SUM ( CASE WHEN rm.RPC_CAcr IN ('C', 'R') THEN rd.rpn_netamt ELSE 0 END) AS Amt,
                      SUM (NVL (rd.RPN_TOTTAX, 0)) AS Tax,
                      SUM ( CASE WHEN rm.RPC_CAcr IN ('C', 'R') THEN rd.rpn_netamt + NVL (rd.rpn_disamt, 0) ELSE 0 END) AS GrossAmt,
                      SUM (CASE WHEN rm.RPC_CAcr = 'M' THEN rd.rpn_netamt ELSE 0 END) AS Comp,
                      SUM (NVL (rd.rpn_disamt, 0)) AS Discount
                  FROM Receiptmast rm JOIN Receiptdetl rd ON rm.RPC_SLNO = rd.RPC_SLNO
                      JOIN Prodescription pd ON rd.pd_code = pd.pd_code
                      JOIN Progroup pg ON pd.pg_code = pg.pg_code
                      LEFT JOIN Misincexpdtl d ON d.Pc_code = pg.pc_code AND d.Dg_type = 'R'
                      LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
                WHERE rm.RPC_COLLCNCODE IS NULL
                      AND (rm.RPC_CANCEL IS NULL OR rm.RPC_CANCEL <> 'C')  
                      AND rm.RPC_CAcr IN ('C', 'R', 'M')
                      AND RM.RPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND RM.RPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXISTS (SELECT 1 FROM multihospital m WHERE m.MH_CODE = rm.MH_CODE)
              GROUP BY g.Dg_grcode, g.Dg_desc
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

const getProcedureIncomeSection_one = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
         NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
         SUM ( (Billdetl.pdn_rate * pdn_qty) - NVL (Billdetl.bmn_disamt, 0))
            Amt,
         SUM (NVL (Billdetl.BDN_TOTTAX, 0) + NVL (Billdetl.Bdn_Totcess, 0)) tax,
         SUM ( (Billdetl.pdn_rate * pdn_qty)) GrossAmt,
         SUM (0) AS Comp,
         SUM (NVL (Billdetl.bmn_disamt, 0)) Discount
    FROM Billdetl,
         Billmast,
         Prodescription,
         Progroup,
         Misincexpdtl,
         Misincexpgroup,
         Opbillmast
   WHERE     Billmast.Bmc_Slno = Billdetl.Bmc_Slno
         AND Billdetl.Opc_Slno = Opbillmast.Opc_Slno
         AND Billdetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND Opbillmast.Opc_Cacr <> 'M'
         AND Billmast.Bmc_Cacr = 'O'
         AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
         AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
         AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND Opbillmast.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
         AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Billmast.IP_NO AND G.STATUS = 1)
         AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
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

const getPharamcyReturnSection_one = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
       SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
       SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
       SUM (0) AS Comp,
       SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
  FROM Mretdetl, Pbilldetl, Opbillmast
 WHERE     Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
       AND Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
       AND Pbilldetl.IT_CODE = Mretdetl.It_code
       AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
       AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
       AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
       AND (Mretdetl.Mrc_cancel IS NULL OR  Mretdetl.Mrc_cancel = 'N' )
       AND Mretdetl.MRC_CACR IN ('O')
       AND (Opbillmast.OPN_CANCEL IS NULL OR Opbillmast.OPN_CANCEL = 'N')
       AND Opbillmast.Opc_Cacr <> 'M'
       AND  EXISTS (SELECT 1 FROM multihospital MH WHERE MH.MH_CODE = OPBILLMAST.MH_CODE )
       AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
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

const getReceiptmasterSection_one = async (conn_ora, bind) => {
  const sql = `SELECT 
                    NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
                    NVL (g.Dg_grcode, 999) AS Code,
                    SUM ( CASE WHEN rm.RPC_CAcr IN ('C', 'R') THEN rd.rpn_netamt ELSE 0 END) AS Amt,
                    SUM (NVL (rd.RPN_TOTTAX, 0)) AS Tax,
                    SUM ( 
                    CASE WHEN rm.RPC_CAcr IN ('C', 'R') 
                    THEN rd.rpn_netamt + NVL (rd.rpn_disamt, 0)
                            ELSE NVL (rd.rpn_disamt, 0)
                    END) AS GrossAmt,
                    SUM (CASE WHEN rm.RPC_CAcr = 'M' THEN rd.rpn_netamt ELSE 0 END) AS Comp,
                    SUM (NVL (rd.rpn_disamt, 0)) AS Discount
            FROM Receiptmast rm 
            JOIN Receiptdetl rd ON rm.RPC_SLNO = rd.RPC_SLNO
            JOIN Prodescription pd ON rd.pd_code = pd.pd_code
            JOIN Progroup pg ON pd.pg_code = pg.pg_code 
            LEFT JOIN Misincexpdtl d ON d.Pc_code = pg.pc_code AND d.Dg_type = 'R'
            LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
          WHERE rm.RPC_COLLCNCODE IS NOT NULL
                AND rm.RPC_CANCEL = 'N' AND rm.RPC_CAcr IN ('C', 'R', 'M')
                AND rm.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND rm.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = rm.MH_CODE)
        GROUP BY g.Dg_grcode, g.Dg_desc
          HAVING SUM ( CASE WHEN rm.RPC_CAcr IN ('C', 'R') THEN rd.rpn_netamt ELSE 0 END) <> 0
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

const getPharmacyCollection_Two = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `SELECT SUM (NVL (pd.Bdn_amount, 0)) AS Amt,
       SUM (NVL (pd.Bdn_amount, 0) + NVL (pd.Bmn_disamt, 0)) AS GrossAmt,
       SUM (NVL (pd.Bmn_disamt, 0)) AS Discount, 
       0 AS Comp,
       SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS Tax
  FROM Pbillmast pm 
  JOIN Pbilldetl pd ON pd.Bmc_Slno = pm.Bmc_Slno
  JOIN Opbillmast om ON pd.Opc_Slno = om.Opc_Slno
  LEFT JOIN GTT_EXCLUDE_IP gtt ON gtt.IP_NO = pm.IP_NO AND gtt.STATUS = 2
 WHERE (pm.Bmc_cancel = 'N' OR pm.Bmc_cancel IS NULL )
       AND pm.Bmc_Cacr = 'O' AND om.Opc_Cacr <> 'M' 
       AND ( om.Opn_cancel = 'N' OR om.Opn_cancel IS NULL )
       AND gtt.IP_NO IS NULL
       AND OM.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND OM.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')   
       AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = om.MH_CODE)`;
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

const getIpRefundReceiptDetlSection_Two = async (conn_ora, bind) => {
  const sql = `SELECT NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
         NVL (g.Dg_grcode, 999) AS Code,
         SUM (NVL (rrd.rpn_netamt, 0)) * -1 AS Amt,
         SUM (NVL (rrd.RFN_TOTTAX, 0)) * -1 AS Tax,
         SUM (NVL (rrd.rpn_netamt, 0) + NVL (rrd.rpn_disamt, 0)) * -1 AS GrossAmt,
         0 AS Comp,
         SUM (NVL (rrd.rpn_disamt, 0)) * -1 AS Discount
    FROM Refundreceiptdetl rrd
         JOIN Refundreceiptmast rrm ON rrm.Rfc_Slno = rrd.Rfc_Slno
         JOIN Receiptdetl rd ON rrd.Rpc_Slno = rd.Rpc_Slno AND rrd.Rpc_Cnt = rd.Rpc_Cnt
         JOIN Opbillmast om ON rd.Opc_Slno = om.Opc_Slno
         JOIN Prodescription pd ON rrd.Pd_Code = pd.Pd_Code
         JOIN Progroup pg ON pd.Pg_Code = pg.Pg_Code
         LEFT JOIN Misincexpdtl d ON d.Pc_code = pg.pc_code AND d.Dg_type = 'R'
         LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
   WHERE (om.Opn_Cancel = 'N' OR om.Opn_Cancel IS NULL ) 
         AND (rrd.Rfc_Cancel = 'N' OR rrd.Rfc_Cancel IS NULL)
         AND rrm.Rfc_Cacr = 'O'
         AND om.Opc_Cacr <> 'M'
         AND om.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND om.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') 
         AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = om.MH_CODE)
GROUP BY g.Dg_grcode, g.Dg_desc
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

const getPharamcyCollection_three = async (conn_ora, bind) => {
  const sql = `SELECT SUM (A.Billamt) Amt,
       SUM (A.GrossAmt) GrossAmt,
       SUM (A.Discount) Discount,
       SUM (A.Comp) Comp,
       SUM (A.TAX) TAX
  FROM (SELECT SUM (
                  DECODE (Pbillmast.Bmc_Cacr,
                          'R', NVL (Pbilldetl.Bdn_amount, 0),
                          'C', NVL (Pbilldetl.Bdn_amount, 0),
                          0))
                  Billamt,
               SUM (
                  DECODE (Pbillmast.Bmc_Cacr,
                          'R', NVL (Pbilldetl.Bdn_amount, 0),
                          'C', NVL (Pbilldetl.Bdn_amount, 0),
                          0)
                  + (DECODE (Pbillmast.Bmc_Cacr,
                             'R', NVL (Pbilldetl.Bmn_disamt, 0),
                             'C', NVL (Pbilldetl.Bmn_disamt, 0),
                             0)))
                  GrossAmt,
               SUM (
                  DECODE (Pbillmast.Bmc_Cacr,
                          'R', NVL (Pbilldetl.Bmn_disamt, 0),
                          'C', NVL (Pbilldetl.Bmn_disamt, 0),
                          0))
                  Discount,
               SUM (
                  DECODE (Pbillmast.Bmc_Cacr,
                          'M', NVL (Pbilldetl.Bdn_amount, 0),
                          0))
                  AS Comp,
               SUM (
                  NVL (PBILLDETL.BMN_CESS, 0)
                  + NVL (PBILLDETL.BMN_SALETAX, 0))
                  TAX
          FROM Pbillmast, Pbilldetl
         WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
               AND pbillmast.BMC_COLLCNCODE IS NOT NULL
               AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
               AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
               AND Pbillmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') 
               AND Pbillmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
               AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        UNION ALL
        SELECT SUM (
                  NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (Mretdetl.MRN_DISAMT, 0))
               * -1
                  Billamt,
               SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
               SUM (NVL (Mretdetl.MRN_DISAMT, 0)) * -1 Discount,
               SUM (0) AS Comp,
               SUM (
                  NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0))
               * -1
                  TAX
          FROM Mretdetl, Pbilldetl, mretmast
         WHERE     Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
               AND Pbilldetl.IT_CODE = Mretdetl.It_code
               AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
               AND mretmast.mrc_slno = Mretdetl.mrc_slno
               AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
               AND Mretmast.mrc_retcncode IS NOT NULL
               AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
               AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
               AND NVL (mretmast.Mrc_cancel, 'N') = 'N'
               AND Mretdetl.MRC_CACR IN ('C', 'R')
               AND Mretmast.MRD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') 
               AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
               AND Mretmast.Mrd_RETDate <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') ) A`;
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

const getIpincomeSection_four = async (conn_ora, bind) => {
  const sql = `SELECT NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
            NVL (g.Dg_grcode, 999) AS Code,SUM (
            CASE WHEN bm.Bmc_Cacr IN ('C', 'R') THEN (bd.pdn_rate * bd.pdn_qty) - NVL (bd.bmn_disamt, 0) ELSE 0 END) AS Amt,
            SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.Bdn_Totcess, 0)) AS Tax,
            SUM ( CASE WHEN bm.Bmc_Cacr IN ('C', 'R') THEN (bd.pdn_rate * bd.pdn_qty) ELSE 0 END) AS GrossAmt,
            SUM ( CASE WHEN bm.Bmc_Cacr = 'M' THEN (bd.pdn_rate * bd.pdn_qty) - NVL (bd.bmn_disamt, 0) ELSE 0  END) AS Comp, 
            SUM ( CASE WHEN bm.Bmc_Cacr IN ('C', 'R') THEN NVL (bd.bmn_disamt, 0) ELSE 0 END) AS Discount
    FROM Billmast bm
         JOIN Billdetl bd ON bm.Bmc_Slno = bd.Bmc_Slno
         JOIN Prodescription pd ON bd.pd_code = pd.pd_code
         JOIN Progroup pg ON pd.pg_code = pg.pg_code
         LEFT JOIN Misincexpdtl d ON d.pc_code = pg.pc_code AND d.Dg_type = 'R'
         LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
   WHERE bm.BMC_COLLCNCODE IS NULL AND bm.Bmc_Cacr IN ('C', 'R', 'M') 
         AND (bm.BMC_CANCEL = 'N' or bm.BMC_CANCEL is null)
         AND bm.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND bm.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
         AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = bm.MH_CODE)
GROUP BY g.DG_GRCODE, g.DG_DESC`;
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

const getPharmacyReturnSection_three = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (mr.MRN_AMOUNT, 0) - NVL (mr.MRN_DISAMT, 0)) * -1 AS Amt,
       SUM (NVL (mr.MRN_AMOUNT, 0)) * -1 AS GrossAmt,
       SUM (NVL (mr.MRN_DISAMT, 0)) * -1 AS Discount,
       0 AS Comp,
       SUM (NVL (mr.MRN_CESS, 0) + NVL (mr.MRN_SALETAX, 0)) * -1 AS Tax
  FROM Mretdetl mr
       JOIN Pbillmast pm ON pm.Bmc_Slno = mr.Bmc_Slno
       JOIN Disbillmast dm ON pm.Dmc_Slno = dm.Dmc_Slno
       LEFT JOIN GTT_EXCLUDE_IP gtt ON gtt.IP_NO = dm.IP_NO AND gtt.STATUS = 2
 WHERE mr.MRC_CACR = 'I' 
       AND NVL (MR.Mrc_cancel, 'N') = 'N'
       AND NVL (DM.Dmc_Cancel, 'N') = 'N'
       AND dm.Dmc_Cacr <> 'M' 
       AND gtt.IP_NO IS NULL
       AND dm.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND dm.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = dm.MH_CODE)`;
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

const getProcedureIncomeSecition_two = async (conn_ora, bind) => {
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
         NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
         SUM (
            DECODE (
               billmast.Bmc_Cacr,
               'C', (Billdetl.pdn_rate * pdn_qty)
                    - NVL (Billdetl.bmn_disamt, 0),
               'R', (Billdetl.pdn_rate * pdn_qty)
                    - NVL (Billdetl.bmn_disamt, 0),
               0))
            Amt,
         SUM (NVL (Billdetl.BDN_TOTTAX, 0) + NVL (Billdetl.Bdn_Totcess, 0)) tax,
         SUM (
            DECODE (billmast.Bmc_Cacr,
                    'C', (Billdetl.pdn_rate * pdn_qty),
                    'R', (Billdetl.pdn_rate * pdn_qty)))
            GrossAmt,
         SUM (
            DECODE (
               billmast.Bmc_Cacr,
               'M', (Billdetl.pdn_rate * pdn_qty)
                    - NVL (Billdetl.bmn_disamt, 0),
               0))
            AS Comp,
         SUM (
            DECODE (billmast.Bmc_Cacr,
                    'C', (Billdetl.bmn_disamt),
                    'R', (Billdetl.bmn_disamt)))
            Discount
    FROM Billmast,
         Billdetl,
         Misincexpdtl,
         Prodescription,
         Progroup,
         Misincexpgroup
   WHERE     Billmast.Bmc_Slno = Billdetl.Bmc_Slno
         AND billmast.BMC_COLLCNCODE IS NOT NULL
         AND Billdetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Progroup.pc_code = Misincexpdtl.pc_code(+)
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Billmast.Bmc_Cacr IN ('C', 'R', 'M')
         AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
         AND Billmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
         AND Billmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
GROUP BY Misincexpgroup.DG_GRCODE, Misincexpgroup.DG_DESC
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

const getPharmacyCollection_four = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
       SUM (NVL (Pbilldetl.Bdn_amount, 0) + NVL (Pbilldetl.Bmn_disamt, 0))
          GrossAmt,
       SUM (NVL (Pbilldetl.Bmn_disamt, 0)) Discount,
       SUM (0) AS Comp,
       SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
  FROM Pbillmast, Disbillmast, Pbilldetl
 WHERE     pbillmast.bmc_slno = pbilldetl.bmc_slno
       AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
       AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
       AND Pbillmast.Bmc_Cacr = 'I'
       AND NVL (Dmc_Cancel, 'N') = 'N'
       AND Disbillmast.Dmc_Cacr <> 'M'
       AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP G WHERE G.IP_NO = Pbillmast.IP_NO AND G.STATUS = 2)
       AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
       AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
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

const getIpRefundDetlSection_three = async (conn_ora, bind) => {
  const sql = `SELECT NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
                      NVL (g.Dg_grcode, 999) AS Code,
                      SUM (NVL (rrd.rpn_netamt, 0)) * -1 AS Amt,
                      SUM (NVL (rrd.RFN_TOTTAX, 0)) * -1 AS Tax,
                      SUM (NVL (rrd.rpn_netamt, 0) + NVL (rrd.rpn_disamt, 0)) * -1 AS GrossAmt,
                      0 AS Comp,
                      SUM (NVL (rrd.rpn_disamt, 0)) * -1 AS Discount
                  FROM Refundreceiptmast rrm
                      JOIN Refundreceiptdetl rrd ON rrm.Rfc_Slno = rrd.Rfc_Slno
                      JOIN Prodescription pd ON rrd.pd_code = pd.pd_code
                      JOIN Progroup pg ON pd.pg_code = pg.pg_code
                      LEFT JOIN Misincexpdtl d ON d.Pc_code = pg.pc_code AND d.Dg_type = 'R'
                      LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
                WHERE  (rrm.Rfc_Cancel = 'N' OR rrm.Rfc_Cancel IS NULL)
                      AND rrm.Rfc_Cacr IN ('C', 'R')
                      AND rrd.Rfd_Date BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = rrm.MH_CODE)
              GROUP BY g.Dg_grcode, g.Dg_desc
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

const getIpincomeSection_five = async (conn_ora, bind) => {
  const sql = `SELECT NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
                      NVL (g.Dg_grcode, 999) AS Code,
                      SUM ( (bd.pdn_rate * bd.pdn_qty) - NVL (bd.bmn_disamt, 0)) AS Amt,
                      SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.Bdn_Totcess, 0)) AS Tax,
                      SUM ( (bd.pdn_rate * bd.pdn_qty)) AS GrossAmt,
                      0 AS Comp,
                      SUM (NVL (bd.bmn_disamt, 0)) AS Discount
                  FROM Billmast bm
                      JOIN Billdetl bd ON bm.Bmc_Slno = bd.Bmc_Slno
                      JOIN Disbillmast dm ON bm.Dmc_Slno = dm.Dmc_Slno
                      JOIN Prodescription pd ON bd.pd_code = pd.pd_code
                      JOIN Progroup pg ON pd.pg_code = pg.pg_code
                      LEFT JOIN Misincexpdtl d ON d.Pc_code = pg.pc_code AND d.Dg_type = 'R'
                      LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
                WHERE bm.Bmc_Cacr = 'I'
                      AND dm.Dmc_Cacr <> 'M'
                      AND NVL(bm.BMC_CANCEL, 'N') = 'N'
                      AND NVL(dm.Dmc_cancel, 'N') = 'N'
                      AND NOT EXISTS (SELECT 1 FROM GTT_EXCLUDE_IP gtt WHERE gtt.IP_NO = dm.IP_NO AND gtt.STATUS = 1)
                      AND dm.dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND dm.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = bm.MH_CODE)
              GROUP BY g.Dg_grcode, g.Dg_desc
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

const getIpRefundDetlSection_four = async (conn_ora, bind) => {
  const sql = `SELECT NVL (g.Dg_desc, 'Ungrouped') AS Dg_desc,
                        NVL (g.Dg_grcode, 999) AS Code,
                        SUM (NVL (rbd.rfn_netamt, 0)) * -1 AS Amt,
                        SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.Rfn_Totcess, 0)) * -1 AS Tax,
                        SUM (NVL (rbd.rfn_netamt, 0) + NVL (rbd.rfn_disamt, 0)) * -1 AS GrossAmt,
                        0 AS Comp,
                        SUM (NVL (rbd.rfn_disamt, 0)) * -1 AS Discount
                  FROM Refundbillmast rbm
                      JOIN Refundbilldetl rbd ON rbm.Rfc_Slno = rbd.Rfc_Slno
                      JOIN Billmast bm ON bm.Bmc_Slno = rbm.Bmc_Slno
                      JOIN Prodescription pd ON rbd.pd_code = pd.pd_code
                      JOIN Progroup pg ON pd.pg_code = pg.pg_code
                      LEFT JOIN Misincexpdtl d ON d.Pc_code = pg.pc_code AND d.Dg_type = 'R'
                      LEFT JOIN Misincexpgroup g ON g.dg_grcode = d.dg_grcode
                WHERE rbm.Rfc_Cacr IN ('C', 'R') 
                      AND NVL (rbm.Rfc_Cancel, 'N') <> 'C'
                      AND rbd.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND rbd.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                      AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = bm.MH_CODE)
              GROUP BY g.Dg_grcode, g.Dg_desc
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

const getCollectionPortion_one = async (conn_ora, bind) => {
  const sql = `SELECT SUM ( NVL (rm.RPN_CASH, 0) + NVL (rm.RPN_CARD, 0) + NVL (rm.RPN_CHEQUE, 0)) AS Amt
                    FROM Receiptmast rm
                  WHERE     rm.RPC_CACR IN ('C', 'R')
                        AND rm.RPC_CANCEL IS NULL
                        AND rm.RPC_COLLCNCODE IS NULL
                        AND rm.RPD_DATE 
                        BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = rm.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (om.OPN_CASH, 0) + NVL (om.OPN_CARD, 0) + NVL (om.OPN_CHEQUE, 0)) AS Amt
                    FROM Opbillmast om
                  WHERE om.OPC_CACR IN ('C', 'R') AND om.OPN_CANCEL IS NULL
                        AND om.OPD_DATE BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = om.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (bm.BMN_CASH, 0) + NVL (bm.BMN_CARD, 0) + NVL (bm.BMN_CHEQUE, 0)) AS Amt
                    FROM Billmast bm
                  WHERE     bm.Bmc_Cacr IN ('C', 'R')
                        AND bm.BMC_CANCEL IS NULL
                        AND bm.BMC_COLLCNCODE IS NULL
                        AND bm.BMD_DATE BETWEEN TO_DATE (:fromDate,'dd/MM/yyyy hh24:mi:ss') 
                        AND TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = bm.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (pm.BMN_CARD, 0) + NVL (pm.BMN_CASH, 0) + NVL (pm.BMN_CHEQUE, 0)) AS Amt
                    FROM Pbillmast pm
                  WHERE     pm.Bmc_Cacr IN ('C', 'R')
                        AND pm.Bmc_cancel = 'N'
                        AND pm.BMC_COLLCNCODE IS NULL
                        AND pm.BMD_DATE BETWEEN TO_DATE (:fromDate,'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = pm.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (ir.IRN_AMOUNT, 0) + NVL (ir.IRN_CARD, 0) + NVL (ir.IRN_CHEQUE, 0)  + NVL (ir.IRN_NEFT, 0))
                        - SUM ( NVL (ir.IRN_BALANCE, 0) + NVL (ir.IRN_REFCHEQ, 0) + NVL (ir.IRN_REFCARD, 0)) AS Amt
                    FROM IPRECEIPT ir 
                    JOIN Disbillmast dm ON dm.Dmc_Slno = ir.Dmc_Slno
                  WHERE ir.DMC_TYPE IN ('C', 'R') 
                  AND ir.IRC_CANCEL IS NULL
                  AND dm.DMD_DATE BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND ir.IRD_DATE BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND NOT EXISTS  (SELECT 1 FROM GTT_EXCLUDE_IP gtt WHERE gtt.IP_NO = dm.IP_NO AND gtt.STATUS = 1)
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = dm.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (bm.BMN_CASH, 0) + NVL (bm.BMN_CARD, 0) + NVL (bm.BMN_CHEQUE, 0)) AS Amt
                    FROM Billmast bm
                  WHERE     bm.Bmc_Cacr IN ('C', 'R')
                        AND bm.BMC_CANCEL IS NULL
                        AND bm.BMC_COLLCNCODE IS NOT NULL
                        AND bm.BMD_COLLDATE BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = bm.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (rm.RPN_CASH, 0) + NVL (rm.RPN_CARD, 0) + NVL (rm.RPN_CHEQUE, 0)) AS Amt
                    FROM Receiptmast rm
                  WHERE     rm.RPC_CACR IN ('C', 'R')
                        AND rm.RPC_CANCEL IS NULL
                        AND rm.RPC_COLLCNCODE IS NOT NULL
                        AND rm.RPD_COLLDATE BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = rm.MH_CODE)
                  UNION ALL
                  SELECT SUM ( NVL (pm.BMN_CARD, 0) + NVL (pm.BMN_CASH, 0) + NVL (pm.BMN_CHEQUE, 0)) AS Amt
                    FROM Pbillmast pm
                  WHERE     pm.Bmc_Cacr IN ('C', 'R')
                        AND NVL (pm.Bmc_cancel, 'N') = 'N'
                        AND pm.BMC_COLLCNCODE IS NOT NULL
                        AND pm.BMD_COLLDATE BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate,'dd/MM/yyyy hh24:mi:ss')
                        AND EXISTS (SELECT 1 FROM multihospital mh WHERE mh.MH_CODE = pm.MH_CODE)`;
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

const getCollectionPortion_two = async (conn_ora, bind) => {
  // INCLUDED
  const sql = `WITH date_params
                  AS (
                      SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS to_date FROM DUAL
                  ), MH AS ( SELECT MH_CODE FROM multihospital),
                  EXCLUDE_IP AS ( SELECT IP_NO FROM GTT_EXCLUDE_IP G WHERE G.STATUS = 1)
                  SELECT SUM (Amt) Amt, SUM (Tax) Tax,IP_NO
                    FROM (
                          SELECT SUM ( (  NVL (Ipreceipt.irn_amount, 0) + NVL (Ipreceipt.irn_cheque, 0) + NVL (Ipreceipt.irn_card, 0) + NVL (Ipreceipt.irn_neft, 0))
                                    - (  NVL (Ipreceipt.irn_balance, 0) + NVL (Ipreceipt.IRN_REFCHEQ, 0)  + NVL (Ipreceipt.irn_refcard, 0))) Amt,
                                0 tax,
                                DISBILLMAST.IP_NO
                            FROM ipreceipt 
                            JOIN Disbillmast ON Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
                            CROSS JOIN date_params dp
                          WHERE Disbillmast.Dmd_date < dp.from_date
                                AND Ipreceipt.Dmc_type IN ('C', 'R')
                                AND IRD_DATE >= dp.from_date
                                AND ird_date <= dp.to_date
                                AND Irc_cancel IS NULL
                                GROUP BY DISBILLMAST.IP_NO       
                      UNION ALL
                            SELECT SUM ( DECODE (RECEIPTMAST.RPC_CACR,  'R', NVL (RPN_CASH, 0), 'C', NVL (RPN_CASH, 0), 0))
                                  + SUM ( DECODE (RECEIPTMAST.RPC_CACR, 'R', NVL (RPN_CHEQUE, 0), 'C', NVL (RPN_CHEQUE, 0), 0))
                                  + SUM ( DECODE (RECEIPTMAST.RPC_CACR, 'R', NVL (RPN_CARD, 0), 'C', NVL (RPN_CARD, 0), 0)) Amt,
                                  0 Tax,
                                  NULL "IP_NO"
                              FROM RECEIPTMAST
                              JOIN MH ON MH.MH_CODE = RECEIPTMAST.MH_CODE 
                              CROSS JOIN date_params dp
                            WHERE (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
                                  AND RECEIPTMAST.RPC_COLLCNCODE IS NOT NULL
                                  AND RECEIPTMAST.RPD_COLLDATE >= dp.from_date
                                  AND RECEIPTMAST.RPD_COLLDATE <= dp.to_date
                                  AND RECEIPTMAST.RPD_DATE < TRUNC (dp.to_date)
                      UNION ALL
                          SELECT (SUM ( DECODE (REFUNDRECEIPTMAST.RFC_CACR, 'C', NVL (REFUNDRECEIPTMAST.RFN_CASH, 0),  'R', NVL (REFUNDRECEIPTMAST.RFN_CASH, 0), 0))
                                    + SUM ( DECODE (REFUNDRECEIPTMAST.RFC_CACR, 'C', NVL (REFUNDRECEIPTMAST.RFN_CHEQUE, 0), 'R', NVL (REFUNDRECEIPTMAST.RFN_CHEQUE, 0), 0))
                                    + SUM ( DECODE (REFUNDRECEIPTMAST.RFC_CACR, 'C', NVL (REFUNDRECEIPTMAST.RFN_CARD, 0), 'R', NVL (REFUNDRECEIPTMAST.RFN_CARD, 0), 0))) * -1 Amt,
                                  0 Tax,
                                  NULL "IP_NO"
                            FROM REFUNDRECEIPTMAST
                            JOIN MH ON MH.MH_CODE = REFUNDRECEIPTMAST.MH_CODE
                            CROSS JOIN date_params dp 
                            WHERE REFUNDRECEIPTMAST.RFD_RETDATE >= dp.from_date
                                  AND REFUNDRECEIPTMAST.RFD_RETDATE <= dp.to_date
                                  AND REFUNDRECEIPTMAST.RFD_DATE < TRUNC (dp.to_date)
                                  AND (NVL (REFUNDRECEIPTMAST.RFC_CANCEL, 'N') = 'N')
                                  AND REFUNDRECEIPTMAST.RFC_RETCNCODE IS NOT NULL
                                  AND REFUNDRECEIPTMAST.ROC_SLNO IS NULL
                          UNION ALL
                          SELECT SUM ( DECODE (BILLMAST.BMC_CACR, 'C', NVL (BILLMAST.BMN_CASH, 0), 'R', NVL (BILLMAST.BMN_CASH, 0),  0))
                                  + SUM ( DECODE (BILLMAST.BMC_CACR,'C', NVL (BILLMAST.BMN_CHEQUE, 0), 'R', NVL (BILLMAST.BMN_CHEQUE, 0), 0))
                                  + SUM ( DECODE (BILLMAST.BMC_CACR, 'C', NVL (BILLMAST.BMN_CARD, 0), 'R', NVL (BILLMAST.BMN_CARD, 0), 0)) Amt,
                                  0 Tax,
                                  BILLMAST.IP_NO
                              FROM BILLMAST
                              JOIN MH ON MH.MH_CODE = billmast.mh_code
                              LEFT JOIN EXCLUDE_IP ON EXCLUDE_IP.IP_NO = BILLMAST.IP_NO
                              CROSS JOIN date_params dp 
                            WHERE     (NVL (BILLMAST.BMC_CANCEL, 'N') = 'N')
                                  AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                                  AND BILLMAST.BMD_COLLDATE >= dp.from_date
                                  AND BILLMAST.BMD_COLLDATE <= dp.to_date
                                  AND BILLMAST.BMD_DATE < TRUNC (dp.to_date)
                                  AND EXCLUDE_IP.IP_NO IS NULL
                                  GROUP BY BILLMAST.IP_NO
                          UNION ALL
                          SELECT (SUM ( DECODE (REFUNDBILLMAST.RFC_CACR, 'C', NVL (REFUNDBILLMAST.RFN_CASH, 0),  'R', NVL (REFUNDBILLMAST.RFN_CASH, 0),  0))
                                    + SUM ( DECODE (REFUNDBILLMAST.RFC_CACR, 'C', NVL (REFUNDBILLMAST.RFN_CHEQUE, 0), 'R', NVL (REFUNDBILLMAST.RFN_CHEQUE, 0),  0))
                                    + SUM ( DECODE (REFUNDBILLMAST.RFC_CACR, 'C', NVL (REFUNDBILLMAST.RFN_CARD, 0),  'R', NVL (REFUNDBILLMAST.RFN_CARD, 0), 0))) * -1 AS Amt,
                                  0 Tax,
                                  BILLMAST.IP_NO
                            FROM REFUNDBILLMAST 
                            JOIN BILLMAST ON BILLMAST.BMC_SLNO = REFUNDBILLMAST.BMC_SLNO
                            JOIN MH ON MH.MH_CODE = refundbillmast.MH_CODE
                            LEFT JOIN EXCLUDE_IP ON EXCLUDE_IP.IP_NO = BILLMAST.IP_NO 
                            CROSS JOIN date_params dp
                            WHERE REFUNDBILLMAST.RFD_RETDATE >= dp.from_date
                                  AND REFUNDBILLMAST.RFD_RETDATE <= dp.to_date
                                  AND (NVL (REFUNDBILLMAST.RFC_CANCEL, 'N') = 'N')
                                  AND REFUNDBILLMAST.RFC_RETCNCODE IS NOT NULL
                                  AND REFUNDBILLMAST.RFD_DATE < TRUNC (dp.to_date)
                                  AND REFUNDBILLMAST.ROC_SLNO IS NULL
                                  AND EXCLUDE_IP.IP_NO IS NULL 
                                  GROUP BY BILLMAST.IP_NO
                          UNION ALL
                          SELECT SUM ( DECODE (PBILLMAST.BMC_CACR, 'C', NVL (PBILLMAST.BMN_CASH, 0), 'R', NVL (PBILLMAST.BMN_CASH, 0), 0))
                                  + SUM ( DECODE (PBILLMAST.BMC_CACR, 'C', NVL (PBILLMAST.BMN_CHEQUE, 0), 'R', NVL (PBILLMAST.BMN_CHEQUE, 0), 0))
                                  + SUM ( DECODE (PBILLMAST.BMC_CACR, 'C', NVL (PBILLMAST.BMN_CARD, 0), 'R', NVL (PBILLMAST.BMN_CARD, 0), 0))  Amt,
                                  0 Tax,PBILLMAST.IP_NO
                              FROM PBILLMAST
                              JOIN MH ON MH.MH_CODE = pbillmast.MH_CODE
                              CROSS JOIN date_params dp 
                            WHERE (NVL (PBILLMAST.BMC_CANCEL, 'N') = 'N')
                                  AND PBILLMAST.BMC_COLLCNCODE IS NOT NULL
                                  AND PBILLMAST.BMC_CACR IN ('C', 'R')
                                  AND PBILLMAST.BMD_COLLDATE >= dp.from_date
                                  AND PBILLMAST.BMD_COLLDATE <= dp.to_date
                                  AND PBILLMAST.BMD_DATE < TRUNC (dp.to_date)
                          GROUP BY PBILLMAST.IP_NO
                          HAVING  SUM(NVL(PBILLMAST.BMN_CASH, 0)) <> 0
                                  OR SUM(NVL(PBILLMAST.BMN_CHEQUE, 0)) <> 0
                                  OR SUM(NVL(PBILLMAST.BMN_CARD, 0)) <> 0
                                  OR SUM( CASE  WHEN PBILLMAST.BMC_CACR IN ('O', 'I', 'M')  THEN NVL(PBILLMAST.BMN_NETAMT, 0) ELSE 0 END ) <> 0                
                          UNION ALL
                          SELECT (SUM ( DECODE (MRC_CACR, 'C', NVL (MRN_CASH, 0),  'R', NVL (MRN_CASH, 0),  0))
                                    + SUM ( DECODE (MRC_CACR,  'C', NVL (MRETMAST.MRN_CHEQUE, 0), 'R', NVL (MRETMAST.MRN_CHEQUE, 0), 0))
                                    + SUM ( DECODE (MRC_CACR, 'C', NVL (MRETMAST.MRN_CARD, 0), 'R', NVL (MRETMAST.MRN_CARD, 0),  0)))  * -1 Amt,
                                  0 Tax,NULL IP_NO
                              FROM MRETMAST
                              JOIN MH ON MH.MH_CODE = MRETMAST.MH_CODE
                              CROSS JOIN date_params dp
                            WHERE NVL (MRETMAST.MRC_CANCEL, 'N') = 'N'
                                  AND MRETMAST.MRC_RETCNCODE IS NOT NULL
                                  AND MRETMAST.MRD_RETDATE >= dp.from_date
                                  AND MRETMAST.MRD_RETDATE <= dp.to_date
                                  AND MRETMAST.MRD_DATE < TRUNC (dp.to_date)
                                  AND MRETMAST.MRC_CACR IN ('C', 'R')
                          GROUP BY 
                              CASE
                                  WHEN TRIM(MRETMAST.MRC_IPOP) IN ('OP', 'IP') THEN 'OP'
                              ELSE 'OP'
                              END
                          UNION ALL
                            SELECT SUM (DECODE (OPBILLMAST.OPC_CACR, 'M', 0, NVL (OPN_CASH, 0)))
                                  + SUM ( DECODE (OPBILLMAST.OPC_CACR, 'M', 0, NVL (OPN_CHEQUE, 0)))
                                  + SUM ( DECODE (OPBILLMAST.OPC_CACR, 'M', 0, NVL (OPN_CARD, 0))) Amt,
                                  0 Tax,NULL IP_NO
                              FROM OPBILLMAST
                              JOIN MH ON MH.MH_CODE = OPBILLMAST.MH_CODE
                              CROSS JOIN date_params dp
                            WHERE  (NVL (OPBILLMAST.OPN_CANCEL, 'N') = 'N')
                                  AND OPBILLMAST.OPC_CACR IN ('C', 'R')
                                  AND Cn_Code IS NOT NULL
                                  AND OPBILLMAST.OPD_DATE >= dp.from_date
                                  AND OPBILLMAST.OPD_DATE <= dp.to_date
                                  AND OPBILLMAST.OPD_DATE < TRUNC (dp.to_date)
                          GROUP BY 'OP'
                          ) GROUP BY IP_NO`;
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

const getPerttyCash = async (conn_ora, bind) => {
  const sql = `SELECT SUM (Amt) Amt
  FROM (SELECT SUM (
                  DECODE (Ippettycash.Pcc_Type,
                          'R', NVL (Ippettycash.Pcn_Amount, 0),
                          'P', NVL (Ippettycash.Pcn_Amount, 0) * -1))
                  AS Amt
          FROM Ippettycash
         WHERE NVL (Ippettycash.Pcc_Cancel, 'N') = 'N'
               AND NVL (Ippettycash.Pcn_Amount, 0) <> 0
               AND Ippettycash.Pcd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Ippettycash.Pcd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
               AND IPPETTYCASH.ITC_MHCODE IN
                      (SELECT MH_CODE FROM multihospital)
        UNION ALL
        SELECT SUM (
                  DECODE (Oppettycash.Pcc_Type,
                          'R', NVL (Oppettycash.Pcn_Amount, 0),
                          'P', NVL (Oppettycash.Pcn_Amount, 0) * -1))
                  AS Amt
          FROM Oppettycash
         WHERE NVL (Oppettycash.Pcc_Cancel, 'N') = 'N'
               AND NVL (Oppettycash.Pcn_Amount, 0) <> 0
               AND Oppettycash.Pcd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Oppettycash.Pcd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
               AND OPPETTYCASH.PCC_MHCODE IN
                      (SELECT MH_CODE FROM multihospital)
        UNION ALL
        SELECT SUM (
                  DECODE (Billpettycash.Pcc_Type,
                          'R', NVL (Billpettycash.Pcn_Amount, 0),
                          'P', NVL (Billpettycash.Pcn_Amount, 0) * -1))
                  AS Amt
          FROM Billpettycash
         WHERE NVL (Billpettycash.Pcc_Cancel, 'N') = 'N'
               AND NVL (Billpettycash.Pcn_Amount, 0) <> 0
               AND Billpettycash.Pcd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Billpettycash.Pcd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
               AND BILLPETTYCASH.PCC_MHCODE IN
                      (SELECT MH_CODE FROM multihospital)
        UNION ALL
        SELECT SUM (
                  DECODE (Phpettycash.Pcc_Type,
                          'R', NVL (Phpettycash.Pcn_Amount, 0),
                          'P', NVL (Phpettycash.Pcn_Amount, 0) * -1))
                  AS Amt
          FROM Phpettycash
         WHERE NVL (Phpettycash.Pcc_Cancel, 'N') = 'N'
               AND NVL (Phpettycash.Pcn_Amount, 0) <> 0
               AND Phpettycash.Pcd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Phpettycash.Pcd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
               AND PHPETTYCASH.PCC_MHCODE IN
                      (SELECT MH_CODE FROM multihospital))`;
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
const getCollectionPortion_three = async (conn_ora, bind) => {
  const sql = `WITH date_params AS ( SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     EXCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 4)
SELECT 
    SUM (Amt) AS Amt, 
    SUM (Tax) AS Tax
FROM (
         SELECT 
                            SUM (NVL (rcm.RCN_CASH, 0) + NVL (rcm.RCN_CHK, 0)+ NVL (rcm.RCN_DD, 0) + NVL (rcm.RCN_CARD, 0) + NVL (rcm.RCN_NEFT, 0)) AS Amt,
                            0 AS Tax,
                            RCM.RCC_SLNO,
                            RCM.RC_NO
                      FROM RECPCOLLECTIONMAST rcm
                           JOIN MH ON MH.MH_CODE = rcm.MH_CODE
                           CROSS JOIN date_params dp
                     WHERE rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                           AND rcm.RCC_CANCEL IS NULL
                           AND EXISTS (SELECT 1 FROM RECPCOLLECTIONDETL rcd WHERE rcd.RCC_SLNO = rcm.RCC_SLNO AND rcd.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE AND rcd.MODULES <> 'IPC')
                    HAVING SUM ( NVL (rcm.RCN_CASH, 0) + NVL (rcm.RCN_CHK, 0) + NVL (rcm.RCN_DD, 0)  + NVL (rcm.RCN_CARD, 0)  + NVL (rcm.RCN_NEFT, 0)) > 0
                    GROUP BY rcm.RCN_CASH,rcm.RCN_CHK,rcm.RCN_DD,rcm.RCN_CARD,rcm.RCN_NEFT,RCM.RCC_SLNO,RCM.RC_NO
                    UNION 
                    SELECT 
                        SUM ( NVL (rcm.RCN_CASH, 0) + NVL (rcm.RCN_CHK, 0) + NVL (rcm.RCN_DD, 0) + NVL (rcm.RCN_CARD, 0) + NVL (rcm.RCN_NEFT, 0)) AS Amt,
                        0 AS Tax,
                        RCM.RCC_SLNO,
                        RCM.RC_NO
                    FROM RECPCOLLECTIONMAST rcm
                           JOIN MH ON MH.MH_CODE = rcm.MH_CODE
                           CROSS JOIN date_params dp
                    WHERE rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                           AND rcm.RCC_CANCEL IS NULL
                           AND EXISTS (
                                SELECT 1 FROM RECPCOLLECTIONDETL rcd 
                                LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = rcd.IP_NO 
                                WHERE rcd.RCC_SLNO = rcm.RCC_SLNO 
                                    AND rcd.RCD_DATE BETWEEN dp.from_date 
                                    AND dp.TO_DATE
                                    AND rcd.MODULES = 'IPC' 
                                    AND ex.IP_NO IS NULL)
                    HAVING SUM (NVL (rcm.RCN_CASH, 0)  + NVL (rcm.RCN_CHK, 0) + NVL (rcm.RCN_DD, 0) + NVL (rcm.RCN_CARD, 0) + NVL (rcm.RCN_NEFT, 0)) > 0
                    GROUP BY rcm.RCN_CASH,rcm.RCN_CHK,rcm.RCN_DD,rcm.RCN_CARD,rcm.RCN_NEFT,RCM.RCC_SLNO,RCM.RC_NO
                    UNION
                    SELECT 
                        -1 * SUM ( NVL (rcm.RFN_CASH, 0) + NVL (rcm.RFN_CHK, 0) + NVL (rcm.RFN_DD, 0) + NVL (rcm.RFN_CARD, 0)) AS Amt,
                        0 AS Tax,
                        RCM.RCC_SLNO,
                        RCM.RC_NO
                    FROM RECPCOLLECTIONMAST rcm
                           JOIN MH ON MH.MH_CODE = rcm.MH_CODE
                           CROSS JOIN date_params dp
                    WHERE rcm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                           AND NVL (rcm.RCC_CANCEL, 'N') = 'N'
                           AND EXISTS (
                                SELECT 1 FROM    RECPCOLLECTIONDETL rcd 
                                LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = rcd.IP_NO
                                WHERE rcd.RCC_SLNO = rcm.RCC_SLNO
                                AND rcd.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE AND ex.IP_NO IS NULL)
                    GROUP BY rcm.RCN_CASH,rcm.RCN_CHK,rcm.RCN_DD,rcm.RCN_CARD,rcm.RCN_NEFT,RCM.RCC_SLNO,RCM.RC_NO
                    UNION
                    SELECT 
                        SUM (NVL (rcm.RCN_CASH, 0) + NVL (rcm.RCN_CHK, 0) + NVL (rcm.RCN_DD, 0) + NVL (rcm.RCN_CARD, 0) + NVL (rcm.RCN_NEFT, 0)) AS Amt,
                        0 AS Tax,
                        RCM.RCC_SLNO,
                        RCM.RC_NO
                      FROM RECPCOLLECTIONMAST rcm
                           JOIN MH ON MH.MH_CODE = rcm.MH_CODE
                           CROSS JOIN date_params dp
                     WHERE rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                           AND rcm.RCC_CANCEL IS NULL
                           AND NOT EXISTS (SELECT 1 FROM RECPCOLLECTIONDETL rcd WHERE rcd.RCC_SLNO = rcm.RCC_SLNO AND rcd.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE)
                    HAVING SUM (NVL (rcm.RCN_CASH, 0) + NVL (rcm.RCN_CHK, 0) + NVL (rcm.RCN_DD, 0) + NVL (rcm.RCN_CARD, 0) + NVL (rcm.RCN_NEFT, 0)) > 0 
                    GROUP BY rcm.RCN_CASH,rcm.RCN_CHK,rcm.RCN_DD,rcm.RCN_CARD,rcm.RCN_NEFT,RCM.RCC_SLNO,RCM.RC_NO
     ) A `;
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

// const getCollectionPortion_three = async (conn_ora, bind) => {
//   const sql = `WITH date_params AS ( SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
//      MH AS (SELECT MH_CODE FROM multihospital),
//      EXCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 4)
// SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
//   FROM (
//         SELECT SUM (
//                     NVL (rcm.RCN_CASH, 0)
//                   + NVL (rcm.RCN_CHK, 0)
//                   + NVL (rcm.RCN_DD, 0)
//                   + NVL (rcm.RCN_CARD, 0)
//                   + NVL (rcm.RCN_NEFT, 0))
//                   AS Amt,
//                0 AS Tax
//           FROM RECPCOLLECTIONMAST rcm
//                JOIN MH
//                   ON MH.MH_CODE = rcm.MH_CODE
//                CROSS JOIN date_params dp
//          WHERE rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
//                AND rcm.RCC_CANCEL IS NULL
//                AND EXISTS
//                       (SELECT 1
//                          FROM RECPCOLLECTIONDETL rcd
//                         WHERE rcd.RCC_SLNO = rcm.RCC_SLNO
//                               AND rcd.RCD_DATE BETWEEN dp.from_date
//                                                    AND dp.TO_DATE
//                               AND rcd.MODULES <> 'IPC')
//         HAVING SUM (
//                     NVL (rcm.RCN_CASH, 0)
//                   + NVL (rcm.RCN_CHK, 0)
//                   + NVL (rcm.RCN_DD, 0)
//                   + NVL (rcm.RCN_CARD, 0)
//                   + NVL (rcm.RCN_NEFT, 0)) > 0
//         UNION ALL
//         SELECT SUM (
//                     NVL (rcm.RCN_CASH, 0)
//                   + NVL (rcm.RCN_CHK, 0)
//                   + NVL (rcm.RCN_DD, 0)
//                   + NVL (rcm.RCN_CARD, 0)
//                   + NVL (rcm.RCN_NEFT, 0))
//                   AS Amt,
//                0 AS Tax
//           FROM RECPCOLLECTIONMAST rcm
//                JOIN MH
//                   ON MH.MH_CODE = rcm.MH_CODE
//                CROSS JOIN date_params dp
//          WHERE rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
//                AND rcm.RCC_CANCEL IS NULL
//                AND EXISTS
//                       (SELECT 1
//                          FROM    RECPCOLLECTIONDETL rcd
//                               LEFT JOIN
//                                  EXCLUDE_IP ex
//                               ON ex.IP_NO = rcd.IP_NO
//                         WHERE rcd.RCC_SLNO = rcm.RCC_SLNO
//                               AND rcd.RCD_DATE BETWEEN dp.from_date
//                                                    AND dp.TO_DATE
//                               AND rcd.MODULES = 'IPC'
//                               AND ex.IP_NO IS NULL)
//         HAVING SUM (
//                     NVL (rcm.RCN_CASH, 0)
//                   + NVL (rcm.RCN_CHK, 0)
//                   + NVL (rcm.RCN_DD, 0)
//                   + NVL (rcm.RCN_CARD, 0)
//                   + NVL (rcm.RCN_NEFT, 0)) > 0
//         UNION ALL
//         SELECT -1
//                * SUM (
//                       NVL (rcm.RFN_CASH, 0)
//                     + NVL (rcm.RFN_CHK, 0)
//                     + NVL (rcm.RFN_DD, 0)
//                     + NVL (rcm.RFN_CARD, 0))
//                   AS Amt,
//                0 AS Tax
//           FROM RECPCOLLECTIONMAST rcm
//                JOIN MH
//                   ON MH.MH_CODE = rcm.MH_CODE
//                CROSS JOIN date_params dp
//          WHERE rcm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
//                AND NVL (rcm.RCC_CANCEL, 'N') = 'N'
//                AND EXISTS
//                       (SELECT 1
//                          FROM    RECPCOLLECTIONDETL rcd
//                               LEFT JOIN
//                                  EXCLUDE_IP ex
//                               ON ex.IP_NO = rcd.IP_NO
//                         WHERE rcd.RCC_SLNO = rcm.RCC_SLNO
//                               AND rcd.RCD_DATE BETWEEN dp.from_date
//                                                    AND dp.TO_DATE
//                               AND ex.IP_NO IS NULL)
//         UNION ALL
//         SELECT SUM (
//                     NVL (rcm.RCN_CASH, 0)
//                   + NVL (rcm.RCN_CHK, 0)
//                   + NVL (rcm.RCN_DD, 0)
//                   + NVL (rcm.RCN_CARD, 0)
//                   + NVL (rcm.RCN_NEFT, 0))
//                   AS Amt,
//                0 AS Tax
//           FROM RECPCOLLECTIONMAST rcm
//                JOIN MH
//                   ON MH.MH_CODE = rcm.MH_CODE
//                CROSS JOIN date_params dp
//          WHERE rcm.RCD_DATE BETWEEN dp.from_date AND dp.TO_DATE
//                AND rcm.RCC_CANCEL IS NULL
//                AND NOT EXISTS
//                           (SELECT 1
//                              FROM RECPCOLLECTIONDETL rcd
//                             WHERE rcd.RCC_SLNO = rcm.RCC_SLNO
//                                   AND rcd.RCD_DATE BETWEEN dp.from_date
//                                                        AND dp.TO_DATE)
//         HAVING SUM (
//                     NVL (rcm.RCN_CASH, 0)
//                   + NVL (rcm.RCN_CHK, 0)
//                   + NVL (rcm.RCN_DD, 0)
//                   + NVL (rcm.RCN_CARD, 0)
//                   + NVL (rcm.RCN_NEFT, 0)) > 0)`;
//   const result = await conn_ora.execute(
//     sql,
//     {
//       fromDate: bind.from,
//       toDate: bind.to,
//     },
//     {outFormat: oracledb.OUT_FORMAT_OBJECT},
//   );
//   return result.rows;
// };
// INCLUDED
const getIpRefundDetlSection_five = async (conn_ora, bind) => {
  const sql = `WITH date_params AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     EXCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
  FROM (
        SELECT -1 * SUM ( NVL (rrm.RFN_CASH, 0) + NVL (rrm.RFN_CARD, 0) + NVL (rrm.RFN_CHEQUE, 0)) AS Amt,
               -1 * SUM (NVL (rrm.RFN_TOTTAX, 0)) AS Tax
          FROM REFUNDRECEIPTMAST rrm
               JOIN MH ON MH.MH_CODE = rrm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     rrm.RFC_CACR IN ('C', 'R')
               AND rrm.RFC_CANCEL IS NULL
               AND rrm.RFC_RETCNCODE IS NULL
               AND rrm.ROC_SLNO IS NULL
               AND (   NVL (rrm.RFN_CASH, 0) > 0
                    OR NVL (rrm.RFN_CARD, 0) > 0
                    OR NVL (rrm.RFN_CHEQUE, 0) > 0)
               AND rrm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        SELECT -1 * SUM ( NVL (rbm.RFN_CASH, 0)  + NVL (rbm.RFN_CARD, 0) + NVL (rbm.RFN_CHEQUE, 0)) AS Amt,
               -1 * SUM (NVL (rbm.RFN_TOTTAX, 0)) AS Tax
          FROM REFUNDBILLMAST rbm
               JOIN MH ON MH.MH_CODE = rbm.MH_CODE
               CROSS JOIN date_params dp
         WHERE     rbm.RFC_CACR IN ('C', 'R')
               AND rbm.RFC_CANCEL IS NULL
               AND rbm.RFC_RETCNCODE IS NULL
               AND rbm.ROC_SLNO IS NULL
               AND (NVL (rbm.RFN_CASH, 0) > 0
                    OR NVL (rbm.RFN_CARD, 0) > 0
                    OR NVL (rbm.RFN_CHEQUE, 0) > 0)
               AND rbm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        SELECT -1 * SUM ( NVL (mr.MRN_CASH, 0) + NVL (mr.MRN_CARD, 0) + NVL (mr.MRN_CHEQUE, 0)) AS Amt, 
                    -1 * SUM ( NVL (mr.MRN_SALETAXCH, 0) + NVL (mr.MRN_SALETAXCR, 0) + NVL (mr.MRN_CESSCH, 0) + NVL (mr.MRN_CESSCR, 0)) AS Tax
          FROM MRETMAST mr
               JOIN MH
                  ON MH.MH_CODE = mr.MH_CODE
               CROSS JOIN date_params dp
         WHERE     mr.MRC_CACR IN ('C', 'R')
               AND NVL (mr.MRC_CANCEL, 'N') = 'N'
               AND mr.MRC_RETCNCODE IS NULL
               AND (   NVL (mr.MRN_CASH, 0) > 0
                    OR NVL (mr.MRN_CARD, 0) > 0
                    OR NVL (mr.MRN_CHEQUE, 0) > 0)
               AND mr.MRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        UNION ALL
        SELECT -1 * SUM ( NVL (irf.IRF_CASH, 0)  + NVL (irf.IRF_CARD, 0) + NVL (irf.IRF_CHEQUE, 0)) AS Amt,
               0 AS Tax
          FROM IPRECEIPTREFUND irf
               JOIN MH ON MH.MH_CODE = irf.IRC_MHCODE
               LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = irf.IP_NO
               CROSS JOIN date_params dp
         WHERE irf.IRF_CACR = 'C' AND irf.IRF_CANCEL IS NULL
               AND (   NVL (irf.IRF_CASH, 0) > 0
                    OR NVL (irf.IRF_CARD, 0) > 0
                    OR NVL (irf.IRF_CHEQUE, 0) > 0)
               AND irf.IRF_DATE BETWEEN dp.from_date AND dp.TO_DATE
               AND ex.IP_NO IS NULL)`;
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

const getCollectionPortion_four = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Opbillmast.OPN_NETAMT, 0)) AS Amt,
                SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
            FROM Opbillmast
            WHERE Opbillmast.OPC_CACR = 'M' AND Opbillmast.OPN_CANCEL IS NULL
                AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            UNION ALL
            SELECT SUM (NVL (Disbillmast.DMN_NETAMT, 0)) Amt,
                SUM (
                    DECODE (
                        NVL (Disbillmast.Dmc_Cancel, 'N'),
                        'N',   NVL (DMN_SALESTAXCH, 0)
                            + NVL (DMN_SALESTAXCR, 0)
                            + NVL (DMN_CESSCH, 0)
                            + NVL (DMN_CESSCR, 0),
                        0))
                    TAX
            FROM Disbillmast
            WHERE Dmc_Cacr = 'M' AND Dmc_Cancel IS NULL
                AND DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                AND DMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
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

const getDiscount = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (RECPCOLLECTIONMAST.RCN_DISCOUNT, 0)) AS Discount
                FROM RECPCOLLECTIONMAST
                WHERE RECPCOLLECTIONMAST.RCD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECPCOLLECTIONMAST.RCD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND NVL (RECPCOLLECTIONMAST.RCC_CANCEL, 'N') = 'N'
                HAVING SUM (NVL (RECPCOLLECTIONMAST.RCN_DISCOUNT, 0)) > 0
                UNION ALL
                SELECT SUM (NVL (RECPCOLLECTIONMAST.RCN_DISCOUNT, 0)) * -1 AS Discount
                FROM Recpcollectionmast
                WHERE Recpcollectionmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Recpcollectionmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND NVL (Rcc_Cancel, 'N') = 'N'
                HAVING SUM (NVL (RECPCOLLECTIONMAST.RCN_DISCOUNT, 0)) > 0`;
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
                    EXCLUDE_IP
                    AS (SELECT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                  SELECT NVL (mig.DG_DESC, 'Ungrouped') AS Dg_desc,
                        NVL (mig.DG_GRCODE, 999) AS Code,
                        -1 * SUM (NVL (rbd.RFN_NETAMT, 0)) AS Amt,
                        -1 * SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.RFN_TOTCESS, 0)) AS Tax,
                        -1 * SUM (NVL (rbd.RFN_NETAMT, 0) + NVL (rbd.RFN_DISAMT, 0))
                            AS GrossAmt,
                        0 AS Comp,
                        -1 * SUM (NVL (rbd.RFN_DISAMT, 0)) AS Discount
                    FROM REFUNDBILLDETL rbd
                        JOIN BILLMAST bm
                            ON bm.BMC_SLNO = rbd.BMC_SLNO
                        JOIN REFUNDBILLMAST rbm
                            ON rbm.RFC_SLNO = rbd.RFC_SLNO
                        JOIN DISBILLMAST dm
                            ON bm.DMC_SLNO = dm.DMC_SLNO
                        JOIN PRODESCRIPTION pd
                            ON pd.PD_CODE = rbd.PD_CODE
                        JOIN PROGROUP pg
                            ON pg.PG_CODE = pd.PG_CODE
                        LEFT JOIN MISINCEXPDTL mid
                            ON mid.PC_CODE = pg.PC_CODE AND mid.DG_TYPE = 'R'
                        LEFT JOIN MISINCEXPGROUP mig
                            ON mig.DG_GRCODE = mid.DG_GRCODE
                        JOIN MH
                            ON MH.MH_CODE = dm.MH_CODE
                        LEFT JOIN EXCLUDE_IP ex
                            ON ex.IP_NO = dm.IP_NO
                        CROSS JOIN date_params dp
                  WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                        AND NVL (rbd.RFC_CANCEL, 'N') = 'N'
                        AND rbm.RFC_CACR = 'I'
                        AND dm.DMC_CACR <> 'M'
                        AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        AND ex.IP_NO IS NULL
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
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                  SELECT SUM (NVL (ir.IRN_DISCOUNT, 0)) AS Discount, dm.IP_NO
                    FROM IPRECEIPT ir
                        JOIN DISBILLMAST dm
                            ON ir.DMC_SLNO = dm.DMC_SLNO
                        JOIN MH
                            ON MH.MH_CODE = dm.MH_CODE
                        LEFT JOIN EXCLUDE_IP ex
                            ON ex.IP_NO = dm.IP_NO
                        CROSS JOIN date_params dp
                  WHERE     dm.DMD_DATE < dp.from_date
                        AND ir.DMC_TYPE IN ('C', 'R')
                        AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        AND NVL (ir.IRC_CANCEL, 'N') = 'N'
                        AND ex.IP_NO IS NULL
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
                    AS (SELECT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
                  FROM (
                        SELECT SUM (NVL (oa.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM OPADVANCE oa
                              JOIN MH
                                  ON MH.MH_CODE = oa.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = oa.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     NVL (oa.ARC_CANCEL, 'N') = 'N'
                              AND oa.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                        UNION ALL
                        /* PH ADVANCE */
                        SELECT SUM (NVL (pa.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM PHADVANCEENTRY pa
                              JOIN MH
                                  ON MH.MH_CODE = pa.ARC_MHCODE
                              CROSS JOIN date_params dp
                        WHERE NVL (pa.ARC_CANCEL, 'N') = 'N'
                              AND pa.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        /* IP ADVANCE */
                        SELECT SUM (NVL (ia.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM IPADVANCE ia
                              JOIN MH
                                  ON MH.MH_CODE = ia.IAC_MHCODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = ia.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     NVL (ia.ARC_CANCEL, 'N') = 'N'
                              AND ia.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                        UNION ALL
                        /* GENERAL ADVANCE */
                        SELECT SUM (NVL (ae.ARN_AMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM ADVANCEENTRY ae
                              JOIN MH
                                  ON MH.MH_CODE = ae.ARC_MHCODE
                              CROSS JOIN date_params dp
                        WHERE NVL (ae.ARC_CANCEL, 'N') = 'N'
                              AND ae.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE) final_data`;
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
                    AS (SELECT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
                  FROM (
                        SELECT SUM (NVL (ob.OPN_ADVANCE, 0)) AS Amt, 0 AS Tax
                          FROM OPBILLMAST ob
                              JOIN MH
                                  ON MH.MH_CODE = ob.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE NVL (ob.OPN_CANCEL, 'N') = 'N'
                              AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        SELECT SUM (NVL (pb.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM PBILLMAST pb
                              JOIN MH
                                  ON MH.MH_CODE = pb.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = pb.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     NVL (pb.BMC_CANCEL, 'N') = 'N'
                              AND pb.BMC_COLLCNCODE IS NULL
                              AND pb.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                        UNION ALL
                        SELECT SUM (NVL (dm.DMN_ADVANCE, 0)) AS Amt, 0 AS Tax
                          FROM DISBILLMAST dm
                              JOIN MH
                                  ON MH.MH_CODE = dm.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                        UNION ALL
                        SELECT SUM (NVL (bm.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM BILLMAST bm
                              JOIN MH
                                  ON MH.MH_CODE = bm.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     NVL (bm.BMC_CANCEL, 'N') = 'N'
                              AND bm.BMC_COLLCNCODE IS NULL
                              AND bm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        SELECT SUM (NVL (pb.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM PBILLMAST pb
                              JOIN MH
                                  ON MH.MH_CODE = pb.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = pb.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     NVL (pb.BMC_CANCEL, 'N') = 'N'
                              AND pb.BMC_COLLCNCODE IS NOT NULL
                              AND pb.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                        UNION ALL
                        SELECT SUM (NVL (bm.BMN_ADVAMOUNT, 0)) AS Amt, 0 AS Tax
                          FROM BILLMAST bm
                              JOIN MH
                                  ON MH.MH_CODE = bm.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = bm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     NVL (bm.BMC_CANCEL, 'N') = 'N'
                              AND bm.BMC_COLLCNCODE IS NOT NULL
                              AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL) final_data`;
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

const getIpRefundDetlSection_six = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital)
                SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
                  FROM (/* REFUND RECEIPT - RT CREDIT */
                        SELECT -1 * SUM (NVL (rrm.RPN_RTCREDIT, 0)) AS Amt,
                              -1 * SUM (NVL (rrm.RFN_TOTTAX, 0)) AS Tax
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
                        /* REFUND BILL - NORMAL */
                        SELECT -1 * SUM (NVL (rbm.BMN_RTCREDIT, 0)) AS Amt,
                              -1 * SUM (NVL (rbm.RFN_TOTTAX, 0) + NVL (rbm.RFN_TOTCESS, 0))
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
                        /* MRET - NORMAL */
                        SELECT -1
                              * SUM (
                                      NVL (mr.BMN_RTCREDIT, 0)
                                    + NVL (mr.MRN_SALETAXCR, 0)
                                    + NVL (mr.MRN_CESSCR, 0))
                                  AS Amt,
                              -1
                              * SUM (
                                      NVL (mr.MRN_SALETAXCH, 0)
                                    + NVL (mr.MRN_SALETAXCR, 0)
                                    + NVL (mr.MRN_CESSCH, 0)
                                    + NVL (mr.MRN_CESSCR, 0))
                                  AS Tax
                          FROM MRETMAST mr
                              JOIN MH
                                  ON MH.MH_CODE = mr.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     mr.MRC_CACR = 'R'
                              AND NVL (mr.MRC_CANCEL, 'N') <> 'Y'
                              AND NVL (mr.BMN_RTCREDIT, 0) > 0
                              AND mr.MRC_RETCNCODE IS NULL
                              AND mr.MRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        /* OP REFUND */
                        SELECT -1 * SUM (NVL (obr.RON_CREDIT, 0)) AS Amt,
                              -1 * SUM (NVL (obr.RON_TOTTAX, 0)) AS Tax
                          FROM OPBILLREFUNDMAST obr
                              JOIN MH
                                  ON MH.MH_CODE = obr.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     NVL (obr.ROC_CANCEL, 'N') = 'N'
                              AND obr.ROC_CACR = 'R'
                              AND NVL (obr.RON_CREDIT, 0) <> 0
                              AND obr.ROD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        UNION ALL
                        /* IP REFUND */
                        SELECT -1 * SUM (NVL (ipm.RIN_CREDIT, 0)) AS Amt,
                              -1 * SUM (NVL (ipm.RIN_TOTTAX, 0)) AS Tax
                          FROM IPREFUNDMAST ipm
                              JOIN MH
                                  ON MH.MH_CODE = ipm.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     ipm.RIC_CACR = 'R'
                              AND NVL (ipm.RIC_CANCEL, 'N') = 'N'
                              AND ipm.DMC_SLNO IS NOT NULL
                              AND ipm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE) final_data`;
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

const getAdvanceRefund = async (conn_ora, bind) => {
  const sql = `WITH date_params
                      AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                  TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                            FROM DUAL),
                      MH AS (SELECT MH_CODE FROM multihospital),
                      EXCLUDE_IP
                      AS (SELECT IP_NO
                            FROM GTT_EXCLUDE_IP
                            WHERE STATUS = 1),
                      VALID_OP_ADVANCE
                      AS (SELECT oa.AR_SLNO
                            FROM OPADVANCE oa LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = oa.IP_NO
                            WHERE ex.IP_NO IS NULL),
                      VALID_DISBILL
                      AS (SELECT dm.DMC_SLNO
                            FROM DISBILLMAST dm
                                  LEFT JOIN EXCLUDE_IP ex
                                    ON ex.IP_NO = dm.IP_NO
                                  CROSS JOIN date_params dp
                            WHERE dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                                  AND ex.IP_NO IS NULL)
                  SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
                    FROM (/* REFUND OP ADVANCE */
                          SELECT SUM (NVL (roa.RFN_AMT, 0)) AS Amt, 0 AS Tax
                            FROM REFUNDOPADVANCE roa
                                JOIN MH
                                    ON MH.MH_CODE = roa.MH_CODE
                                JOIN VALID_OP_ADVANCE voa
                                    ON voa.AR_SLNO = roa.AR_SLNO
                                CROSS JOIN date_params dp
                          WHERE roa.RFC_CANCEL = 'N'
                                AND roa.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          HAVING SUM (NVL (roa.RFN_AMT, 0)) > 0
                          UNION ALL
                          /* REFUND ADVANCE */
                          SELECT SUM (NVL (ra.RFN_AMT, 0)) AS Amt, 0 AS Tax
                            FROM REFUNDADVANCE ra
                                JOIN MH
                                    ON MH.MH_CODE = ra.RFC_MHCODE
                                JOIN VALID_OP_ADVANCE voa
                                    ON voa.AR_SLNO = ra.AR_SLNO
                                CROSS JOIN date_params dp
                          WHERE NVL (ra.RFC_CANCEL, 'N') = 'N'
                                AND ra.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          HAVING SUM (NVL (ra.RFN_AMT, 0)) > 0
                          UNION ALL
                          /* IP RECEIPT ADVANCE RETURN */
                          SELECT SUM (
                                      NVL (ir.IRN_BALANCE, 0)
                                    + NVL (ir.IRN_REFCHEQ, 0)
                                    + NVL (ir.IRN_REFCARD, 0))
                                    AS Amt,
                                0 AS Tax
                            FROM IPRECEIPT ir
                                JOIN MH
                                    ON MH.MH_CODE = ir.IPC_MHCODE
                                JOIN VALID_DISBILL vd
                                    ON vd.DMC_SLNO = ir.DMC_SLNO
                                CROSS JOIN date_params dp
                          WHERE     ir.DMC_TYPE = 'A'
                                AND ir.IRC_CANCEL IS NULL
                                AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          HAVING SUM (
                                      NVL (ir.IRN_BALANCE, 0)
                                    + NVL (ir.IRN_REFCHEQ, 0)
                                    + NVL (ir.IRN_REFCARD, 0)) > 0
                          UNION ALL
                          /* ADVANCE RETURN */
                          SELECT SUM (NVL (ar.RAN_AMT, 0)) AS Amt, 0 AS Tax
                            FROM ADVANCERETURN ar
                                JOIN MH
                                    ON MH.MH_CODE = ar.RAC_MHCODE
                                JOIN VALID_OP_ADVANCE voa
                                    ON voa.AR_SLNO = ar.AR_SLNO
                                CROSS JOIN date_params dp
                          WHERE NVL (ar.RAC_CANCEL, 'N') = 'N'
                                AND ar.RAD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          HAVING SUM (NVL (ar.RAN_AMT, 0)) > 0) final_data`;
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
const getCollectionPortion_seven = async (conn_ora, bind) => {
  const sql = `WITH date_params
                AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                            TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                      FROM DUAL),
                MH AS (SELECT MH_CODE FROM multihospital),
                EXCLUDE_IP
                AS (SELECT IP_NO
                      FROM GTT_EXCLUDE_IP
                      WHERE STATUS = 1)
            SELECT SUM (Amt) AS Amt, SUM (Tax) AS Tax
              FROM (/* RECEIPTMAST WITHOUT COLLECTION CODE */
                    SELECT SUM (NVL (rm.RPN_CREDIT, 0)) AS Amt,
                          SUM (NVL (rm.RPN_TOTTAX, 0)) AS Tax
                      FROM RECEIPTMAST rm
                          JOIN MH
                              ON MH.MH_CODE = rm.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     rm.RPC_CACR = 'R'
                          AND NVL (rm.RPC_CANCEL, 'N') <> 'C'
                          AND rm.RPC_COLLCNCODE IS NULL
                          AND rm.RPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          AND NVL (rm.RPN_CREDIT, 0) <> 0
                    UNION ALL
                    /* OPBILLMAST */
                    SELECT SUM (NVL (ob.OPN_CREDIT, 0) + NVL (ob.OPN_COPAYDED_CREDIT, 0))
                              AS Amt,
                          SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
                      FROM OPBILLMAST ob
                          JOIN MH
                              ON MH.MH_CODE = ob.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     ob.OPC_CACR IN ('C', 'R')
                          AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                          AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          AND (NVL (ob.OPN_CREDIT, 0) + NVL (ob.OPN_SALETAXCR, 0)) <> 0
                    UNION ALL
                    /* BILLMAST WITHOUT COLLECTION CODE */
                    SELECT SUM (NVL (bm.BMN_CREDIT, 0)) AS Amt,
                          SUM (NVL (bm.BMN_TOTTAX, 0) + NVL (bm.BMN_TOTCESS, 0)) AS Tax
                      FROM BILLMAST bm
                          JOIN MH
                              ON MH.MH_CODE = bm.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     bm.BMC_CACR = 'R'
                          AND NVL (bm.BMC_CANCEL, 'N') <> 'C'
                          AND bm.BMC_COLLCNCODE IS NULL
                          AND bm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                    UNION ALL
                    /* PBILLMAST WITHOUT COLLECTION CODE */
                    SELECT SUM (
                                NVL (pb.BMN_CREDIT, 0)
                              + NVL (pb.BMN_SALETAXCR, 0)
                              + NVL (pb.BMN_CESSCR, 0)
                              + NVL (pb.BMN_COPAYDED_CREDIT, 0))
                              AS Amt,
                          SUM (
                                NVL (pb.BMN_SALETAXCH, 0)
                              + NVL (pb.BMN_SALETAXCR, 0)
                              + NVL (pb.BMN_CESSCH, 0)
                              + NVL (pb.BMN_CESSCR, 0))
                              AS Tax
                      FROM PBILLMAST pb
                          JOIN MH
                              ON MH.MH_CODE = pb.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     pb.BMC_CACR = 'R'
                          AND NVL (pb.BMC_CANCEL, 'N') IN ('N', 'P')
                          AND pb.BMC_COLLCNCODE IS NULL
                          AND NVL (pb.BMN_CREDIT, 0) <> 0
                          AND pb.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                    UNION ALL
                    /* DISBILLMAST */
                    SELECT SUM (
                              NVL (dm.DMN_FINALCREDIT, 0)
                              + NVL (dm.DMN_COPAYDED_CREDIT, 0))
                              AS Amt,
                          SUM (
                                NVL (dm.DMN_SALESTAXCH, 0)
                              + NVL (dm.DMN_SALESTAXCR, 0)
                              + NVL (dm.DMN_CESSCH, 0)
                              + NVL (dm.DMN_CESSCR, 0))
                              AS Tax
                      FROM DISBILLMAST dm
                          JOIN MH
                              ON MH.MH_CODE = dm.MH_CODE
                          LEFT JOIN EXCLUDE_IP ex
                              ON ex.IP_NO = dm.IP_NO
                          CROSS JOIN date_params dp
                    WHERE     dm.DMC_CACR = 'R'
                          AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                          AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                          AND ex.IP_NO IS NULL
                    UNION ALL
                    /* BILLMAST WITH COLLECTION CODE */
                    SELECT SUM (NVL (bm.BMN_CREDIT, 0)) AS Amt,
                          SUM (NVL (bm.BMN_TOTTAX, 0) + NVL (bm.BMN_TOTCESS, 0)) AS Tax
                      FROM BILLMAST bm
                          JOIN MH
                              ON MH.MH_CODE = bm.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     bm.BMC_CACR = 'R'
                          AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                          AND bm.BMC_COLLCNCODE IS NOT NULL
                          AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
                    UNION ALL
                    /* PBILLMAST WITH COLLECTION CODE */
                    SELECT SUM (
                                NVL (pb.BMN_CREDIT, 0)
                              + NVL (pb.BMN_SALETAXCR, 0)
                              + NVL (pb.BMN_CESSCR, 0)
                              + NVL (pb.BMN_COPAYDED_CREDIT, 0))
                              AS Amt,
                          SUM (
                                NVL (pb.BMN_SALETAXCH, 0)
                              + NVL (pb.BMN_SALETAXCR, 0)
                              + NVL (pb.BMN_CESSCH, 0)
                              + NVL (pb.BMN_CESSCR, 0))
                              AS Tax
                      FROM PBILLMAST pb
                          JOIN MH
                              ON MH.MH_CODE = pb.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     pb.BMC_CACR = 'R'
                          AND NVL (pb.BMC_CANCEL, 'N') = 'N'
                          AND pb.BMC_COLLCNCODE IS NOT NULL
                          AND pb.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
                    UNION ALL
                    /* RECEIPTMAST WITH COLLECTION CODE */
                    SELECT SUM (NVL (rm.RPN_CREDIT, 0)) AS Amt,
                          SUM (NVL (rm.RPN_TOTTAX, 0)) AS Tax
                      FROM RECEIPTMAST rm
                          JOIN MH
                              ON MH.MH_CODE = rm.MH_CODE
                          CROSS JOIN date_params dp
                    WHERE     rm.RPC_CACR = 'R'
                          AND NVL (rm.RPC_CANCEL, 'N') = 'N'
                          AND rm.RPC_COLLCNCODE IS NOT NULL
                          AND rm.RPD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE) final_data`;
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
                    AS (SELECT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (Payable) AS Amt, SUM (Tax) AS Tax
                  FROM (/* DISBILLMAST */
                        SELECT SUM (NVL (dm.DMN_FINALPTPAYABLE, 0)) AS Payable,
                              SUM (
                                    NVL (dm.DMN_SALESTAXCH, 0)
                                  + NVL (dm.DMN_SALESTAXCR, 0)
                                  + NVL (dm.DMN_CESSCH, 0)
                                  + NVL (dm.DMN_CESSCR, 0))
                                  AS Tax
                          FROM DISBILLMAST dm
                              JOIN MH
                                  ON MH.MH_CODE = dm.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     dm.DMC_CACR IN ('C', 'R')
                              AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                              AND NVL (dm.DMN_FINALPTPAYABLE, 0) <> 0
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                        UNION ALL
                        /* IPRECEIPT */
                        SELECT -1
                              * SUM (
                                    (  NVL (ir.IRN_AMOUNT, 0)
                                    + NVL (ir.IRN_CHEQUE, 0)
                                    + NVL (ir.IRN_CARD, 0)
                                    + NVL (ir.IRN_NEFT, 0))
                                    - (  NVL (ir.IRN_BALANCE, 0)
                                      + NVL (ir.IRN_REFCHEQ, 0)
                                      + NVL (ir.IRN_REFCARD, 0))
                                    + NVL (ir.IRN_DISCOUNT, 0))
                                  AS Payable,
                              -1
                              * SUM (
                                      NVL (dm.DMN_SALESTAXCH, 0)
                                    + NVL (dm.DMN_SALESTAXCR, 0)
                                    + NVL (dm.DMN_CESSCH, 0)
                                    + NVL (dm.DMN_CESSCR, 0))
                                  AS Tax
                          FROM IPRECEIPT ir
                              JOIN DISBILLMAST dm
                                  ON ir.DMC_SLNO = dm.DMC_SLNO
                              JOIN MH
                                  ON MH.MH_CODE = ir.IPC_MHCODE
                              LEFT JOIN EXCLUDE_IP ex
                                  ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     ir.DMC_TYPE IN ('C', 'R')
                              AND ir.IRC_CANCEL IS NULL
                              AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                              AND ( (  NVL (ir.IRN_AMOUNT, 0)
                                      + NVL (ir.IRN_CHEQUE, 0)
                                      + NVL (ir.IRN_CARD, 0)
                                      + NVL (ir.IRN_NEFT, 0))
                                    - (  NVL (ir.IRN_BALANCE, 0)
                                      + NVL (ir.IRN_REFCHEQ, 0)
                                      + NVL (ir.IRN_REFCARD, 0))
                                    + NVL (ir.IRN_DISCOUNT, 0)) <> 0
                        UNION ALL
                        /* OPBILLMAST */
                        SELECT SUM (NVL (ob.RPN_PTPAYABLE, 0)) AS Payable,
                              SUM (NVL (ob.OPN_SALETAXCH, 0) + NVL (ob.OPN_SALETAXCR, 0))
                                  AS Tax
                          FROM OPBILLMAST ob
                              JOIN MH
                                  ON MH.MH_CODE = ob.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     ob.OPC_CACR IN ('C', 'R')
                              AND NVL (ob.OPN_CANCEL, 'N') <> 'C'
                              AND ob.RPN_PTPAYABLE > 0
                              AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE) final_data`;
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

const getIpRefundDetlSection_seven = async (conn_ora, bind) => {
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                    NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                    SUM (refundbilldetl.rfn_netamt) * -1 Amt,
                    SUM (
                        NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)
                        + NVL (Refundbilldetl.Rfn_Totcess, 0))
                    * -1
                        tax,
                    SUM (
                        NVL (refundbilldetl.rfn_netamt, 0)
                        + NVL (refundbilldetl.rfn_disamt, 0))
                    * -1
                        GrossAmt,
                    SUM (0) AS Comp,
                    SUM (NVL (refundbilldetl.rfn_disamt, 0)) * -1 discount
                FROM Refundbilldetl,
                    Refundbillmast,
                    Billdetl,
                    Opbillmast,
                    Prodescription,
                    Progroup,
                    Misincexpdtl,
                    Misincexpgroup
            WHERE     Refundbilldetl.Bmc_Slno = Billdetl.Bmc_Slno
                    AND Billdetl.Opc_Slno = Opbillmast.Opc_Slno
                    AND Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
                    AND Refundbilldetl.Bmc_Cnt = Billdetl.Bmc_Cnt
                    AND Refundbilldetl.Pd_Code = Prodescription.Pd_Code
                    AND Prodescription.Pg_Code = Progroup.Pg_Code
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                    AND Misincexpdtl.Dg_type(+) = 'R'
                    AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
                    AND Refundbillmast.Rfc_Cacr IN ('O')
                    AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                    AND NVL (Refundbilldetl.Rfc_Cancel, 'N') = 'N'
                    AND Opbillmast.Opc_Cacr <> 'M'
                    AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
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

const getDiscount_three = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
                          FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP
                    AS (SELECT IP_NO
                          FROM GTT_EXCLUDE_IP
                          WHERE STATUS = 1)
                SELECT SUM (NVL (ir.IRN_DISCOUNT, 0)) AS Discount
                  FROM IPRECEIPT ir
                      JOIN DISBILLMAST dm
                          ON ir.DMC_SLNO = dm.DMC_SLNO
                      JOIN MH
                          ON MH.MH_CODE = dm.MH_CODE
                      LEFT JOIN EXCLUDE_IP ex
                          ON ex.IP_NO = dm.IP_NO
                      CROSS JOIN date_params dp
                WHERE     NVL (ir.IRC_CANCEL, 'N') = 'N'
                      AND ir.DMC_TYPE IN ('C', 'R')
                      AND dm.DMC_CACR <> 'M'
                      AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                      AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                      AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                      AND NVL (ir.IRN_DISCOUNT, 0) > 0
                      AND ex.IP_NO IS NULL`;
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
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     EXCLUDE_IP
     AS (SELECT IP_NO
           FROM GTT_EXCLUDE_IP
          WHERE STATUS = 1)
  SELECT Ptc_Desc, SUM (Discount) Discount, SUM (tax) tax
    FROM (  SELECT rm.RPC_SLNO AS Slno,
                   rm.RP_NO AS BillNo,
                   rm.RPD_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (NVL (rd.RPN_NETAMT, 0)) AS Net,
                   SUM (NVL (rd.RPN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                      CASE
                         WHEN rm.RPC_COLLCNCODE IS NULL
                         THEN
                            NVL (rd.RPN_TOTTAX, 0)
                         ELSE
                            NVL (rm.RPN_TOTTAX, 0)
                      END)
                      AS Tax
              FROM RECEIPTMAST rm
                   JOIN RECEIPTDETL rd
                      ON rm.RPC_SLNO = rd.RPC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = rm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON rm.PT_NO = p.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON rd.DA_CODE = da.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON p.PT_CODE = pt.PT_CODE
                   CROSS JOIN date_params dp
             WHERE NVL (rm.RPC_CANCEL, 'N') = 'N' AND rm.RPC_CACR IN ('C', 'R')
                   AND ( (rm.RPC_COLLCNCODE IS NULL
                          AND rm.RPD_DATE BETWEEN dp.from_date AND dp.TO_DATE)
                        OR (rm.RPC_COLLCNCODE IS NOT NULL
                            AND rm.RPD_COLLDATE BETWEEN dp.from_date
                                                    AND dp.TO_DATE))
          GROUP BY rm.RPC_SLNO,
                   rm.RP_NO,
                   rm.RPD_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT rrm.RFC_SLNO AS Slno,
                   rrm.RF_NO AS BillNo,
                   rrm.RFD_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (rrm.RFN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (rrd.RPN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (rrm.RFN_TOTTAX, 0)) AS Tax
              FROM REFUNDRECEIPTMAST rrm
                   JOIN REFUNDRECEIPTDETL rrd
                      ON rrm.RFC_SLNO = rrd.RFC_SLNO
                   JOIN RECEIPTDETL rd
                      ON rd.RPC_SLNO = rrd.RPC_SLNO AND rd.RPC_CNT = rrd.RPC_CNT
                   JOIN RECEIPTMAST rm
                      ON rm.RPC_SLNO = rd.RPC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = rrm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON rm.PT_NO = p.PT_NO
                   LEFT JOIN PATTYPE pt
                      ON p.PT_CODE = pt.PT_CODE
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON rd.DA_CODE = da.DA_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (rm.RPC_CANCEL, 'N') = 'N'
                   AND NVL (rrm.RFC_CANCEL, 'N') = 'N'
                   AND rrm.RFC_CACR IN ('C', 'R')
                   AND rm.RPC_CACR IN ('C', 'R')
                   AND ( (rrm.RFC_RETCNCODE IS NULL
                          AND rrm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE)
                        OR (rrm.RFC_RETCNCODE IS NOT NULL
                            AND rrm.RFD_RETDATE BETWEEN dp.from_date
                                                    AND dp.TO_DATE))
          GROUP BY rrm.RFC_SLNO,
                   rrm.RF_NO,
                   rrm.RFD_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (ob.OPN_NETAMT, 0)
                      + NVL (ob.OPN_SALETAXCH, 0)
                      + NVL (ob.OPN_SALETAXCR, 0))
                      AS Net,
                   SUM (
                        NVL (ps.SRN_OPERDIS, 0)
                      + NVL (ps.SRN_THEARDIS, 0)
                      + NVL (ps.SRN_ANTDIS, 0))
                      AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN PATSURGERY ps
                      ON (   ps.OPERATION_OPSLNO = ob.OPC_SLNO
                          OR ps.THEATER_OPSLNO = ob.OPC_SLNO
                          OR ps.ANTEST_OPSLNO = ob.OPC_SLNO)
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = ps.IP_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = ps.DA_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (ob.OPN_NETAMT, 0)
                      + NVL (ob.OPN_SALETAXCH, 0)
                      + NVL (ob.OPN_SALETAXCR, 0))
                      AS Net,
                   SUM (NVL (pd.SRN_DISCOUNT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN PATSURDETL pd
                      ON pd.OPC_SLNO = ob.OPC_SLNO
                   JOIN PATSURGERY ps
                      ON ps.SR_SLNO = pd.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = ps.IP_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pd.DA_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (ob.OPN_NETAMT, 0)
                      + NVL (ob.OPN_SALETAXCH, 0)
                      + NVL (ob.OPN_SALETAXCR, 0))
                      AS Net,
                   SUM (NVL (po.SRN_DISCOUNT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN PATSUROTHER po
                      ON po.OPC_SLNO = ob.OPC_SLNO
                   JOIN PATSURGERY ps
                      ON ps.SR_SLNO = po.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = ps.IP_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = po.DA_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (ob.OPN_NETAMT, 0)
                      + NVL (ob.OPN_SALETAXCH, 0)
                      + NVL (ob.OPN_SALETAXCR, 0))
                      AS Net,
                   SUM (NVL (rd.RPN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN RECEIPTDETL rd
                      ON rd.OPC_SLNO = ob.OPC_SLNO
                   JOIN RECEIPTMAST rm
                      ON rm.RPC_SLNO = rd.RPC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = rd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     rm.RPC_CACR = 'O'
                   AND NVL (rm.RPC_CANCEL, 'N') = 'N'
                   AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                   AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   0 AS Net,
                   -1 * SUM (NVL (rrd.RPN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (rrd.RFN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN RECEIPTDETL rd
                      ON rd.OPC_SLNO = ob.OPC_SLNO
                   JOIN RECEIPTMAST rm
                      ON rm.RPC_SLNO = rd.RPC_SLNO
                   JOIN REFUNDRECEIPTDETL rrd
                      ON rrd.RPC_SLNO = rd.RPC_SLNO AND rrd.RPC_CNT = rd.RPC_CNT
                   JOIN REFUNDRECEIPTMAST rrm
                      ON rrm.RFC_SLNO = rrd.RFC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = rd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     rm.RPC_CACR = 'O'
                   AND rrm.RFC_CACR = 'O'
                   AND NVL (rrm.RFC_CANCEL, 'N') = 'N'
                   AND NVL (rm.RPC_CANCEL, 'N') = 'N'
                   AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                   AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (NVL (ob.OPN_NETAMT, 0)) AS Net,
                   SUM (NVL (bd.BMN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN BILLDETL bd
                      ON bd.OPC_SLNO = ob.OPC_SLNO
                   JOIN BILLMAST bm
                      ON bm.BMC_SLNO = bd.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR = 'O'
                   AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                   AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                   AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   0 AS Net,
                   -1 * SUM (NVL (rbd.RFN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.RFN_TOTCESS, 0))
                      AS Tax
              FROM OPBILLMAST ob
                   JOIN BILLDETL bd
                      ON bd.OPC_SLNO = ob.OPC_SLNO
                   JOIN BILLMAST bm
                      ON bm.BMC_SLNO = bd.BMC_SLNO
                   JOIN REFUNDBILLDETL rbd
                      ON     rbd.BMC_SLNO = bd.BMC_SLNO
                         AND rbd.BMC_CNT = bd.BMC_CNT
                         AND rbd.PD_CODE = bd.PD_CODE
                   JOIN REFUNDBILLMAST rbm
                      ON rbm.RFC_SLNO = rbd.RFC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR = 'O'
                   AND NVL (rbm.RFC_CANCEL, 'N') = 'N'
                   AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                   AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                   AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   0 AS Net,
                   -1 * SUM (NVL (rbd.RFN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (rbd.RFN_TOTTAX, 0) + NVL (rbd.RFN_TOTCESS, 0))
                      AS Tax
              FROM OPBILLMAST ob
                   JOIN BILLDETL bd
                      ON bd.OPC_SLNO = ob.OPC_SLNO
                   JOIN BILLMAST bm
                      ON bm.BMC_SLNO = bd.BMC_SLNO
                   JOIN REFUNDBILLDETL rbd
                      ON     rbd.BMC_SLNO = bd.BMC_SLNO
                         AND rbd.BMC_CNT = bd.BMC_CNT
                         AND rbd.PD_CODE = bd.PD_CODE
                   JOIN REFUNDBILLMAST rbm
                      ON rbm.RFC_SLNO = rbd.RFC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR = 'O'
                   AND NVL (rbm.RFC_CANCEL, 'N') = 'N'
                   AND NVL (bm.BMC_CANCEL, 'N') = 'N'
                   AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                   AND ob.OPC_CACR <> 'M'
                   AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT ob.OPC_SLNO AS Slno,
                   ob.OP_NO AS BillNo,
                   ob.OPD_DATE AS BillDate,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (ob.OPN_NETAMT, 0)
                      + NVL (ob.OPN_SALETAXCH, 0)
                      + NVL (ob.OPN_SALETAXCR, 0))
                      AS Net,
                   SUM (NVL (pb.BMN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax
              FROM OPBILLMAST ob
                   JOIN PBILLDETL pbd
                      ON pbd.OPC_SLNO = ob.OPC_SLNO
                   JOIN PBILLMAST pb
                      ON pb.BMC_SLNO = pbd.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = ob.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = ob.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pb.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     pb.BMC_CACR = 'O'
                   AND NVL (pb.BMC_CANCEL, 'N') = 'N'
                   AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                   AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY ob.OPC_SLNO,
                   ob.OP_NO,
                   ob.OPD_DATE,
                   ob.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT a.Slno,
                   a.BillNo,
                   a.BillDate,
                   a.PT_NO,
                   a.Ptname,
                   0 AS Net,
                   SUM (a.Discount) AS Discount,
                   a.Dac_Desc,
                   a.DA_CODE,
                   a.Ptc_Desc,
                   SUM (a.Tax) AS Tax
              FROM (SELECT DISTINCT
                           mm.MRC_SLNO,
                           ob.OPC_SLNO AS Slno,
                           ob.OP_NO AS BillNo,
                           ob.OPD_DATE AS BillDate,
                           ob.PT_NO,
                           INITCAP (p.PTC_PTNAME) AS Ptname,
                           -1 * NVL (md.MRN_DISAMT, 0) AS Discount,
                           INITCAP (da.DAC_DESC) AS Dac_Desc,
                           da.DA_CODE,
                           INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                           -1
                           * (NVL (md.MRN_TOTTAXCR, 0) + NVL (md.MRN_TOTTAXCH, 0))
                              AS Tax
                      FROM OPBILLMAST ob
                           JOIN PBILLDETL pbd
                              ON pbd.OPC_SLNO = ob.OPC_SLNO
                           JOIN MRETDETL md
                              ON     md.BMC_SLNO = pbd.BMC_SLNO
                                 AND md.IT_CODE = pbd.IT_CODE
                                 AND md.ITC_DOCNO = pbd.ITC_DOCNO
                                 AND md.ITC_DOCTYPE = pbd.ITC_DOCTYPE
                                 AND md.ITC_SLNO = pbd.ITC_SLNO
                           JOIN MRETMAST mm
                              ON mm.MRC_SLNO = md.MRC_SLNO
                           JOIN PBILLMAST pb
                              ON pb.BMC_SLNO = md.BMC_SLNO
                           JOIN MH
                              ON MH.MH_CODE = ob.MH_CODE
                           LEFT JOIN PATIENT p
                              ON p.PT_NO = ob.PT_NO
                           LEFT JOIN DISCOUNTAUTHORITY da
                              ON da.DA_CODE = pb.DA_CODE
                           LEFT JOIN PATTYPE pt
                              ON pt.PT_CODE = p.PT_CODE
                           CROSS JOIN date_params dp
                     WHERE     mm.MRC_CACR = 'O'
                           AND NVL (mm.MRC_CANCEL, 'N') = 'N'
                           AND NVL (ob.OPN_CANCEL, 'N') = 'N'
                           AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE) a
          GROUP BY a.Slno,
                   a.BillNo,
                   a.BillDate,
                   a.PT_NO,
                   a.Ptname,
                   a.Dac_Desc,
                   a.DA_CODE,
                   a.Ptc_Desc
          UNION ALL
            SELECT orm.ROC_SLNO AS Slno,
                   orm.RO_NO AS BillNo,
                   orm.ROD_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (orm.RON_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (rrd.RPN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (rrd.RFN_TOTTAX, 0)) AS Tax
              FROM OPBILLREFUNDMAST orm
                   JOIN REFUNDRECEIPTMAST rrm
                      ON rrm.ROC_SLNO = orm.ROC_SLNO
                   JOIN REFUNDRECEIPTDETL rrd
                      ON rrd.RFC_SLNO = rrm.RFC_SLNO
                   JOIN RECEIPTDETL rd
                      ON rd.RPC_SLNO = rrd.RPC_SLNO AND rd.RPC_CNT = rrd.RPC_CNT
                   JOIN RECEIPTMAST rm
                      ON rm.RPC_SLNO = rd.RPC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = orm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = rm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = rd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (rm.RPC_CANCEL, 'N') = 'N'
                   AND NVL (rrm.RFC_CANCEL, 'N') = 'N'
                   AND orm.ROD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY orm.ROC_SLNO,
                   orm.RO_NO,
                   orm.ROD_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT orm.ROC_SLNO AS Slno,
                   orm.RO_NO AS BillNo,
                   orm.ROD_DATE AS BillDate,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (orm.RON_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (rbd.RFN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (orm.RON_TOTTAX, 0)) AS Tax
              FROM OPBILLREFUNDMAST orm
                   JOIN REFUNDBILLMAST rbm
                      ON rbm.ROC_SLNO = orm.ROC_SLNO
                   JOIN REFUNDBILLDETL rbd
                      ON rbd.RFC_SLNO = rbm.RFC_SLNO
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = rbd.BMC_SLNO AND bd.BMC_CNT = rbd.BMC_CNT
                   JOIN BILLMAST bm
                      ON bm.BMC_SLNO = bd.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = orm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = bm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (rbm.RFC_CANCEL, 'N') = 'N'
                   AND NVL (bd.BMC_CANCEL, 'N') = 'N'
                   AND NVL (orm.ROC_CANCEL, 'N') = 'N'
                   AND orm.ROD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY orm.ROC_SLNO,
                   orm.RO_NO,
                   orm.ROD_DATE,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (ps.SVN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN PATSERVICE ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = ps.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (ps.SVC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (rrd.RDN_DISAMT, 0)) AS Discount,
                   '' AS Dac_Desc,
                   '' AS DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN DISRMRENTDETL rrd
                      ON rrd.DMC_SLNO = dm.DMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (pv.VSN_DISAMT, 0)) AS Discount,
                   '' AS Dac_Desc,
                   '' AS DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN PATVISIT pv
                      ON pv.DMC_SLNO = dm.DMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (pv.VSC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (
                        NVL (ps.SRN_OPERDIS, 0)
                      + NVL (ps.SRN_THEARDIS, 0)
                      + NVL (ps.SRN_ANTDIS, 0))
                      AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = ps.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (pd.SRN_DISCOUNT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSURDETL pd
                      ON pd.SR_SLNO = ps.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (po.SRN_DISCOUNT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN PATSURGERY ps
                      ON ps.DMC_SLNO = dm.DMC_SLNO
                   JOIN PATSUROTHER po
                      ON po.SR_SLNO = ps.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = po.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND NVL (ps.SRC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (bd.BMN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN BILLMAST bm
                      ON bm.DMC_SLNO = dm.DMC_SLNO
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = bm.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = bm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR IN ('I')
                   AND NVL (bd.BMC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   0 AS Net,
                   -1 * SUM (NVL (rbd.RFN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   0 AS Tax
              FROM DISBILLMAST dm
                   JOIN BILLMAST bm
                      ON bm.DMC_SLNO = dm.DMC_SLNO
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = bm.BMC_SLNO
                   JOIN REFUNDBILLDETL rbd
                      ON rbd.BMC_SLNO = bd.BMC_SLNO AND rbd.BMC_CNT = bd.BMC_CNT
                   JOIN REFUNDBILLMAST rbm
                      ON rbm.RFC_SLNO = rbd.RFC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = bm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR IN ('I')
                   AND rbm.RFC_CACR IN ('I')
                   AND NVL (rbm.RFC_CANCEL, 'N') = 'N'
                   AND NVL (bd.BMC_CANCEL, 'N') = 'N'
                   AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT dm.DMC_SLNO AS Slno,
                   dm.DM_NO AS BillNo,
                   dm.DMD_DATE AS BillDate,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                        NVL (dm.DMN_NETAMT, 0)
                      + NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0))
                      AS Net,
                   SUM (NVL (pb.BMN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (
                        NVL (dm.DMN_SALESTAXCH, 0)
                      + NVL (dm.DMN_SALESTAXCR, 0)
                      + NVL (dm.DMN_CESSCH, 0)
                      + NVL (dm.DMN_CESSCR, 0))
                      AS Tax
              FROM DISBILLMAST dm
                   JOIN PBILLMAST pb
                      ON pb.DMC_SLNO = dm.DMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = dm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = dm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = dm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pb.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     pb.BMC_CACR IN ('I')
                   AND NVL (pb.BMC_CANCEL, 'N') = 'N'
                   AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY dm.DMC_SLNO,
                   dm.DM_NO,
                   dm.DMD_DATE,
                   dm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT a.Slno,
                   a.BillNo,
                   a.BillDate,
                   a.PT_NO,
                   a.Ptname,
                   0 AS Net,
                   SUM (a.Discount) AS Discount,
                   a.Dac_Desc,
                   a.DA_CODE,
                   a.Ptc_Desc,
                   0 AS Tax
              FROM (SELECT DISTINCT mm.MRC_SLNO,
                                    dm.DMC_SLNO AS Slno,
                                    dm.DM_NO AS BillNo,
                                    dm.DMD_DATE AS BillDate,
                                    dm.PT_NO,
                                    INITCAP (p.PTC_PTNAME) AS Ptname,
                                    -1 * NVL (md.MRN_DISAMT, 0) AS Discount,
                                    INITCAP (da.DAC_DESC) AS Dac_Desc,
                                    da.DA_CODE,
                                    INITCAP (pt.PTC_DESC) AS Ptc_Desc
                      FROM DISBILLMAST dm
                           JOIN PBILLMAST pb
                              ON pb.DMC_SLNO = dm.DMC_SLNO
                           JOIN MRETDETL md
                              ON md.BMC_SLNO = pb.BMC_SLNO
                           JOIN MRETMAST mm
                              ON mm.MRC_SLNO = md.MRC_SLNO
                           JOIN PBILLDETL pbd
                              ON     pbd.BMC_SLNO = md.BMC_SLNO
                                 AND pbd.IT_CODE = md.IT_CODE
                                 AND pbd.ITC_DOCNO = md.ITC_DOCNO
                                 AND pbd.ITC_DOCTYPE = md.ITC_DOCTYPE
                                 AND pbd.ITC_SLNO = md.ITC_SLNO
                           JOIN MH
                              ON MH.MH_CODE = dm.MH_CODE
                           LEFT JOIN EXCLUDE_IP ex
                              ON ex.IP_NO = dm.IP_NO
                           LEFT JOIN PATIENT p
                              ON p.PT_NO = dm.PT_NO
                           LEFT JOIN DISCOUNTAUTHORITY da
                              ON da.DA_CODE = pb.DA_CODE
                           LEFT JOIN PATTYPE pt
                              ON pt.PT_CODE = p.PT_CODE
                           CROSS JOIN date_params dp
                     WHERE     mm.MRC_CACR IN ('I')
                           AND NVL (mm.MRC_CANCEL, 'N') = 'N'
                           AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                           AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                           AND ex.IP_NO IS NULL) a
          GROUP BY a.Slno,
                   a.BillNo,
                   a.BillDate,
                   a.PT_NO,
                   a.Ptname,
                   a.Dac_Desc,
                   a.DA_CODE,
                   a.Ptc_Desc
          UNION ALL
            SELECT irm.RIC_SLNO AS Slno,
                   irm.RI_NO AS BillNo,
                   irm.RID_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS PtName,
                   -1 * MAX (NVL (irm.RIN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (iid.RIN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (irm.RIN_TOTTAX, 0)) AS Tax
              FROM IPREFUNDMAST irm
                   JOIN IPREFUNDITEMDETL iid
                      ON iid.RIC_SLNO = irm.RIC_SLNO
                   JOIN PATSERVICE psv
                      ON psv.SV_SLNO = iid.RIN_MODULESLNO
                   JOIN MH
                      ON MH.MH_CODE = irm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = irm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = irm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = psv.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     iid.RIC_TYPE = 'SVR'
                   AND NVL (irm.RIC_CANCEL, 'N') = 'N'
                   AND NVL (iid.RIC_CANCEL, 'N') = 'N'
                   AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY irm.RIC_SLNO,
                   irm.RI_NO,
                   irm.RID_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT irm.RIC_SLNO AS Slno,
                   irm.RI_NO AS BillNo,
                   irm.RID_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS PtName,
                   -1 * MAX (NVL (irm.RIN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (iid.RIN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (irm.RIN_TOTTAX, 0)) AS Tax
              FROM IPREFUNDMAST irm
                   JOIN IPREFUNDITEMDETL iid
                      ON iid.RIC_SLNO = irm.RIC_SLNO
                   JOIN PATSURGERY ps
                      ON ps.SR_SLNO = iid.RIN_MODULESLNO
                   JOIN MH
                      ON MH.MH_CODE = irm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = irm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = irm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = ps.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     iid.RIC_TYPE = 'SUG'
                   AND iid.SR_FEE IN ('OP', 'TH', 'T1')
                   AND NVL (irm.RIC_CANCEL, 'N') = 'N'
                   AND NVL (iid.RIC_CANCEL, 'N') = 'N'
                   AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY irm.RIC_SLNO,
                   irm.RI_NO,
                   irm.RID_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT irm.RIC_SLNO AS Slno,
                   irm.RI_NO AS BillNo,
                   irm.RID_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS PtName,
                   -1 * MAX (NVL (irm.RIN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (iid.RIN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (irm.RIN_TOTTAX, 0)) AS Tax
              FROM IPREFUNDMAST irm
                   JOIN IPREFUNDITEMDETL iid
                      ON iid.RIC_SLNO = irm.RIC_SLNO
                   JOIN PATSURGERY ps
                      ON ps.SR_SLNO = iid.RIN_MODULESLNO
                   JOIN PATSURDETL pd
                      ON pd.SR_SLNO = ps.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = irm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = irm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = irm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     iid.RIC_TYPE = 'SUG'
                   AND iid.SR_FEE IN ('DT')
                   AND NVL (irm.RIC_CANCEL, 'N') = 'N'
                   AND NVL (iid.RIC_CANCEL, 'N') = 'N'
                   AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY irm.RIC_SLNO,
                   irm.RI_NO,
                   irm.RID_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT irm.RIC_SLNO AS Slno,
                   irm.RI_NO AS BillNo,
                   irm.RID_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (irm.RIN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (iid.RIN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (irm.RIN_TOTTAX, 0)) AS Tax
              FROM IPREFUNDMAST irm
                   JOIN IPREFUNDITEMDETL iid
                      ON iid.RIC_SLNO = irm.RIC_SLNO
                   JOIN PATSURGERY ps
                      ON ps.SR_SLNO = iid.RIN_MODULESLNO
                   JOIN PATSUROTHER po
                      ON po.SR_SLNO = ps.SR_SLNO
                   JOIN MH
                      ON MH.MH_CODE = irm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = irm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = irm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = po.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     iid.RIC_TYPE = 'SUG'
                   AND iid.SR_FEE IN ('OT')
                   AND NVL (irm.RIC_CANCEL, 'N') = 'N'
                   AND NVL (iid.RIC_CANCEL, 'N') = 'N'
                   AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY irm.RIC_SLNO,
                   irm.RI_NO,
                   irm.RID_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT irm.RIC_SLNO AS Slno,
                   irm.RI_NO AS BillNo,
                   irm.RID_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (irm.RIN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (iid.RIN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (irm.RIN_TOTTAX, 0)) AS Tax
              FROM IPREFUNDMAST irm
                   JOIN IPREFUNDITEMDETL iid
                      ON iid.RIC_SLNO = irm.RIC_SLNO
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = iid.RIN_MODULESLNO
                         AND bd.PD_CODE = iid.PD_CODE
                   JOIN MH
                      ON MH.MH_CODE = irm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = irm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = irm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     iid.RIC_TYPE = 'BIL'
                   AND NVL (irm.RIC_CANCEL, 'N') = 'N'
                   AND NVL (iid.RIC_CANCEL, 'N') = 'N'
                   AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY irm.RIC_SLNO,
                   irm.RI_NO,
                   irm.RID_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT irm.RIC_SLNO AS Slno,
                   irm.RI_NO AS BillNo,
                   irm.RID_DATE AS BillDate,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (irm.RIN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (iid.RIN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (irm.RIN_TOTTAX, 0)) AS Tax
              FROM IPREFUNDMAST irm
                   JOIN IPREFUNDITEMDETL iid
                      ON iid.RIC_SLNO = irm.RIC_SLNO
                   JOIN PBILLMAST pb
                      ON pb.BMC_SLNO = iid.RIN_MODULESLNO
                   JOIN MH
                      ON MH.MH_CODE = irm.MH_CODE
                   LEFT JOIN EXCLUDE_IP ex
                      ON ex.IP_NO = irm.IP_NO
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = irm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pb.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     iid.RIC_TYPE = 'PHY'
                   AND NVL (irm.RIC_CANCEL, 'N') = 'N'
                   AND NVL (iid.RIC_CANCEL, 'N') = 'N'
                   AND irm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   AND ex.IP_NO IS NULL
          GROUP BY irm.RIC_SLNO,
                   irm.RI_NO,
                   irm.RID_DATE,
                   p.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
          SELECT ir.IRC_SLNO AS Slno,
                 ir.IR_NO AS BillNo,
                 ir.IRD_DATE AS BillDate,
                 ir.PT_NO,
                 INITCAP (p.PTC_PTNAME) AS Ptname,
                 NVL (ir.IRN_TOTAL, 0) AS Net,
                 NVL (ir.IRN_DISCOUNT, 0) AS Discount,
                 INITCAP (da.DAC_DESC) AS Dac_Desc,
                 da.DA_CODE,
                 INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                 0 AS Tax
            FROM IPRECEIPT ir
                 JOIN DISBILLMAST dm
                    ON dm.DMC_SLNO = ir.DMC_SLNO
                 JOIN MH
                    ON MH.MH_CODE = ir.IPC_MHCODE
                 LEFT JOIN EXCLUDE_IP ex
                    ON ex.IP_NO = dm.IP_NO
                 LEFT JOIN PATIENT p
                    ON p.PT_NO = ir.PT_NO
                 LEFT JOIN DISCOUNTAUTHORITY da
                    ON da.DA_CODE = ir.DA_CODE
                 LEFT JOIN PATTYPE pt
                    ON pt.PT_CODE = p.PT_CODE
                 CROSS JOIN date_params dp
           WHERE     NVL (ir.IRC_CANCEL, 'N') = 'N'
                 AND NVL (ir.IRN_DISCOUNT, 0) <> 0
                 AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                 AND ex.IP_NO IS NULL
          UNION ALL
            SELECT bm.BMC_SLNO AS Slno,
                   bm.BM_NO AS BillNo,
                   bm.BMD_DATE AS BillDate,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                      CASE
                         WHEN bm.BMC_CACR IN ('C', 'R')
                         THEN
                            (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)
                         ELSE
                            0
                      END)
                      AS Net,
                   SUM (NVL (bd.BMN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.BDN_TOTCESS, 0)) AS Tax
              FROM BILLMAST bm
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = bm.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = bm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = bm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR IN ('C', 'R')
                   AND NVL (bd.BMC_CANCEL, 'N') = 'N'
                   AND bm.BMC_COLLCNCODE IS NULL
                   AND bm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY bm.BMC_SLNO,
                   bm.BM_NO,
                   bm.BMD_DATE,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT bm.BMC_SLNO AS Slno,
                   bm.BM_NO AS BillNo,
                   bm.BMD_DATE AS BillDate,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   MAX (
                      CASE
                         WHEN bm.BMC_CACR IN ('C', 'R')
                         THEN
                            (bd.PDN_RATE * bd.PDN_QTY) - NVL (bd.BMN_DISAMT, 0)
                         ELSE
                            0
                      END)
                      AS Net,
                   SUM (NVL (bd.BMN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   SUM (NVL (bd.BDN_TOTTAX, 0) + NVL (bd.BDN_TOTCESS, 0)) AS Tax
              FROM BILLMAST bm
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = bm.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = bm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = bm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR IN ('C', 'R')
                   AND NVL (bd.BMC_CANCEL, 'N') = 'N'
                   AND bm.BMC_COLLCNCODE IS NOT NULL
                   AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
          GROUP BY bm.BMC_SLNO,
                   bm.BM_NO,
                   bm.BMD_DATE,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
            SELECT rbm.RFC_SLNO AS Slno,
                   rbm.RF_NO AS BillNo,
                   rbm.RFD_DATE AS BillDate,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME) AS Ptname,
                   -1 * MAX (NVL (rbm.RFN_NETAMT, 0)) AS Net,
                   -1 * SUM (NVL (rbd.RFN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1 * SUM (NVL (rbm.RFN_TOTTAX, 0) + NVL (rbm.RFN_TOTCESS, 0))
                      AS Tax
              FROM REFUNDBILLMAST rbm
                   JOIN REFUNDBILLDETL rbd
                      ON rbd.RFC_SLNO = rbm.RFC_SLNO
                   JOIN BILLDETL bd
                      ON bd.BMC_SLNO = rbd.BMC_SLNO AND bd.BMC_CNT = rbd.BMC_CNT
                   JOIN BILLMAST bm
                      ON bm.BMC_SLNO = bd.BMC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = rbm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = bm.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = bd.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE     bm.BMC_CACR IN ('C', 'R')
                   AND rbm.RFC_CACR IN ('C', 'R')
                   AND NVL (rbm.RFC_CANCEL, 'N') = 'N'
                   AND NVL (bd.BMC_CANCEL, 'N') = 'N'
                   AND ( (rbm.RFC_RETCNCODE IS NULL
                          AND rbm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE)
                        OR (rbm.RFC_RETCNCODE IS NOT NULL
                            AND rbm.RFD_RETDATE BETWEEN dp.from_date
                                                    AND dp.TO_DATE))
          GROUP BY rbm.RFC_SLNO,
                   rbm.RF_NO,
                   rbm.RFD_DATE,
                   bm.PT_NO,
                   INITCAP (p.PTC_PTNAME),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC)
          UNION ALL
          SELECT pb.BMC_SLNO AS Slno,
                 pb.BM_NO AS BillNo,
                 pb.BMD_DATE AS BillDate,
                 pb.PT_NO,
                 TRIM (INITCAP (pb.HOC_PTNAME)) AS Ptname,
                 (  NVL (pb.BMN_NETAMT, 0)
                  + NVL (pb.BMN_SALETAXCH, 0)
                  + NVL (pb.BMN_CESSCH, 0)
                  + NVL (pb.BMN_SALETAXCR, 0)
                  + NVL (pb.BMN_CESSCR, 0))
                    AS Net,
                 NVL (pb.BMN_DISAMT, 0) AS Discount,
                 INITCAP (da.DAC_DESC) AS Dac_Desc,
                 da.DA_CODE,
                 INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                 (  NVL (pb.BMN_SALETAXCH, 0)
                  + NVL (pb.BMN_SALETAXCR, 0)
                  + NVL (pb.BMN_CESSCH, 0)
                  + NVL (pb.BMN_CESSCR, 0))
                    AS Tax
            FROM PBILLMAST pb
                 JOIN MH
                    ON MH.MH_CODE = pb.MH_CODE
                 LEFT JOIN PATIENT p
                    ON p.PT_NO = pb.PT_NO
                 LEFT JOIN DISCOUNTAUTHORITY da
                    ON da.DA_CODE = pb.DA_CODE
                 LEFT JOIN PATTYPE pt
                    ON pt.PT_CODE = p.PT_CODE
                 CROSS JOIN date_params dp
           WHERE     pb.BMC_CACR IN ('C', 'R')
                 AND NVL (pb.BMC_CANCEL, 'N') = 'N'
                 AND NVL (pb.BMN_DISAMT, 0) <> 0
                 AND ( (pb.BMC_COLLCNCODE IS NULL
                        AND pb.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE)
                      OR (pb.BMC_COLLCNCODE IS NOT NULL
                          AND pb.BMD_COLLDATE BETWEEN dp.from_date
                                                  AND dp.TO_DATE))
          UNION ALL
            SELECT mm.MRC_SLNO AS Slno,
                   mm.MR_NO AS BillNo,
                   mm.MRD_DATE AS BillDate,
                   mm.PT_NO,
                   TRIM (INITCAP (pb.HOC_PTNAME)) AS Ptname,
                   -1
                   * MAX (
                          NVL (mm.MRN_NETAMT, 0)
                        + NVL (mm.MRN_SALETAXCH, 0)
                        + NVL (mm.MRN_CESSCH, 0)
                        + NVL (mm.MRN_SALETAXCR, 0)
                        + NVL (mm.MRN_CESSCR, 0))
                      AS Net,
                   -1 * SUM (NVL (md.MRN_DISAMT, 0)) AS Discount,
                   INITCAP (da.DAC_DESC) AS Dac_Desc,
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC) AS Ptc_Desc,
                   -1
                   * SUM (
                          NVL (mm.MRN_SALETAXCH, 0)
                        + NVL (mm.MRN_SALETAXCR, 0)
                        + NVL (mm.MRN_CESSCH, 0)
                        + NVL (mm.MRN_CESSCR, 0))
                      AS Tax
              FROM MRETMAST mm
                   JOIN MRETDETL md
                      ON md.MRC_SLNO = mm.MRC_SLNO
                   JOIN PBILLMAST pb
                      ON pb.BMC_SLNO = md.BMC_SLNO
                   JOIN PBILLDETL pbd
                      ON     pbd.BMC_SLNO = md.BMC_SLNO
                         AND pbd.IT_CODE = md.IT_CODE
                         AND pbd.ITC_DOCNO = md.ITC_DOCNO
                         AND pbd.ITC_DOCTYPE = md.ITC_DOCTYPE
                         AND pbd.ITC_SLNO = md.ITC_SLNO
                   JOIN MH
                      ON MH.MH_CODE = mm.MH_CODE
                   LEFT JOIN PATIENT p
                      ON p.PT_NO = pb.PT_NO
                   LEFT JOIN DISCOUNTAUTHORITY da
                      ON da.DA_CODE = pb.DA_CODE
                   LEFT JOIN PATTYPE pt
                      ON pt.PT_CODE = p.PT_CODE
                   CROSS JOIN date_params dp
             WHERE mm.MRC_CACR IN ('C', 'R') AND NVL (mm.MRC_CANCEL, 'N') = 'N'
                   AND ( (mm.MRC_RETCNCODE IS NULL
                          AND mm.MRD_DATE BETWEEN dp.from_date AND dp.TO_DATE)
                        OR (mm.MRC_RETCNCODE IS NOT NULL
                            AND mm.MRD_RETDATE BETWEEN dp.from_date
                                                   AND dp.TO_DATE))
          GROUP BY mm.MRC_SLNO,
                   mm.MR_NO,
                   mm.MRD_DATE,
                   mm.PT_NO,
                   TRIM (INITCAP (pb.HOC_PTNAME)),
                   INITCAP (da.DAC_DESC),
                   da.DA_CODE,
                   INITCAP (pt.PTC_DESC))
GROUP BY Ptc_Desc
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

// FROM GROUPED SECTION START

const getPharmacyCollection_Two_Grouped = async (conn_ora, bind) => {
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     INCLUDE_IP
     AS (SELECT IP_NO
           FROM GTT_EXCLUDE_IP
          WHERE STATUS = 3)
SELECT SUM (NVL (pd.BDN_AMOUNT, 0)) AS Amt,
       SUM (NVL (pd.BDN_AMOUNT, 0) + NVL (pd.BMN_DISAMT, 0)) AS GrossAmt,
       SUM (NVL (pd.BMN_DISAMT, 0)) AS Discount,
       SUM (0) AS Comp,
       SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS Tax
  FROM PBILLMAST pb
       JOIN PBILLDETL pd
          ON pd.BMC_SLNO = pb.BMC_SLNO
       JOIN OPBILLMAST ob
          ON ob.OPC_SLNO = pd.OPC_SLNO
       JOIN MH
          ON MH.MH_CODE = ob.MH_CODE
       JOIN INCLUDE_IP ip
          ON ip.IP_NO = pb.IP_NO
       CROSS JOIN date_params dp
 WHERE     NVL (pb.BMC_CANCEL, 'N') = 'N'
       AND pb.BMC_CACR = 'O'
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

const getPharmacyCollection_four_Grouped = async (conn_ora, bind) => {
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     INCLUDE_IP
     AS (SELECT IP_NO
           FROM GTT_EXCLUDE_IP
          WHERE STATUS = 3)
SELECT SUM (NVL (pd.BDN_AMOUNT, 0)) AS Amt,
       SUM (NVL (pd.BDN_AMOUNT, 0) + NVL (pd.BMN_DISAMT, 0)) AS GrossAmt,
       SUM (NVL (pd.BMN_DISAMT, 0)) AS Discount,
       SUM (0) AS Comp,
       SUM (NVL (pd.BMN_CESS, 0) + NVL (pd.BMN_SALETAX, 0)) AS Tax
  FROM PBILLMAST pb
       JOIN PBILLDETL pd
          ON pd.BMC_SLNO = pb.BMC_SLNO
       JOIN DISBILLMAST dm
          ON dm.DMC_SLNO = pb.DMC_SLNO
       JOIN MH
          ON MH.MH_CODE = dm.MH_CODE
       JOIN INCLUDE_IP ip
          ON ip.IP_NO = dm.IP_NO
       CROSS JOIN date_params dp
 WHERE     NVL (pb.BMC_CANCEL, 'N') = 'N'
       AND pb.BMC_CACR = 'I'
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

const getPharmacyReturnSection_three_Grouped = async (conn_ora, bind) => {
  const sql = `WITH date_params
     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,
                TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE
           FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     INCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 3)
SELECT SUM (NVL (md.MRN_AMOUNT, 0) - NVL (md.MRN_DISAMT, 0)) * -1 AS Amt,
       SUM (NVL (md.MRN_AMOUNT, 0)) * -1 AS GrossAmt,
       SUM (NVL (md.MRN_DISAMT, 0)) * -1 AS Discount,
       SUM (0) AS Comp,
       SUM (NVL (md.MRN_CESS, 0) + NVL (md.MRN_SALETAX, 0)) * -1 AS Tax
  FROM MRETDETL md
       JOIN PBILLMAST pb
          ON pb.BMC_SLNO = md.BMC_SLNO
       JOIN DISBILLMAST dm
          ON dm.DMC_SLNO = pb.DMC_SLNO
       JOIN MH
          ON MH.MH_CODE = dm.MH_CODE
       JOIN INCLUDE_IP ip
          ON ip.IP_NO = dm.IP_NO
       CROSS JOIN date_params dp
 WHERE     md.MRC_CACR IN ('I')
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

/******
 *
 * DETAILED REPORT QUERY
 *
 *
 */

const get_CreditInsuranceBillCollection = async (conn_ora, bind) => {
  const sql = `WITH GTT_FILTER
     AS (SELECT/*+ MATERIALIZE */ DISTINCT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1),
     R_FILTER AS (SELECT DISTINCT RCC_SLNO, IP_NO FROM Recpcollectiondetl),
     BASE
     AS (SELECT X.RCC_SLNO,
                X.Rc_no,
                X.Rcd_date,
                X.Rfd_Date,
                NVL (X.Rcn_cash, 0) Rcn_cash,
                NVL (X.Rcn_chk, 0) Rcn_chk,
                NVL (X.Rcn_dd, 0) Rcn_dd,
                NVL (X.Rcn_Card, 0) Rcn_card,
                NVL (X.RCN_NEFT, 0) Rcn_bank,
                NVL (X.Rfn_Cash, 0) Rfn_cash,
                NVL (X.Rfn_Chk, 0) Rfn_chk,
                NVL (X.Rfn_Dd, 0) Rfn_dd,
                NVL (X.Rfn_Card, 0) Rfn_card,
                INITCAP (X.Rcc_Bank) Bank,
                INITCAP (Y.Cuc_name) Customer,
                INITCAP (Z.Usc_name) UserName
           FROM Recpcollectionmast X
                JOIN Customer Y
                   ON X.Cu_code = Y.Cu_code
                LEFT JOIN Users Z
                   ON X.Us_code = Z.Us_code
          WHERE NVL (X.Rcc_cancel, 'N') = 'N'
                AND X.MH_CODE IN (SELECT MH_CODE FROM multihospital))
            -- COLLECTION
            SELECT B.Rc_no BillNo,
                  B.Rcn_cash Cash,
                  B.Rcn_chk Cheque,
                  B.Rcn_dd DD,
                  B.Rcn_card Card,
                  B.Rcn_bank Bankamt,
                  B.Bank,
                  B.Customer,
                  B.UserName
            FROM BASE B
                  LEFT JOIN R_FILTER R ON R.RCC_SLNO = B.RCC_SLNO
                  LEFT JOIN GTT_FILTER G  ON G.IP_NO = R.IP_NO
            WHERE B.Rcd_date BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                  AND (R.IP_NO IS NULL OR G.IP_NO IS NULL)
                  GROUP BY B.Rc_no, B.Rcn_cash, B.Rcn_chk, B.Rcn_dd, B.Rcn_card, B.Rcn_bank, B.Bank, B.Customer, B.UserName
            UNION ALL
            SELECT B.Rc_no BillNo,
                  B.Rfn_cash Cash,
                  B.Rfn_chk Cheque,
                  B.Rfn_dd DD,
                  B.Rfn_card Card,
                  0 Bankamt,
                  B.Bank,
                  B.Customer,
                  B.UserName
            FROM BASE B
                  LEFT JOIN R_FILTER R ON R.RCC_SLNO = B.RCC_SLNO
                  LEFT JOIN GTT_FILTER G ON G.IP_NO = R.IP_NO
            WHERE B.Rfd_Date BETWEEN TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AND TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                  AND (R.IP_NO IS NULL OR G.IP_NO IS NULL)
                  GROUP BY B.Rc_no, B.Rfn_cash, B.Rfn_chk, B.Rfn_dd, B.Rfn_card, B.Bank, B.Customer, B.UserName`;
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

const get_CreditInsuranceBillDetail = async (conn_ora, bind) => {
  const sql = `WITH date_params AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
     MH AS (SELECT MH_CODE FROM multihospital),
     EXCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1),
     CUS AS (SELECT CU_CODE, CUC_NAME FROM CUSTOMER),
     USR AS (SELECT US_CODE, USC_NAME FROM USERS)
        SELECT 
                RM.PTC_NAME,
                RM.PT_NO,
                RM.RP_NO,
                SUM (NVL (rm.RPN_TOTTAX, 0)) AS Tax,
                SUM (NVL (rm.RPN_CREDIT, 0)) AS Amt,
                CUS.CUC_NAME,
                USR.USC_NAME
          FROM RECEIPTMAST rm
                JOIN CUS ON CUS.CU_CODE = RM.CU_CODE
                JOIN USR ON USR.US_CODE = RM.US_CODE
                JOIN MH ON MH.MH_CODE = rm.MH_CODE
                CROSS JOIN date_params dp
         WHERE rm.RPC_CACR = 'R'
               AND NVL (rm.RPC_CANCEL, 'N') <> 'C'
               AND rm.RPC_COLLCNCODE IS NULL
               AND rm.RPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
               AND NVL (rm.RPN_CREDIT, 0) <> 0
         GROUP BY RM.PTC_NAME,RM.PT_NO,RM.RP_NO,CUS.CUC_NAME,USR.USC_NAME      
         UNION ALL
         SELECT 
                NULL AS PTC_NAME,
                OB.PT_NO,
                OB.OP_NO,
                SUM (NVL (ob.OPN_TOTTAX, 0)) AS Tax,
                SUM (NVL (ob.OPN_CREDIT, 0) + NVL (ob.OPN_COPAYDED_CREDIT, 0)) AS Amt,
                CUS.CUC_NAME,
                USR.USC_NAME
         FROM OPBILLMAST ob
                JOIN CUS ON CUS.CU_CODE = OB.CU_CODE
                JOIN USR ON USR.US_CODE = OB.US_CODE
                JOIN MH ON MH.MH_CODE = ob.MH_CODE
                CROSS JOIN date_params dp
         WHERE ob.OPC_CACR IN ('C', 'R')
               AND NVL (ob.OPN_CANCEL, 'N') = 'N'
               AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
               AND (NVL (ob.OPN_CREDIT, 0) + NVL (ob.OPN_SALETAXCR, 0)) <> 0
        GROUP BY OB.PT_NO,OB.OP_NO,CUS.CUC_NAME,USR.USC_NAME
        UNION ALL
        SELECT 
                BM.PTC_NAME,
                BM.PT_NO,
                BM.BM_NO, 
                SUM (NVL (bm.BMN_TOTTAX, 0) + NVL (bm.BMN_TOTCESS, 0)) AS Tax,
                SUM (NVL (bm.BMN_CREDIT, 0)) AS Amt,
                CUS.CUC_NAME,
                USR.USC_NAME
          FROM BILLMAST bm
                JOIN CUS ON CUS.CU_CODE = BM.CU_CODE
                JOIN USR ON USR.US_CODE = BM.US_CODE
                JOIN MH ON MH.MH_CODE = bm.MH_CODE
                CROSS JOIN date_params dp
         WHERE bm.BMC_CACR = 'R'
               AND NVL (bm.BMC_CANCEL, 'N') <> 'C'
               AND bm.BMC_COLLCNCODE IS NULL
               AND bm.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        GROUP BY BM.PTC_NAME,BM.PT_NO,BM.BM_NO,CUS.CUC_NAME,USR.USC_NAME
        UNION ALL
        SELECT 
                PB.HOC_PTNAME,
                PB.PT_NO,
                PB.BM_NO,
                SUM ( NVL (pb.BMN_SALETAXCH, 0) + NVL (pb.BMN_SALETAXCR, 0) + NVL (pb.BMN_CESSCH, 0) + NVL (pb.BMN_CESSCR, 0)) AS Tax,
                SUM ( NVL (pb.BMN_CREDIT, 0) + NVL (pb.BMN_SALETAXCR, 0) + NVL (pb.BMN_CESSCR, 0) + NVL (pb.BMN_COPAYDED_CREDIT, 0)) AS Amt,
                CUS.CUC_NAME,
                USR.USC_NAME
        FROM PBILLMAST pb
               JOIN CUS ON CUS.CU_CODE = PB.CU_CODE
               JOIN USR ON USR.US_CODE = PB.US_CODE
               JOIN MH ON MH.MH_CODE = pb.MH_CODE
               CROSS JOIN date_params dp
         WHERE  pb.BMC_CACR = 'R'
               AND NVL (pb.BMC_CANCEL, 'N') IN ('N', 'P')
               AND pb.BMC_COLLCNCODE IS NULL
               AND NVL (pb.BMN_CREDIT, 0) <> 0
               AND pb.BMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
        GROUP BY PB.HOC_PTNAME,PB.PT_NO,PB.BM_NO,CUS.CUC_NAME,USR.USC_NAME
        UNION ALL
        SELECT 
            NULL AS PT_NAME,
            DM.PT_NO,
            DM.DM_NO,
            SUM (NVL (dm.DMN_SALESTAXCH, 0) + NVL (dm.DMN_SALESTAXCR, 0) + NVL (dm.DMN_CESSCH, 0) + NVL (dm.DMN_CESSCR, 0)) AS Tax,
            SUM (NVL (dm.DMN_FINALCREDIT, 0) + NVL (dm.DMN_COPAYDED_CREDIT, 0)) AS Amt,
            CUS.CUC_NAME,
            USR.USC_NAME
          FROM DISBILLMAST dm
               JOIN CUS ON CUS.CU_CODE = DM.CU_CODE
               JOIN USR ON USR.US_CODE = DM.US_CODE
               JOIN MH ON MH.MH_CODE = dm.MH_CODE
               LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = dm.IP_NO
               CROSS JOIN date_params dp
         WHERE  dm.DMC_CACR = 'R'
               AND NVL (dm.DMC_CANCEL, 'N') = 'N'
               AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
               AND ex.IP_NO IS NULL
         GROUP BY DM.PT_NO,DM.DM_NO,CUS.CUC_NAME,USR.USC_NAME
         UNION ALL
         SELECT
                BM.PTC_NAME,
                BM.PT_NO,
                BM.BM_NO,
                SUM (NVL (bm.BMN_TOTTAX, 0) + NVL (bm.BMN_TOTCESS, 0)) AS Tax,
                SUM (NVL (bm.BMN_CREDIT, 0)) AS Amt,
                CUS.CUC_NAME,
                USR.USC_NAME
          FROM BILLMAST bm
               JOIN CUS ON CUS.CU_CODE = BM.CU_CODE
               JOIN USR ON USR.US_CODE = BM.US_CODE
               JOIN MH ON MH.MH_CODE = bm.MH_CODE
               CROSS JOIN date_params dp
         WHERE bm.BMC_CACR = 'R'
               AND NVL (bm.BMC_CANCEL, 'N') = 'N'
               AND bm.BMC_COLLCNCODE IS NOT NULL
               AND bm.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
       GROUP BY BM.PTC_NAME,BM.PT_NO,BM.BM_NO,CUS.CUC_NAME,USR.USC_NAME
       UNION ALL
            SELECT 
                PB.HOC_PTNAME,
                PB.PT_NO,
                PB.BM_NO,
                SUM ( NVL (pb.BMN_SALETAXCH, 0) + NVL (pb.BMN_SALETAXCR, 0) + NVL (pb.BMN_CESSCH, 0)  + NVL (pb.BMN_CESSCR, 0)) AS Tax,
                SUM (NVL (pb.BMN_CREDIT, 0)  + NVL (pb.BMN_SALETAXCR, 0) + NVL (pb.BMN_CESSCR, 0) + NVL (pb.BMN_COPAYDED_CREDIT, 0)) AS Amt,
                CUS.CUC_NAME,
                USR.USC_NAME
          FROM PBILLMAST pb
               JOIN CUS ON CUS.CU_CODE = PB.CU_CODE
               JOIN USR ON USR.US_CODE = PB.US_CODE
               JOIN MH ON MH.MH_CODE = pb.MH_CODE
               CROSS JOIN date_params dp
         WHERE     pb.BMC_CACR = 'R'
               AND NVL (pb.BMC_CANCEL, 'N') = 'N'
               AND pb.BMC_COLLCNCODE IS NOT NULL
               AND pb.BMD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
        GROUP BY PB.HOC_PTNAME,PB.PT_NO,PB.BM_NO,CUS.CUC_NAME,USR.USC_NAME 
        UNION ALL
        SELECT 
                RM.PTC_NAME,
                RM.PT_NO,
                RM.RP_NO,
                SUM (NVL (rm.RPN_CREDIT, 0)) AS Amt,
                SUM (NVL (rm.RPN_TOTTAX, 0)) AS Tax,
                CUS.CUC_NAME,
                USR.USC_NAME
        FROM RECEIPTMAST rm
               JOIN CUS ON CUS.CU_CODE = RM.CU_CODE
               JOIN USR ON USR.US_CODE = RM.US_CODE
               JOIN MH ON MH.MH_CODE = rm.MH_CODE
               CROSS JOIN date_params dp
        WHERE rm.RPC_CACR = 'R'
               AND NVL (rm.RPC_CANCEL, 'N') = 'N'
               AND rm.RPC_COLLCNCODE IS NOT NULL
               AND rm.RPD_COLLDATE BETWEEN dp.from_date AND dp.TO_DATE
               GROUP BY RM.PTC_NAME,RM.PT_NO,RM.RP_NO,CUS.CUC_NAME,USR.USC_NAME
        UNION ALL
        SELECT 
                              NULL AS PTC_NAME,
                              NULL AS PT_NO,
                              RRM.RF_NO,
                              -1 * SUM (NVL (rrm.RFN_TOTTAX, 0)) AS Tax,
                              -1 * SUM (NVL (rrm.RPN_RTCREDIT, 0)) AS Amt,
                            CUS.CUC_NAME,
                            USR.USC_NAME              
                          FROM REFUNDRECEIPTMAST rrm
                              JOIN CUS ON CUS.CU_CODE = RRM.RFC_CU_CODE
                              JOIN USR ON USR.US_CODE = RRM.US_CODE
                              JOIN MH ON MH.MH_CODE = rrm.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE rrm.RFC_CACR = 'R'
                              AND NVL (rrm.RFC_CANCEL, 'N') <> 'C'
                              AND NVL (rrm.RPN_RTCREDIT, 0) > 0
                              AND rrm.ROC_SLNO IS NULL
                              AND rrm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                         GROUP BY RRM.RF_NO,CUS.CUC_NAME,USR.USC_NAME
         UNION ALL 
         SELECT 
                                NULL AS PTC_NAME,
                                NULL AS PT_NO,
                                RBM.RF_NO,
                                -1 * SUM (NVL (rbm.RFN_TOTTAX, 0) + NVL (rbm.RFN_TOTCESS, 0)) AS Tax,
                                -1 * SUM (NVL (rbm.BMN_RTCREDIT, 0)) AS Amt,
                                CUS.CUC_NAME,
                                USR.USC_NAME    
                          FROM REFUNDBILLMAST rbm
                              JOIN CUS ON CUS.CU_CODE = RBM.RFC_CU_CODE
                              JOIN USR ON USR.US_CODE = RBM.US_CODE  
                              JOIN MH ON MH.MH_CODE = rbm.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE     rbm.RFC_CACR = 'R'
                              AND NVL (rbm.RFC_CANCEL, 'N') <> 'C'
                              AND rbm.RFC_RETCNCODE IS NULL
                              AND NVL (rbm.BMN_RTCREDIT, 0) > 0
                              AND rbm.ROC_SLNO IS NULL
                              AND rbm.RFD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        GROUP BY RBM.RF_NO, CUS.CUC_NAME,USR.USC_NAME
                        UNION ALL
          SELECT 
                                MR.HOC_PTNAME,
                                MR.PT_NO,
                                MR.MR_NO,
                                -1 * SUM (NVL (mr.MRN_SALETAXCH, 0) + NVL (mr.MRN_SALETAXCR, 0) + NVL (mr.MRN_CESSCH, 0) + NVL (mr.MRN_CESSCR, 0)) AS Tax,
                                -1 * SUM ( NVL (mr.BMN_RTCREDIT, 0) + NVL (mr.MRN_SALETAXCR, 0) + NVL (mr.MRN_CESSCR, 0)) AS Amt, 
                                CUS.CUC_NAME,
                                USR.USC_NAME
                        FROM MRETMAST mr
                              JOIN CUS ON CUS.CU_CODE = MR.CU_CODE
                              JOIN USR ON USR.US_CODE = MR.US_CODE  
                              JOIN MH ON MH.MH_CODE = mr.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE mr.MRC_CACR = 'R'
                              AND NVL (mr.MRC_CANCEL, 'N') <> 'Y'
                              AND NVL (mr.BMN_RTCREDIT, 0) > 0
                              AND mr.MRC_RETCNCODE IS NULL
                              AND mr.MRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        GROUP BY MR.HOC_PTNAME,MR.PT_NO,MR.MR_NO, CUS.CUC_NAME,USR.USC_NAME 
               UNION ALL
               SELECT 
                               NULL AS PT_NAME,
                               OPM.PT_NO,
                               OBR.RO_NO,   
                                -1 * SUM (NVL (obr.RON_TOTTAX, 0)) AS Tax,
                                -1 * SUM (NVL (obr.RON_CREDIT, 0)) AS Amt,
                                CUS.CUC_NAME,
                                USR.USC_NAME
                        FROM OPBILLREFUNDMAST obr
                              JOIN OPBILLMAST OPM ON OPM.OPC_SLNO = OBR.OPC_SLNO
                              JOIN CUS ON CUS.CU_CODE = OPM.CU_CODE
                              JOIN USR ON USR.US_CODE = OBR.US_CODE
                              JOIN MH ON MH.MH_CODE = obr.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE NVL (obr.ROC_CANCEL, 'N') = 'N'
                              AND obr.ROC_CACR = 'R'
                              AND NVL (obr.RON_CREDIT, 0) <> 0
                              AND obr.ROD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                    GROUP BY OPM.PT_NO,OBR.RO_NO,CUS.CUC_NAME,USR.USC_NAME
                    UNION ALL
                    SELECT 
                                NULL AS PTC_NAME,
                                IPM.PT_NO,
                                IPM.RI_NO,
                                -1 * SUM (NVL (ipm.RIN_TOTTAX, 0)) AS Tax,
                                -1 * SUM (NVL (ipm.RIN_CREDIT, 0)) AS Amt,
                                CUS.CUC_NAME,
                                USR.USC_NAME
                          FROM IPREFUNDMAST ipm
                              JOIN CUS ON CUS.CU_CODE = IPM.CU_CODE
                              JOIN USR ON USR.US_CODE = IPM.US_CODE
                              JOIN MH ON MH.MH_CODE = ipm.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE ipm.RIC_CACR = 'R'
                              AND NVL (ipm.RIC_CANCEL, 'N') = 'N'
                              AND ipm.DMC_SLNO IS NOT NULL
                              AND ipm.RID_DATE BETWEEN dp.from_date AND dp.TO_DATE
                    GROUP BY IPM.PT_NO,IPM.RI_NO,CUS.CUC_NAME,USR.USC_NAME`;
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

const get_UnsettledAmount_TMCH = async (conn_ora, bind) => {
  const sql = `WITH date_params
                    AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date,  TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                    MH AS (SELECT MH_CODE FROM multihospital),
                    EXCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                SELECT 
                        PT.PTC_PTNAME,
                        DT.PT_NO,
                        DT.DM_NO,
                        SUM (Tax) AS Tax,
                        SUM (Payable) AS Amt, 
                        CU.CUC_NAME,
                        DO.DOC_NAME,
                        US.USC_NAME
                  FROM (/* DISBILLMAST */
                        SELECT 
                                DM.PT_NO,
                                DM.DM_NO,
                                SUM (NVL (dm.DMN_SALESTAXCH, 0) + NVL (dm.DMN_SALESTAXCR, 0) + NVL (dm.DMN_CESSCH, 0) + NVL (dm.DMN_CESSCR, 0)) AS Tax,
                                SUM (NVL (dm.DMN_FINALPTPAYABLE, 0)) AS Payable,
                                DM.CU_CODE,
                                DM.DO_CODE,
                                DM.US_CODE
                          FROM DISBILLMAST dm
                              JOIN MH ON MH.MH_CODE = dm.MH_CODE
                              LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE  dm.DMC_CACR IN ('C', 'R')
                              AND NVL (dm.DMC_CANCEL, 'N') = 'N'
                              AND NVL (dm.DMN_FINALPTPAYABLE, 0) <> 0
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                              GROUP BY DM.PT_NO,DM.DM_NO,DM.CU_CODE,DM.DO_CODE,DM.US_CODE
                        UNION ALL
                        /* IPRECEIPT */
                        SELECT 
                                DM.PT_NO,
                                DM.DM_NO,
                                -1 * SUM ( NVL (dm.DMN_SALESTAXCH, 0) + NVL (dm.DMN_SALESTAXCR, 0)  + NVL (dm.DMN_CESSCH, 0) + NVL (dm.DMN_CESSCR, 0)) AS Tax,
                                -1 * SUM ( (  NVL (ir.IRN_AMOUNT, 0) + NVL (ir.IRN_CHEQUE, 0) + NVL (ir.IRN_CARD, 0) + NVL (ir.IRN_NEFT, 0)) - (  NVL (ir.IRN_BALANCE, 0) + NVL (ir.IRN_REFCHEQ, 0) + NVL (ir.IRN_REFCARD, 0)) + NVL (ir.IRN_DISCOUNT, 0)) AS Payable, 
                                DM.CU_CODE,
                                DM.DO_CODE,
                                DM.US_CODE
                          FROM IPRECEIPT ir
                              JOIN DISBILLMAST dm ON ir.DMC_SLNO = dm.DMC_SLNO
                              JOIN MH ON MH.MH_CODE = ir.IPC_MHCODE
                              LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = dm.IP_NO
                              CROSS JOIN date_params dp
                        WHERE     ir.DMC_TYPE IN ('C', 'R')
                              AND ir.IRC_CANCEL IS NULL
                              AND ir.IRD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND dm.DMD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                              AND ex.IP_NO IS NULL
                              AND ( (  NVL (ir.IRN_AMOUNT, 0)
                                      + NVL (ir.IRN_CHEQUE, 0)
                                      + NVL (ir.IRN_CARD, 0)
                                      + NVL (ir.IRN_NEFT, 0))
                                    - (  NVL (ir.IRN_BALANCE, 0)
                                      + NVL (ir.IRN_REFCHEQ, 0)
                                      + NVL (ir.IRN_REFCARD, 0))
                                    + NVL (ir.IRN_DISCOUNT, 0)) <> 0
                        GROUP BY DM.PT_NO,DM.DM_NO,DM.CU_CODE,DM.DO_CODE,DM.US_CODE            
                        UNION ALL
                        /* OPBILLMAST */
                        SELECT 
                            OB.PT_NO,
                            OB.OP_NO,
                            SUM (NVL (ob.OPN_SALETAXCH, 0) + NVL (ob.OPN_SALETAXCR, 0)) AS Tax,
                            SUM (NVL (ob.RPN_PTPAYABLE, 0)) AS Payable,
                            OB.CU_CODE,
                            OB.DO_CODE,
                            OB.US_CODE
                          FROM OPBILLMAST ob
                              JOIN MH ON MH.MH_CODE = ob.MH_CODE
                              CROSS JOIN date_params dp
                        WHERE  ob.OPC_CACR IN ('C', 'R')
                              AND NVL (ob.OPN_CANCEL, 'N') <> 'C'
                              AND ob.RPN_PTPAYABLE > 0
                              AND ob.OPD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                   GROUP BY OB.PT_NO,OB.OP_NO,OB.CU_CODE,OB.DO_CODE,OB.US_CODE
                   ) DT
                   JOIN PATIENT PT ON PT.PT_NO = DT.PT_NO
                   JOIN DOCTOR DO ON DO.DO_CODE = DT.DO_CODE
                   JOIN USERS US ON US.US_CODE = DT.US_CODE
                   LEFT JOIN CUSTOMER CU ON CU.CU_CODE = DT.CU_CODE
                   GROUP BY DT.PT_NO,DT.DM_NO,PT.PTC_PTNAME,CU.CUC_NAME,DO.DOC_NAME,US.USC_NAME`;
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

const getAdvanceCollection = async (conn_ora, bind) => {
  const sql = `WITH date_params
                     AS (SELECT TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') AS from_date, TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') AS TO_DATE FROM DUAL),
                     MH AS (SELECT MH_CODE FROM multihospital),
                     EXCLUDE_IP AS (SELECT IP_NO FROM GTT_EXCLUDE_IP WHERE STATUS = 1)
                  SELECT 
                     AD.PT_NO,
                     PT.PTC_PTNAME,
                     AD.AR_NO,
                     SUM (Amt) AS Amt, 
                     SUM (Tax) AS Tax,
                     US.USC_NAME
                  FROM (
                        SELECT 
                              OA.PT_NO,
                              OA.AR_NO,
                              SUM (NVL (oa.ARN_AMOUNT, 0)) AS Amt, 
                              0 AS Tax,
                              OA.US_CODE
                           FROM OPADVANCE oa
                                 JOIN MH ON MH.MH_CODE = oa.MH_CODE
                                 LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = oa.IP_NO
                                 CROSS JOIN date_params dp
                           WHERE  NVL (oa.ARC_CANCEL, 'N') = 'N'
                                 AND oa.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                                 AND ex.IP_NO IS NULL
                           GROUP BY OA.PT_NO,OA.AR_NO,OA.US_CODE
                        UNION ALL
                        SELECT 
                              PA.PT_NO,
                              PA.AR_NO,
                              SUM (NVL (pa.ARN_AMOUNT, 0)) AS Amt, 
                              0 AS Tax,
                              PA.US_CODE
                           FROM PHADVANCEENTRY pa
                                 JOIN MH ON MH.MH_CODE = pa.ARC_MHCODE
                                 CROSS JOIN date_params dp
                           WHERE NVL (pa.ARC_CANCEL, 'N') = 'N'
                                 AND pa.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        GROUP BY PA.PT_NO,PA.AR_NO,PA.US_CODE
                        UNION ALL
                        SELECT 
                                 IA.IP_NO,
                                 IA.AR_NO,
                                 SUM (NVL (ia.ARN_AMOUNT, 0)) AS Amt, 
                                 0 AS Tax,
                                 IA.US_CODE
                           FROM IPADVANCE ia
                                 JOIN MH ON MH.MH_CODE = ia.IAC_MHCODE
                                 LEFT JOIN EXCLUDE_IP ex ON ex.IP_NO = ia.IP_NO
                                 CROSS JOIN date_params dp
                           WHERE NVL (ia.ARC_CANCEL, 'N') = 'N'
                                 AND ia.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                                 AND ex.IP_NO IS NULL
                        GROUP BY IA.IP_NO,IA.AR_NO,IA.US_CODE
                        UNION ALL
                        SELECT 
                                 AE.PT_NO,
                                 AE.AR_NO,
                                 SUM (NVL (ae.ARN_AMOUNT, 0)) AS Amt, 
                                 0 AS Tax,
                                 AE.US_CODE
                           FROM ADVANCEENTRY ae
                                 JOIN MH ON MH.MH_CODE = ae.ARC_MHCODE
                                 CROSS JOIN date_params dp
                           WHERE NVL (ae.ARC_CANCEL, 'N') = 'N'
                                 AND ae.ARD_DATE BETWEEN dp.from_date AND dp.TO_DATE
                        GROUP BY AE.PT_NO,AE.AR_NO,AE.US_CODE
                        ) AD
                        JOIN PATIENT PT ON PT.PT_NO  = AD.PT_NO
                        JOIN USERS US ON US.US_CODE = AD.US_CODE
                        GROUP BY AD.PT_NO,AD.AR_NO, AD.US_CODE,PT.PTC_PTNAME,US.USC_NAME`;
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
  getPharmacyCollection_Two_Grouped,
  getPharmacyReturnSection_three_Grouped,
  getPharmacyCollection_four_Grouped,
  get_CreditInsuranceBillCollection,
  get_CreditInsuranceBillDetail,
  get_UnsettledAmount_TMCH,
  getAdvanceCollection,
};
