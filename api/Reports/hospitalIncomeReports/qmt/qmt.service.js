const {oracledb} = require("../../../../config/oradbconfig");
const getMisincexpmast = async (conn_ora) => {
  const sql = `SELECT * FROM MISINCEXPMAST`;
  const result = await conn_ora.execute(sql, {}, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

const getUngroupedRoomDetl = async (conn_ora, bind) => {
  //   console.log(bind);
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (
                            NVL (disroomdetl.drn_nurdays, 0) * NVL (disroomdetl.drn_nuramt, 0))
                            Amt,
                        SUM (0) tax,
                        SUM (
                            NVL (disroomdetl.drn_nurdays, 0) * NVL (disroomdetl.drn_nuramt, 0))
                            GrossAmt,
                        SUM (0) Discount
                    FROM Disroomdetl,
                        Disbillmast,
                        Ipparam,
                        Misincexpdtl,
                        Misincexpgroup
                WHERE     Disbillmast.Dmc_Slno = Disroomdetl.Dmc_Slno
                        AND Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode(+)
                        AND Misincexpdtl.Dg_Type(+) = 'R'
                        AND Ipparam.Ipc_Nucode = Misincexpdtl.Pc_Code(+)
                        AND Disbillmast.Mh_code = Ipparam.Mh_Code
                        AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                        AND NVL (Disroomdetl.Dmc_Cancel, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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

const getTheaterIncome = async (conn_ora, bind) => {
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (srn_operation, 0) - (NVL (Patsurgery.srn_operdis, 0))) Amt,
                            SUM (NVL (Patsurgery.SRN_OPERTOTTAX, 0)) tax,
                            SUM (NVL (srn_operation, 0)) GrossAmt,
                            SUM (NVL (Patsurgery.srn_operdis, 0)) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.ipc_oper
                            AND NVL (Patsurgery.srn_operation, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_THEATER, 0) - (NVL (Patsurgery.SRN_THEARDIS, 0))) Amt,
                            SUM (NVL (Patsurgery.SRN_THEATTOTTAX, 0)) tax,
                            SUM (NVL (SRN_THEATER, 0)) GrossAmt,
                            SUM (NVL (SRN_THEARDIS, 0)) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.ipc_ther
                            AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_CHIEF, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_CHIEF, 0)) GrossAmt,
                            SUM (0) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.ipc_CHIEF
                            AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_1STASST, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_1STASST, 0)) GrossAmt,
                            SUM (0) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.ipc_1stasst
                            AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_2NDASST, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_2NDASST, 0)) GrossAmt,
                            SUM (0) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.Ipc_2NDASST
                            AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_3RDASST, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_3RDASST, 0)) GrossAmt,
                            SUM (0) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.Ipc_3RDASST
                            AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_GUEST, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_GUEST, 0)) GrossAmt,
                            SUM (0) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.Ipc_GUEST
                            AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_ANTEST, 0) - NVL (Srn_antdis, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_ANTEST, 0)) GrossAmt,
                            SUM (NVL (Srn_antdis, 0)) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.ipc_ANEST
                            AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (SRN_ANTEST2, 0)) Amt,
                            SUM (NVL (SRN_TOTTAX, 0)) tax,
                            SUM (NVL (SRN_ANTEST2, 0)) GrossAmt,
                            SUM (0) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURGERYRESOURCESDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Ipparam.Ipc_ANEST2
                            AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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
                        FROM Disbillmast,
                            Patsurgery,
                            Misincexpdtl,
                            Misincexpgroup,
                            patsurother,
                            Prodescription,
                            Progroup
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Patsurother.SR_SLNO = Patsurgery.SR_SLNO
                            AND patsurother.pd_code = Prodescription.pd_code
                            AND Prodescription.pg_Code = Progroup.pg_Code
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (PATSUROTHER.Src_Cancel, 'N') = 'N'
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (PATSURDETL.SRN_AMOUNT - NVL (patsurdetl.srn_discount, 0)) Amt,
                            SUM (NVL (Patsurdetl.PSN_TOTTAX, 0)) tax,
                            SUM (PATSURDETL.SRN_AMOUNT) GrossAmt,
                            SUM (NVL (patsurdetl.srn_discount, 0)) Discount
                        FROM Disbillmast,
                            Patsurgery,
                            Misincexpdtl,
                            Misincexpgroup,
                            PATSURDETL
                    WHERE     Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND PATSURDETL.SR_SLNO = Patsurgery.SR_SLNO
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                            AND Misincexpdtl.Dg_type(+) = 'R'
                            AND Misincexpdtl.Pc_code(+) = PATSURDETL.PC_CODE
                            AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (patsurdetl.Src_Cancel, 'N') = 'N'
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                            NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                            SUM (NVL (Cmn_Netamt, 0) - NVL (Cmn_Outcoll, 0)) Amt,
                            0 tax,
                            SUM (NVL (Cmn_Netamt, 0) - NVL (Cmn_Outcoll, 0)) GrossAmt,
                            SUM (0) AS Discount
                        FROM Canbillmast,
                            Disbillmast,
                            Ipparam,
                            Misincexpdtl,
                            Misincexpgroup
                    WHERE     Canbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Ipparam.Ipc_Canteencode = Misincexpdtl.Pc_Code(+)
                            AND Misincexpdtl.Dg_Type(+) = 'R'
                            AND Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode(+)
                            AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                            AND NVL (Canbillmast.Cmc_Cancel, 'N') = 'N'
                            AND Canbillmast.Cmc_Cacr = 'I'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Mh_code = Ipparam.Mh_Code
                            AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_Grcode, Misincexpgroup.Dg_Desc
                    ORDER BY Dg_desc`;
  //   console.log(sql);
  const result = await conn_ora.execute(
    sql,
    {
      fromDate: bind.from,
      toDate: bind.to,
    },
    {outFormat: oracledb.OUT_FORMAT_OBJECT},
  );
  //   console.log(result.rows);
  return result.rows;
};

const getConsultingIncome = async (conn_ora, bind) => {
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (NVL ( (VSN_RATE), 0) - NVL (Vsn_disamt, 0)) Amt,
                        SUM (NVL (PATVISIT.VSN_TOTTAX, 0)) tax,
                        SUM (NVL ( (VSN_RATE), 0)) GrossAmt,
                        SUM (NVL (Vsn_disamt, 0)) Discount
                    FROM PATVISIT,
                        Disbillmast,
                        Ipparam,
                        Misincexpdtl,
                        Misincexpgroup
                WHERE     PATVISIT.Dmc_Slno = Disbillmast.Dmc_Slno
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Ipparam.Ipc_vscode
                        AND Disbillmast.Mh_code = Ipparam.Mh_Code
                        AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                        AND NVL (VSC_CANCEL, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss') 
                        AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss') 
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                    NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                    SUM (
                        (NVL (
                            Rdn_Amount
                            * DECODE (
                                NVL (Dmc_Hour, 'N'),
                                'N', Rdn_Days,
                                DECODE (NVL (Dmc_Minhourtaken, 'N'), 'Y', 1, Rdn_Days)),
                            0)))
                    - SUM (NVL (Rdn_Disamt, 0))
                        Amt,
                    SUM (NVL (DISRMRENTDETL.RDN_TOTTAX, 0)) tax,
                    SUM (
                        (NVL (
                            Rdn_Amount
                            * DECODE (
                                NVL (Dmc_Hour, 'N'),
                                'N', Rdn_Days,
                                DECODE (NVL (Dmc_Minhourtaken, 'N'), 'Y', 1, Rdn_Days)),
                            0)))
                        GrossAmt,
                    SUM (NVL (Rdn_Disamt, 0)) Discount
                FROM DISRMRENTDETL,
                    Disbillmast,
                    Misincexpdtl,
                    Misincexpgroup,
                    Disroomdetl
            WHERE     DISRMRENTDETL.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND Disrmrentdetl.Rm_Slno = Disroomdetl.Rm_Slno
                    AND Disrmrentdetl.Rt_Code = Disroomdetl.Rt_Code
                    AND Disrmrentdetl.Bd_Code = Disroomdetl.Bd_Code
                    AND Disrmrentdetl.Dmc_Slno = Disroomdetl.Dmc_Slno
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                    AND Misincexpdtl.Dg_type(+) = 'R'
                    AND DISRMRENTDETL.pc_code = Misincexpdtl.pc_code(+)
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
         NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
         SUM (NVL (SVN_QTY * SVN_RATE, 0) - NVL (SVN_DISAMT, 0)) Amt,
         SUM (NVL (PATSERVICE.SVN_TOTTAX, 0)) tax,
         SUM (NVL (SVN_QTY * SVN_RATE, 0)) GrossAmt,
         SUM (NVL (SVN_DISAMT, 0)) Discount
    FROM PATSERVICE,
         Disbillmast,
         Prodescription,
         Progroup,
         Misincexpdtl,
         Misincexpgroup
   WHERE     PATSERVICE.Dmc_Slno = Disbillmast.Dmc_Slno
         AND PATSERVICE.pd_code = Prodescription.pd_code
         AND Prodescription.pg_Code = Progroup.pg_Code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
         AND NVL (SVC_CANCEL, 'N') = 'N'
         AND Disbillmast.Dmc_Cacr <> 'M'
         AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
         AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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
               AND pbillmast.BMC_COLLCNCODE IS NULL
               AND NVL (Pbillmast.Bmc_cancel, 'N') IN ('N', 'P')
               AND Pbillmast.Bmc_Cacr IN ('C', 'R', 'M')
               AND Pbillmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Pbillmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
               AND Mretmast.mrc_retcncode IS NULL
               AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
               AND NVL (Mretdetl.Mrc_Cancel, 'N') <> 'Y'
               AND NVL (Mretmast.Mrc_Cancel, 'N') <> 'Y'
               AND Mretdetl.MRC_CACR IN ('C', 'R')
               AND Mretdetl.MRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND MRETDETL.MH_CODE IN (SELECT MH_CODE FROM multihospital)
               AND Mretdetl.Mrd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')) A`;

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

const getIpRefundDetl_one = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                    SUM (
                        NVL (Iprefunditemdetl.Rin_Netamt, 0)
                        + NVL (Iprefunditemdetl.Rin_Disamt, 0))
                    * -1
                        GrossAmt,
                    SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                    SUM (0) Comp,
                    SUM (0) TAX
                FROM Iprefunditemdetl, Iprefundmast
                WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                    AND Iprefunditemdetl.Ric_Type = 'PHY'
                    AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                    AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                    AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
                        NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
                        SUM (
                            DECODE (Receiptmast.RPC_CAcr,
                                    'C', receiptdetl.rpn_netamt,
                                    'R', receiptdetl.rpn_netamt,
                                    0))
                            Amt,
                        SUM (NVL (Receiptdetl.RPN_TOTTAX, 0)) tax,
                        SUM (
                            DECODE (Receiptmast.RPC_CAcr,
                                    'C', receiptdetl.rpn_netamt,
                                    'R', receiptdetl.rpn_netamt,
                                    0)
                            + NVL (receiptdetl.rpn_disamt, 0))
                            GrossAmt,
                        SUM (DECODE (Receiptmast.rpc_cacr, 'M', receiptdetl.rpn_netamt, 0))
                            AS Comp,
                        SUM (NVL (receiptdetl.rpn_disamt, 0)) discount
                    FROM Receiptdetl,
                        Receiptmast,
                        Prodescription,
                        Progroup,
                        Misincexpdtl,
                        Misincexpgroup
                WHERE     receiptmast.RPC_COLLCNCODE IS NULL
                        AND Receiptmast.RPC_SLNO = Receiptdetl.RPC_SLNO
                        AND Receiptdetl.pd_code = Prodescription.pd_code
                        AND Prodescription.pg_code = Progroup.pg_code
                        AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                        AND Misincexpdtl.Dg_type(+) = 'R'
                        AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
                        AND (NVL (RECEIPTMAST.RPC_CANCEL, 'N') <> 'C')
                        AND Receiptmast.RPC_CAcr IN ('C', 'R', 'M')
                        AND Receiptmast.RPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND Receiptmast.RPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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

