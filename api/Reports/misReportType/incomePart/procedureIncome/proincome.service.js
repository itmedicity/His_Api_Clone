// @ts-ignore
const {oracledb, getTmcConnection} = require("../../../../../config/oradbconfig");

module.exports = {
  proIncomePart1: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    Misincexpgroup.Dg_desc,
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
                    Misincexpgroup,
                    IPADMISS
            WHERE PATSERVICE.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND DISBILLMAST.IP_NO = IPADMISS.IP_NO
                    AND PATSERVICE.pd_code = Prodescription.pd_code
                    AND Prodescription.pg_Code = Progroup.pg_Code
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Progroup.pc_code
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND NVL (SVC_CANCEL, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL 
        SELECT 
                    Misincexpgroup.Dg_desc,
                    Misincexpgroup.Dg_grcode AS Code,
                    SUM ( NVL (disroomdetl.drn_nurdays, 0) * NVL (disroomdetl.drn_nuramt, 0)) Amt,
                    SUM (0) tax,
                    SUM ( NVL (disroomdetl.drn_nurdays, 0) * NVL (disroomdetl.drn_nuramt, 0)) GrossAmt,
                    SUM (0) Discount
            FROM Disroomdetl,
                    Disbillmast,
                    Ipparam,
                    Misincexpdtl,
                    Misincexpgroup,
                    IPADMISS
            WHERE Disbillmast.Dmc_Slno = Disroomdetl.Dmc_Slno
                    AND IPADMISS.IP_NO = DISBILLMAST.IP_NO
                    AND Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_Type = 'R'
                    AND Ipparam.Ipc_Nucode = Misincexpdtl.Pc_Code
                    AND NVL (Disbillmast.Dmc_cancel, 'N') = 'N'
                    AND NVL (Disroomdetl.Dmc_Cancel, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    Misincexpgroup,
                    IPADMISS
            WHERE Patsurgery.OPERATION_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO =  PATSURGERY.IP_NO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_oper
                    AND NVL (Patsurgery.srn_operation, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT 
                    Misincexpgroup.Dg_desc,
                    Misincexpgroup.Dg_grcode,
                    SUM (NVL (SRN_THEATER, 0) - (NVL (Patsurgery.SRN_THEARDIS, 0))) Amt,
                    SUM (NVL (Patsurgery.SRN_THEATTOTTAX, 0)) tax,
                    SUM (NVL (SRN_THEATER, 0)) GrossAmt,
                    SUM (NVL (SRN_THEARDIS, 0)) Discount
            FROM Opbillmast,
                    Patsurgery,
                    Opparam,
                    Misincexpdtl,
                    Misincexpgroup,
                    IPADMISS
            WHERE Patsurgery.THEATER_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_ther
                    AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE Patsurgery.CHIEF_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_CHIEF
                    AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE     Patsurgery.D1STASST_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_1stasst
                    AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT 
                    Misincexpgroup.Dg_desc,
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE Patsurgery.D2NDASST_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO =  PATSURGERY.IP_NO
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_2NDASST
                    AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE Patsurgery.D3RDASST_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_3RDASST
                    AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE Patsurgery.GUEST_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_GUEST
                    AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT 
                    Misincexpgroup.Dg_desc,
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE Patsurgery.ANTEST_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO =  PATSURGERY.IP_NO         
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_ANEST
                    AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    PATSURGERYRESOURCESDETL,
                    IPADMISS
            WHERE Patsurgery.ANTEST2_OPSLNO = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO    
                    AND PATSURGERYRESOURCESDETL.SR_SLNO = PATSURGERY.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Opparam.Opc_ANEST2
                    AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    Progroup,
                    IPADMISS
            WHERE PATSUROTHER.Opc_Slno = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND Patsurother.SR_SLNO = Patsurgery.SR_SLNO
                    AND patsurother.pd_code = Prodescription.pd_code
                    AND Prodescription.pg_Code = Progroup.pg_Code
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Progroup.pc_code
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    PATSURDETL,
                    IPADMISS
            WHERE patsurdetl.Opc_Slno = Opbillmast.Opc_Slno
                    AND IPADMISS.IP_NO = PATSURGERY.IP_NO
                    AND PATSURDETL.SR_SLNO = Patsurgery.SR_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = PATSURDETL.PC_CODE
                    AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                    AND NVL (Opbillmast.OPN_CANCEL, 'N') = 'N'
                    AND Opbillmast.OPC_CACR <> 'M'
                    AND Opbillmast.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    Misincexpgroup,
                    IPADMISS
            WHERE  DISRMRENTDETL.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND IPADMISS.IP_NO = DISBILLMAST.IP_NO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND DISRMRENTDETL.pc_code = Misincexpdtl.pc_code
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT Misincexpgroup.Dg_Desc,
                    Misincexpgroup.Dg_Grcode AS Code,
                    SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                    SUM (NVL (Iprefunditemdetl.RIN_TOTTAX, 0)) * -1 tax,
                    SUM ( NVL (Iprefunditemdetl.Rin_Netamt, 0) + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                    SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount
            FROM Misincexpgroup,
                    Misincexpdtl,
                    Iprefunditemdetl,
                    Iprefundmast,
                    IPADMISS
            WHERE Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                    AND IPADMISS.IP_NO = IPREFUNDMAST.IP_NO
                    AND Iprefunditemdetl.Pc_Code = Misincexpdtl.Pc_Code
                    AND Misincexpgroup.Dg_Grcode = Misincexpdtl.Dg_Grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpgroup.Dg_Type = 'R'
                    AND Iprefunditemdetl.Ric_Type <> 'PHY'
                    AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                    AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                    AND Iprefundmast.Rid_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Iprefundmast.Rid_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                    Misincexpgroup,
                    IPADMISS
            WHERE     PATVISIT.Dmc_Slno = Disbillmast.Dmc_Slno
                    AND IPADMISS.DMC_SLNO = DISBILLMAST.DMC_SLNO
                    AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                    AND NVL(IPADMISS.IPC_PTFLAG, 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Misincexpdtl.Pc_code = Ipparam.Ipc_vscode
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND NVL (VSC_CANCEL, 'N') = 'N'
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        ORDER BY Dg_desc`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  proIncomePart2: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                    Misincexpgroup.Dg_desc,
                    Misincexpgroup.Dg_grcode AS Code,
                    SUM (refundbilldetl.rfn_netamt) * -1 Amt,
                    SUM (NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)) * -1 tax,
                    SUM ( NVL (refundbilldetl.rfn_netamt, 0)  + NVL (refundbilldetl.rfn_disamt, 0)) * -1 GrossAmt,
                    SUM (0) AS Comp,
                    SUM (NVL (refundbilldetl.rfn_disamt, 0)) * -1 discount
            FROM Refundbilldetl
            JOIN Billdetl ON Refundbilldetl.Bmc_Slno = Billdetl.Bmc_Slno
            JOIN Opbillmast ON Billdetl.Opc_Slno = Opbillmast.Opc_Slno
            JOIN Refundbillmast ON Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
            JOIN Prodescription ON Refundbilldetl.Pd_Code = Prodescription.Pd_Code
            JOIN Progroup ON Prodescription.Pg_Code = Progroup.Pg_Code
            JOIN BILLMAST ON BILLMAST.BMC_SLNO = BILLDETL.BMC_SLNO
            JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
            JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            LEFT JOIN PATIENT ON PATIENT.PT_NO = BILLMAST.PT_NO
            WHERE Refundbilldetl.Bmc_Cnt = Billdetl.Bmc_Cnt
                    AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND Refundbillmast.Rfc_Cacr IN ('O')
                    AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                    AND NVL (Refundbilldetl.Rfc_Cancel, 'N') = 'N'
                    AND Opbillmast.Opc_Cacr <> 'M'
                    AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT Misincexpgroup.Dg_desc,
                    Misincexpgroup.Dg_grcode AS Code,
                    SUM (refundbilldetl.rfn_netamt) * -1 Amt,
                    SUM (NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)) * -1 tax,
                    SUM ( NVL (refundbilldetl.rfn_netamt, 0) + NVL (refundbilldetl.rfn_disamt, 0)) * -1 GrossAmt,
                    SUM (0) AS Comp,
                    SUM (NVL (refundbilldetl.rfn_disamt, 0)) * -1 discount
            FROM Billmast 
            JOIN Refundbilldetl ON Billmast.Bmc_Slno = Refundbilldetl.Bmc_Slno 
            JOIN Disbillmast ON Billmast.Dmc_Slno = Disbillmast.Dmc_Slno
            JOIN Prodescription ON Refundbilldetl.Pd_Code = Prodescription.Pd_code
            JOIN Progroup ON Prodescription.Pg_code = Progroup.Pg_code 
            JOIN Refundbillmast ON Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
            JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
            JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode 
            LEFT JOIN PATIENT ON BILLMAST.PT_NO = PATIENT.PT_NO
                    WHERE NVL(PATIENT.PTC_PTFLAG , 'N') = 'N'
                    AND Misincexpdtl.Dg_type = 'R'
                    AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                    AND NVL (Refundbilldetl.Rfc_Cancel, 'N') = 'N'
                    AND Refundbillmast.Rfc_Cacr IN ('I')
                    AND Disbillmast.Dmc_Cacr <> 'M'
                    AND Disbillmast.dmd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Disbillmast.dmd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
            FROM Receiptdetl
                JOIN Receiptmast ON Receiptmast.RPC_SLNO = Receiptdetl.RPC_SLNO
                JOIN Opbillmast ON Receiptdetl.Opc_Slno = Opbillmast.Opc_Slno
                JOIN Prodescription ON Receiptdetl.pd_code = Prodescription.pd_code 
                JOIN Progroup ON Prodescription.pg_code = Progroup.pg_code
                JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode  
                LEFT JOIN PATIENT ON PATIENT.PT_NO = RECEIPTDETL.PT_NO
            WHERE Misincexpdtl.Dg_type = 'R'
                    AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                    AND Receiptmast.RPC_CANCEL IS NULL
                    AND NVL (Opbillmast.Opn_cancel, 'N') = 'N'
                    AND Opbillmast.Opc_Cacr <> 'M'
                    AND Receiptmast.RPC_CAcr = 'O'
                    AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND Opbillmast.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT 
                    Misincexpgroup.DG_DESC,
                    Misincexpgroup.DG_GRCODE AS Code,
                    SUM ( DECODE ( billmast.Bmc_Cacr, 'C', (Billdetl.pdn_rate * pdn_qty)  - NVL (Billdetl.bmn_disamt, 0),  'R', (Billdetl.pdn_rate * pdn_qty) - NVL (Billdetl.bmn_disamt, 0),  0)) Amt,
                    SUM (NVL (Billdetl.BDN_TOTTAX, 0)) tax,
                    SUM ( DECODE (billmast.Bmc_Cacr,  'C', (Billdetl.pdn_rate * pdn_qty),  'R', (Billdetl.pdn_rate * pdn_qty))) GrossAmt,
                    SUM ( DECODE ( billmast.Bmc_Cacr,  'M', (Billdetl.pdn_rate * pdn_qty)  - NVL (Billdetl.bmn_disamt, 0),  0)) AS Comp,
                    SUM ( DECODE (billmast.Bmc_Cacr,  'C', (Billdetl.bmn_disamt),  'R', (Billdetl.bmn_disamt))) Discount
            FROM Billmast 
            JOIN Billdetl ON Billmast.Bmc_Slno = Billdetl.Bmc_Slno AND billmast.BMC_COLLCNCODE IS NULL
            JOIN Prodescription ON Billdetl.pd_code = Prodescription.pd_code
            JOIN Progroup ON Prodescription.pg_code = Progroup.pg_code
            JOIN Misincexpdtl ON Progroup.pc_code = Misincexpdtl.pc_code
            JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            LEFT JOIN PATIENT ON PATIENT.PT_NO = BILLMAST.PT_NO
            WHERE Misincexpdtl.Dg_type = 'R'
                    AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                    AND Billmast.Bmc_Cacr IN ('C', 'R')
                    AND NVL (Billmast.BMC_CANCEL, 'N') = 'N'
                    AND Billmast.BMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                    AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
                    AND Billmast.Bmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
        GROUP BY Misincexpgroup.DG_GRCODE, Misincexpgroup.DG_DESC`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  proIncomePart3: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT MISINCEXPGROUP.DG_DESC,
                     MISINCEXPGROUP.DG_GRCODE AS CODE,
                     SUM ( (BILLDETL.PDN_RATE * PDN_QTY) - NVL (BILLDETL.BMN_DISAMT, 0)) AMT,
                     SUM (NVL (BILLDETL.BDN_TOTTAX, 0)) TAX,
                     SUM ( (BILLDETL.PDN_RATE * PDN_QTY)) GROSSAMT,
                     SUM (0) AS COMP,
                     SUM (NVL (BILLDETL.BMN_DISAMT, 0)) DISCOUNT
                FROM BILLDETL  
                JOIN BILLMAST ON BILLMAST.BMC_SLNO = BILLDETL.BMC_SLNO
                LEFT JOIN PATIENT ON PATIENT.PT_NO = BILLMAST.PT_NO
                JOIN OPBILLMAST ON BILLDETL.OPC_SLNO = OPBILLMAST.OPC_SLNO
                JOIN PRODESCRIPTION ON BILLDETL.PD_CODE = PRODESCRIPTION.PD_CODE
                JOIN PROGROUP ON PRODESCRIPTION.PG_CODE = PROGROUP.PG_CODE
                JOIN MISINCEXPDTL ON MISINCEXPDTL.PC_CODE = PROGROUP.PC_CODE
                JOIN MISINCEXPGROUP ON MISINCEXPDTL.DG_GRCODE = MISINCEXPGROUP.DG_GRCODE
               WHERE MISINCEXPDTL.DG_TYPE = 'R'
                    AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                     AND OPBILLMAST.OPC_CACR <> 'M'
                     AND BILLMAST.BMC_CACR = 'O'
                     AND NVL (BILLMAST.BMC_CANCEL, 'N') = 'N'
                     AND NVL (OPBILLMAST.OPN_CANCEL, 'N') = 'N'
                     AND OPBILLMAST.OPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                     AND OPBILLMAST.OPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                     AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM MULTIHOSPITAL)
            GROUP BY MISINCEXPGROUP.DG_GRCODE, MISINCEXPGROUP.DG_DESC
            UNION ALL
            SELECT MISINCEXPGROUP.DG_DESC,
                     MISINCEXPGROUP.DG_GRCODE AS CODE,
                     SUM (
                        DECODE (
                           BILLMAST.BMC_CACR,
                           'C', (BILLDETL.PDN_RATE * PDN_QTY)
                                - NVL (BILLDETL.BMN_DISAMT, 0),
                           'R', (BILLDETL.PDN_RATE * PDN_QTY)
                                - NVL (BILLDETL.BMN_DISAMT, 0),
                           0))
                        AMT,
                     SUM (NVL (BILLDETL.BDN_TOTTAX, 0)) TAX,
                     SUM (
                        DECODE (BILLMAST.BMC_CACR,
                                'C', (BILLDETL.PDN_RATE * PDN_QTY),
                                'R', (BILLDETL.PDN_RATE * PDN_QTY)))
                        GROSSAMT,
                     SUM (
                        DECODE (
                           BILLMAST.BMC_CACR,
                           'M', (BILLDETL.PDN_RATE * PDN_QTY)
                                - NVL (BILLDETL.BMN_DISAMT, 0),
                           0))
                        AS COMP,
                     SUM (
                        DECODE (BILLMAST.BMC_CACR,
                                'C', (BILLDETL.BMN_DISAMT),
                                'R', (BILLDETL.BMN_DISAMT)))
                        DISCOUNT
                FROM BILLMAST
                    JOIN BILLDETL ON BILLMAST.BMC_SLNO = BILLDETL.BMC_SLNO 
                    LEFT JOIN PATIENT ON PATIENT.PT_NO = BILLMAST.PT_NO
                    JOIN PRODESCRIPTION ON BILLDETL.PD_CODE = PRODESCRIPTION.PD_CODE
                    JOIN PROGROUP ON PRODESCRIPTION.PG_CODE = PROGROUP.PG_CODE
                    JOIN MISINCEXPDTL ON PROGROUP.PC_CODE = MISINCEXPDTL.PC_CODE
                    JOIN MISINCEXPGROUP ON MISINCEXPDTL.DG_GRCODE = MISINCEXPGROUP.DG_GRCODE
                    WHERE BILLMAST.BMC_COLLCNCODE IS NOT NULL
                    AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                     AND MISINCEXPDTL.DG_TYPE = 'R'
                     AND BILLMAST.BMC_CACR IN ('C', 'R')
                     AND NVL (BILLMAST.BMC_CANCEL, 'N') = 'N'
                     AND BILLMAST.BMD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                     AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM MULTIHOSPITAL)
                     AND BILLMAST.BMD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
            GROUP BY MISINCEXPGROUP.DG_GRCODE, MISINCEXPGROUP.DG_DESC
            UNION ALL
            SELECT MISINCEXPGROUP.DG_DESC,
                     MISINCEXPGROUP.DG_GRCODE AS CODE,
                     SUM ( (BILLDETL.PDN_RATE * PDN_QTY) - NVL (BILLDETL.BMN_DISAMT, 0))
                        AMT,
                     SUM (NVL (BILLDETL.BDN_TOTTAX, 0)) TAX,
                     SUM ( (BILLDETL.PDN_RATE * PDN_QTY)) GROSSAMT,
                     SUM (0) AS COMP,
                     SUM (NVL (BILLDETL.BMN_DISAMT, 0)) DISCOUNT
                FROM BILLDETL
                JOIN BILLMAST ON BILLMAST.BMC_SLNO = BILLDETL.BMC_SLNO
                LEFT JOIN PATIENT ON PATIENT.PT_NO = BILLMAST.PT_NO
                JOIN DISBILLMAST ON BILLMAST.DMC_SLNO = DISBILLMAST.DMC_SLNO
                JOIN PRODESCRIPTION ON BILLDETL.PD_CODE = PRODESCRIPTION.PD_CODE
                JOIN PROGROUP ON PRODESCRIPTION.PG_CODE = PROGROUP.PG_CODE
                JOIN MISINCEXPDTL ON MISINCEXPDTL.PC_CODE = PROGROUP.PC_CODE
                JOIN MISINCEXPGROUP ON MISINCEXPDTL.DG_GRCODE = MISINCEXPGROUP.DG_GRCODE
                WHERE MISINCEXPDTL.DG_TYPE = 'R'
                    AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                     AND DISBILLMAST.DMC_CACR <> 'M'
                     AND BILLMAST.BMC_CACR = 'I'
                     AND NVL (BILLMAST.BMC_CANCEL, 'N') = 'N'
                     AND NVL (DISBILLMAST.DMC_CANCEL, 'N') = 'N'
                     AND DISBILLMAST.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                     AND BILLMAST.MH_CODE IN (SELECT MH_CODE FROM MULTIHOSPITAL)
                     AND DISBILLMAST.DMD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
            GROUP BY MISINCEXPGROUP.DG_GRCODE, MISINCEXPGROUP.DG_DESC`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  proIncomePart4: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                Misincexpgroup.Dg_desc,
                Misincexpgroup.Dg_grcode AS Code,
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
            FROM Receiptdetl
                JOIN  Receiptmast ON Receiptmast.RPC_SLNO = Receiptdetl.RPC_SLNO
                LEFT JOIN PATIENT ON PATIENT.PT_NO = Receiptdetl.PT_NO
                JOIN Prodescription ON Receiptdetl.pd_code = Prodescription.pd_code
                JOIN Progroup ON Prodescription.pg_code = Progroup.pg_code
                JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            WHERE receiptmast.RPC_COLLCNCODE IS NOT NULL
                AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
                AND Receiptmast.RPC_CAcr IN ('C', 'R')
                AND Receiptmast.RPD_COLLDATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Receiptmast.RPD_COLLDATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        HAVING SUM (
                    DECODE (Receiptmast.RPC_CAcr,
                            'C', receiptdetl.rpn_netamt,
                            'R', receiptdetl.rpn_netamt,
                            0)) <> 0
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT Misincexpgroup.Dg_desc,
                Misincexpgroup.Dg_grcode AS Code,
                SUM (Refundreceiptdetl.rpn_netamt) * -1 Amt,
                SUM (NVL (Refundreceiptdetl.RFN_TOTTAX, 0)) * -1 tax,
                SUM (
                    NVL (Refundreceiptdetl.rpn_netamt, 0)
                    + NVL (Refundreceiptdetl.rpn_disamt, 0))
                * -1
                    GrossAmt,
                SUM (0) AS Comp,
                SUM (NVL (Refundreceiptdetl.rpn_disamt, 0)) * -1 discount
            FROM Refundreceiptdetl
            JOIN Receiptdetl ON Refundreceiptdetl.Rpc_Slno = Receiptdetl.Rpc_Slno 
            LEFT JOIN PATIENT ON PATIENT.PT_NO = REFUNDRECEIPTDETL.PT_NO
            JOIN Refundreceiptmast ON Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
            JOIN Opbillmast ON Receiptdetl.Opc_Slno = Opbillmast.Opc_Slno
            JOIN Prodescription ON Refundreceiptdetl.Pd_Code = Prodescription.Pd_Code
            JOIN Progroup ON Prodescription.Pg_Code = Progroup.Pg_Code
            JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
            JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            WHERE Refundreceiptdetl.Rpc_Cnt = Receiptdetl.Rpc_Cnt
                AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND NVL (Opbillmast.Opn_Cancel, 'N') = 'N'
                AND NVL (Refundreceiptdetl.Rfc_Cancel, 'N') = 'N'
                AND Refundreceiptmast.Rfc_Cacr IN ('O')
                AND Opbillmast.Opc_Cacr <> 'M'
                AND Opbillmast.Opd_date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                AND Opbillmast.Opd_date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT Misincexpgroup.Dg_desc,
                Misincexpgroup.Dg_grcode AS Code,
                SUM (Refundreceiptdetl.rpn_netamt) * -1 Amt,
                SUM (NVL (Refundreceiptdetl.RFN_TOTTAX, 0)) * -1 tax,
                SUM (
                    NVL (Refundreceiptdetl.rpn_netamt, 0)
                    + NVL (Refundreceiptdetl.rpn_disamt, 0))
                * -1
                    GrossAmt,
                SUM (0) AS Comp,
                SUM (NVL (Refundreceiptdetl.rpn_disamt, 0)) * -1 discount
            FROM Refundreceiptdetl
                JOIN Refundreceiptmast ON Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
                LEFT JOIN PATIENT ON PATIENT.PT_NO = REFUNDRECEIPTDETL.PT_NO
                JOIN Prodescription ON Refundreceiptdetl.pd_code = Prodescription.pd_code
                JOIN Progroup ON Prodescription.pg_code = Progroup.pg_code
                JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            WHERE Misincexpdtl.Dg_type = 'R'
                AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                AND Refundreceiptmast.Rfc_Cancel IS NULL
                AND Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
                AND Refundreceiptdetl.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Refundreceiptdetl.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
            GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT Misincexpgroup.Dg_desc,
                Misincexpgroup.Dg_grcode AS Code,
                SUM (refundbilldetl.rfn_netamt) * -1 Amt,
                SUM (NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)) * -1 tax,
                SUM (
                    NVL (refundbilldetl.rfn_netamt, 0)
                    + NVL (refundbilldetl.rfn_disamt, 0))
                * -1
                    GrossAmt,
                SUM (0) AS Comp,
                SUM (NVL (refundbilldetl.rfn_disamt, 0)) * -1 discount
            FROM refundbilldetl
                JOIN refundbillmast ON Refundbillmast.Rfc_Slno = Refundbilldetl.Rfc_Slno
                JOIN Billmast ON Billmast.Bmc_Slno = Refundbillmast.Bmc_Slno
                LEFT JOIN PATIENT ON PATIENT.PT_NO = BILLMAST.PT_NO
                JOIN Prodescription ON Refundbilldetl.pd_code = Prodescription.pd_code
                JOIN Progroup ON Prodescription.pg_code = Progroup.pg_code
                JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            WHERE Misincexpdtl.Dg_type = 'R'
                AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                AND Refundbillmast.Rfc_Cancel IS NULL
                AND Refundbillmast.Rfc_Cacr IN ('C', 'R')
                AND Refundbilldetl.Rfd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Refundbilldetl.Rfd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND billmast.mh_code IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc
        UNION ALL
        SELECT 
                Misincexpgroup.Dg_desc,
                Misincexpgroup.Dg_grcode AS Code,
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
            FROM Receiptdetl
                LEFT JOIN PATIENT ON PATIENT.PT_NO = RECEIPTDETL.PT_NO
                JOIN Receiptmast ON Receiptmast.RPC_SLNO = Receiptdetl.RPC_SLNO
                JOIN Prodescription ON Receiptdetl.pd_code = Prodescription.pd_code
                JOIN Progroup ON Prodescription.pg_code = Progroup.pg_code
                JOIN Misincexpdtl ON Misincexpdtl.Pc_code = Progroup.pc_code
                JOIN Misincexpgroup ON Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
            WHERE receiptmast.RPC_COLLCNCODE IS NULL
                AND NVL(PATIENT.PTC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND (NVL (RECEIPTMAST.RPC_CANCEL, 'N') = 'N')
                AND Receiptmast.RPC_CAcr IN ('C', 'R')
                AND Receiptmast.RPD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Receiptmast.RPD_DATE <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND RECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_grcode, Misincexpgroup.Dg_desc`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
  theaterIncome: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT 
                Misincexpgroup.Dg_desc,
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.ipc_oper
                AND NVL (Patsurgery.srn_operation, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
        WHERE Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.ipc_ther
                AND NVL (Patsurgery.SRN_THEATER, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.ipc_CHIEF
                AND NVL (Patsurgery.SRN_CHIEF, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.ipc_1stasst
                AND NVL (Patsurgery.SRN_1STASST, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
        WHERE Patsurgery.Dmc_Slno = Disbillmast.Dmc_Slno
                AND PATSURGERYRESOURCESDETL.SR_SLNO = Patsurgery.SR_SLNO
                AND Misincexpdtl.dg_grcode = Misincexpgroup.dg_grcode
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.Ipc_2NDASST
                AND NVL (Patsurgery.SRN_2NDASST, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.Ipc_3RDASST
                AND NVL (Patsurgery.SRN_3RDASST, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.Ipc_GUEST
                AND NVL (Patsurgery.SRN_GUEST, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.ipc_ANEST
                AND NVL (Patsurgery.SRN_ANTEST, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Ipparam.Ipc_ANEST2
                AND NVL (Patsurgery.SRN_ANTEST2, 0) > 0
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = Progroup.pc_code
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_type = 'R'
                AND Misincexpdtl.Pc_code = PATSURDETL.PC_CODE
                AND NVL (Patsurgery.Src_Cancel, 'N') = 'N'
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.DMD_DATE >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
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
                AND NVL(DISBILLMAST.DMC_PTFLAG,'N') = 'N'
                AND Misincexpdtl.Dg_Type = 'R'
                AND Misincexpdtl.Dg_Grcode = Misincexpgroup.Dg_Grcode
                AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
                AND NVL (Canbillmast.Cmc_Cancel, 'N') = 'N'
                AND Canbillmast.Cmc_Cacr = 'I'
                AND Disbillmast.Dmc_Cacr <> 'M'
                AND Disbillmast.Dmd_Date >= TO_DATE (:fromDate, 'dd/MM/yyyy hh24:mi:ss')
                AND Disbillmast.Dmd_Date <= TO_DATE (:toDate, 'dd/MM/yyyy hh24:mi:ss')
                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
        GROUP BY Misincexpgroup.Dg_Grcode, Misincexpgroup.Dg_Desc
        ORDER BY Dg_desc`,
        {
          fromDate: data.from,
          toDate: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      callBack(null, result.rows);
    } catch (error) {
      console.log(error);
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },
};
