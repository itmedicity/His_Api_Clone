// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../../config/oradbconfig');

module.exports = {
    patientTypeDiscountTmch: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = data.ptno.join(',');
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
        Ptc_Desc, 
        SUM (Discount) Discount, 
        SUM (tax) tax
FROM ( 
    SELECT Receiptmast.Rpc_Slno Slno,
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
        WHERE Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
              AND receiptmast.RPC_COLLCNCODE IS NULL
              AND Receiptmast.Pt_No = Patient.Pt_No(+)
              AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
              AND Patient.Pt_Code = Pattype.Pt_Code(+)
              AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
              AND Receiptmast.Rpc_Cacr IN ('C', 'R')
              AND Receiptmast.Rpd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')--1
              AND Receiptmast.Rpd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') --2
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
              AND Receiptmast.RPD_COLLDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')--3
              AND Receiptmast.RPD_COLLDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')--4
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
              AND refundreceiptmast.RFC_RETCNCODE IS NULL
              AND Receiptdetl.Rpc_Cnt = Refundreceiptdetl.Rpc_Cnt
              AND Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
              AND Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
              AND Receiptmast.Pt_No = Patient.Pt_No
              AND Patient.Pt_Code = Pattype.Pt_Code
              AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+)
              AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N'
              AND NVL (Refundreceiptmast.Rfc_Cancel, 'N') = 'N'
              AND Refundreceiptmast.Rfc_Cacr IN ('C', 'R')
              AND Receiptmast.Rpc_Cacr IN ('C', 'R')
              AND Refundreceiptmast.Rfd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Refundreceiptmast.Rfd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND REFUNDRECEIPTMAST.MH_CODE IN  (SELECT MH_CODE FROM multihospital)
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
              AND Refundreceiptmast.RFD_RETDATE >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')--7
              AND Refundreceiptmast.RFD_RETDATE <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')--8
              AND REFUNDRECEIPTMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
     GROUP BY Refundreceiptmast.Rfc_Slno,
              Refundreceiptmast.Rf_No,
              Refundreceiptmast.Rfd_Date,
              Patient.Pt_No,
              INITCAP (Patient.Ptc_Ptname),
              INITCAP (Dac_Desc),
              Discountauthority.Da_Code,
              INITCAP (Pattype.Ptc_Desc)
     UNION ALL
     /*--Op Consolidate Billing--*/
     SELECT Opbillmast.Opc_Slno Slno,
                Opbillmast.Op_No BillNo,
                Opbillmast.Opd_Date BillDate,
                Opbillmast.Pt_No,
                INITCAP (Patient.Ptc_Ptname)Ptname,
                MAX (NVL (Opbillmast.Opn_Netamt,0)+ NVL ( OPBILLMAST.OPN_SALETAXCH, 0)  + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) Net,
                SUM (NVL (Srn_Operdis, 0) + NVL (Srn_Theardis, 0) + NVL (Srn_Antdis, 0)) Discount,
                INITCAP (Dac_Desc) Dac_Desc,
                Discountauthority.Da_Code,
                INITCAP (Pattype.Ptc_Desc)Ptc_Desc,
                 SUM (NVL (opbillmast.OPN_TOTTAX,0))  Tax
     FROM Opbillmast,
                Patsurgery,
                Discountauthority,
                Patient,
                Pattype
     WHERE (Patsurgery.Operation_Opslno = Opbillmast.Opc_Slno
     OR Patsurgery.Theater_Opslno = Opbillmast.Opc_Slno
     OR Patsurgery.Antest_Opslno = Opbillmast.Opc_Slno)
     AND Patsurgery.Da_Code = Discountauthority.Da_Code(+)
     AND Patient.Pt_Code = Pattype.Pt_Code
     AND Opbillmast.Pt_No = Patient.Pt_No
     AND Opbillmast.Opd_Date >= TO_DATE ( '${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
     AND Opbillmast.Opd_Date <= TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss')
      AND Patsurgery.IP_NO NOT IN (${ipNumberList})
     AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
     GROUP BY Opbillmast.Opc_Slno,Opbillmast.Op_No, Opbillmast.Opd_Date,Opbillmast.Pt_No,INITCAP (Patient.Ptc_Ptname),INITCAP (Dac_Desc),Discountauthority.Da_Code,INITCAP (Pattype.Ptc_Desc)
     UNION ALL
       SELECT Opbillmast.Opc_Slno Slno,
              Opbillmast.Op_No BillNo,
              Opbillmast.Opd_Date BillDate,
              Opbillmast.Pt_No,
              INITCAP (Patient.Ptc_Ptname) Ptname,
              MAX ( NVL (Opbillmast.Opn_Netamt, 0)+ NVL (OPBILLMAST.OPN_SALETAXCH, 0) + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) Net,
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Patsurgery.IP_NO NOT IN (${ipNumberList})
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
              MAX ( NVL (Opbillmast.Opn_Netamt, 0) + NVL (OPBILLMAST.OPN_SALETAXCH, 0)  + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) Net,
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Patsurgery.IP_NO NOT IN (${ipNumberList})
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
              MAX ( NVL (Opbillmast.Opn_Netamt, 0) + NVL (OPBILLMAST.OPN_SALETAXCH, 0) + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) Net,
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss') --15
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') --16
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss') -- 17
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') -- 18
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') --20
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
              SUM (NVL (REFUNDBILLDETL.RFN_TOTTAX, 0)) * -1 tax
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss') 
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}',  'dd/MM/yyyy hh24:mi:ss')
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
     SELECT Opbillmast.Opc_Slno
            Slno,
            Opbillmast.Op_No
            BillNo,
            Opbillmast.Opd_Date
            BillDate,
            Opbillmast.Pt_No,
            INITCAP (Patient.Ptc_Ptname) Ptname,
            0 Net,
            SUM (NVL (Refundbilldetl.Rfn_Disamt,0)) Discount,
            INITCAP (Dac_Desc) Dac_Desc,
            Discountauthority.Da_Code,
            INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
            SUM (NVL ( REFUNDBILLDETL.RFN_TOTTAX,0)) tax
            FROM Billdetl,
                    Billmast,
                    Refundbilldetl,
                    Refundbillmast,
                    Opbillmast,
                    Patient,
                    Discountauthority,
                    Pattype
            WHERE Billdetl.Opc_Slno = Opbillmast.Opc_Slno
            AND Billdetl.Bmc_Slno = Billmast.Bmc_Slno
            AND Billdetl.Bmc_Slno = Refundbilldetl.Bmc_Slno
            AND Billdetl.Bmc_Cnt =  Refundbilldetl.Bmc_Cnt
            AND Billdetl.Pd_Code = Refundbilldetl.Pd_Code
            AND Refundbilldetl.Rfc_Slno = Refundbillmast.Rfc_Slno
            AND Opbillmast.Pt_No = Patient.Pt_No
            AND Billdetl.Da_Code = Discountauthority.Da_Code(+) 
            AND Patient.Pt_Code = Pattype.Pt_Code
            AND Billmast.Bmc_Cacr IN ('O') AND NVL ( Refundbillmast.Rfc_Cancel, 'N') =   'N' AND NVL ( Billmast.Bmc_Cancel, 'N') = 'N'
            AND NVL ( Opbillmast.Opn_Cancel, 'N') = 'N' 
            AND Opbillmast.Opc_Cacr <> 'M' AND Opbillmast.Opd_Date >= TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') 
            AND Opbillmast.Opd_Date <= TO_DATE (  '${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital) 
            GROUP BY Opbillmast.Opc_Slno, Opbillmast.Op_No,Opbillmast.Opd_Date, Opbillmast.Pt_No, 
            INITCAP ( Patient.Ptc_Ptname), INITCAP ( Dac_Desc), Discountauthority.Da_Code,INITCAP ( Pattype.Ptc_Desc)
     UNION ALL
       SELECT Opbillmast.Opc_Slno Slno,
              Opbillmast.Op_No BillNo,
              Opbillmast.Opd_Date BillDate,
              Opbillmast.Pt_No,
              INITCAP (Patient.Ptc_Ptname) Ptname,
              MAX ( NVL (Opbillmast.Opn_Netamt, 0)  + NVL (OPBILLMAST.OPN_SALETAXCH, 0) + NVL (OPBILLMAST.OPN_SALETAXCR, 0)) Net,
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
              AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss') 
              AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
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
                      NVL (MRETDETL.MRN_TOTTAXCR, 0)  + NVL (MRETDETL.MRN_TOTTAXCH, 0) * -1 tax
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
                      AND Opbillmast.Opd_Date >= TO_DATE ('${fromDate}',  'dd/MM/yyyy hh24:mi:ss') 
                      AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}',  'dd/MM/yyyy hh24:mi:ss') 
                      AND OPBILLMAST.MH_CODE IN  (SELECT MH_CODE FROM multihospital)) A
                     GROUP BY A.Slno,
                              A.Op_No,
                              A.Opd_Date,
                              A.Pt_No,
                              A.Ptname,
                              Dac_Desc,
                              Da_Code,
                              Ptc_Desc,
                              A.tax
     UNION ALL     
     SELECT Opbillrefundmast.Roc_Slno Slno,
                 Opbillrefundmast.Ro_No BillNo,
                 Opbillrefundmast.Rod_Date BillDate,
                 Patient.Pt_No, INITCAP (Patient.Ptc_Ptname) Ptname,
                 MAX ( NVL (Opbillrefundmast.Ron_Netamt,0)) * -1 Net,
                 SUM ( NVL (Refundreceiptdetl.Rpn_Disamt,0))  * -1 Discount,
                 INITCAP (Dac_Desc) Dac_Desc,
                 Discountauthority.Da_Code,
                 INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                 SUM ( NVL (Refundreceiptdetl.RFN_TOTTAX,0)) * -1 tax
     FROM Opbillrefundmast,
                Receiptmast,
                Receiptdetl,
                Patient,
                Discountauthority,
                Refundreceiptmast,
                Refundreceiptdetl,
                Pattype
     WHERE Opbillrefundmast.Roc_Slno = Refundreceiptmast.Roc_Slno
      AND Receiptdetl.Rpc_Slno = Refundreceiptdetl.Rpc_Slno
      AND Receiptdetl.Rpc_Cnt = Refundreceiptdetl.Rpc_Cnt
      AND Refundreceiptmast.Rfc_Slno = Refundreceiptdetl.Rfc_Slno
       AND Receiptmast.Rpc_Slno = Receiptdetl.Rpc_Slno
       AND Receiptmast.Pt_No = Patient.Pt_No
       AND Receiptdetl.Da_Code = Discountauthority.Da_Code(+) 
       AND Patient.Pt_Code = Pattype.Pt_Code 
       AND NVL (Receiptmast.Rpc_Cancel, 'N') = 'N' AND NVL ( Refundreceiptmast.Rfc_Cancel, 'N') = 'N' 
       AND Opbillrefundmast.Rod_Date >= TO_DATE ( '${fromDate}','dd/MM/yyyy hh24:mi:ss') 
       AND Opbillrefundmast.Rod_Date <= TO_DATE (  '${toDate}', 'dd/MM/yyyy hh24:mi:ss') 
       AND OPBILLREFUNDMAST.MH_CODE IN  (SELECT MH_CODE FROM multihospital) 
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
              AND Opbillrefundmast.Rod_Date >=  TO_DATE ('${fromDate}',  'dd/MM/yyyy hh24:mi:ss') 
              AND Opbillrefundmast.Rod_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
              AND Billmast.IP_NO NOT IN (${ipNumberList})
              AND OPBILLREFUNDMAST.MH_CODE IN  (SELECT MH_CODE FROM multihospital)
     GROUP BY Opbillrefundmast.Roc_Slno,
              Opbillrefundmast.Ro_No,
              Opbillrefundmast.Rod_Date,
              Billmast.Pt_No,
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
                MAX ( NVL (DISBILLMAST.DMN_NETAMT, 0)  + NVL (DMN_SALESTAXCH, 0)  + NVL (DMN_SALESTAXCR, 0)) Net,
                SUM (NVL (Patservice.Svn_Disamt, 0)) Discount,
                INITCAP (Dac_Desc) Dac_Desc,
                Discountauthority.Da_Code,
                INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
                SUM ( NVL (DMN_SALESTAXCH, 0) + NVL (DMN_SALESTAXCR, 0)  + NVL (DMN_CESSCH, 0)  + NVL (DMN_CESSCR, 0))  Tax
     FROM Disbillmast,
                Patservice,
                Patient,
                Discountauthority,
                Pattype
     WHERE Disbillmast.Dmc_Slno = Patservice.Dmc_Slno
      AND Disbillmast.Pt_No = Patient.Pt_No
      AND Patservice.Da_Code = Discountauthority.Da_Code(+)
      AND Patient.Pt_Code = Pattype.Pt_Code 
      AND NVL (Disbillmast.Dmc_Cancel, 'N') =  'N' 
      AND NVL (Patservice.Svc_Cancel, 'N') =  'N' AND Disbillmast.Dmd_Date >= TO_DATE (  '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') 
      AND Disbillmast.Dmd_Date <= TO_DATE (  '${toDate}',  'dd/MM/yyyy hh24:mi:ss') 
       AND Disbillmast.IP_NO NOT IN (${ipNumberList})
      AND DISBILLMAST.MH_CODE IN(SELECT MH_CODE FROM multihospital)
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
              MAX ( NVL (DISBILLMAST.DMN_NETAMT, 0)  + NVL (DMN_SALESTAXCH, 0)  + NVL (DMN_SALESTAXCR, 0))  Net,
              SUM (NVL (DISRMRENTDETL.Rdn_Disamt, 0)) Discount, '' Dac_Desc, '' Da_Code,
              INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
              SUM ( NVL (DMN_SALESTAXCH, 0) + NVL (DMN_SALESTAXCR, 0)  + NVL (DMN_CESSCH, 0) + NVL (DMN_CESSCR, 0)) Tax
         FROM Disbillmast,
              DISRMRENTDETL,
              Patient,
              Discountauthority,
              Pattype
        WHERE     Disbillmast.Dmc_Slno = DISRMRENTDETL.Dmc_Slno
              AND Disbillmast.Pt_No = Patient.Pt_No
              AND Patient.Pt_Code = Pattype.Pt_Code
              AND NVL (Disbillmast.Dmc_Cancel, 'N') = 'N'
              AND Disbillmast.Dmd_Date >= TO_DATE ('${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --35
              AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}',  'dd/MM/yyyy hh24:mi:ss') --36
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              MAX ( NVL (DISBILLMAST.DMN_NETAMT, 0)  + NVL (DMN_SALESTAXCH, 0)  + NVL (DMN_SALESTAXCR, 0)) Net,
              SUM (NVL (PATVISIT.VSN_DISAMT, 0)) Discount,
              '' Dac_Desc,
              '' Da_Code,
              INITCAP (Pattype.Ptc_Desc) Ptc_Desc,
              SUM ( NVL (DMN_SALESTAXCH, 0)  + NVL (DMN_SALESTAXCR, 0) + NVL (DMN_CESSCH, 0)  + NVL (DMN_CESSCR, 0)) Tax
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
              AND Disbillmast.Dmd_Date >= TO_DATE ('${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --37
              AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}',  'dd/MM/yyyy hh24:mi:ss') --38
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              MAX ( NVL (DISBILLMAST.DMN_NETAMT, 0) + NVL (DMN_SALESTAXCH, 0) + NVL (DMN_SALESTAXCR, 0)) Net,
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
              AND Disbillmast.Dmd_Date >=
                     TO_DATE ('${fromDate}',
                              'dd/MM/yyyy hh24:mi:ss') --39
              AND Disbillmast.Dmd_Date <=
                     TO_DATE ('${toDate}',
                              'dd/MM/yyyy hh24:mi:ss') --40
              AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              AND Disbillmast.Dmd_Date >=
                     TO_DATE ('${fromDate}',
                              'dd/MM/yyyy hh24:mi:ss') --41
              AND Disbillmast.Dmd_Date <=
                     TO_DATE ('${toDate}',
                              'dd/MM/yyyy hh24:mi:ss')  --42
              AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              AND Disbillmast.Dmd_Date >=
                     TO_DATE ('${fromDate}',
                              'dd/MM/yyyy hh24:mi:ss') --43
              AND Disbillmast.Dmd_Date <=
                     TO_DATE ('${toDate}',
                              'dd/MM/yyyy hh24:mi:ss') --44
              AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              AND Disbillmast.Dmd_Date >=
                     TO_DATE ('${fromDate}',
                              'dd/MM/yyyy hh24:mi:ss') --45
              AND Disbillmast.Dmd_Date <=
                     TO_DATE ('${toDate}',
                              'dd/MM/yyyy hh24:mi:ss') --46
              AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              AND Disbillmast.Dmd_Date >=
                     TO_DATE ('${fromDate}',
                              'dd/MM/yyyy hh24:mi:ss') 
              AND Disbillmast.Dmd_Date <=
                     TO_DATE ('${toDate}',
                              'dd/MM/yyyy hh24:mi:ss') 
              AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
              AND Disbillmast.Dmd_Date >=
                     TO_DATE ('${fromDate}',
                              'dd/MM/yyyy hh24:mi:ss') --49
              AND Disbillmast.Dmd_Date <=
                     TO_DATE ('${toDate}',
                              'dd/MM/yyyy hh24:mi:ss') --50
              AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
                      AND Disbillmast.Dmd_Date >=
                             TO_DATE ('${fromDate}',
                                      'dd/MM/yyyy hh24:mi:ss') --51
                      AND Disbillmast.Dmd_Date <=
                             TO_DATE ('${toDate}',
                                      'dd/MM/yyyy hh24:mi:ss') --52
                      AND Disbillmast.IP_NO NOT IN (${ipNumberList})
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
                                   AND Iprefundmast.Rid_Date >=
                                          TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
                                   AND Iprefundmast.Rid_Date <=
                                          TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
                                    AND Iprefundmast.IP_NO NOT IN (${ipNumberList})
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
              AND Iprefundmast.Rid_Date >=
                      TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
              AND Iprefundmast.Rid_Date <=
                     TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
              AND Iprefundmast.IP_NO NOT IN (${ipNumberList})
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
              AND Iprefundmast.Rid_Date >=
                     TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
              AND Iprefundmast.Rid_Date <=
                      TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
              AND Iprefundmast.IP_NO NOT IN (${ipNumberList})
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
              AND Iprefundmast.Rid_Date >=
                      TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
              AND Iprefundmast.Rid_Date <=
                     TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
              AND Iprefundmast.IP_NO NOT IN (${ipNumberList})
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
              AND Iprefundmast.Rid_Date >=
                      TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
              AND Iprefundmast.Rid_Date <=
                     TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
              AND Iprefundmast.IP_NO NOT IN (${ipNumberList})
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
              AND Iprefundmast.Rid_Date >=
                     TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
              AND Iprefundmast.Rid_Date <=
                     TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
               AND Iprefundmast.IP_NO NOT IN (${ipNumberList})
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
                               AND Ipreceipt.Ird_Date >= TO_DATE ( '${fromDate}',  'dd/MM/yyyy hh24:mi:ss') --53
                               AND Ipreceipt.Ird_Date <=  TO_DATE ( '${toDate}', 'dd/MM/yyyy hh24:mi:ss') --54
                               AND IPRECEIPT.DMC_SLNO IN (SELECT DMC_SLNO FROM DISBILLMAST WHERE IP_NO NOT IN (${ipNumberList}) AND DMC_CANCEL IS NULL )
                               AND ipreceipt.IPC_MHCODE IN   (SELECT MH_CODE FROM multihospital)
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
                                                                                   AND Billmast.Bmd_Date >=
                                                                                          TO_DATE (
                                                                                             '${fromDate}',
                                                                                             'dd/MM/yyyy hh24:mi:ss') --67
                                                                                   AND Billmast.Bmd_Date <=
                                                                                          TO_DATE (
                                                                                             '${toDate}',
                                                                                             'dd/MM/yyyy hh24:mi:ss') --68
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
                                                                                 AND Billmast.BMD_COLLDATE >=
                                                                                        TO_DATE (
                                                                                           '${fromDate}',
                                                                                           'dd/MM/yyyy hh24:mi:ss')  --69
                                                                                 AND Billmast.BMD_COLLDATE <=
                                                                                        TO_DATE (
                                                                                           '${toDate}',
                                                                                           'dd/MM/yyyy hh24:mi:ss') --70
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
                                                                                         AND Refundbillmast.Rfd_Date >=
                                                                                                TO_DATE (
                                                                                                   '${fromDate}',
                                                                                                   'dd/MM/yyyy hh24:mi:ss') --71
                                                                                         AND Refundbillmast.Rfd_Date <=
                                                                                                TO_DATE (
                                                                                                   '${toDate}',
                                                                                                   'dd/MM/yyyy hh24:mi:ss')  --72
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
                                                                                        AND Refundbillmast.RFD_RETDATE >=
                                                                                               TO_DATE (
                                                                                                  '${fromDate}',
                                                                                                  'dd/MM/yyyy hh24:mi:ss')  --73
                                                                                        AND Refundbillmast.RFD_RETDATE <=
                                                                                               TO_DATE (
                                                                                                  '${toDate}',
                                                                                                  'dd/MM/yyyy hh24:mi:ss')--74
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
                                                                                                  AND Pbillmast.Bmd_Date >=
                                                                                                         TO_DATE (
                                                                                                            '${fromDate}',
                                                                                                            'dd/MM/yyyy hh24:mi:ss')  
                                                                                                  AND Pbillmast.Bmd_Date <=
                                                                                                         TO_DATE (
                                                                                                            '${toDate}',
                                                                                                            'dd/MM/yyyy hh24:mi:ss')   
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
                                                                                              AND Pbillmast.BMD_COLLDATE >=
                                                                                                     TO_DATE (
                                                                                                        '${fromDate}',
                                                                                                        'dd/MM/yyyy hh24:mi:ss')  --77
                                                                                              AND Pbillmast.BMD_COLLDATE <=
                                                                                                     TO_DATE (
                                                                                                        '${toDate}',
                                                                                                        'dd/MM/yyyy hh24:mi:ss')  --78
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
                                                                                             AND Mretmast.Mrd_Date >=
                                                                                                    TO_DATE (
                                                                                                       '${fromDate}',
                                                                                                       'dd/MM/yyyy hh24:mi:ss')  --79
                                                                                             AND Mretmast.Mrd_Date <=
                                                                                                    TO_DATE (
                                                                                                       '${toDate}',
                                                                                                       'dd/MM/yyyy hh24:mi:ss')  --80
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
                                           AND Mretmast.MRD_RETDATE >=
                                                  TO_DATE (
                                                     '${fromDate}',
                                                     'dd/MM/yyyy hh24:mi:ss')  --81
                                           AND Mretmast.MRD_RETDATE <=
                                                  TO_DATE (
                                                     '${toDate}',
                                                     'dd/MM/yyyy hh24:mi:ss')  --82
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