const getProcedureIncomeSection_one = async (conn_ora, bind) => {
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
       SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1
          TAX
  FROM Mretdetl, Pbilldetl, Opbillmast
 WHERE     Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
       AND Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
       AND Pbilldetl.IT_CODE = Mretdetl.It_code
       AND Pbilldetl.ITC_DOCNO = Mretdetl.Itc_docno
       AND Pbilldetl.ITC_DOCTYPE = Mretdetl.Itc_Doctype
       AND Pbilldetl.Itc_Slno = Mretdetl.Itc_slno
       AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
       AND Mretdetl.MRC_CACR IN ('O')
       AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
       AND Opbillmast.Opc_Cacr <> 'M'
       AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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
  const sql = ` SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
         NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
         SUM (
            DECODE (Receiptmast.RPC_CAcr,
                    'C', receiptdetl.rpn_netamt,
                    'R', receiptdetl.rpn_netamt,
                    0))
            Amt,
         SUM (NVL (Receiptdetl.RPN_TOTTAX, 0)) tax,
         SUM (
            DECODE (Receiptmast.RPC_CAcr,
                    'C', receiptdetl.rpn_netamt,
                    'R', receiptdetl.rpn_netamt,
                    0)
            + NVL (receiptdetl.rpn_disamt, 0))
            GrossAmt,
         SUM (DECODE (Receiptmast.rpc_cacr, 'M', receiptdetl.rpn_netamt, 0))
            AS Comp,
         SUM (NVL (receiptdetl.rpn_disamt, 0)) discount
    FROM Receiptdetl,
         Receiptmast,
         Prodescription,
         Progroup,
         Misincexpdtl,
         Misincexpgroup
   WHERE     receiptmast.RPC_COLLCNCODE IS NOT NULL
         AND Receiptmast.RPC_SLNO = Receiptdetl.RPC_SLNO
         AND Receiptdetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
         AND Receiptmast.RPC_CAcr IN ('C', 'R', 'M')
         AND Receiptmast.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND Receiptmast.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
         AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
  HAVING SUM (
            DECODE (Receiptmast.RPC_CAcr,
                    'C', receiptdetl.rpn_netamt,
                    'R', receiptdetl.rpn_netamt,
                    0)) <> 0
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

const getPharmacyCollection_Two = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
       SUM (NVL (Pbilldetl.Bdn_amount, 0) + NVL (Pbilldetl.Bmn_disamt, 0))
          GrossAmt,
       SUM (NVL (Pbilldetl.Bmn_disamt, 0)) Discount,
       SUM (0) AS Comp,
       SUM (NVL (PBILLDETL.BMN_CESS, 0) + NVL (PBILLDETL.BMN_SALETAX, 0)) TAX
  FROM Pbillmast, Pbilldetl, Opbillmast
 WHERE     Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
       AND Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
       AND NVL (Pbillmast.Bmc_cancel, 'N') = 'N'
       AND Pbillmast.Bmc_Cacr = 'O'
       AND Opbillmast.Opc_Cacr <> 'M'
       AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
       AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
       AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
         NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
         SUM (Refundreceiptdetl.rpn_netamt) * -1 Amt,
         SUM (NVL (Refundreceiptdetl.RFN_TOTTAX, 0)) * -1 tax,
         SUM (NVL (Refundreceiptdetl.RFN_TOTTAX, 0)) * -1 tax,
         SUM (
            NVL (Refundreceiptdetl.rpn_netamt, 0)
            + NVL (Refundreceiptdetl.rpn_disamt, 0))
         * -1
            GrossAmt,
         SUM (0) AS Comp,
         SUM (NVL (Refundreceiptdetl.rpn_disamt, 0)) * -1 discount
    FROM Refundreceiptdetl,
         Refundreceiptmast,
         Receiptdetl,
         Opbillmast,
         Prodescription,
         Progroup,
         Misincexpdtl,
         Misincexpgroup
   WHERE     Refundreceiptdetl.Rpc_Slno = Receiptdetl.Rpc_Slno
         AND Refundreceiptdetl.Rpc_Cnt = Receiptdetl.Rpc_Cnt
         AND Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
         AND Receiptdetl.Opc_Slno = Opbillmast.Opc_Slno
         AND Refundreceiptdetl.Pd_Code = Prodescription.Pd_Code
         AND Prodescription.Pg_Code = Progroup.Pg_Code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
         AND NVL (Refundreceiptdetl.Rfc_Cancel, 'N') = 'N'
         AND Refundreceiptmast.Rfc_Cacr IN ('O')
         AND Opbillmast.Opc_Cacr <> 'M'
         AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
         AND Opbillmast.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
         AND billmast.BMC_COLLCNCODE IS NULL
         AND Billdetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Progroup.pc_code = Misincexpdtl.pc_code(+)
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Billmast.Bmc_Cacr IN ('C', 'R', 'M')
         AND NVL (Billmast.BMC_CANCEL, 'N') <> 'C'
         AND Billmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
         AND Billmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
GROUP BY Misincexpgroup.DG_GRCODE, Misincexpgroup.DG_DESC`;
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
  const sql = `SELECT SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
       SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
       SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
       SUM (0) AS Comp,
       SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1
          TAX
  FROM Mretdetl, Pbillmast, Disbillmast
 WHERE     Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
       AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
       AND Mretdetl.MRC_CACR IN ('I')
       AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
       AND NVL (Dmc_Cancel, 'N') = 'N'
       AND Disbillmast.Dmc_Cacr <> 'M'
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
  const sql = `SELECT NVL (Misincexpgroup.Dg_desc, 'Ungrouped') Dg_desc,
         NVL (Misincexpgroup.Dg_grcode, 999) AS Code,
         SUM (Refundreceiptdetl.rpn_netamt) * -1 Amt,
         SUM (NVL (Refundreceiptdetl.RFN_TOTTAX, 0)) * -1 tax,
         SUM (
            NVL (Refundreceiptdetl.rpn_netamt, 0)
            + NVL (Refundreceiptdetl.rpn_disamt, 0))
         * -1
            GrossAmt,
         SUM (0) AS Comp,
         SUM (NVL (Refundreceiptdetl.rpn_disamt, 0)) * -1 discount
    FROM Refundreceiptdetl,
         Refundreceiptmast,
         Prodescription,
         Progroup,
         Misincexpdtl,
         Misincexpgroup
   WHERE     Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
         AND Refundreceiptdetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND NVL (Refundreceiptmast.Rfc_Cancel, 'N') <> 'C'
         AND Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
         AND Refundreceiptdetl.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND Refundreceiptdetl.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
         AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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

const getIpincomeSection_five = async (conn_ora, bind) => {
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
         Disbillmast
   WHERE     Billmast.Bmc_Slno = Billdetl.Bmc_Slno
         AND Billmast.Dmc_Slno = Disbillmast.Dmc_Slno
         AND Billdetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND Disbillmast.Dmc_Cacr <> 'M'
         AND Billmast.Bmc_Cacr = 'I'
         AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
         AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
         AND Disbillmast.dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
         AND Disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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

const getIpRefundDetlSection_four = async (conn_ora, bind) => {
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
    FROM refundbilldetl,
         refundbillmast,
         Prodescription,
         Progroup,
         Misincexpdtl,
         Misincexpgroup,
         Billmast
   WHERE     Billmast.Bmc_Slno = Refundbillmast.Bmc_Slno
         AND Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
         AND Refundbilldetl.pd_code = Prodescription.pd_code
         AND Prodescription.pg_code = Progroup.pg_code
         AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
         AND Misincexpdtl.Dg_type(+) = 'R'
         AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
         AND NVL (Refundbillmast.Rfc_Cancel, 'N') <> 'C'
         AND Refundbillmast.Rfc_Cacr IN ('C', 'R')
         AND Refundbilldetl.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
         AND Refundbilldetl.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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

const getCollectionPortion_one = async (conn_ora, bind) => {
  const sql = `SELECT SUM (
                            NVL (receiptmast.RPN_CASH, 0)
                        + NVL (receiptmast.RPN_CARD, 0)
                        + NVL (receiptmast.RPN_CHEQUE, 0))
                        AS Amt
                FROM receiptmast
                WHERE     receiptmast.RPC_CACR IN ('C', 'R')
                    AND receiptmast.RPC_CANCEL IS NULL
                    AND receiptmast.RPC_COLLCNCODE IS NULL
                    AND receiptmast.RPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND receiptmast.RPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (Opbillmast.OPN_CASH, 0)
                        + NVL (Opbillmast.OPN_CARD, 0)
                        + NVL (Opbillmast.OPN_CHEQUE, 0))
                        AS Amt
                FROM Opbillmast
                WHERE Opbillmast.OPC_CACR IN ('C', 'R') AND Opbillmast.OPN_CANCEL IS NULL
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (billmast.BMN_CASH, 0)
                        + NVL (billmast.BMN_CARD, 0)
                        + NVL (billmast.BMN_CHEQUE, 0))
                        AS Amt
                FROM billmast
                WHERE     billmast.Bmc_Cacr IN ('C', 'R')
                    AND billmast.BMC_CANCEL IS NULL
                    AND BILLMAST.BMC_COLLCNCODE IS NULL
                    AND billmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND billmast.BMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (Pbillmast.BMN_CARD, 0)
                        + NVL (Pbillmast.BMN_CASH, 0)
                        + NVL (Pbillmast.BMN_CHEQUE, 0))
                        AS Amt
                FROM Pbillmast
                WHERE     Pbillmast.Bmc_Cacr IN ('C', 'R')
                    AND Pbillmast.bmc_cancel = 'N'
                    AND pbillmast.BMC_COLLCNCODE IS NULL
                    AND Pbillmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.BMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (ipreceipt.irn_amount, 0)
                        + NVL (ipreceipt.irn_card, 0)
                        + NVL (ipreceipt.irn_cheque, 0)
                        + NVL (ipreceipt.irn_neft, 0))
                    - SUM (
                            NVL (irn_balance, 0)
                            + NVL (IRN_REFCHEQ, 0)
                            + NVL (IPRECEIPT.IRN_REFCARD, 0))
                        Amt
                FROM IPRECEIPT, Disbillmast
                WHERE Disbillmast.Dmc_Slno = IPRECEIPT.Dmc_Slno
                    AND IPRECEIPT.DMC_TYPE IN ('C', 'R')
                    AND DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND IRC_CANCEL IS NULL
                    AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND IRD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                UNION ALL
                SELECT SUM (
                            NVL (billmast.BMN_CASH, 0)
                        + NVL (billmast.BMN_CARD, 0)
                        + NVL (billmast.BMN_CHEQUE, 0))
                        AS Amt
                FROM billmast
                WHERE     billmast.Bmc_Cacr IN ('C', 'R')
                    AND billmast.BMC_CANCEL IS NULL
                    AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                    AND BILLMAST.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND BILLMAST.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (receiptmast.RPN_CASH, 0)
                        + NVL (receiptmast.RPN_CARD, 0)
                        + NVL (receiptmast.RPN_CHEQUE, 0))
                        AS Amt
                FROM receiptmast
                WHERE     receiptmast.RPC_CACR IN ('C', 'R')
                    AND receiptmast.RPC_CANCEL IS NULL
                    AND receiptmast.RPC_COLLCNCODE IS NOT NULL
                    AND receiptmast.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND receiptmast.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (Pbillmast.BMN_CARD, 0)
                        + NVL (Pbillmast.BMN_CASH, 0)
                        + NVL (Pbillmast.BMN_CHEQUE, 0))
                        AS Amt
                FROM Pbillmast
                WHERE     Pbillmast.Bmc_Cacr IN ('C', 'R')
                    AND NVL (Pbillmast.bmc_cancel, 'N') = 'N'
                    AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                    AND Pbillmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;
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
  const sql = `SELECT SUM (Amt) Amt, SUM (Tax) Tax
  FROM (SELECT SUM (
                  (  NVL (Ipreceipt.irn_amount, 0)
                   + NVL (Ipreceipt.irn_cheque, 0)
                   + NVL (Ipreceipt.irn_card, 0)
                   + NVL (Ipreceipt.irn_neft, 0))
                  - (  NVL (Ipreceipt.irn_balance, 0)
                     + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                     + NVL (Ipreceipt.irn_refcard, 0)))
                  Amt,
               0 tax
          FROM ipreceipt, Disbillmast
         WHERE Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
               AND Disbillmast.Dmd_date < TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Ipreceipt.Dmc_type IN ('C', 'R')
               AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
               AND ird_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
               AND Irc_cancel IS NULL
        UNION ALL
          SELECT SUM (
                    DECODE (RECEIPTMAST.RPC_CACR,
                            'R', NVL (RPN_CASH, 0),
                            'C', NVL (RPN_CASH, 0),
                            0))
                 + SUM (
                      DECODE (RECEIPTMAST.RPC_CACR,
                              'R', NVL (RPN_CHEQUE, 0),
                              'C', NVL (RPN_CHEQUE, 0),
                              0))
                 + SUM (
                      DECODE (RECEIPTMAST.RPC_CACR,
                              'R', NVL (RPN_CARD, 0),
                              'C', NVL (RPN_CARD, 0),
                              0))
                    Amt,
                 0 Tax
            FROM RECEIPTMAST
           WHERE     (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
                 AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                 AND RECEIPTMAST.RPC_COLLCNCODE IS NOT NULL
                 AND RECEIPTMAST.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND RECEIPTMAST.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND RECEIPTMAST.RPD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
        GROUP BY 'Registration'
        UNION ALL
          SELECT (SUM (
                     DECODE (REFUNDRECEIPTMAST.RFC_CACR,
                             'C', NVL (REFUNDRECEIPTMAST.RFN_CASH, 0),
                             'R', NVL (REFUNDRECEIPTMAST.RFN_CASH, 0),
                             0))
                  + SUM (
                       DECODE (REFUNDRECEIPTMAST.RFC_CACR,
                               'C', NVL (REFUNDRECEIPTMAST.RFN_CHEQUE, 0),
                               'R', NVL (REFUNDRECEIPTMAST.RFN_CHEQUE, 0),
                               0))
                  + SUM (
                       DECODE (REFUNDRECEIPTMAST.RFC_CACR,
                               'C', NVL (REFUNDRECEIPTMAST.RFN_CARD, 0),
                               'R', NVL (REFUNDRECEIPTMAST.RFN_CARD, 0),
                               0)))
                 * -1
                    Amt,
                 0 Tax
            FROM REFUNDRECEIPTMAST
           WHERE REFUNDRECEIPTMAST.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND REFUNDRECEIPTMAST.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND REFUNDRECEIPTMAST.RFD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
                 AND REFUNDRECEIPTMAST.MH_CODE IN
                        (SELECT MH_CODE FROM multihospital)
                 AND (NVL (REFUNDRECEIPTMAST.RFC_CANCEL, 'N') = 'N')
                 AND REFUNDRECEIPTMAST.RFC_RETCNCODE IS NOT NULL
                 AND REFUNDRECEIPTMAST.ROC_SLNO IS NULL
        GROUP BY 'Registration'
        UNION ALL
          SELECT SUM (
                    DECODE (BILLMAST.BMC_CACR,
                            'C', NVL (BILLMAST.BMN_CASH, 0),
                            'R', NVL (BILLMAST.BMN_CASH, 0),
                            0))
                 + SUM (
                      DECODE (BILLMAST.BMC_CACR,
                              'C', NVL (BILLMAST.BMN_CHEQUE, 0),
                              'R', NVL (BILLMAST.BMN_CHEQUE, 0),
                              0))
                 + SUM (
                      DECODE (BILLMAST.BMC_CACR,
                              'C', NVL (BILLMAST.BMN_CARD, 0),
                              'R', NVL (BILLMAST.BMN_CARD, 0),
                              0))
                    Amt,
                 0 Tax
            FROM BILLMAST
           WHERE     (NVL (BILLMAST.BMC_CANCEL, 'N') = 'N')
                 AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                 AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                 AND BILLMAST.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND BILLMAST.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND BILLMAST.BMD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
        GROUP BY 'Billing'
        UNION ALL
          SELECT (SUM (
                     DECODE (REFUNDBILLMAST.RFC_CACR,
                             'C', NVL (REFUNDBILLMAST.RFN_CASH, 0),
                             'R', NVL (REFUNDBILLMAST.RFN_CASH, 0),
                             0))
                  + SUM (
                       DECODE (REFUNDBILLMAST.RFC_CACR,
                               'C', NVL (REFUNDBILLMAST.RFN_CHEQUE, 0),
                               'R', NVL (REFUNDBILLMAST.RFN_CHEQUE, 0),
                               0))
                  + SUM (
                       DECODE (REFUNDBILLMAST.RFC_CACR,
                               'C', NVL (REFUNDBILLMAST.RFN_CARD, 0),
                               'R', NVL (REFUNDBILLMAST.RFN_CARD, 0),
                               0)))
                 * -1
                    AS Amt,
                 0 Tax
            FROM REFUNDBILLMAST
           WHERE REFUNDBILLMAST.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND REFUNDBILLMAST.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND refundbillmast.MH_CODE IN
                        (SELECT MH_CODE FROM multihospital)
                 AND (NVL (REFUNDBILLMAST.RFC_CANCEL, 'N') = 'N')
                 AND REFUNDBILLMAST.RFC_RETCNCODE IS NOT NULL
                 AND REFUNDBILLMAST.RFD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
                 AND REFUNDBILLMAST.ROC_SLNO IS NULL
        GROUP BY 'Billing'
        UNION ALL
          SELECT SUM (
                    DECODE (PBILLMAST.BMC_CACR,
                            'C', NVL (PBILLMAST.BMN_CASH, 0),
                            'R', NVL (PBILLMAST.BMN_CASH, 0),
                            0))
                 + SUM (
                      DECODE (PBILLMAST.BMC_CACR,
                              'C', NVL (PBILLMAST.BMN_CHEQUE, 0),
                              'R', NVL (PBILLMAST.BMN_CHEQUE, 0),
                              0))
                 + SUM (
                      DECODE (PBILLMAST.BMC_CACR,
                              'C', NVL (PBILLMAST.BMN_CARD, 0),
                              'R', NVL (PBILLMAST.BMN_CARD, 0),
                              0))
                    Amt,
                 0 Tax
            FROM PBILLMAST
           WHERE     (NVL (PBILLMAST.BMC_CANCEL, 'N') = 'N')
                 AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                 AND PBILLMAST.BMC_COLLCNCODE IS NOT NULL
                 AND PBILLMAST.BMC_CACR IN ('C', 'R')
                 AND PBILLMAST.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND PBILLMAST.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND PBILLMAST.BMD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
        GROUP BY DECODE (TRIM (PBILLMAST.bmc_ipop),
                         'OP', 'OP',
                         'IP', 'OP',
                         'OP')
          HAVING    SUM (
                       DECODE (PBILLMAST.BMC_CACR,
                               'C', NVL (PBILLMAST.BMN_CASH, 0),
                               'R', NVL (PBILLMAST.BMN_CASH, 0),
                               0)) <> 0
                 OR SUM (
                       DECODE (PBILLMAST.BMC_CACR,
                               'C', NVL (PBILLMAST.BMN_CHEQUE, 0),
                               'R', NVL (PBILLMAST.BMN_CHEQUE, 0),
                               0)) <> 0
                 OR SUM (
                       DECODE (PBILLMAST.BMC_CACR,
                               'C', NVL (PBILLMAST.BMN_CARD, 0),
                               'R', NVL (PBILLMAST.BMN_CARD, 0),
                               0)) <> 0
                 OR SUM (
                       DECODE (PBILLMAST.BMC_CACR,
                               'O', PBILLMAST.BMN_NETAMT,
                               0)) <> 0
                 OR SUM (
                       DECODE (PBILLMAST.BMC_CACR,
                               'I', PBILLMAST.BMN_NETAMT,
                               0)) <> 0
                 OR SUM (
                       DECODE (PBILLMAST.BMC_CACR,
                               'M', PBILLMAST.BMN_NETAMT,
                               0)) <> 0
        UNION ALL
          SELECT (SUM (
                     DECODE (MRC_CACR,
                             'C', NVL (MRN_CASH, 0),
                             'R', NVL (MRN_CASH, 0),
                             0))
                  + SUM (
                       DECODE (MRC_CACR,
                               'C', NVL (MRETMAST.MRN_CHEQUE, 0),
                               'R', NVL (MRETMAST.MRN_CHEQUE, 0),
                               0))
                  + SUM (
                       DECODE (MRC_CACR,
                               'C', NVL (MRETMAST.MRN_CARD, 0),
                               'R', NVL (MRETMAST.MRN_CARD, 0),
                               0)))
                 * -1
                    Amt,
                 0 Tax
            FROM MRETMAST
           WHERE     NVL (MRETMAST.MRC_CANCEL, 'N') = 'N'
                 AND MRETMAST.MRC_RETCNCODE IS NOT NULL
                 AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                 AND MRETMAST.MRD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND MRETMAST.MRD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND MRETMAST.MRD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
                 AND MRETMAST.MRC_CACR IN ('C', 'R')
        GROUP BY DECODE (TRIM (MRC_IPOP),  'OP', 'OP',  'IP', 'OP',  'OP')
        UNION ALL
          SELECT SUM (DECODE (OPBILLMAST.OPC_CACR, 'M', 0, NVL (OPN_CASH, 0)))
                 + SUM (
                      DECODE (OPBILLMAST.OPC_CACR, 'M', 0, NVL (OPN_CHEQUE, 0)))
                 + SUM (
                      DECODE (OPBILLMAST.OPC_CACR, 'M', 0, NVL (OPN_CARD, 0)))
                    Amt,
                 0 Tax
            FROM OPBILLMAST
           WHERE     (NVL (OPBILLMAST.OPN_CANCEL, 'N') = 'N')
                 AND OPBILLMAST.OPC_CACR IN ('C', 'R')
                 AND Cn_Code IS NOT NULL
                 AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                 AND OPBILLMAST.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND OPBILLMAST.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                 AND OPBILLMAST.OPD_DATE < TRUNC (TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss'))
        GROUP BY 'OP')`;
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

const getCollectionPortion_three = async (conn_ora, bind) => {
  const sql = `SELECT SUM (
            NVL (RECPCOLLECTIONMAST.RCN_CASH, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_CHK, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_DD, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_Card, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_NEFT, 0))
          Amt,
       0 tax
  FROM RECPCOLLECTIONMAST
 WHERE RECPCOLLECTIONMAST.RCD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND RECPCOLLECTIONMAST.RCD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
       AND NVL (RECPCOLLECTIONMAST.RCC_CANCEL, 'N') = 'N'
HAVING SUM (
            NVL (RECPCOLLECTIONMAST.RCN_CASH, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_CHK, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_DD, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_Card, 0)
          + NVL (RECPCOLLECTIONMAST.RCN_NEFT, 0)) > 0
UNION ALL
SELECT (  SUM (NVL (Recpcollectionmast.Rfn_Cash, 0))
        + SUM (NVL (Recpcollectionmast.Rfn_Chk, 0))
        + SUM (NVL (Recpcollectionmast.Rfn_Dd, 0))
        + SUM (NVL (Recpcollectionmast.Rfn_Card, 0)))
       * -1
          Amt,
       0 tax
  FROM Recpcollectionmast
 WHERE Recpcollectionmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND RECPCOLLECTIONMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
       AND Recpcollectionmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND NVL (Rcc_Cancel, 'N') = 'N'`;
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

const getIpRefundDetlSection_five = async (conn_ora, bind) => {
  const sql = `SELECT SUM (
            NVL (Refundreceiptmast.RFN_CASH, 0)
          + NVL (Refundreceiptmast.RFN_CARD, 0)
          + NVL (Refundreceiptmast.RFN_CHEQUE, 0))
       * -1
          AS Amt,
       SUM (NVL (Refundreceiptmast.RFN_TOTTAX, 0)) * -1 tax
  FROM Refundreceiptmast
 WHERE     Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
       AND Refundreceiptmast.Rfc_Cancel IS NULL
       AND Refundreceiptmast.RFC_RETCNCODE IS NULL
       AND Refundreceiptmast.Roc_Slno IS NULL
       AND (   NVL (Refundreceiptmast.RFN_CASH, 0) > 0
            OR NVL (Refundreceiptmast.RFN_CARD, 0) > 0
            OR NVL (Refundreceiptmast.RFN_CHEQUE, 0) > 0)
       AND Refundreceiptmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND Refundreceiptmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (
            NVL (refundbillmast.RFN_CASH, 0)
          + NVL (refundbillmast.RFN_CARD, 0)
          + NVL (refundbillmast.RFN_CHEQUE, 0))
       * -1
          AS Amt,
       SUM (
          NVL (refundbillmast.RFN_TOTTAX, 0)
          + NVL (Refundbillmast.Rfn_Totcess, 0))
       * -1
          tax
  FROM refundbillmast
 WHERE     refundbillmast.Rfc_Cacr IN ('C', 'R')
       AND refundbillmast.Rfc_Cancel IS NULL
       AND Refundbillmast.RFC_RETCNCODE IS NULL
       AND RefundBillmast.Roc_Slno IS NULL
       AND (   NVL (refundbillmast.RFN_CASH, 0) > 0
            OR NVL (refundbillmast.RFN_CARD, 0) > 0
            OR NVL (refundbillmast.RFN_CHEQUE, 0) > 0)
       AND refundbillmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND refundbillmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND refundbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (
            NVL (Mretmast.MRN_CASH, 0)
          + NVL (Mretmast.MRN_CARD, 0)
          + NVL (Mretmast.MRN_CHEQUE, 0))
       * -1
          AS Amt,
       SUM (
            NVL (MRN_SALETAXCH, 0)
          + NVL (MRN_SALETAXCR, 0)
          + NVL (MRN_CESSCH, 0)
          + NVL (MRN_CESSCR, 0))
       * -1
          Tax
  FROM Mretmast
 WHERE     Mretmast.MRC_CACR IN ('C', 'R')
       AND NVL (Mretmast.MRC_CANCEL, 'N') = 'N'
       AND Mretmast.MRC_RETCNCODe IS NULL
       AND (   NVL (Mretmast.MRN_CASH, 0) > 0
            OR NVL (Mretmast.MRN_CARD, 0) > 0
            OR NVL (Mretmast.MRN_CHEQUE, 0) > 0)
       AND Mretmast.MRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND Mretmast.MRD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (
            NVL (IPRECEIPTrefund.irf_cash, 0)
          + NVL (IPRECEIPTrefund.irf_card, 0)
          + NVL (IPRECEIPTrefund.irf_cheque, 0))
       * -1
          AS Amt,
       0 tax
  FROM IPRECEIPTrefund
 WHERE IRF_CACR IN ('C') AND IRF_CANCEL IS NULL
       AND (   NVL (IPRECEIPTrefund.irf_cash, 0) > 0
            OR NVL (IPRECEIPTrefund.irf_card, 0) > 0
            OR NVL (IPRECEIPTrefund.irf_cheque, 0) > 0)
       AND IRF_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND IRF_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND ipreceiptrefund.IRC_MHCODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (NVL (Ron_Cash, 0) + NVL (Ron_Card, 0) + NVL (Ron_Cheque, 0)) * -1
          AS Amt,
       SUM (NVL (opbillrefundmast.RON_TOTTAX, 0)) * -1 Tax
  FROM Opbillrefundmast
 WHERE (NVL (Roc_Cancel, 'N') = 'N')
       AND (   NVL (Ron_Cash, 0) > 0
            OR NVL (Ron_Cheque, 0) > 0
            OR NVL (Ron_Card, 0) > 0)
       AND Opbillrefundmast.Rod_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND Opbillrefundmast.Rod_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND OPBILLREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (NVL (Rin_Cash, 0) + NVL (Rin_Card, 0) + NVL (Rin_Cheque, 0)) * -1
          Amt,
       SUM (NVL (IPREFUNDMAST.RIN_TOTTAX, 0) * -1) Tax
  FROM Iprefundmast
 WHERE     Ric_Cacr IN ('C', 'R')
       AND NVL (Ric_Cancel, 'N') = 'N'
       AND Dmc_Slno IS NOT NULL
       AND Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
       AND Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
UNION ALL
SELECT SUM (
            NVL (Refundreceiptmast.RFN_CASH, 0)
          + NVL (Refundreceiptmast.RFN_CARD, 0)
          + NVL (Refundreceiptmast.RFN_CHEQUE, 0))
       * -1
          AS Amt,
       SUM (NVL (Refundreceiptmast.RFN_TOTTAX, 0)) * -1 tax
  FROM Refundreceiptmast
 WHERE     Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
       AND Refundreceiptmast.Rfc_Cancel IS NULL
       AND Refundreceiptmast.RFC_RETCNCODE IS NOT NULL
       AND Refundreceiptmast.Roc_Slno IS NULL
       AND (   NVL (Refundreceiptmast.RFN_CASH, 0) > 0
            OR NVL (Refundreceiptmast.RFN_CARD, 0) > 0
            OR NVL (Refundreceiptmast.RFN_CHEQUE, 0) > 0)
       AND Refundreceiptmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND Refundreceiptmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (
            NVL (refundbillmast.RFN_CASH, 0)
          + NVL (refundbillmast.RFN_CARD, 0)
          + NVL (refundbillmast.RFN_CHEQUE, 0))
       * -1
          AS Amt,
       SUM (
          NVL (refundbillmast.RFN_TOTTAX, 0)
          + NVL (Refundbillmast.Rfn_Totcess, 0))
       * -1
          tax
  FROM refundbillmast
 WHERE     refundbillmast.Rfc_Cacr IN ('C', 'R')
       AND refundbillmast.Rfc_Cancel IS NULL
       AND Refundbillmast.RFC_RETCNCODE IS NOT NULL
       AND RefundBillmast.Roc_Slno IS NULL
       AND (   NVL (refundbillmast.RFN_CASH, 0) > 0
            OR NVL (refundbillmast.RFN_CARD, 0) > 0
            OR NVL (refundbillmast.RFN_CHEQUE, 0) > 0)
       AND refundbillmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND refundbillmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND refundbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
UNION ALL
SELECT SUM (
            NVL (Mretmast.MRN_CASH, 0)
          + NVL (Mretmast.MRN_CARD, 0)
          + NVL (Mretmast.MRN_CHEQUE, 0))
       * -1
          AS Amt,
       SUM (
            NVL (MRN_SALETAXCH, 0)
          + NVL (MRN_SALETAXCR, 0)
          + NVL (MRN_CESSCH, 0)
          + NVL (MRN_CESSCR, 0))
       * -1
          Tax
  FROM Mretmast
 WHERE     Mretmast.MRC_CACR IN ('C', 'R')
       AND Mretmast.MRC_CANCEL = 'N'
       AND Mretmast.MRC_RETCNCODE IS NOT NULL
       AND (   NVL (Mretmast.MRN_CASH, 0) > 0
            OR NVL (Mretmast.MRN_CARD, 0) > 0
            OR NVL (Mretmast.MRN_CHEQUE, 0) > 0)
       AND Mretmast.MRD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
       AND Mretmast.MRD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
       AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;
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

const getIpincomeSection_six = async (conn_ora, bind) => {
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
                FROM Billmast,
                    Refundbilldetl,
                    Refundbillmast,
                    Disbillmast,
                    Prodescription,
                    Progroup,
                    Misincexpdtl,
                    Misincexpgroup
            WHERE     Billmast.Bmc_Slno = Refundbilldetl.Bmc_Slno
                    AND Billmast.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND Refundbilldetl.Pd_Code = Prodescription.Pd_code
                    AND Prodescription.Pg_code = Progroup.Pg_code
                    AND Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode(+)
                    AND Misincexpdtl.Dg_type(+) = 'R'
                    AND Misincexpdtl.Pc_code(+) = Progroup.pc_code
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND NVL (Refundbilldetl.Rfc_Cancel, 'N') = 'N'
                    AND Refundbillmast.Rfc_Cacr IN ('I')
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
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

const getDiscount_one = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Irn_Discount, 0)) Discount
            FROM ipreceipt, Disbillmast
            WHERE Ipreceipt.Dmc_slno = Disbillmast.Dmc_slno
                AND Disbillmast.Dmd_date < TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Ipreceipt.Dmc_type IN ('C', 'R')
                AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                AND IRD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND NVL (Irc_cancel, 'N') = 'N'`;
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

const getCollectionPortion_five = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                FROM OPADVANCE
                WHERE NVL (ARC_CANCEL, 'N') = 'N'
                    AND ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND ARD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPADVANCE.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                FROM PHADVANCEENTRY
                WHERE (NVL (ARC_CANCEL, 'N') = 'N')
                    AND ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND PHADVANCEENTRY.ARC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND ARD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                UNION ALL
                SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                FROM IPADVANCE
                WHERE (NVL (ARC_CANCEL, 'N') = 'N')
                    AND ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND ARD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND IPADVANCE.IAC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (ARN_AMOUNT, 0)) Amt, 0 tax
                FROM ADVANCEENTRY
                WHERE (NVL (ARC_CANCEL, 'N') = 'N')
                    AND ARD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND ARD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND ADVANCEENTRY.ARC_MHCODE IN (SELECT MH_CODE FROM multihospital)`;
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

const getCollectionPortion_six = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Opn_advance, 0)) Amt, 0 tax
                FROM Opbillmast
                WHERE NVL (OPN_CANCEL, 'N') = 'N'
                    AND OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (bmn_advamount, 0)) Amt, 0 tax
                FROM Pbillmast
                WHERE NVL (BMC_CANCEL, 'N') = 'N'
                    AND BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.BMC_COLLCNCODE IS NULL
                    AND BMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (Dmn_advance, 0)) Amt, 0 TAX
                FROM Disbillmast
                WHERE NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                    AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (BMN_ADVAMOUNT, 0)) Amt, 0 Tax
                FROM Billmast
                WHERE NVL (BMC_CANCEL, 'N') = 'N'
                    AND BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND BILLMAST.BMC_COLLCNCODE IS NULL
                    AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                UNION ALL
                SELECT SUM (NVL (bmn_advamount, 0)) Amt, 0 Tax
                FROM Pbillmast
                WHERE NVL (BMC_CANCEL, 'N') = 'N'
                    AND BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                    AND BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (BMN_ADVAMOUNT, 0)) Amt, 0 Tax
                FROM Billmast
                WHERE NVL (BMC_CANCEL, 'N') = 'N'
                    AND BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                    AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')`;
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
  const sql = `SELECT SUM (NVL (Refundreceiptmast.RPN_RTCREDIT, 0)) * -1 AS Amt,
                    SUM (NVL (Refundreceiptmast.RFN_TOTTAX, 0)) * -1 tax
                FROM Refundreceiptmast
                WHERE     Refundreceiptmast.Rfc_Cacr IN ('R')
                    AND NVL (Refundreceiptmast.Rfc_Cancel, 'N') <> 'C'
                    AND NVL (Refundreceiptmast.RPN_RTCREDIT, 0) > 0
                    AND Refundreceiptmast.Roc_Slno IS NULL
                    AND Refundreceiptmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Refundreceiptmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (refundbillmast.BMN_RTCREDIT, 0)) * -1 AS Amt,
                    SUM (
                        NVL (refundbillmast.RFN_TOTTAX, 0)
                        + NVL (Refundbillmast.Rfn_Totcess, 0))
                    * -1
                        tax
                FROM refundbillmast
                WHERE     refundbillmast.Rfc_Cacr IN ('R')
                    AND NVL (refundbillmast.Rfc_Cancel, 'N') <> 'C'
                    AND refundbillmast.RFC_RETCNCODE IS NULL
                    AND NVL (refundbillmast.BMN_RTCREDIT, 0) > 0
                    AND RefundBillmast.Roc_Slno IS NULL
                    AND refundbillmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND refundbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND refundbillmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                HAVING SUM (NVL (refundbillmast.BMN_RTCREDIT, 0)) > 0
                UNION ALL
                SELECT SUM (
                            NVL (Mretmast.BMN_RTCREDIT, 0)
                        + NVL (MRETMAST.MRN_SALETAXCR, 0)
                        + NVL (MRETMAST.MRN_CESSCR, 0))
                    * -1
                        AS Amt,
                    SUM (
                            NVL (MRN_SALETAXCH, 0)
                        + NVL (MRN_SALETAXCR, 0)
                        + NVL (MRN_CESSCH, 0)
                        + NVL (MRN_CESSCR, 0))
                    * -1
                        Tax
                FROM Mretmast
                WHERE     Mretmast.MRC_CACR IN ('R')
                    AND NVL (Mretmast.MRC_CANCEL, 'N') <> 'Y'
                    AND NVL (Mretmast.BMN_RTCREDIT, 0) > 0
                    AND Mretmast.MRC_RETCNCODE IS NULL
                    AND Mretmast.MRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Mretmast.MRD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (DECODE (Opbillrefundmast.Roc_Cacr, 'R', NVL (Ron_Credit, 0), 0))
                    * -1
                        AMT,
                    SUM (NVL (opbillrefundmast.RON_TOTTAX, 0) * -1) Tax
                FROM Opbillrefundmast
                WHERE (NVL (Roc_Cancel, 'N') = 'N')
                    AND Opbillrefundmast.Rod_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillrefundmast.Rod_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND (DECODE (Opbillrefundmast.Roc_Cacr, 'R', Ron_Credit, 0)) <> 0
                UNION ALL
                SELECT SUM (NVL (Rin_Credit, 0)) * -1 Amt,
                    SUM (NVL (IPREFUNDMAST.RIN_TOTTAX, 0) * -1) Tax
                FROM Iprefundmast
                WHERE     Ric_Cacr IN ('R')
                    AND NVL (Ric_Cancel, 'N') = 'N'
                    AND Dmc_Slno IS NOT NULL
                    AND Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                UNION ALL
                SELECT SUM (NVL (refundbillmast.BMN_RTCREDIT, 0)) * -1 AS Amt,
                    SUM (
                        NVL (refundbillmast.RFN_TOTTAX, 0)
                        + NVL (Refundbillmast.Rfn_Totcess, 0))
                    * -1
                        tax
                FROM refundbillmast
                WHERE     refundbillmast.Rfc_Cacr IN ('R')
                    AND refundbillmast.Rfc_Cancel IS NULL
                    AND NVL (refundbillmast.BMN_RTCREDIT, 0) <> 0
                    AND RefundBillmast.Roc_Slno IS NULL
                    AND refundbillmast.RFC_RETCNCODE IS NOT NULL
                    AND refundbillmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND refundbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND refundbillmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                HAVING SUM (NVL (refundbillmast.BMN_RTCREDIT, 0)) > 0
                UNION ALL
                SELECT SUM (
                            NVL (Mretmast.BMN_RTCREDIT, 0)
                        + NVL (MRETMAST.MRN_SALETAXCR, 0)
                        + NVL (MRETMAST.MRN_CESSCR, 0))
                    * -1
                        AS Amt,
                    SUM (
                            NVL (MRN_SALETAXCH, 0)
                        + NVL (MRN_SALETAXCR, 0)
                        + NVL (MRN_CESSCH, 0)
                        + NVL (MRN_CESSCR, 0))
                    * -1
                        Tax
                FROM Mretmast
                WHERE     Mretmast.MRC_CACR IN ('R')
                    AND NVL (Mretmast.MRC_CANCEL, 'N') = 'N'
                    AND NVL (Mretmast.BMN_RTCREDIT, 0) <> 0
                    AND Mretmast.MRC_RETCNCODE IS NOT NULL
                    AND Mretmast.MRD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Mretmast.MRD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;
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
  const sql = `SELECT SUM (NVL (REFUNDOPADVANCE.RFN_AMT, 0)) Amt, 0 tax
                FROM REFUNDOPADVANCE
                WHERE REFUNDOPADVANCE.Rfc_Cancel = 'N'
                    AND REFUNDOPADVANCE.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDOPADVANCE.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND REFUNDOPADVANCE.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                HAVING SUM (NVL (REFUNDOPADVANCE.RFN_AMT, 0)) > 0
                UNION ALL
                SELECT SUM (NVL (REFUNDADVANCE.RFN_AMT, 0)) Amt, 0 tax
                FROM REFUNDADVANCE
                WHERE NVL (REFUNDADVANCE.RFC_CANCEL, 'N') = 'N'
                    AND REFUNDADVANCE.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND REFUNDADVANCE.RFC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND REFUNDADVANCE.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                HAVING SUM (NVL (REFUNDADVANCE.RFN_AMT, 0)) > 0
                UNION ALL
                SELECT SUM (
                        (  NVL (Ipreceipt.irn_balance, 0)
                        + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                        + NVL (Ipreceipt.irn_refcard, 0)))
                        Amt,
                    0 tax
                FROM IPRECEIPT
                WHERE DMC_TYPE = 'A' AND IRC_CANCEL IS NULL
                    AND IPRECEIPT.IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND ipreceipt.IPC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND IPRECEIPT.IRD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                HAVING SUM (
                        (  NVL (Ipreceipt.irn_balance, 0)
                        + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                        + NVL (Ipreceipt.irn_refcard, 0))) > 0
                UNION ALL
                SELECT SUM (NVL (ADVANCERETURN.RAN_AMT, 0)) Amt, 0 tax
                FROM ADVANCERETURN
                WHERE (NVL (ADVANCERETURN.RAC_CANCEL, 'N') = 'N')
                    AND ADVANCERETURN.RAD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND ADVANCERETURN.RAC_MHCODE IN (SELECT MH_CODE FROM multihospital)
                    AND ADVANCERETURN.RAD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                HAVING SUM (NVL (ADVANCERETURN.RAN_AMT, 0)) > 0`;
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

const getCollectionPortion_seven = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (RPN_CREDIT, 0)) AS Amt,
                    SUM (NVL (receiptmast.RPN_TOTTAX, 0)) Tax
                FROM receiptmast
                WHERE     receiptmast.RPC_CACR IN ('R')
                    AND NVL (Receiptmast.Rpc_Cancel, 'N') <> 'C'
                    AND receiptmast.rpc_collcncode IS NULL
                    AND receiptmast.RPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND receiptmast.RPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND NVL (Rpn_credit, 0) <> 0
                    AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (Opbillmast.OPN_CREDIT, 0))
                    + SUM (NVL (Opbillmast.opn_copayded_credit, 0))
                        AS Amt,
                    SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
                FROM Opbillmast
                WHERE Opbillmast.OPC_CACR IN ('C', 'R')
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND (NVL (Opbillmast.OPN_CREDIT, 0)
                            + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) <> 0
                    AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (BMN_CREDIT, 0)) AS Amt,
                    SUM (NVL (billmast.BMN_TOTTAX, 0) + NVL (Billmast.Bmn_Totcess, 0)) Tax
                FROM billmast
                WHERE     billmast.Bmc_Cacr IN ('R')
                    AND NVL (billmast.BMC_CANCEL, 'N') <> 'C'
                    AND BILLMAST.BMC_COLLCNCODE IS NULL
                    AND billmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Billmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (Pbillmast.BMN_CREDIT, 0)
                        + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                        + NVL (PBILLMAST.BMN_CESSCR, 0))
                    + SUM (NVL (Bmn_Copayded_Credit, 0))
                        AS Amt,
                    SUM (
                            NVL (BMN_SALETAXCH, 0)
                        + NVL (BMN_SALETAXCR, 0)
                        + NVL (BMN_CESSCH, 0)
                        + NVL (BMN_CESSCR, 0))
                        Tax
                FROM Pbillmast
                WHERE     Pbillmast.Bmc_Cacr = 'R'
                    AND NVL (Pbillmast.bmc_cancel, 'N') IN ('N', 'P')
                    AND pbillmast.BMC_COLLCNCODE IS NULL
                    AND NVL (Bmn_credit, 0) <> 0
                    AND Pbillmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.BMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (Disbillmast.DMN_FINALCREDIT, 0))
                    + SUM (NVL (dmn_copayded_credit, 0))
                        Amt,
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
                WHERE Dmc_Cacr = 'R' AND NVL (Disbillmast.DMC_CANCEL, 'N') = 'N'
                    AND DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND DMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                UNION ALL
                SELECT SUM (NVL (BMN_CREDIT, 0)) AS Amt,
                    SUM (NVL (billmast.BMN_TOTTAX, 0) + NVL (Billmast.Bmn_Totcess, 0)) Tax
                FROM billmast
                WHERE     billmast.Bmc_Cacr IN ('R')
                    AND NVL (billmast.BMC_CANCEL, 'N') = 'N'
                    AND BILLMAST.BMC_COLLCNCODE IS NOT NULL
                    AND BILLMAST.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND BILLMAST.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (
                            NVL (Pbillmast.BMN_CREDIT, 0)
                        + NVL (PBILLMAST.BMN_SALETAXCR, 0)
                        + NVL (PBILLMAST.BMN_CESSCR, 0))
                    + SUM (NVL (Bmn_Copayded_Credit, 0))
                        AS Amt,
                    SUM (
                            NVL (BMN_SALETAXCH, 0)
                        + NVL (BMN_SALETAXCR, 0)
                        + NVL (BMN_CESSCH, 0)
                        + NVL (BMN_CESSCR, 0))
                        Tax
                FROM Pbillmast
                WHERE     Pbillmast.Bmc_Cacr = 'R'
                    AND NVL (Pbillmast.bmc_cancel, 'N') = 'N'
                    AND pbillmast.BMC_COLLCNCODE IS NOT NULL
                    AND Pbillmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Pbillmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                UNION ALL
                SELECT SUM (NVL (RPN_CREDIT, 0)) AS Amt,
                    SUM (NVL (receiptmast.RPN_TOTTAX, 0)) Tax
                FROM receiptmast
                WHERE     receiptmast.RPC_CACR IN ('R')
                    AND NVL (receiptmast.RPC_CANCEL, 'N') = 'N'
                    AND receiptmast.RPC_COLLCNCODE IS NOT NULL
                    AND receiptmast.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND receiptmast.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)`;
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

