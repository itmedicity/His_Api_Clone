// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../../../config/oradbconfig');

module.exports = {
        proIncomePart1Tssh: async (data, callBack) => {
                let pool_ora = await oraConnection();
                let conn_ora = await pool_ora.getConnection();

                const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
                const fromDate = data.from;
                const toDate = data.to;

                const sql = `SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
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
                        WHERE PATSERVICE.Dmc_Slno = Disbillmast.Dmc_Slno
                                AND PATSERVICE.pd_code = Prodescription.pd_code
                                AND Prodescription.pg_Code = Progroup.pg_Code
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Progroup.pc_code
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND NVL (SVC_CANCEL, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
                                SUM ( NVL (disroomdetl.drn_nurdays, 0) * NVL (disroomdetl.drn_nuramt, 0)) Amt,
                                SUM (0) tax,
                                SUM ( NVL (disroomdetl.drn_nurdays, 0) * NVL (disroomdetl.drn_nuramt, 0)) GrossAmt,
                                SUM (0) Discount
                        FROM Disroomdetl,
                                Disbillmast,
                                Ipparam,
                                Misincexpdtl,
                                Misincexpgroup
                        WHERE Disbillmast.Dmc_Slno = Disroomdetl.Dmc_Slno
                                AND Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode
                                AND Misincexpdtl.Dg_Type = 'R'
                                AND Ipparam.Ipc_Nucode = Misincexpdtl.Pc_Code
                                AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                                AND NVL (Disroomdetl.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.Dmd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_oper
                                AND NVL (Patsurgery.srn_operation, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_ther
                                AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_CHIEF
                                AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >=  TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_1stasst
                                AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_2NDASST
                                AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_3RDASST
                                AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_GUEST
                                AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_ANEST
                                AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Opparam.Opc_ANEST2
                                AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Progroup.pc_code
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND NVL (PATSUROTHER.Src_Cancel, 'N') = 'N'
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = PATSURDETL.PC_CODE
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                                AND Opbillmast.OPC_CACR <> 'M'
                                AND Opbillmast.OPD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.OPD_DATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Patsurgery.IP_NO IN  (${ipNumberList})
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND NVL (PATSURDETL.Src_Cancel, 'N') = 'N'
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
                                SUM (NVL (Rdn_amount * Rdn_days, 0) - NVL (Rdn_Disamt, 0)) Amt,
                                SUM (NVL (DISRMRENTDETL.RDN_TOTTAX, 0)) tax,
                                SUM (NVL (Rdn_amount * Rdn_days, 0)) GrossAmt,
                                SUM (NVL (Rdn_Disamt, 0)) Discount
                        FROM DISRMRENTDETL,
                                Disbillmast,
                                Misincexpdtl,
                                Misincexpgroup
                        WHERE     DISRMRENTDETL.Dmc_Slno = Disbillmast.Dmc_Slno
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND DISRMRENTDETL.pc_code = Misincexpdtl.pc_code
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO IN  (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_Desc,
                                Misincexpgroup.Dg_Grcode AS Code,
                                SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                                SUM (NVL (Iprefunditemdetl.RIN_TOTTAX, 0)) * -1 tax,
                                SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0) + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                                SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount
                        FROM Misincexpgroup,
                                Misincexpdtl,
                                Iprefunditemdetl,
                                Iprefundmast
                        WHERE     Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                                AND Iprefunditemdetl.Pc_Code = Misincexpdtl.Pc_Code
                                AND Misincexpgroup.Dg_Grcode = Misincexpdtl.Dg_Grcode
                                AND Misincexpgroup.Dg_Type = 'R'
                                AND Iprefunditemdetl.Ric_Type <> 'PHY'
                                AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                                AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                                AND Iprefundmast.Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Iprefundmast.Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_Grcode, Misincexpgroup.Dg_Desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.Ipc_vscode
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND NVL (VSC_CANCEL, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO IN  (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        ORDER BY Dg_desc`;
                try {
                        const result = await conn_ora.execute(
                                sql,
                                {},
                                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                        )
                        await result.resultSet?.getRows((err, rows) => {
                                callBack(err, rows)
                        })
                } catch (error) {
                        console.log(error)
                } finally {
                        if (conn_ora) {
                                await conn_ora.close();
                                await pool_ora.close();
                        }
                }
        },
        proIncomePart2Tssh: async (data, callBack) => {
                let pool_ora = await oraConnection();
                let conn_ora = await pool_ora.getConnection();

                const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
                const fromDate = data.from;
                const toDate = data.to;

                const sql = ` SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
                                SUM (refundbilldetl.rfn_netamt) * -1 Amt,
                                SUM (NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)) * -1 tax,
                                SUM ( NVL (refundbilldetl.rfn_netamt, 0) + NVL (refundbilldetl.rfn_disamt, 0)) * -1 GrossAmt,
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
                        WHERE  Refundbilldetl.Bmc_Slno = Billdetl.Bmc_Slno
                                AND Billdetl.Opc_Slno = Opbillmast.Opc_Slno
                                AND Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
                                AND Refundbilldetl.Bmc_Cnt = Billdetl.Bmc_Cnt
                                AND Refundbilldetl.Pd_Code = Prodescription.Pd_Code
                                AND Prodescription.Pg_Code = Progroup.Pg_Code
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Progroup.pc_code
                                AND Refundbillmast.Rfc_Cacr IN ('O')
                                AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                                AND NVL (Refundbilldetl.Rfc_Cancel, 'N') = 'N'
                                AND Opbillmast.Opc_Cacr <> 'M'
                                AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.Opd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
                                SUM (refundbilldetl.rfn_netamt) * -1 Amt,
                                SUM (NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)) * -1 tax,
                                SUM ( NVL (refundbilldetl.rfn_netamt, 0) + NVL (refundbilldetl.rfn_disamt, 0)) * -1GrossAmt,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Progroup.pc_code
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND NVL (Refundbilldetl.Rfc_Cancel, 'N') = 'N'
                                AND Refundbillmast.Rfc_Cacr IN ('I')
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.dmd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
                                SUM (receiptdetl.rpn_netamt) Amt,
                                SUM (NVL (Receiptdetl.RPN_TOTTAX, 0)) tax,
                                SUM ( NVL (receiptdetl.rpn_netamt, 0) + NVL (receiptdetl.rpn_disamt, 0)) GrossAmt,
                                SUM (0) AS Comp,
                                SUM (NVL (receiptdetl.rpn_disamt, 0)) discount
                        FROM Receiptdetl,
                                Receiptmast,
                                Prodescription,
                                Progroup,
                                Misincexpdtl,
                                Misincexpgroup,
                                Opbillmast
                        WHERE     Receiptmast.RPC_SLNO = Receiptdetl.RPC_SLNO
                                AND Receiptdetl.Opc_Slno = Opbillmast.Opc_Slno
                                AND Receiptdetl.pd_code = Prodescription.pd_code
                                AND Prodescription.pg_code = Progroup.pg_code
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Progroup.pc_code
                                AND Receiptmast.RPC_CANCEL IS NULL
                                AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                                AND Opbillmast.Opc_Cacr <> 'M'
                                AND Receiptmast.RPC_CAcr = 'O'
                                AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Opbillmast.Opd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc`;

                try {
                        const result = await conn_ora.execute(
                                sql,
                                {},
                                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                        )
                        await result.resultSet?.getRows((err, rows) => {
                                callBack(err, rows)
                        })
                } catch (error) {
                        console.log(error)
                } finally {
                        if (conn_ora) {
                                await conn_ora.close();
                                await pool_ora.close();
                        }
                }
        },
        proIncomePart3Tssh: async (data, callBack) => {
                let pool_ora = await oraConnection();
                let conn_ora = await pool_ora.getConnection();

                const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
                const fromDate = data.from;
                const toDate = data.to;

                const sql = `SELECT Misincexpgroup.Dg_desc,
                            Misincexpgroup.Dg_grcode AS Code,
                            SUM ( (Billdetl.pdn_rate * pdn_qty) - NVL (Billdetl.bmn_disamt, 0)) Amt,
                            SUM (NVL (Billdetl.BDN_TOTTAX, 0)) tax,
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
                    WHERE Billmast.Bmc_Slno = Billdetl.Bmc_Slno
                            AND Billdetl.Opc_Slno = Opbillmast.Opc_Slno
                            AND Billdetl.pd_code = Prodescription.pd_code
                            AND Prodescription.pg_code = Progroup.pg_code
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                            AND Misincexpdtl.Dg_type = 'R'
                            AND Misincexpdtl.Pc_code = Progroup.pc_code
                            AND Opbillmast.Opc_Cacr <> 'M'
                            AND Billmast.Bmc_Cacr = 'O'
                            AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                            AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND Opbillmast.Opd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                    UNION ALL
                    SELECT Misincexpgroup.DG_DESC,
                            Misincexpgroup.DG_GRCODE AS Code,
                            SUM ( DECODE ( billmast.Bmc_Cacr,  'C', (Billdetl.pdn_rate * pdn_qty)  - NVL (Billdetl.bmn_disamt, 0), 'R', (Billdetl.pdn_rate * pdn_qty) - NVL (Billdetl.bmn_disamt, 0),  0))  Amt,
                            SUM (NVL (Billdetl.BDN_TOTTAX, 0)) tax,
                            SUM ( DECODE (billmast.Bmc_Cacr,  'C', (Billdetl.pdn_rate * pdn_qty),  'R', (Billdetl.pdn_rate * pdn_qty))) GrossAmt,
                            SUM ( DECODE ( billmast.Bmc_Cacr,  'M', (Billdetl.pdn_rate * pdn_qty)  - NVL (Billdetl.bmn_disamt, 0), 0)) AS Comp,
                            SUM ( DECODE (billmast.Bmc_Cacr,  'C', (Billdetl.bmn_disamt),  'R', (Billdetl.bmn_disamt))) Discount
                    FROM Billmast,
                            Billdetl,
                            Misincexpdtl,
                            Prodescription,
                            Progroup,
                            Misincexpgroup
                    WHERE Billmast.Bmc_Slno = Billdetl.Bmc_Slno
                            AND billmast.BMC_COLLCNCODE IS NOT NULL
                            AND Billdetl.pd_code = Prodescription.pd_code
                            AND Prodescription.pg_code = Progroup.pg_code
                            AND Progroup.pc_code = Misincexpdtl.pc_code
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                            AND Misincexpdtl.Dg_type = 'R'
                            AND Billmast.Bmc_Cacr IN ('C', 'R')
                            AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                            AND Billmast.BMD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                            AND Billmast.BMD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                    GROUP BY Misincexpgroup.DG_GRCODE, Misincexpgroup.DG_DESC
                    UNION ALL
                    SELECT Misincexpgroup.Dg_desc,
                            Misincexpgroup.Dg_grcode AS Code,
                            SUM ( (Billdetl.pdn_rate * pdn_qty) - NVL (Billdetl.bmn_disamt, 0)) Amt,
                            SUM (NVL (Billdetl.BDN_TOTTAX, 0)) tax,
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
                    WHERE Billmast.Bmc_Slno = Billdetl.Bmc_Slno
                            AND Billmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Billdetl.pd_code = Prodescription.pd_code
                            AND Prodescription.pg_code = Progroup.pg_code
                            AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                            AND Misincexpdtl.Dg_type = 'R'
                            AND Misincexpdtl.Pc_code = Progroup.pc_code
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Billmast.Bmc_Cacr = 'I'
                            AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                            AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                            AND Disbillmast.dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.dmd_date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.IP_NO IN (${ipNumberList})
                    GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc`;

                try {
                        const result = await conn_ora.execute(
                                sql,
                                {},
                                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                        )
                        await result.resultSet?.getRows((err, rows) => {
                                callBack(err, rows)
                        })
                } catch (error) {
                        console.log(error)
                } finally {
                        if (conn_ora) {
                                await conn_ora.close();
                                await pool_ora.close();
                        }
                }
        },
        proIncomePart4Tssh: async (data, callBack) => {
                let pool_ora = await oraConnection();
                let conn_ora = await pool_ora.getConnection();

                const fromDate = data.from;
                const toDate = data.to;

                const sql = `SELECT 
                            '' DG_DESC,
                            0 CODE,
                            0 AMT,
                            0 TAX,
                            0 GROSSAMT,
                            0 COMP,
                            0 DISCOUNT
                    FROM Misincexpgroup
                    WHERE DG_TYPE = 'E'`;
                try {
                        const result = await conn_ora.execute(
                                sql,
                                {},
                                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                        )
                        await result.resultSet?.getRows((err, rows) => {
                                callBack(err, rows)
                        })
                } catch (error) {
                        console.log(error)
                } finally {
                        if (conn_ora) {
                                await conn_ora.close();
                                await pool_ora.close();
                        }
                }
        },
        theaterIncomeTssh: async (data, callBack) => {
                let pool_ora = await oraConnection();
                let conn_ora = await pool_ora.getConnection();

                const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
                const fromDate = data.from;
                const toDate = data.to;

                const sql = `SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode AS Code,
                                SUM (NVL (srn_operation, 0) - (NVL (Patsurgery.srn_operdis, 0))) Amt,
                                SUM (NVL (Patsurgery.SRN_OPERTOTTAX, 0)) tax,
                                SUM (NVL (srn_operation, 0)) GrossAmt,
                                SUM (NVL (Patsurgery.srn_operdis, 0)) Discount
                        FROM Disbillmast,
                                Patsurgery,
                                Ipparam,
                                Misincexpdtl,
                                Misincexpgroup
                        WHERE Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.ipc_oper
                                AND NVL (Patsurgery.srn_operation, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.ipc_ther
                                AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.ipc_CHIEF
                                AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.ipc_1stasst
                                AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.Ipc_2NDASST
                                AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.Ipc_3RDASST
                                AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.Ipc_GUEST
                                AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.ipc_ANEST
                                AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Ipparam.Ipc_ANEST2
                                AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = Progroup.pc_code
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND NVL (PATSUROTHER.Src_Cancel, 'N') = 'N'
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_desc,
                                Misincexpgroup.Dg_grcode,
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
                                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                                AND Misincexpdtl.Dg_type = 'R'
                                AND Misincexpdtl.Pc_code = PATSURDETL.PC_CODE
                                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.DMD_DATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND NVL (patsurdetl.Src_Cancel, 'N') = 'N'
                        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
                        UNION ALL
                        SELECT Misincexpgroup.Dg_Desc,
                                Misincexpgroup.Dg_Grcode AS Code,
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
                                AND Ipparam.Ipc_Canteencode = Misincexpdtl.Pc_Code
                                AND Misincexpdtl.Dg_Type = 'R'
                                AND Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode
                                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                                AND NVL (Canbillmast.Cmc_Cancel, 'N') = 'N'
                                AND Canbillmast.Cmc_Cacr = 'I'
                                AND Disbillmast.Dmc_Cacr <> 'M'
                                AND Disbillmast.Dmd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.IP_NO IN (${ipNumberList})
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        GROUP BY Misincexpgroup.Dg_Grcode, Misincexpgroup.Dg_Desc
                        ORDER BY Dg_desc`;
                try {
                        const result = await conn_ora.execute(
                                sql,
                                {},
                                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
                        )
                        await result.resultSet?.getRows((err, rows) => {
                                callBack(err, rows)
                        })
                } catch (error) {
                        console.log(error)
                } finally {
                        if (conn_ora) {
                                await conn_ora.close();
                                await pool_ora.close();
                        }
                }
        },
}

