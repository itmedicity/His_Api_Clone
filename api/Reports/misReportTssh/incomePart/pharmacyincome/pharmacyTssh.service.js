// @ts-ignore
const { oracledb, connectionClose, oraConnection } = require('../../../../../config/oradbconfig');

module.exports = {
    pharmacyTsshSalePart1: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const sql = `SELECT 
                            0 Amt,
                            0 GrossAmt,
                            0 Discount,
                            0 Comp,   
                            0 TAX
                    FROM HOSPITAL`;
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
    phamracyTsshReturnPart1: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = group === 1 ? null : (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                        SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
                        SUM (0) AS Comp,
                        SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                    FROM Mretdetl, Pbillmast, Disbillmast
                    WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                        AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                        AND Mretdetl.MRC_CACR IN ('I')
                        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                        AND NVL (Dmc_Cancel, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.IP_NO IN (${ipNumberList})`;

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
    phamracyTsshSalePart2: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 0 Amt,
                        0 GrossAmt,
                        0 Discount,
                        0 Comp,
                        0 TAX
                    FROM HOSPITAL`;
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
    phamracyTsshReturnPart2: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = group === 1 ? null : (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        // const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

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
                                AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO IN (${ipNumberList})`;

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
    phamracyTsshSalePart3: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = group === 1 ? null : (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        // const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

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
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND PBILLMAST.IP_NO IN (${ipNumberList})`;

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
    phamracyTsshReturnPart3: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                                SUM ( NVL (Iprefunditemdetl.Rin_Netamt, 0)  + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                                SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                                SUM (0) Comp,
                                SUM (0) TAX
                        FROM Iprefunditemdetl, Iprefundmast
                        WHERE  Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                                AND Iprefunditemdetl.Ric_Type = 'PHY'
                                AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                                AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                                AND Iprefundmast.Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Iprefundmast.Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

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
    pharmacyRoundOffAmntTssh: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
                            SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                            SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
                            SUM (0) AS Comp,
                            SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                        FROM Mretdetl, Pbillmast, Disbillmast
                        WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Mretdetl.MRC_CACR IN ('I')
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.IP_NO IN (${ipNumberList})
                            UNION
                            SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
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
                                    AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                    AND Disbillmast.IP_NO IN (${ipNumberList})
                            UNION 
                            SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
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
                                AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND PBILLMAST.IP_NO IN (${ipNumberList})
                        UNION
                        SELECT SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                                SUM ( NVL (Iprefunditemdetl.Rin_Netamt, 0)  + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                                SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                                SUM (0) Comp,
                                SUM (0) TAX
                        FROM Iprefunditemdetl, Iprefundmast
                        WHERE  Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                                AND Iprefunditemdetl.Ric_Type = 'PHY'
                                AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                                AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                                AND Iprefundmast.Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Iprefundmast.Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

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
    



/*
 * 
 * // REPORT FOR TMCH GROUPED
 * 
 * 
 */



    TmchGroupedSalePart1: async (data, callBack) => {

        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const sql = `SELECT 
                            0 Amt,
                            0 GrossAmt,
                            0 Discount,
                            0 Comp,   
                            0 TAX
                    FROM HOSPITAL`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            // await result.resultSet?.getRows((err, rows) => {
            //     // callBack(err, rows)
            //     return {
            //         success : 1,
            //         err : err,
            //         data : rows
            //     }
            // })

            const resultData = await result.resultSet?.getRows()
            return { success : 1, data : resultData }

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    TmchGroupedReturnPart1: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        
        const group = data?.group;
        const ipNumberList = (data?.grouped?.length > 0 && data.grouped.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
                        SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                        SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
                        SUM (0) AS Comp,
                        SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                    FROM Mretdetl, Pbillmast, Disbillmast
                    WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                        AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                        AND Mretdetl.MRC_CACR IN ('I')
                        AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                        AND NVL (Dmc_Cancel, 'N') = 'N'
                        AND Disbillmast.Dmc_Cacr <> 'M'
                        AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                        AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                        AND DISBILLMAST.IP_NO IN (${ipNumberList})`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )

        //    const resultData = result.resultSet?.getRows((err, rows) => {
        //     console.log(rows)
        //         return {
        //             success : 1,
        //             err : err,
        //             data : rows
        //         }
        //     })

        const resultData = await result.resultSet?.getRows()
        return { success : 1, data : resultData }

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    TmchGroupedSalePart2: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 0 Amt,
                        0 GrossAmt,
                        0 Discount,
                        0 Comp,
                        0 TAX
                    FROM HOSPITAL`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            // await result.resultSet?.getRows((err, rows) => {
            //     return {
            //         success : 1,
            //         err : err,
            //         data : rows
            //     }
            // })

            const resultData = await result.resultSet?.getRows()
            return { success : 1, data : resultData }

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    TmchGroupedReturnPart2: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = (data?.grouped?.length > 0 && data.grouped.join(',')) || null;
        // const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

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
                                AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND Disbillmast.IP_NO IN (${ipNumberList})`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            // await result.resultSet?.getRows((err, rows) => {
            //     return {
            //         success : 1,
            //         err : err,
            //         data : rows
            //     }
            // })

            const resultData = await result.resultSet?.getRows()
            return { success : 1, data : resultData }

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    TmchGroupedTsshSalePart3: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const group = data?.group;
        const ipNumberList = (data?.grouped?.length > 0 && data.grouped.join(',')) || null;
        // const ipNumberList = (data?.ptno?.length > 0 && data.ptno.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

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
                            AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND PBILLMAST.IP_NO IN (${ipNumberList})`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            // await result.resultSet?.getRows((err, rows) => {
            //     return {
            //         success : 1,
            //         err : err,
            //         data : rows
            //     }
            // })

            const resultData = await result.resultSet?.getRows()
            return { success : 1, data : resultData }

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    TmchGroupedTsshReturnPart3: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                                SUM ( NVL (Iprefunditemdetl.Rin_Netamt, 0)  + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                                SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                                SUM (0) Comp,
                                SUM (0) TAX
                        FROM Iprefunditemdetl, Iprefundmast
                        WHERE  Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                                AND Iprefunditemdetl.Ric_Type = 'PHY'
                                AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                                AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                                AND Iprefundmast.Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Iprefundmast.Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            // await result.resultSet?.getRows((err, rows) => {
            //     return {
            //         success : 1,
            //         err : err,
            //         data : rows
            //     }
            // })

            const resultData = await result.resultSet?.getRows()
            return { success : 1, data : resultData }

        } catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    TmchGroupedRoundOffAmntTssh: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const ipNumberList = (data?.grouped?.length > 0 && data.grouped.join(',')) || null;
        const fromDate = data.from;
        const toDate = data.to;

        const sql = `SELECT 
                            SUM (NVL (Mretdetl.MRN_AMOUNT, 0) - NVL (MRN_DISAMT, 0)) * -1 Amt,
                            SUM (NVL (Mretdetl.MRN_AMOUNT, 0)) * -1 GrossAmt,
                            SUM (NVL (MRN_DISAMT, 0)) * -1 Discount,
                            SUM (0) AS Comp,
                            SUM (NVL (MRETDETL.MRN_CESS, 0) + NVL (MRETDETL.MRN_SALETAX, 0)) * -1 TAX
                        FROM Mretdetl, Pbillmast, Disbillmast
                        WHERE Pbillmast.Bmc_Slno = Mretdetl.Bmc_Slno
                            AND Pbillmast.Dmc_Slno = Disbillmast.Dmc_Slno
                            AND Mretdetl.MRC_CACR IN ('I')
                            AND NVL (Mretdetl.Mrc_cancel, 'N') = 'N'
                            AND NVL (Dmc_Cancel, 'N') = 'N'
                            AND Disbillmast.Dmc_Cacr <> 'M'
                            AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                            AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                            AND DISBILLMAST.IP_NO IN (${ipNumberList})
                            UNION
                            SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
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
                                    AND Disbillmast.Dmd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                    AND DISBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                    AND Disbillmast.Dmd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                    AND Disbillmast.IP_NO IN (${ipNumberList})
                            UNION 
                            SELECT SUM (NVL (Pbilldetl.Bdn_amount, 0)) Amt,
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
                                AND Opbillmast.Opd_date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND OPBILLMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Opbillmast.Opd_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND PBILLMAST.IP_NO IN (${ipNumberList})
                        UNION
                        SELECT SUM (NVL (Iprefunditemdetl.Rin_Netamt, 0)) * -1 Amt,
                                SUM ( NVL (Iprefunditemdetl.Rin_Netamt, 0)  + NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 GrossAmt,
                                SUM (NVL (Iprefunditemdetl.Rin_Disamt, 0)) * -1 Discount,
                                SUM (0) Comp,
                                SUM (0) TAX
                        FROM Iprefunditemdetl, Iprefundmast
                        WHERE  Iprefundmast.Ric_Slno = Iprefunditemdetl.Ric_Slno
                                AND Iprefunditemdetl.Ric_Type = 'PHY'
                                AND Iprefundmast.Ric_Cacr IN ('C', 'R')
                                AND NVL (Iprefundmast.Ric_Cancel, 'N') = 'N'
                                AND Iprefundmast.Rid_Date >= TO_DATE ('${fromDate}', 'dd/MM/yyyy hh24:mi:ss')
                                AND IPREFUNDMAST.MH_CODE IN (SELECT MH_CODE FROM multihospital)
                                AND Iprefundmast.Rid_Date <= TO_DATE ('${toDate}', 'dd/MM/yyyy hh24:mi:ss')`;

        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            // await result.resultSet?.getRows((err, rows) => {
            //     return {
            //         success : 1,
            //         err : err,
            //         data : rows
            //     }
            // })

            const resultData = await result.resultSet?.getRows()
            return { success : 1, data : resultData }

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