const getCollectionPortion_eight = async (conn_ora, bind) => {
  const sql = `SELECT SUM (NVL (Payable, 0)) Amt, SUM (tax) tax
                FROM (SELECT SUM (NVL (DMN_FINALPTPAYABLE, 0)) Payable,
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
                        WHERE     Dmc_Cacr IN ('C', 'R')
                            AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                            AND NVL (DMN_FINALPTPAYABLE, 0) <> 0
                            AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        UNION ALL
                        SELECT SUM (
                                (  NVL (Ipreceipt.irn_amount, 0)
                                + NVL (Ipreceipt.irn_cheque, 0)
                                + NVL (Ipreceipt.irn_card, 0)
                                + NVL (IRN_NEFT, 0))
                                - (  NVL (Ipreceipt.irn_balance, 0)
                                    + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                                    + NVL (Ipreceipt.irn_refcard, 0))
                                + NVL (ipreceipt.irn_discount, 0))
                            * -1
                                Payable,
                            SUM (
                                DECODE (
                                    NVL (Disbillmast.Dmc_Cancel, 'N'),
                                    'N',   NVL (DMN_SALESTAXCH, 0)
                                        + NVL (DMN_SALESTAXCR, 0)
                                        + NVL (DMN_CESSCH, 0)
                                        + NVL (DMN_CESSCR, 0),
                                    0))
                            * -1
                                TAX
                        FROM ipreceipt, Disbillmast
                        WHERE Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Disbillmast.Dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Ipreceipt.Dmc_type IN ('C', 'R')
                            AND IRD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND ipreceipt.IPC_MHCODE IN
                                    (SELECT MH_CODE FROM multihospital)
                            AND ird_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Irc_cancel IS NULL
                            AND ( (  NVL (Ipreceipt.irn_amount, 0)
                                    + NVL (Ipreceipt.irn_cheque, 0)
                                    + NVL (Ipreceipt.irn_card, 0)
                                    + NVL (IRN_NEFT, 0))
                                    - (  NVL (Ipreceipt.irn_balance, 0)
                                    + NVL (Ipreceipt.IRN_REFCHEQ, 0)
                                    + NVL (Ipreceipt.irn_refcard, 0))
                                    + NVL (ipreceipt.irn_discount, 0)) <> 0
                        UNION ALL
                        SELECT SUM (NVL (Rpn_Ptpayable, 0)) Payable,
                            SUM (NVL (Opn_Saletaxch, 0) + NVL (Opn_Saletaxcr, 0)) Tax
                        FROM Opbillmast
                        WHERE Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Opbillmast.Opc_Cacr IN ('C', 'R')
                            AND Rpn_Ptpayable > 0
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (Opbillmast.Opn_Cancel, 'N') <> 'C'
                            AND TRUNC (Opbillmast.Opd_Date) <>
                                    TRUNC (NVL (Opd_Date, SYSDATE + 1))
                        UNION ALL
                        SELECT SUM (NVL (Billmast.Bmn_Netamt, 0)) Payable,
                            SUM (
                                    NVL (Bmn_Tottaxch, 0)
                                + NVL (Bmn_Tottaxcr, 0)
                                + NVL (Bmn_Totcessch, 0)
                                + NVL (Bmn_Totcesscr, 0))
                                Tax
                        FROM Billmast
                        WHERE Billmast.Bmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Billmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Billmast.Bmc_Cacr IN ('C', 'R')
                            AND Rpn_Ptpayable > 0
                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (Billmast.Bmc_Cancel, 'N') <> 'C'
                            AND TRUNC (Billmast.Bmd_Date) <>
                                    TRUNC (NVL (Bmd_Colldate, SYSDATE + 1))
                        UNION ALL
                        SELECT SUM (NVL (Refundbillmast.Rfn_Netamt, 0)) * -1 Payable,
                            SUM (
                                    NVL (Rfn_Tottaxcr, 0)
                                + NVL (Rfn_Tottaxch, 0)
                                + NVL (Rfn_Totcesscr, 0)
                                + NVL (Rfn_Totcessch, 0))
                            * -1
                                Tax
                        FROM Refundbillmast, Billmast
                        WHERE     Refundbillmast.Bmc_Slno = Billmast.Bmc_Slno
                            AND Refundbillmast.Rfc_Cacr IN ('C', 'R')
                            AND NVL (Refundbillmast.Rfc_Cancel, 'N') <> 'C'
                            AND TRUNC (Refundbillmast.Rfd_Date) <>
                                    TRUNC (NVL (Rfd_Retdate, SYSDATE + 1))
                            AND Rpn_Rtptpayable > 0
                            AND NVL (Refundbillmast.Roc_Slno, 'N') = 'N'
                            AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Refundbillmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Refundbillmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        UNION ALL
                        SELECT SUM (NVL (Receiptmast.Rpn_Netamt, 0)) Payable,
                            SUM (NVL (Rpn_Tottaxch, 0) + NVL (Rpn_Tottaxcr, 0)) Tax
                        FROM Receiptmast
                        WHERE Receiptmast.Rpd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Receiptmast.Rpd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Receiptmast.Rpc_Cacr IN ('C', 'R')
                            AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (Receiptmast.Rpc_Cancel, 'N') <> 'C'
                            AND TRUNC (Receiptmast.Rpd_Date) <>
                                    TRUNC (NVL (Rpd_Colldate, SYSDATE + 1))
                            AND Rpn_Ptpayable > 0
                        UNION ALL
                        SELECT SUM (NVL (Refundreceiptmast.Rfn_Netamt, 0)) * -1 Payable,
                            SUM (NVL (Rfn_Tottaxcr, 0) + NVL (Rfn_Tottaxch, 0)) * -1 Tax
                        FROM Refundreceiptmast, Receiptmast
                        WHERE     Refundreceiptmast.Rpc_Slno = Receiptmast.Rpc_Slno
                            AND Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
                            AND NVL (Refundreceiptmast.Roc_Slno, 'N') = 'N'
                            AND REFUNDRECEIPTMAST.MH_CODE IN
                                    (SELECT MH_CODE FROM multihospital)
                            AND NVL (Refundreceiptmast.Rfc_Cancel, 'N') <> 'C'
                            AND TRUNC (Refundreceiptmast.Rfd_Date) <>
                                    TRUNC (NVL (Rfd_Retdate, SYSDATE + 1))
                            AND Rpn_Rtptpayable > 0
                            AND Refundreceiptmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Refundreceiptmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        UNION ALL
                        SELECT SUM (NVL (Pbillmast.Rpn_Finalptpayable, 0)) Payable,
                            SUM (
                                    NVL (Bmn_Saletaxch, 0)
                                + NVL (Bmn_Cessch, 0)
                                + NVL (Bmn_Saletaxcr, 0)
                                + NVL (Bmn_Cesscr, 0))
                                Tax
                        FROM Pbillmast
                        WHERE     Pbillmast.Bmc_Cacr IN ('C', 'R')
                            AND pbillmast.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (Pbillmast.Bmc_Cancel, 'N') <> 'Y'
                            AND TRUNC (Pbillmast.Bmd_Date) <>
                                    TRUNC (NVL (Bmd_Colldate, SYSDATE + 1))
                            AND Rpn_Ptpayable > 0
                            AND Pbillmast.Bmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Pbillmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                        UNION ALL
                        SELECT SUM (NVL (Rpn_Finalrtptpayable, 0)) * -1 Payable,
                            SUM (
                                    NVL (Mrn_Saletaxch, 0)
                                + NVL (Mrn_Cessch, 0)
                                + NVL (Mrn_Saletaxcr, 0)
                                + NVL (Mrn_Cesscr, 0))
                            * -1
                                Tax
                        FROM Mretmast
                        WHERE     Mretmast.Mrc_Cacr IN ('C', 'R')
                            AND MRETMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND NVL (Mretmast.Mrc_Cancel, 'N') <> 'Y'
                            AND TRUNC (Mretmast.Mrd_Date) <>
                                    TRUNC (NVL (Mrd_Retdate, SYSDATE + 1))
                            AND Rpn_Rtptpayable > 0
                            AND Mretmast.Mrd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                            AND Mretmast.Mrd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')) A`;
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
  const sql = `SELECT SUM (NVL (irn_discount, 0)) Discount
                FROM Ipreceipt, Disbillmast
                WHERE     Ipreceipt.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND NVL (irc_cancel, 'N') = 'N'
                    AND Ipreceipt.Dmc_Type IN ('C', 'R')
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Ipreceipt.Ird_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Ipreceipt.Ird_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                    AND NVL (irn_discount, 0) > 0`;
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
  const sql = `SELECT Ptc_Desc, SUM (Discount) Discount, SUM (tax) tax
    FROM (  SELECT Receiptmast.Rpc_Slno Slno,
                   Receiptmast.Rp_No BillNo,
                   Receiptmast.Rpd_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Receiptdetl.Rpn_Netamt, 0)) Net,
                   SUM (NVL (Receiptdetl.Rpn_Disamt, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (Receiptdetl.RPN_TOTTAX, 0)) tax
              FROM Receiptmast,
                   Receiptdetl,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
                   AND receiptmast.RPC_COLLCNCODE IS NULL
                   AND Receiptmast.Pt_No = Patient.Pt_No(+)
                   AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code(+)
                   AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
                   AND Receiptmast.Rpc_Cacr IN ('C', 'R')
                   AND Receiptmast.Rpd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Receiptmast.Rpd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Receiptmast.Rpc_Slno,
                   Receiptmast.Rp_No,
                   Receiptmast.Rpd_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Receiptmast.Rpc_Slno Slno,
                   Receiptmast.Rp_No BillNo,
                   Receiptmast.Rpd_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Receiptmast.Rpn_Netamt, 0)) Net,
                   SUM (NVL (Receiptdetl.Rpn_Disamt, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (receiptmast.RPN_TOTTAX, 0)) Tax
              FROM Receiptmast,
                   Receiptdetl,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
                   AND receiptmast.RPC_COLLCNCODE IS NOT NULL
                   AND Receiptmast.Pt_No = Patient.Pt_No
                   AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
                   AND Receiptmast.Rpc_Cacr IN ('C', 'R')
                   AND Receiptmast.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Receiptmast.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Receiptmast.Rpc_Slno,
                   Receiptmast.Rp_No,
                   Receiptmast.Rpd_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL                           /*--Op Direct Billing Refund--*/
                                           SELECT Refundreceiptmast.Rfc_Slno
                                                     Slno,
                                                  Refundreceiptmast.Rf_No
                                                     BillNo,
                                                  Refundreceiptmast.Rfd_Date
                                                     BillDate,
                                                  Patient.Pt_No,
                                                  INITCAP (Patient.Ptc_Ptname)
                                                     Ptname,
                                                  MAX (
                                                     NVL (
                                                        Refundreceiptmast.Rfn_Netamt,
                                                        0))
                                                  * -1
                                                     Net,
                                                  SUM (
                                                     NVL (
                                                        Refundreceiptdetl.Rpn_Disamt,
                                                        0))
                                                  * -1
                                                     Discount,
                                                  INITCAP (Dac_Desc) Dac_Desc,
                                                  Discountauthority.Da_Code,
                                                  INITCAP (Pattype.Ptc_Desc)
                                                     Ptc_Desc,
                                                  SUM (
                                                     NVL (
                                                        refundreceiptmast.RFN_TOTTAX,
                                                        0))
                                                  * -1
                                                     Tax
                                             FROM Receiptmast,
                                                  Receiptdetl,
                                                  Patient,
                                                  Discountauthority,
                                                  Refundreceiptmast,
                                                  Refundreceiptdetl,
                                                  Pattype
                                            WHERE Receiptdetl.Rpc_Slno =
                                                     Refundreceiptdetl.Rpc_Slno
                                                  AND refundreceiptmast.RFC_RETCNCODE
                                                         IS NULL
                                                  AND Receiptdetl.Rpc_Cnt =
                                                         Refundreceiptdetl.Rpc_Cnt
                                                  AND Refundreceiptmast.Rfc_Slno =
                                                         Refundreceiptdetl.Rfc_Slno
                                                  AND Receiptmast.Rpc_Slno =
                                                         Receiptdetl.Rpc_Slno
                                                  AND Receiptmast.Pt_No =
                                                         Patient.Pt_No
                                                  AND Patient.Pt_Code =
                                                         Pattype.Pt_Code
                                                  AND Receiptdetl.Da_Code =
                                                         Discountauthority.Da_Code(+)
                                                  AND NVL (
                                                         Receiptmast.Rpc_Cancel,
                                                         'N') = 'N'
                                                  AND NVL (
                                                         Refundreceiptmast.Rfc_Cancel,
                                                         'N') = 'N'
                                                  AND Refundreceiptmast.Rfc_Cacr IN
                                                         ('C', 'R')
                                                  AND Receiptmast.Rpc_Cacr IN
                                                         ('C', 'R')
                                                  AND Refundreceiptmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                  AND Refundreceiptmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                  AND REFUNDRECEIPTMAST.MH_CODE IN
                                                         (SELECT MH_CODE
                                                            FROM multihospital)
                                         GROUP BY Refundreceiptmast.Rfc_Slno,
                                                  Refundreceiptmast.Rf_No,
                                                  Refundreceiptmast.Rfd_Date,
                                                  Patient.Pt_No,
                                                  INITCAP (Patient.Ptc_Ptname),
                                                  INITCAP (Dac_Desc),
                                                  Discountauthority.Da_Code,
                                                  INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Refundreceiptmast.Rfc_Slno Slno,
                   Refundreceiptmast.Rf_No BillNo,
                   Refundreceiptmast.Rfd_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Refundreceiptmast.Rfn_Netamt, 0)) * -1 Net,
                   SUM (NVL (Refundreceiptdetl.Rpn_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (refundreceiptmast.RFN_TOTTAX, 0)) * -1 Tax
              FROM Receiptmast,
                   Receiptdetl,
                   Patient,
                   Discountauthority,
                   Refundreceiptmast,
                   Refundreceiptdetl,
                   Pattype
             WHERE     Receiptdetl.Rpc_Slno = Refundreceiptdetl.Rpc_Slno
                   AND Receiptdetl.Rpc_Cnt = Refundreceiptdetl.Rpc_Cnt
                   AND Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
                   AND refundreceiptmast.RFC_RETCNCODE IS NOT NULL
                   AND Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
                   AND Receiptmast.Pt_No = Patient.Pt_No
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
                   AND NVL (Refundreceiptmast.Rfc_Cancel, 'N') = 'N'
                   AND Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
                   AND Receiptmast.Rpc_Cacr IN ('C', 'R')
                   AND Refundreceiptmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Refundreceiptmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND REFUNDRECEIPTMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Refundreceiptmast.Rfc_Slno,
                   Refundreceiptmast.Rf_No,
                   Refundreceiptmast.Rfd_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL                             /*--Op Consolidate Billing--*/
                                         SELECT Opbillmast.Opc_Slno Slno,
                                                Opbillmast.Op_No BillNo,
                                                Opbillmast.Opd_Date BillDate,
                                                Opbillmast.Pt_No,
                                                INITCAP (Patient.Ptc_Ptname)
                                                   Ptname,
                                                MAX (
                                                   NVL (Opbillmast.Opn_Netamt,
                                                        0)
                                                   + NVL (
                                                        OPBILLMAST.OPN_SALETAXCH,
                                                        0)
                                                   + NVL (
                                                        OPBILLMAST.OPN_SALETAXCR,
                                                        0))
                                                   Net,
                                                SUM (
                                                     NVL (Srn_Operdis, 0)
                                                   + NVL (Srn_Theardis, 0)
                                                   + NVL (Srn_Antdis, 0))
                                                   Discount,
                                                INITCAP (Dac_Desc) Dac_Desc,
                                                Discountauthority.Da_Code,
                                                INITCAP (Pattype.Ptc_Desc)
                                                   Ptc_Desc,
                                                SUM (
                                                   NVL (opbillmast.OPN_TOTTAX,
                                                        0))
                                                   Tax
                                           FROM Opbillmast,
                                                Patsurgery,
                                                Discountauthority,
                                                Patient,
                                                Pattype
                                          WHERE (Patsurgery.Operation_Opslno =
                                                    Opbillmast.Opc_Slno
                                                 OR Patsurgery.Theater_Opslno =
                                                       Opbillmast.Opc_Slno
                                                 OR Patsurgery.Antest_Opslno =
                                                       Opbillmast.Opc_Slno)
                                                AND Patsurgery.Da_Code =
                                                       Discountauthority.Da_Code(+)
                                                AND Patient.Pt_Code =
                                                       Pattype.Pt_Code
                                                AND Opbillmast.Pt_No =
                                                       Patient.Pt_No
                                                AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                AND OPBILLMAST.MH_CODE IN
                                                       (SELECT MH_CODE
                                                          FROM multihospital)
                                       GROUP BY Opbillmast.Opc_Slno,
                                                Opbillmast.Op_No,
                                                Opbillmast.Opd_Date,
                                                Opbillmast.Pt_No,
                                                INITCAP (Patient.Ptc_Ptname),
                                                INITCAP (Dac_Desc),
                                                Discountauthority.Da_Code,
                                                INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (Opbillmast.Opn_Netamt, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCH, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCR, 0))
                      Net,
                   SUM (NVL (Srn_Discount, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
              FROM Opbillmast,
                   Patsurgery,
                   Patsurdetl,
                   Discountauthority,
                   Patient,
                   Pattype
             WHERE     Patsurdetl.Opc_Slno = Opbillmast.Opc_Slno
                   AND Patsurgery.Sr_Slno = Patsurdetl.Sr_Slno
                   AND Patsurdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Opbillmast.Pt_No = Patient.Pt_No
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (Opbillmast.Opn_Netamt, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCH, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCR, 0))
                      Net,
                   SUM (NVL (Srn_Discount, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
              FROM Opbillmast,
                   Patsurgery,
                   Patsurother,
                   Discountauthority,
                   Patient,
                   Pattype
             WHERE     Patsurother.Opc_Slno = Opbillmast.Opc_Slno
                   AND Patsurgery.Sr_Slno = Patsurother.Sr_Slno
                   AND Patsurother.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Opbillmast.Pt_No = Patient.Pt_No
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (Opbillmast.Opn_Netamt, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCH, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCR, 0))
                      Net,
                   SUM (NVL (Receiptdetl.Rpn_Disamt, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
              FROM Receiptdetl,
                   Receiptmast,
                   Opbillmast,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Receiptdetl.Opc_Slno = Opbillmast.Opc_Slno
                   AND Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
                   AND Opbillmast.Pt_No = Patient.Pt_No(+)
                   AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Receiptmast.Rpc_Cacr IN ('O')
                   AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
                   AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   0 Net,
                   SUM (NVL (Refundreceiptdetl.Rpn_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (Refundreceiptdetl.RFN_TOTTAX, 0)) * -1 tax
              FROM Receiptdetl,
                   Receiptmast,
                   Refundreceiptmast,
                   Refundreceiptdetl,
                   Opbillmast,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Receiptdetl.Opc_Slno = Opbillmast.Opc_Slno
                   AND Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
                   AND Receiptdetl.Rpc_Slno = Refundreceiptdetl.Rpc_Slno
                   AND Receiptdetl.Rpc_Cnt = Refundreceiptdetl.Rpc_Cnt
                   AND Refundreceiptdetl.Rfc_Slno = Refundreceiptmast.Rfc_Slno
                   AND Opbillmast.Pt_No = Patient.Pt_No(+)
                   AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Receiptmast.Rpc_Cacr IN ('O')
                   AND Refundreceiptmast.Rfc_Cacr IN ('O')
                   AND NVL (Refundreceiptmast.Rfc_Cancel, 'N') = 'N'
                   AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
                   AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Opbillmast.Opn_Netamt, 0)) Net,
                   SUM (NVL (Billdetl.Bmn_Disamt, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
              FROM Billdetl,
                   Billmast,
                   Opbillmast,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Billdetl.Opc_Slno = Opbillmast.Opc_Slno
                   AND Billdetl.Bmc_Slno = Billmast.Bmc_Slno
                   AND Opbillmast.Pt_No = Patient.Pt_No
                   AND Billdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Billmast.Bmc_Cacr IN ('O')
                   AND NVL (Billmast.Bmc_Cancel, 'N') = 'N'
                   AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   0 Net,
                   SUM (NVL (Refundbilldetl.Rfn_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                      NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)
                      + NVL (Refundbilldetl.Rfn_Totcess, 0))
                   * -1
                      tax
              FROM Billdetl,
                   Billmast,
                   Refundbilldetl,
                   Refundbillmast,
                   Opbillmast,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Billdetl.Opc_Slno = Opbillmast.Opc_Slno
                   AND Billdetl.Bmc_Slno = Billmast.Bmc_Slno
                   AND Billdetl.Bmc_Slno = Refundbilldetl.Bmc_Slno
                   AND Billdetl.Bmc_Cnt = Refundbilldetl.Bmc_Cnt
                   AND Billdetl.Pd_Code = Refundbilldetl.Pd_Code
                   AND Refundbilldetl.Rfc_Slno = Refundbillmast.Rfc_Slno
                   AND Opbillmast.Pt_No = Patient.Pt_No
                   AND Billdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Billmast.Bmc_Cacr IN ('O')
                   AND NVL (Refundbillmast.Rfc_Cancel, 'N') = 'N'
                   AND NVL (Billmast.Bmc_Cancel, 'N') = 'N'
                   AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL /*--Op Consolidate Billing refund(additional modification)--*/
                                                                         SELECT Opbillmast.Opc_Slno
                                                                                   Slno,
                                                                                Opbillmast.Op_No
                                                                                   BillNo,
                                                                                Opbillmast.Opd_Date
                                                                                   BillDate,
                                                                                Opbillmast.Pt_No,
                                                                                INITCAP (
                                                                                   Patient.Ptc_Ptname)
                                                                                   Ptname,
                                                                                0
                                                                                   Net,
                                                                                SUM (
                                                                                   NVL (
                                                                                      Refundbilldetl.Rfn_Disamt,
                                                                                      0))
                                                                                   Discount,
                                                                                INITCAP (
                                                                                   Dac_Desc)
                                                                                   Dac_Desc,
                                                                                Discountauthority.Da_Code,
                                                                                INITCAP (
                                                                                   Pattype.Ptc_Desc)
                                                                                   Ptc_Desc,
                                                                                SUM (
                                                                                   NVL (
                                                                                      REFUNDBILLDETL.RFN_TOTTAX,
                                                                                      0)
                                                                                   + NVL (
                                                                                        Refundbilldetl.Rfn_Totcess,
                                                                                        0))
                                                                                   tax
                                                                           FROM Billdetl,
                                                                                Billmast,
                                                                                Refundbilldetl,
                                                                                Refundbillmast,
                                                                                Opbillmast,
                                                                                Patient,
                                                                                Discountauthority,
                                                                                Pattype
                                                                          WHERE Billdetl.Opc_Slno =
                                                                                   Opbillmast.Opc_Slno
                                                                                AND Billdetl.Bmc_Slno =
                                                                                       Billmast.Bmc_Slno
                                                                                AND Billdetl.Bmc_Slno =
                                                                                       Refundbilldetl.Bmc_Slno
                                                                                AND Billdetl.Bmc_Cnt =
                                                                                       Refundbilldetl.Bmc_Cnt
                                                                                AND Billdetl.Pd_Code =
                                                                                       Refundbilldetl.Pd_Code
                                                                                AND Refundbilldetl.Rfc_Slno =
                                                                                       Refundbillmast.Rfc_Slno
                                                                                AND Opbillmast.Pt_No =
                                                                                       Patient.Pt_No
                                                                                AND Billdetl.Da_Code =
                                                                                       Discountauthority.Da_Code(+)
                                                                                AND Patient.Pt_Code =
                                                                                       Pattype.Pt_Code
                                                                                AND Billmast.Bmc_Cacr IN
                                                                                       ('O')
                                                                                AND NVL (
                                                                                       Refundbillmast.Rfc_Cancel,
                                                                                       'N') =
                                                                                       'N'
                                                                                AND NVL (
                                                                                       Billmast.Bmc_Cancel,
                                                                                       'N') =
                                                                                       'N'
                                                                                AND NVL (
                                                                                       Opbillmast.Opn_Cancel,
                                                                                       'N') =
                                                                                       'N'
                                                                                AND Opbillmast.Opc_Cacr <>
                                                                                       'M'
                                                                                AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                AND OPBILLMAST.MH_CODE IN
                                                                                       (SELECT MH_CODE
                                                                                          FROM multihospital)
                                                                       GROUP BY Opbillmast.Opc_Slno,
                                                                                Opbillmast.Op_No,
                                                                                Opbillmast.Opd_Date,
                                                                                Opbillmast.Pt_No,
                                                                                INITCAP (
                                                                                   Patient.Ptc_Ptname),
                                                                                INITCAP (
                                                                                   Dac_Desc),
                                                                                Discountauthority.Da_Code,
                                                                                INITCAP (
                                                                                   Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillmast.Opc_Slno Slno,
                   Opbillmast.Op_No BillNo,
                   Opbillmast.Opd_Date BillDate,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (Opbillmast.Opn_Netamt, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCH, 0)
                      + NVL (OPBILLMAST.OPN_SALETAXCR, 0))
                      Net,
                   NVL (Pbillmast.Bmn_Disamt, 0) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (opbillmast.OPN_TOTTAX, 0)) Tax
              FROM Pbilldetl,
                   Pbillmast,
                   Opbillmast,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Pbilldetl.Opc_Slno = Opbillmast.Opc_Slno
                   AND Pbilldetl.Bmc_Slno = Pbillmast.Bmc_Slno
                   AND Opbillmast.Pt_No = Patient.Pt_No
                   AND Pbillmast.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Pbillmast.Bmc_Cacr IN ('O')
                   AND NVL (Pbillmast.Bmc_Cancel, 'N') = 'N'
                   AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                   AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillmast.Opc_Slno,
                   Opbillmast.Op_No,
                   Opbillmast.Opd_Date,
                   Opbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   NVL (Pbillmast.Bmn_Disamt, 0),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT A.Slno,
                   A.Op_No Billno,
                   A.Opd_Date Billdate,
                   A.Pt_No,
                   A.Ptname,
                   0 Net,
                   SUM (A.Discount) Discount,
                   A.Dac_Desc Dauthority,
                   A.Da_Code,
                   A.Ptc_Desc,
                   A.tax
              FROM (SELECT DISTINCT
                           (Mretmast.Mrc_Slno) Mrc_Slno,
                           Opbillmast.Opc_Slno Slno,
                           Opbillmast.Op_No,
                           Opbillmast.Opd_Date,
                           Opbillmast.Pt_No,
                           INITCAP (Patient.Ptc_Ptname) Ptname,
                           NVL (Mretdetl.Mrn_Disamt, 0) * -1 Discount,
                           INITCAP (Dac_Desc) Dac_Desc,
                           Discountauthority.Da_Code,
                           INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                           NVL (MRETDETL.MRN_TOTTAXCR, 0)
                           + NVL (MRETDETL.MRN_TOTTAXCH, 0) * -1
                              tax
                      FROM Mretmast,
                           Mretdetl,
                           Pbillmast,
                           Pbilldetl,
                           Opbillmast,
                           Discountauthority,
                           Patient,
                           Pattype
                     WHERE     Opbillmast.Opc_Slno = Pbilldetl.Opc_Slno
                           AND Mretmast.Mrc_Slno = Mretdetl.Mrc_Slno
                           AND Mretdetl.Bmc_Slno = Pbillmast.Bmc_Slno
                           AND Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                           AND Pbilldetl.It_Code = Mretdetl.It_Code
                           AND Pbilldetl.Itc_Docno = Mretdetl.Itc_Docno
                           AND Pbilldetl.Itc_Doctype = Mretdetl.Itc_Doctype
                           AND Pbilldetl.Itc_Slno = Mretdetl.Itc_Slno
                           AND Opbillmast.Pt_No = Patient.Pt_No
                           AND Pbillmast.Da_Code = Discountauthority.Da_Code(+)
                           AND Patient.Pt_Code = Pattype.Pt_Code
                           AND Mretmast.Mrc_Cacr IN ('O')
                           AND NVL (Mretmast.Mrc_Cancel, 'N') = 'N'
                           AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                           AND Opbillmast.Opd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                           AND Opbillmast.Opd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                           AND OPBILLMAST.MH_CODE IN
                                  (SELECT MH_CODE FROM multihospital)) A
          GROUP BY A.Slno,
                   A.Op_No,
                   A.Opd_Date,
                   A.Pt_No,
                   A.Ptname,
                   Dac_Desc,
                   Da_Code,
                   Ptc_Desc,
                   A.tax
          UNION ALL                                   /*--Op Credit Refund--*/
                                   SELECT Opbillrefundmast.Roc_Slno Slno,
                                          Opbillrefundmast.Ro_No BillNo,
                                          Opbillrefundmast.Rod_Date BillDate,
                                          Patient.Pt_No,
                                          INITCAP (Patient.Ptc_Ptname) Ptname,
                                          MAX (
                                             NVL (Opbillrefundmast.Ron_Netamt,
                                                  0))
                                          * -1
                                             Net,
                                          SUM (
                                             NVL (Refundreceiptdetl.Rpn_Disamt,
                                                  0))
                                          * -1
                                             Discount,
                                          INITCAP (Dac_Desc) Dac_Desc,
                                          Discountauthority.Da_Code,
                                          INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                                          SUM (
                                             NVL (Refundreceiptdetl.RFN_TOTTAX,
                                                  0))
                                          * -1
                                             tax
                                     FROM Opbillrefundmast,
                                          Receiptmast,
                                          Receiptdetl,
                                          Patient,
                                          Discountauthority,
                                          Refundreceiptmast,
                                          Refundreceiptdetl,
                                          Pattype
                                    WHERE Opbillrefundmast.Roc_Slno =
                                             Refundreceiptmast.Roc_Slno
                                          AND Receiptdetl.Rpc_Slno =
                                                 Refundreceiptdetl.Rpc_Slno
                                          AND Receiptdetl.Rpc_Cnt =
                                                 Refundreceiptdetl.Rpc_Cnt
                                          AND Refundreceiptmast.Rfc_Slno =
                                                 Refundreceiptdetl.Rfc_Slno
                                          AND Receiptmast.Rpc_Slno =
                                                 Receiptdetl.Rpc_Slno
                                          AND Receiptmast.Pt_No = Patient.Pt_No
                                          AND Receiptdetl.Da_Code =
                                                 Discountauthority.Da_Code(+)
                                          AND Patient.Pt_Code = Pattype.Pt_Code
                                          AND NVL (Receiptmast.Rpc_Cancel, 'N') =
                                                 'N'
                                          AND NVL (
                                                 Refundreceiptmast.Rfc_Cancel,
                                                 'N') = 'N'
                                          AND Opbillrefundmast.Rod_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                          AND Opbillrefundmast.Rod_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                          AND OPBILLREFUNDMAST.MH_CODE IN
                                                 (SELECT MH_CODE
                                                    FROM multihospital)
                                 GROUP BY Opbillrefundmast.Roc_Slno,
                                          Opbillrefundmast.Ro_No,
                                          Opbillrefundmast.Rod_Date,
                                          Patient.Pt_No,
                                          INITCAP (Patient.Ptc_Ptname),
                                          INITCAP (Dac_Desc),
                                          Discountauthority.Da_Code,
                                          INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Opbillrefundmast.Roc_Slno Slno,
                   Opbillrefundmast.Ro_No BillNo,
                   Opbillrefundmast.Rod_Date BillDate,
                   Billmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Opbillrefundmast.Ron_Netamt, 0)) * -1 Net,
                   SUM (NVL (Refundbilldetl.Rfn_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (opbillrefundmast.RON_TOTTAX, 0)) * -1 Tax
              FROM Opbillrefundmast,
                   Billdetl,
                   Discountauthority,
                   Billmast,
                   Patient,
                   Refundbilldetl,
                   Refundbillmast,
                   Pattype
             WHERE     Opbillrefundmast.Roc_Slno = Refundbillmast.Roc_Slno
                   AND Billdetl.Bmc_Slno = Refundbilldetl.Bmc_Slno
                   AND Billdetl.Bmc_Cnt = Refundbilldetl.Bmc_Cnt
                   AND Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
                   AND Billdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Billmast.Pt_No = Patient.Pt_No(+)
                   AND Billmast.Bmc_Slno = Billdetl.Bmc_Slno
                   AND NVL (Refundbillmast.Rfc_Cancel, 'N') = 'N'
                   AND NVL (Billdetl.Bmc_Cancel, 'N') = 'N'
                   AND NVL (Opbillrefundmast.Roc_Cancel, 'N') = 'N'
                   AND Opbillrefundmast.Rod_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Opbillrefundmast.Rod_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND OPBILLREFUNDMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Opbillrefundmast.Roc_Slno,
                   Opbillrefundmast.Ro_No,
                   Opbillrefundmast.Rod_Date,
                   Billmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL                                     /*--Discharge Bill--*/
                                 SELECT Disbillmast.Dmc_Slno Slno,
                                        Disbillmast.Dm_No BillNo,
                                        Disbillmast.Dmd_Date BillDate,
                                        Disbillmast.Pt_No,
                                        INITCAP (Patient.Ptc_Ptname) Ptname,
                                        MAX (
                                             NVL (DISBILLMAST.DMN_NETAMT, 0)
                                           + NVL (DMN_SALESTAXCH, 0)
                                           + NVL (DMN_SALESTAXCR, 0))
                                           Net,
                                        SUM (NVL (Patservice.Svn_Disamt, 0))
                                           Discount,
                                        INITCAP (Dac_Desc) Dac_Desc,
                                        Discountauthority.Da_Code,
                                        INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                                        SUM (
                                             NVL (DMN_SALESTAXCH, 0)
                                           + NVL (DMN_SALESTAXCR, 0)
                                           + NVL (DMN_CESSCH, 0)
                                           + NVL (DMN_CESSCR, 0))
                                           Tax
                                   FROM Disbillmast,
                                        Patservice,
                                        Patient,
                                        Discountauthority,
                                        Pattype
                                  WHERE Disbillmast.Dmc_Slno =
                                           Patservice.Dmc_Slno
                                        AND Disbillmast.Pt_No = Patient.Pt_No
                                        AND Patservice.Da_Code =
                                               Discountauthority.Da_Code(+)
                                        AND Patient.Pt_Code = Pattype.Pt_Code
                                        AND NVL (Disbillmast.Dmc_Cancel, 'N') =
                                               'N'
                                        AND NVL (Patservice.Svc_Cancel, 'N') =
                                               'N'
                                        AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                        AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                        AND DISBILLMAST.MH_CODE IN
                                               (SELECT MH_CODE
                                                  FROM multihospital)
                               GROUP BY Disbillmast.Dmc_Slno,
                                        Disbillmast.Dm_No,
                                        Disbillmast.Dmd_Date,
                                        Disbillmast.Pt_No,
                                        INITCAP (Patient.Ptc_Ptname),
                                        INITCAP (Dac_Desc),
                                        Discountauthority.Da_Code,
                                        INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT DISTINCT
                   Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (NVL (DISRMRENTDETL.Rdn_Disamt, 0)) Discount,
                   '' Dac_Desc,
                   '' Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Disbillmast,
                   DISRMRENTDETL,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = DISRMRENTDETL.Dmc_Slno
                   AND Disbillmast.Pt_No = Patient.Pt_No
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   Dac_Desc,
                   Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT DISTINCT
                   Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (NVL (PATVISIT.VSN_DISAMT, 0)) Discount,
                   '' Dac_Desc,
                   '' Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Disbillmast,
                   PATVISIT,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = PATVISIT.Dmc_Slno
                   AND Disbillmast.Pt_No = Patient.Pt_No
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND NVL (PATVISIT.VSC_CANCEL, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (
                        NVL (Srn_Operdis, 0)
                      + NVL (Srn_Theardis, 0)
                      + NVL (Srn_Antdis, 0))
                      Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Disbillmast,
                   Patsurgery,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = Patsurgery.Dmc_Slno
                   AND Disbillmast.Pt_No = Patient.Pt_No
                   AND Patsurgery.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (NVL (Patsurdetl.Srn_Discount, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Disbillmast,
                   Patsurgery,
                   Patsurdetl,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = Patsurgery.Dmc_Slno
                   AND Patsurgery.Sr_Slno = Patsurdetl.Sr_Slno
                   AND Disbillmast.Pt_No = Patient.Pt_No
                   AND Patsurdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (NVL (Patsurother.Srn_Discount, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Disbillmast,
                   Patsurgery,
                   Patsurother,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = Patsurgery.Dmc_Slno
                   AND Patsurgery.Sr_Slno = Patsurother.Sr_Slno
                   AND Disbillmast.Pt_No = Patient.Pt_No
                   AND Patsurother.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (NVL (Billdetl.Bmn_Disamt, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Disbillmast,
                   Billdetl,
                   Discountauthority,
                   Billmast,
                   Patient,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = Billmast.Dmc_Slno
                   AND Billdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Billmast.Pt_No = Patient.Pt_No
                   AND Billmast.Bmc_Slno = Billdetl.Bmc_Slno
                   AND Billmast.Bmc_Cacr IN ('I')
                   AND NVL (Billdetl.Bmc_Cancel, 'N') = 'N'
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   0 Net,
                   SUM (NVL (Refundbilldetl.Rfn_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   0 tax
              FROM Disbillmast,
                   Billdetl,
                   Discountauthority,
                   Billmast,
                   Patient,
                   Refundbilldetl,
                   Refundbillmast,
                   Pattype
             WHERE     Disbillmast.Dmc_Slno = Billmast.Dmc_Slno
                   AND Billdetl.Bmc_Slno = Refundbilldetl.Bmc_Slno
                   AND Billdetl.Bmc_Cnt = Refundbilldetl.Bmc_Cnt
                   AND Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
                   AND Billdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Billmast.Pt_No = Patient.Pt_No
                   AND Billmast.Bmc_Slno = Billdetl.Bmc_Slno
                   AND Billmast.Bmc_Cacr IN ('I')
                   AND Refundbillmast.Rfc_Cacr IN ('I')
                   AND NVL (Refundbillmast.Rfc_Cancel, 'N') = 'N'
                   AND NVL (Billdetl.Bmc_Cancel, 'N') = 'N'
                   AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Disbillmast.Dmc_Slno Slno,
                   Disbillmast.Dm_No BillNo,
                   Disbillmast.Dmd_Date BillDate,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (
                        NVL (DISBILLMAST.DMN_NETAMT, 0)
                      + NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0))
                      Net,
                   SUM (NVL (Pbillmast.Bmn_Disamt, 0)) Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (
                        NVL (DMN_SALESTAXCH, 0)
                      + NVL (DMN_SALESTAXCR, 0)
                      + NVL (DMN_CESSCH, 0)
                      + NVL (DMN_CESSCR, 0))
                      Tax
              FROM Pbillmast,
                   Disbillmast,
                   Discountauthority,
                   Patient,
                   Pattype
             WHERE     Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                   AND Pbillmast.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND Disbillmast.Pt_No = Patient.Pt_No
                   AND Pbillmast.Bmc_Cacr IN ('I')
                   AND NVL (Pbillmast.Bmc_Cancel, 'N') = 'N'
                   AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
          GROUP BY Disbillmast.Dmc_Slno,
                   Disbillmast.Dm_No,
                   Disbillmast.Dmd_Date,
                   Disbillmast.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT A.Slno,
                   A.Dm_No Billno,
                   A.Dmd_Date Billdate,
                   A.Pt_No,
                   A.Ptname,
                   0 Net,
                   SUM (A.Discount) Discount,
                   A.Dac_Desc Dauthority,
                   A.Da_Code,
                   A.Ptc_Desc,
                   A.tax
              FROM (SELECT DISTINCT (Mretmast.Mrc_Slno) Mrc_Slno,
                                    Disbillmast.Dmc_Slno Slno,
                                    Disbillmast.Dm_No,
                                    Disbillmast.Dmd_Date,
                                    Disbillmast.Pt_No,
                                    INITCAP (Patient.Ptc_Ptname) Ptname,
                                    NVL (Mretdetl.Mrn_Disamt, 0) * -1 Discount,
                                    INITCAP (Dac_Desc) Dac_Desc,
                                    Discountauthority.Da_Code,
                                    INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                                    0 tax
                      FROM Mretmast,
                           Mretdetl,
                           Pbillmast,
                           Pbilldetl,
                           Disbillmast,
                           Discountauthority,
                           Patient,
                           Pattype
                     WHERE     Disbillmast.Dmc_Slno = Pbillmast.Dmc_Slno
                           AND Mretmast.Mrc_Slno = Mretdetl.Mrc_Slno
                           AND Mretdetl.Bmc_Slno = Pbillmast.Bmc_Slno
                           AND Pbilldetl.Bmc_Slno = Mretdetl.Bmc_Slno
                           AND Pbilldetl.It_Code = Mretdetl.It_Code
                           AND Pbilldetl.Itc_Docno = Mretdetl.Itc_Docno
                           AND Pbilldetl.Itc_Doctype = Mretdetl.Itc_Doctype
                           AND Pbilldetl.Itc_Slno = Mretdetl.Itc_Slno
                           AND Pbillmast.Da_Code = Discountauthority.Da_Code(+)
                           AND Patient.Pt_Code = Pattype.Pt_Code
                           AND Disbillmast.Pt_No = Patient.Pt_No
                           AND Mretmast.Mrc_Cacr IN ('I')
                           AND NVL (Mretmast.Mrc_Cancel, 'N') = 'N'
                           AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                           AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                           AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                           AND DISBILLMAST.MH_CODE IN
                                  (SELECT MH_CODE FROM multihospital)) A
          GROUP BY A.Slno,
                   A.Dm_No,
                   A.Dmd_Date,
                   A.Pt_No,
                   A.Ptname,
                   Dac_Desc,
                   A.Da_Code,
                   A.Ptc_Desc,
                   A.tax
          UNION ALL                                     /*--Ip Credit Note--*/
                                 SELECT Iprefundmast.Ric_Slno Slno,
                                        Iprefundmast.Ri_No BillNo,
                                        Iprefundmast.Rid_Date BillDate,
                                        Patient.Pt_No,
                                        INITCAP (Patient.Ptc_Ptname) PtName,
                                        MAX (NVL (Iprefundmast.Rin_Netamt, 0))
                                        * -1
                                           Net,
                                        SUM (
                                           NVL (Iprefunditemdetl.Rin_Disamt, 0))
                                        * -1
                                           Discount,
                                        INITCAP (Dac_Desc) Dac_Desc,
                                        Discountauthority.Da_Code,
                                        INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                                        SUM (NVL (iprefundmast.RIN_TOTTAX, 0))
                                        * -1
                                           Tax
                                   FROM Iprefundmast,
                                        Iprefunditemdetl,
                                        Patservice,
                                        Patient,
                                        Discountauthority,
                                        Pattype
                                  WHERE Iprefundmast.Ric_Slno =
                                           Iprefunditemdetl.Ric_Slno
                                        AND Iprefunditemdetl.Ric_Type = 'SVR'
                                        AND Patservice.Sv_Slno =
                                               Iprefunditemdetl.Rin_Moduleslno
                                        AND Iprefundmast.Pt_No = Patient.Pt_No
                                        AND Patservice.Da_Code =
                                               Discountauthority.Da_Code(+)
                                        AND Patient.Pt_Code = Pattype.Pt_Code
                                        AND NVL (Iprefundmast.Ric_Cancel, 'N') =
                                               'N'
                                        AND NVL (Iprefunditemdetl.Ric_Cancel,
                                                 'N') = 'N'
                                        AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                        AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                        AND IPREFUNDMAST.MH_CODE IN
                                               (SELECT MH_CODE
                                                  FROM multihospital)
                               GROUP BY Iprefundmast.Ric_Slno,
                                        Iprefundmast.Ri_No,
                                        Iprefundmast.Rid_Date,
                                        Patient.Pt_No,
                                        INITCAP (Patient.Ptc_Ptname),
                                        INITCAP (Dac_Desc),
                                        Discountauthority.Da_Code,
                                        INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Iprefundmast.Ric_Slno Slno,
                   Iprefundmast.Ri_No BillNo,
                   Iprefundmast.Rid_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Iprefundmast.Rin_Netamt, 0)) * -1 Net,
                   SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (iprefundmast.RIN_TOTTAX, 0)) * -1 Tax
              FROM Iprefundmast,
                   Iprefunditemdetl,
                   Patsurgery,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                   AND Iprefunditemdetl.Ric_Type = 'SUG'
                   AND Iprefunditemdetl.Sr_Fee IN ('OP', 'TH', 'T1')
                   AND Patsurgery.Sr_Slno = Iprefunditemdetl.Rin_Moduleslno
                   AND Iprefundmast.Pt_No = Patient.Pt_No
                   AND Patsurgery.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                   AND NVL (Iprefunditemdetl.Ric_Cancel, 'N') = 'N'
                   AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND IPREFUNDMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Iprefundmast.Ric_Slno,
                   Iprefundmast.Ri_No,
                   Iprefundmast.Rid_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Iprefundmast.Ric_Slno Slno,
                   Iprefundmast.Ri_No BillNo,
                   Iprefundmast.Rid_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Iprefundmast.Rin_Netamt, 0)) * -1 Net,
                   SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (iprefundmast.RIN_TOTTAX, 0)) * -1 Tax
              FROM Iprefundmast,
                   Iprefunditemdetl,
                   Patsurgery,
                   Patsurdetl,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                   AND Iprefunditemdetl.Ric_Type = 'SUG'
                   AND Iprefunditemdetl.Sr_Fee IN ('DT')
                   AND Patsurgery.Sr_Slno = Iprefunditemdetl.Rin_Moduleslno
                   AND Patsurgery.Sr_Slno = Patsurdetl.Sr_Slno
                   AND Iprefundmast.Pt_No = Patient.Pt_No
                   AND Patsurdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                   AND NVL (Iprefunditemdetl.Ric_Cancel, 'N') = 'N'
                   AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND IPREFUNDMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Iprefundmast.Ric_Slno,
                   Iprefundmast.Ri_No,
                   Iprefundmast.Rid_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Iprefundmast.Ric_Slno Slno,
                   Iprefundmast.Ri_No BillNo,
                   Iprefundmast.Rid_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Iprefundmast.Rin_Netamt, 0)) * -1 Net,
                   SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (iprefundmast.RIN_TOTTAX, 0)) * -1 Tax
              FROM Iprefundmast,
                   Iprefunditemdetl,
                   Patsurgery,
                   Patsurother,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                   AND Iprefunditemdetl.Ric_Type = 'SUG'
                   AND Iprefunditemdetl.Sr_Fee IN ('OT')
                   AND Patsurgery.Sr_Slno = Iprefunditemdetl.Rin_Moduleslno
                   AND Patsurgery.Sr_Slno = Patsurother.Sr_Slno
                   AND Iprefundmast.Pt_No = Patient.Pt_No
                   AND Patsurother.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                   AND NVL (Iprefunditemdetl.Ric_Cancel, 'N') = 'N'
                   AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND IPREFUNDMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Iprefundmast.Ric_Slno,
                   Iprefundmast.Ri_No,
                   Iprefundmast.Rid_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Iprefundmast.Ric_Slno Slno,
                   Iprefundmast.Ri_No BillNo,
                   Iprefundmast.Rid_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Iprefundmast.Rin_Netamt, 0)) * -1 Net,
                   SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (iprefundmast.RIN_TOTTAX, 0)) * -1 Tax
              FROM Iprefundmast,
                   Iprefunditemdetl,
                   Billdetl,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                   AND Iprefunditemdetl.Ric_Type = 'BIL'
                   AND Billdetl.Bmc_Slno = Iprefunditemdetl.Rin_Moduleslno
                   AND Billdetl.Pd_Code = Iprefunditemdetl.Pd_Code
                   AND Iprefundmast.Pt_No = Patient.Pt_No
                   AND Billdetl.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                   AND NVL (Iprefunditemdetl.Ric_Cancel, 'N') = 'N'
                   AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND IPREFUNDMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Iprefundmast.Ric_Slno,
                   Iprefundmast.Ri_No,
                   Iprefundmast.Rid_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL
            SELECT Iprefundmast.Ric_Slno Slno,
                   Iprefundmast.Ri_No BillNo,
                   Iprefundmast.Rid_Date BillDate,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname) Ptname,
                   MAX (NVL (Iprefundmast.Rin_Netamt, 0)) * -1 Net,
                   SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                   INITCAP (Dac_Desc) Dac_Desc,
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                   SUM (NVL (iprefundmast.RIN_TOTTAX, 0)) * -1 Tax
              FROM Iprefundmast,
                   Iprefunditemdetl,
                   Pbillmast,
                   Patient,
                   Discountauthority,
                   Pattype
             WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                   AND Iprefunditemdetl.Ric_Type = 'PHY'
                   AND Pbillmast.Bmc_Slno = Iprefunditemdetl.Rin_Moduleslno
                   AND Iprefundmast.Pt_No = Patient.Pt_No
                   AND Pbillmast.Da_Code = Discountauthority.Da_Code(+)
                   AND Patient.Pt_Code = Pattype.Pt_Code
                   AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                   AND NVL (Iprefunditemdetl.Ric_Cancel, 'N') = 'N'
                   AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                   AND IPREFUNDMAST.MH_CODE IN
                          (SELECT MH_CODE FROM multihospital)
          GROUP BY Iprefundmast.Ric_Slno,
                   Iprefundmast.Ri_No,
                   Iprefundmast.Rid_Date,
                   Patient.Pt_No,
                   INITCAP (Patient.Ptc_Ptname),
                   INITCAP (Dac_Desc),
                   Discountauthority.Da_Code,
                   INITCAP (Pattype.Ptc_Desc)
          UNION ALL                                         /*--Ip Receipt--*/
                             SELECT Ipreceipt.Irc_Slno Slno,
                                    Ir_No BillNo,
                                    Ird_Date BillDate,
                                    Ipreceipt.Pt_No,
                                    INITCAP (Patient.Ptc_Ptname) Ptname,
                                    NVL (Ipreceipt.Irn_Total, 0) Net,
                                    NVL (Ipreceipt.Irn_Discount, 0) Discount,
                                    INITCAP (Dac_Desc) Dac_Desc,
                                    Discountauthority.Da_Code,
                                    INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                                    0 tax
                               FROM Ipreceipt,
                                    Patient,
                                    Discountauthority,
                                    Pattype
                              WHERE Ipreceipt.Da_Code =
                                       Discountauthority.Da_Code(+)
                                    AND Patient.Pt_No = Ipreceipt.Pt_No
                                    AND Patient.Pt_Code = Pattype.Pt_Code
                                    AND NVL (Ipreceipt.Irc_Cancel, 'N') = 'N'
                                    AND NVL (Ipreceipt.Irn_Discount, 0) <> 0
                                    AND Ipreceipt.Ird_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                    AND Ipreceipt.Ird_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                    AND ipreceipt.IPC_MHCODE IN
                                           (SELECT MH_CODE FROM multihospital)
          UNION ALL /*--Billing Direct--   corrected by basil for centralized collection*/
                                                                                 SELECT Billmast.Bmc_Slno
                                                                                           Slno,
                                                                                        Billmast.Bm_No
                                                                                           BillNo,
                                                                                        Billmast.Bmd_Date
                                                                                           BillDate,
                                                                                        Billmast.Pt_No,
                                                                                        INITCAP (
                                                                                           Patient.Ptc_Ptname)
                                                                                           Ptname,
                                                                                        MAX (
                                                                                           DECODE (
                                                                                              billmast.Bmc_Cacr,
                                                                                              'C', (Billdetl.pdn_rate
                                                                                                    * pdn_qty)
                                                                                                   - NVL (
                                                                                                        Billdetl.bmn_disamt,
                                                                                                        0),
                                                                                              'R', (Billdetl.pdn_rate
                                                                                                    * pdn_qty)
                                                                                                   - NVL (
                                                                                                        Billdetl.bmn_disamt,
                                                                                                        0),
                                                                                              0))
                                                                                           Net,
                                                                                        SUM (
                                                                                           NVL (
                                                                                              Billdetl.Bmn_Disamt,
                                                                                              0))
                                                                                           Discount,
                                                                                        INITCAP (
                                                                                           Dac_Desc)
                                                                                           Dac_Desc,
                                                                                        Discountauthority.Da_Code,
                                                                                        INITCAP (
                                                                                           Pattype.Ptc_Desc)
                                                                                           Ptc_Desc,
                                                                                        SUM (
                                                                                           NVL (
                                                                                              Billdetl.BDN_TOTTAX,
                                                                                              0)
                                                                                           + NVL (
                                                                                                Billdetl.Bdn_Totcess,
                                                                                                0))
                                                                                           tax
                                                                                   FROM Billdetl,
                                                                                        Billmast,
                                                                                        Discountauthority,
                                                                                        Patient,
                                                                                        Pattype
                                                                                  WHERE Billdetl.Da_Code =
                                                                                           Discountauthority.Da_Code(+)
                                                                                        AND Billmast.Pt_No =
                                                                                               Patient.Pt_No(+)
                                                                                        AND Billmast.Bmc_Slno =
                                                                                               Billdetl.Bmc_Slno
                                                                                        AND Patient.Pt_Code =
                                                                                               Pattype.Pt_Code(+)
                                                                                        AND Billmast.Bmc_Cacr IN
                                                                                               ('C',
                                                                                                'R')
                                                                                        AND NVL (
                                                                                               Billdetl.Bmc_Cancel,
                                                                                               'N') =
                                                                                               'N'
                                                                                        AND billmast.BMC_COLLCNCODE
                                                                                               IS NULL
                                                                                        AND Billmast.Bmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                        AND Billmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                        AND billmast.mh_code IN
                                                                                               (SELECT MH_CODE
                                                                                                  FROM multihospital)
                                                                               GROUP BY Billmast.Bmc_Slno,
                                                                                        Billmast.Bm_No,
                                                                                        Billmast.Bmd_Date,
                                                                                        Billmast.Pt_No,
                                                                                        INITCAP (
                                                                                           Patient.Ptc_Ptname),
                                                                                        INITCAP (
                                                                                           Dac_Desc),
                                                                                        Discountauthority.Da_Code,
                                                                                        INITCAP (
                                                                                           Pattype.Ptc_Desc)
          UNION ALL              /*Added by basil for centralized collection*/
                                                        /*--Billing Direct--*/
                                                                               SELECT Billmast.Bmc_Slno
                                                                                         Slno,
                                                                                      Billmast.Bm_No
                                                                                         BillNo,
                                                                                      Billmast.Bmd_Date
                                                                                         BillDate,
                                                                                      Billmast.Pt_No,
                                                                                      INITCAP (
                                                                                         Patient.Ptc_Ptname)
                                                                                         Ptname,
                                                                                      MAX (
                                                                                         DECODE (
                                                                                            billmast.Bmc_Cacr,
                                                                                            'C', (Billdetl.pdn_rate
                                                                                                  * pdn_qty)
                                                                                                 - NVL (
                                                                                                      Billdetl.bmn_disamt,
                                                                                                      0),
                                                                                            'R', (Billdetl.pdn_rate
                                                                                                  * pdn_qty)
                                                                                                 - NVL (
                                                                                                      Billdetl.bmn_disamt,
                                                                                                      0),
                                                                                            0))
                                                                                         Net,
                                                                                      SUM (
                                                                                         NVL (
                                                                                            Billdetl.Bmn_Disamt,
                                                                                            0))
                                                                                         Discount,
                                                                                      INITCAP (
                                                                                         Dac_Desc)
                                                                                         Dac_Desc,
                                                                                      Discountauthority.Da_Code,
                                                                                      INITCAP (
                                                                                         Pattype.Ptc_Desc)
                                                                                         Ptc_Desc,
                                                                                      SUM (
                                                                                         NVL (
                                                                                            Billdetl.BDN_TOTTAX,
                                                                                            0)
                                                                                         + NVL (
                                                                                              Billdetl.Bdn_Totcess,
                                                                                              0))
                                                                                         tax
                                                                                 FROM Billdetl,
                                                                                      Billmast,
                                                                                      Discountauthority,
                                                                                      Patient,
                                                                                      Pattype
                                                                                WHERE Billdetl.Da_Code =
                                                                                         Discountauthority.Da_Code(+)
                                                                                      AND Billmast.Pt_No =
                                                                                             Patient.Pt_No(+)
                                                                                      AND Billmast.Bmc_Slno =
                                                                                             Billdetl.Bmc_Slno
                                                                                      AND Patient.Pt_Code =
                                                                                             Pattype.Pt_Code(+)
                                                                                      AND Billmast.Bmc_Cacr IN
                                                                                             ('C',
                                                                                              'R')
                                                                                      AND NVL (
                                                                                             Billdetl.Bmc_Cancel,
                                                                                             'N') =
                                                                                             'N'
                                                                                      AND billmast.BMC_COLLCNCODE
                                                                                             IS NOT NULL
                                                                                      AND Billmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                      AND Billmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                      AND billmast.mh_code IN
                                                                                             (SELECT MH_CODE
                                                                                                FROM multihospital)
                                                                             GROUP BY Billmast.Bmc_Slno,
                                                                                      Billmast.Bm_No,
                                                                                      Billmast.Bmd_Date,
                                                                                      Billmast.Pt_No,
                                                                                      INITCAP (
                                                                                         Patient.Ptc_Ptname),
                                                                                      INITCAP (
                                                                                         Dac_Desc),
                                                                                      Discountauthority.Da_Code,
                                                                                      INITCAP (
                                                                                         Pattype.Ptc_Desc)
          UNION ALL /*Corrected by basil for centralized collection  --Billing Direct Refund--*/
                                                                                       SELECT Refundbillmast.Rfc_Slno
                                                                                                 Slno,
                                                                                              Refundbillmast.Rf_No
                                                                                                 BillNo,
                                                                                              Refundbillmast.Rfd_Date
                                                                                                 BillDate,
                                                                                              Billmast.Pt_No,
                                                                                              INITCAP (
                                                                                                 Patient.Ptc_Ptname)
                                                                                                 Ptname,
                                                                                              MAX (
                                                                                                 NVL (
                                                                                                    Refundbillmast.Rfn_Netamt,
                                                                                                    0))
                                                                                              * -1
                                                                                                 Net,
                                                                                              SUM (
                                                                                                 NVL (
                                                                                                    Refundbilldetl.Rfn_Disamt,
                                                                                                    0))
                                                                                              * -1
                                                                                                 Discount,
                                                                                              INITCAP (
                                                                                                 Dac_Desc)
                                                                                                 Dac_Desc,
                                                                                              Discountauthority.Da_Code,
                                                                                              INITCAP (
                                                                                                 Pattype.Ptc_Desc)
                                                                                                 Ptc_Desc,
                                                                                              SUM (
                                                                                                 NVL (
                                                                                                    refundbillmast.RFN_TOTTAX,
                                                                                                    0)
                                                                                                 + NVL (
                                                                                                      Refundbillmast.Rfn_Totcess,
                                                                                                      0))
                                                                                              * -1
                                                                                                 Tax
                                                                                         FROM Billdetl,
                                                                                              Billmast,
                                                                                              Patient,
                                                                                              Refundbilldetl,
                                                                                              Refundbillmast,
                                                                                              Discountauthority,
                                                                                              Pattype
                                                                                        WHERE Billdetl.Bmc_Slno =
                                                                                                 Refundbilldetl.Bmc_Slno
                                                                                              AND Billdetl.Bmc_Cnt =
                                                                                                     Refundbilldetl.Bmc_Cnt
                                                                                              AND Refundbillmast.Rfc_Slno =
                                                                                                     Refundbilldetl.Rfc_Slno
                                                                                              AND Billdetl.Da_Code =
                                                                                                     Discountauthority.Da_Code(+)
                                                                                              AND Billmast.Pt_No =
                                                                                                     Patient.Pt_No
                                                                                              AND Billmast.Bmc_Slno =
                                                                                                     Billdetl.Bmc_Slno
                                                                                              AND Patient.Pt_Code =
                                                                                                     Pattype.Pt_Code(+)
                                                                                              AND Billmast.Bmc_Cacr IN
                                                                                                     ('C',
                                                                                                      'R')
                                                                                              AND Refundbillmast.Rfc_Cacr IN
                                                                                                     ('C',
                                                                                                      'R')
                                                                                              AND NVL (
                                                                                                     Refundbillmast.Rfc_Cancel,
                                                                                                     'N') =
                                                                                                     'N'
                                                                                              AND NVL (
                                                                                                     Billdetl.Bmc_Cancel,
                                                                                                     'N') =
                                                                                                     'N'
                                                                                              AND Refundbillmast.RFC_RETCNCODE
                                                                                                     IS NULL
                                                                                              AND Refundbillmast.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                              AND Refundbillmast.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                              AND refundbillmast.MH_CODE IN
                                                                                                     (SELECT MH_CODE
                                                                                                        FROM multihospital)
                                                                                     GROUP BY Refundbillmast.Rfc_Slno,
                                                                                              Refundbillmast.Rf_No,
                                                                                              Refundbillmast.Rfd_Date,
                                                                                              Billmast.Pt_No,
                                                                                              INITCAP (
                                                                                                 Patient.Ptc_Ptname),
                                                                                              INITCAP (
                                                                                                 Dac_Desc),
                                                                                              Discountauthority.Da_Code,
                                                                                              INITCAP (
                                                                                                 Pattype.Ptc_Desc)
          UNION ALL /*--Billing Direct Refund-- corrected by basil for centralized collection*/
                                                                                      SELECT Refundbillmast.Rfc_Slno
                                                                                                Slno,
                                                                                             Refundbillmast.Rf_No
                                                                                                BillNo,
                                                                                             Refundbillmast.Rfd_Date
                                                                                                BillDate,
                                                                                             Billmast.Pt_No,
                                                                                             INITCAP (
                                                                                                Patient.Ptc_Ptname)
                                                                                                Ptname,
                                                                                             MAX (
                                                                                                NVL (
                                                                                                   Refundbillmast.Rfn_Netamt,
                                                                                                   0))
                                                                                             * -1
                                                                                                Net,
                                                                                             SUM (
                                                                                                NVL (
                                                                                                   Refundbilldetl.Rfn_Disamt,
                                                                                                   0))
                                                                                             * -1
                                                                                                Discount,
                                                                                             INITCAP (
                                                                                                Dac_Desc)
                                                                                                Dac_Desc,
                                                                                             Discountauthority.Da_Code,
                                                                                             INITCAP (
                                                                                                Pattype.Ptc_Desc)
                                                                                                Ptc_Desc,
                                                                                             SUM (
                                                                                                NVL (
                                                                                                   refundbillmast.RFN_TOTTAX,
                                                                                                   0)
                                                                                                + NVL (
                                                                                                     Refundbillmast.Rfn_Totcess,
                                                                                                     0))
                                                                                             * -1
                                                                                                Tax
                                                                                        FROM Billdetl,
                                                                                             Billmast,
                                                                                             Patient,
                                                                                             Refundbilldetl,
                                                                                             Refundbillmast,
                                                                                             Discountauthority,
                                                                                             Pattype
                                                                                       WHERE Billdetl.Bmc_Slno =
                                                                                                Refundbilldetl.Bmc_Slno
                                                                                             AND Billdetl.Bmc_Cnt =
                                                                                                    Refundbilldetl.Bmc_Cnt
                                                                                             AND Refundbillmast.Rfc_Slno =
                                                                                                    Refundbilldetl.Rfc_Slno
                                                                                             AND Billdetl.Da_Code =
                                                                                                    Discountauthority.Da_Code(+)
                                                                                             AND Billmast.Pt_No =
                                                                                                    Patient.Pt_No
                                                                                             AND Billmast.Bmc_Slno =
                                                                                                    Billdetl.Bmc_Slno
                                                                                             AND Patient.Pt_Code =
                                                                                                    Pattype.Pt_Code(+)
                                                                                             AND Billmast.Bmc_Cacr IN
                                                                                                    ('C',
                                                                                                     'R')
                                                                                             AND Refundbillmast.Rfc_Cacr IN
                                                                                                    ('C',
                                                                                                     'R')
                                                                                             AND NVL (
                                                                                                    Refundbillmast.Rfc_Cancel,
                                                                                                    'N') =
                                                                                                    'N'
                                                                                             AND NVL (
                                                                                                    Billdetl.Bmc_Cancel,
                                                                                                    'N') =
                                                                                                    'N'
                                                                                             AND Refundbillmast.RFC_RETCNCODE
                                                                                                    IS NOT NULL
                                                                                             AND Refundbillmast.RFD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                             AND Refundbillmast.RFD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                             AND refundbillmast.MH_CODE IN
                                                                                                    (SELECT MH_CODE
                                                                                                       FROM multihospital)
                                                                                    GROUP BY Refundbillmast.Rfc_Slno,
                                                                                             Refundbillmast.Rf_No,
                                                                                             Refundbillmast.Rfd_Date,
                                                                                             Billmast.Pt_No,
                                                                                             INITCAP (
                                                                                                Patient.Ptc_Ptname),
                                                                                             INITCAP (
                                                                                                Dac_Desc),
                                                                                             Discountauthority.Da_Code,
                                                                                             INITCAP (
                                                                                                Pattype.Ptc_Desc)
          UNION ALL      /*--corrected by basil for centralized collection--*/
                                               /*--Pharmacy Direct Billing--*/
                                                                                                SELECT Pbillmast.Bmc_Slno
                                                                                                          Slno,
                                                                                                       Bm_No
                                                                                                          BillNo,
                                                                                                       Bmd_Date
                                                                                                          BillDate,
                                                                                                       Pbillmast.Pt_No,
                                                                                                       TRIM (
                                                                                                          INITCAP (
                                                                                                             Hoc_Ptname))
                                                                                                          Ptname,
                                                                                                       NVL (
                                                                                                          PBILLMAST.BMN_NETAMT,
                                                                                                          0)
                                                                                                       + NVL (
                                                                                                            PBILLMAST.BMN_SALETAXCH,
                                                                                                            0)
                                                                                                       + NVL (
                                                                                                            PBILLMAST.BMN_CESSCH,
                                                                                                            0)
                                                                                                       + NVL (
                                                                                                            PBILLMAST.BMN_SALETAXCR,
                                                                                                            0)
                                                                                                       + NVL (
                                                                                                            PBILLMAST.BMN_CESSCR,
                                                                                                            0)
                                                                                                          Net,
                                                                                                       NVL (
                                                                                                          Pbillmast.Bmn_Disamt,
                                                                                                          0)
                                                                                                          Discount,
                                                                                                       INITCAP (
                                                                                                          Dac_Desc)
                                                                                                          Dac_Desc,
                                                                                                       Discountauthority.Da_Code,
                                                                                                       INITCAP (
                                                                                                          Pattype.Ptc_Desc)
                                                                                                          Ptc_Desc,
                                                                                                       (NVL (
                                                                                                           BMN_SALETAXCH,
                                                                                                           0)
                                                                                                        + NVL (
                                                                                                             BMN_SALETAXCR,
                                                                                                             0)
                                                                                                        + NVL (
                                                                                                             BMN_CESSCH,
                                                                                                             0)
                                                                                                        + NVL (
                                                                                                             BMN_CESSCR,
                                                                                                             0))
                                                                                                          Tax
                                                                                                  FROM Pbillmast,
                                                                                                       Discountauthority,
                                                                                                       Patient,
                                                                                                       Pattype
                                                                                                 WHERE Pbillmast.Da_Code =
                                                                                                          Discountauthority.Da_Code(+)
                                                                                                       AND Pbillmast.Pt_No =
                                                                                                              Patient.Pt_No(+)
                                                                                                       AND Patient.Pt_Code =
                                                                                                              Pattype.Pt_Code(+)
                                                                                                       AND Pbillmast.Bmc_Cacr IN
                                                                                                              ('C',
                                                                                                               'R')
                                                                                                       AND NVL (
                                                                                                              Pbillmast.Bmc_Cancel,
                                                                                                              'N') =
                                                                                                              'N'
                                                                                                       AND NVL (
                                                                                                              Pbillmast.Bmn_Disamt,
                                                                                                              0) <>
                                                                                                              0
                                                                                                       AND pbillmast.BMC_COLLCNCODE
                                                                                                              IS NULL
                                                                                                       AND Pbillmast.Bmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                                       AND Pbillmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                                       AND pbillmast.MH_CODE IN
                                                                                                              (SELECT MH_CODE
                                                                                                                 FROM multihospital)
          UNION ALL          /*--added by basil for centralized collection--*/
                                               /*--Pharmacy Direct Billing--*/
                                                                                            SELECT Pbillmast.Bmc_Slno
                                                                                                      Slno,
                                                                                                   Bm_No
                                                                                                      BillNo,
                                                                                                   Bmd_Date
                                                                                                      BillDate,
                                                                                                   Pbillmast.Pt_No,
                                                                                                   TRIM (
                                                                                                      INITCAP (
                                                                                                         Hoc_Ptname))
                                                                                                      Ptname,
                                                                                                   NVL (
                                                                                                      PBILLMAST.BMN_NETAMT,
                                                                                                      0)
                                                                                                   + NVL (
                                                                                                        PBILLMAST.BMN_SALETAXCH,
                                                                                                        0)
                                                                                                   + NVL (
                                                                                                        PBILLMAST.BMN_CESSCH,
                                                                                                        0)
                                                                                                   + NVL (
                                                                                                        PBILLMAST.BMN_SALETAXCR,
                                                                                                        0)
                                                                                                   + NVL (
                                                                                                        PBILLMAST.BMN_CESSCR,
                                                                                                        0)
                                                                                                      Net,
                                                                                                   NVL (
                                                                                                      Pbillmast.Bmn_Disamt,
                                                                                                      0)
                                                                                                      Discount,
                                                                                                   INITCAP (
                                                                                                      Dac_Desc)
                                                                                                      Dac_Desc,
                                                                                                   Discountauthority.Da_Code,
                                                                                                   INITCAP (
                                                                                                      Pattype.Ptc_Desc)
                                                                                                      Ptc_Desc,
                                                                                                   (NVL (
                                                                                                       BMN_SALETAXCH,
                                                                                                       0)
                                                                                                    + NVL (
                                                                                                         BMN_SALETAXCR,
                                                                                                         0)
                                                                                                    + NVL (
                                                                                                         BMN_CESSCH,
                                                                                                         0)
                                                                                                    + NVL (
                                                                                                         BMN_CESSCR,
                                                                                                         0))
                                                                                                      Tax
                                                                                              FROM Pbillmast,
                                                                                                   Discountauthority,
                                                                                                   Patient,
                                                                                                   Pattype
                                                                                             WHERE Pbillmast.Da_Code =
                                                                                                      Discountauthority.Da_Code(+)
                                                                                                   AND Pbillmast.Pt_No =
                                                                                                          Patient.Pt_No(+)
                                                                                                   AND Patient.Pt_Code =
                                                                                                          Pattype.Pt_Code(+)
                                                                                                   AND Pbillmast.Bmc_Cacr IN
                                                                                                          ('C',
                                                                                                           'R')
                                                                                                   AND NVL (
                                                                                                          Pbillmast.Bmc_Cancel,
                                                                                                          'N') =
                                                                                                          'N'
                                                                                                   AND NVL (
                                                                                                          Pbillmast.Bmn_Disamt,
                                                                                                          0) <>
                                                                                                          0
                                                                                                   AND pbillmast.BMC_COLLCNCODE
                                                                                                          IS NOT NULL
                                                                                                   AND Pbillmast.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                                   AND Pbillmast.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                                   AND pbillmast.MH_CODE IN
                                                                                                          (SELECT MH_CODE
                                                                                                             FROM multihospital)
          UNION ALL          /*--added by basil for centralized collection--*/
                                                /*--Pharmacy Direct Return--*/
                                                                                           SELECT DISTINCT
                                                                                                  (Mretmast.Mrc_Slno)
                                                                                                     Slno,
                                                                                                  Mretmast.Mr_No
                                                                                                     BillNo,
                                                                                                  Mretmast.Mrd_Date
                                                                                                     BillDate,
                                                                                                  Mretmast.Pt_No,
                                                                                                  TRIM (
                                                                                                     INITCAP (
                                                                                                        Pbillmast.Hoc_Ptname))
                                                                                                     Ptname,
                                                                                                  MAX (
                                                                                                     NVL (
                                                                                                        MRETMAST.MRN_NETAMT,
                                                                                                        0)
                                                                                                     + NVL (
                                                                                                          MRETMAST.MRN_SALETAXCH,
                                                                                                          0)
                                                                                                     + NVL (
                                                                                                          MRETMAST.MRN_CESSCH,
                                                                                                          0)
                                                                                                     + NVL (
                                                                                                          MRETMAST.MRN_SALETAXCR,
                                                                                                          0)
                                                                                                     + NVL (
                                                                                                          MRETMAST.MRN_CESSCR,
                                                                                                          0))
                                                                                                  * -1
                                                                                                     Net,
                                                                                                  SUM (
                                                                                                     NVL (
                                                                                                        Mretdetl.Mrn_Disamt,
                                                                                                        0))
                                                                                                  * -1
                                                                                                     Discount,
                                                                                                  INITCAP (
                                                                                                     Dac_Desc)
                                                                                                     Dac_Desc,
                                                                                                  Discountauthority.Da_Code,
                                                                                                  INITCAP (
                                                                                                     Pattype.Ptc_Desc)
                                                                                                     Ptc_Desc,
                                                                                                  SUM (
                                                                                                     NVL (
                                                                                                        MRN_SALETAXCH,
                                                                                                        0)
                                                                                                     + NVL (
                                                                                                          MRN_SALETAXCR,
                                                                                                          0)
                                                                                                     + NVL (
                                                                                                          MRN_CESSCH,
                                                                                                          0)
                                                                                                     + NVL (
                                                                                                          MRN_CESSCR,
                                                                                                          0))
                                                                                                  * -1
                                                                                                     Tax
                                                                                             FROM Mretmast,
                                                                                                  Mretdetl,
                                                                                                  Pbillmast,
                                                                                                  Pbilldetl,
                                                                                                  Discountauthority,
                                                                                                  Patient,
                                                                                                  Pattype
                                                                                            WHERE Mretmast.Mrc_Slno =
                                                                                                     Mretdetl.Mrc_Slno
                                                                                                  AND Mretdetl.Bmc_Slno =
                                                                                                         Pbillmast.Bmc_Slno
                                                                                                  AND Pbilldetl.Bmc_Slno =
                                                                                                         Mretdetl.Bmc_Slno
                                                                                                  AND Pbilldetl.It_Code =
                                                                                                         Mretdetl.It_Code
                                                                                                  AND Pbilldetl.Itc_Docno =
                                                                                                         Mretdetl.Itc_Docno
                                                                                                  AND Pbilldetl.Itc_Doctype =
                                                                                                         Mretdetl.Itc_Doctype
                                                                                                  AND Pbilldetl.Itc_Slno =
                                                                                                         Mretdetl.Itc_Slno
                                                                                                  AND Pbillmast.Da_Code =
                                                                                                         Discountauthority.Da_Code(+)
                                                                                                  AND Pbillmast.Pt_No =
                                                                                                         Patient.Pt_No(+)
                                                                                                  AND Patient.Pt_Code =
                                                                                                         Pattype.Pt_Code(+)
                                                                                                  AND Mretmast.Mrc_Cacr IN
                                                                                                         ('C',
                                                                                                          'R')
                                                                                                  AND NVL (
                                                                                                         Mretmast.Mrc_Cancel,
                                                                                                         'N') =
                                                                                                         'N'
                                                                                                  AND Mretmast.MRC_RETCNCODE
                                                                                                         IS NULL
                                                                                                  AND Mretmast.Mrd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                                  AND Mretmast.Mrd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                                                                  AND MRETMAST.MH_CODE IN
                                                                                                         (SELECT MH_CODE
                                                                                                            FROM multihospital)
                                                                                         GROUP BY (Mretmast.Mrc_Slno),
                                                                                                  Mretmast.Mr_No,
                                                                                                  Mretmast.Mrd_Date,
                                                                                                  Mretmast.Pt_No,
                                                                                                  TRIM (
                                                                                                     INITCAP (
                                                                                                        Pbillmast.Hoc_Ptname)),
                                                                                                  INITCAP (
                                                                                                     Dac_Desc),
                                                                                                  Discountauthority.Da_Code,
                                                                                                  INITCAP (
                                                                                                     Pattype.Ptc_Desc) /*--added by basil for centralized collection--*/
          UNION ALL                             /*--Pharmacy Direct Return--*/
                                         SELECT DISTINCT
                                                (Mretmast.Mrc_Slno) Slno,
                                                Mretmast.Mr_No BillNo,
                                                Mretmast.Mrd_Date BillDate,
                                                Mretmast.Pt_No,
                                                TRIM (
                                                   INITCAP (
                                                      Pbillmast.Hoc_Ptname))
                                                   Ptname,
                                                MAX (
                                                   NVL (MRETMAST.MRN_NETAMT, 0)
                                                   + NVL (
                                                        MRETMAST.MRN_SALETAXCH,
                                                        0)
                                                   + NVL (MRETMAST.MRN_CESSCH,
                                                          0)
                                                   + NVL (
                                                        MRETMAST.MRN_SALETAXCR,
                                                        0)
                                                   + NVL (MRETMAST.MRN_CESSCR,
                                                          0))
                                                * -1
                                                   Net,
                                                SUM (
                                                   NVL (Mretdetl.Mrn_Disamt, 0))
                                                * -1
                                                   Discount,
                                                INITCAP (Dac_Desc) Dac_Desc,
                                                Discountauthority.Da_Code,
                                                INITCAP (Pattype.Ptc_Desc)
                                                   Ptc_Desc,
                                                SUM (
                                                     NVL (MRN_SALETAXCH, 0)
                                                   + NVL (MRN_SALETAXCR, 0)
                                                   + NVL (MRN_CESSCH, 0)
                                                   + NVL (MRN_CESSCR, 0))
                                                * -1
                                                   Tax
                                           FROM Mretmast,
                                                Mretdetl,
                                                Pbillmast,
                                                Pbilldetl,
                                                Discountauthority,
                                                Patient,
                                                Pattype
                                          WHERE Mretmast.Mrc_Slno =
                                                   Mretdetl.Mrc_Slno
                                                AND Mretdetl.Bmc_Slno =
                                                       Pbillmast.Bmc_Slno
                                                AND Pbilldetl.Bmc_Slno =
                                                       Mretdetl.Bmc_Slno
                                                AND Pbilldetl.It_Code =
                                                       Mretdetl.It_Code
                                                AND Pbilldetl.Itc_Docno =
                                                       Mretdetl.Itc_Docno
                                                AND Pbilldetl.Itc_Doctype =
                                                       Mretdetl.Itc_Doctype
                                                AND Pbilldetl.Itc_Slno =
                                                       Mretdetl.Itc_Slno
                                                AND Pbillmast.Da_Code =
                                                       Discountauthority.Da_Code(+)
                                                AND Pbillmast.Pt_No =
                                                       Patient.Pt_No(+)
                                                AND Patient.Pt_Code =
                                                       Pattype.Pt_Code(+)
                                                AND Mretmast.Mrc_Cacr IN
                                                       ('C', 'R')
                                                AND NVL (Mretmast.Mrc_Cancel,
                                                         'N') = 'N'
                                                AND Mretmast.MRC_RETCNCODE
                                                       IS NOT NULL
                                                AND Mretmast.MRD_RETDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                                                AND Mretmast.MRD_RETDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                                                AND MRETMAST.MH_CODE IN
                                                       (SELECT MH_CODE
                                                          FROM multihospital)
                                       GROUP BY (Mretmast.Mrc_Slno),
                                                Mretmast.Mr_No,
                                                Mretmast.Mrd_Date,
                                                Mretmast.Pt_No,
                                                TRIM (
                                                   INITCAP (
                                                      Pbillmast.Hoc_Ptname)),
                                                INITCAP (Dac_Desc),
                                                Discountauthority.Da_Code,
                                                INITCAP (Pattype.Ptc_Desc))
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
};
