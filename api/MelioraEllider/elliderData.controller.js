const { getOutlet,
    getNursingStation,
    getRoomType,
    getRoomCategory,
    getRoomDetails,
    getInpatientDetails,
    getPatientDetails,
    getNursingBed,
    getCurrentPatient,
    getDisChargedPatient,
    getInpatientFollowUp,
    getBedMasterDetail,
    getFbBedFromMeliora,
    insertFbBedMeliora,
    processRoomType,
    getRoomDetailEllider,
    insertRoomTypeMeliora,
    processRoomCategory,
    getRoomCategoryDetailEllider,
    insertRoomCategoryTypeMeliora,
    insertRoomMasterTypeMeliora,
    processRoomMaster,
    getRoomMasterDetailEllider,
    processNursingStation,
    getNsDetailEllider,
    insertnurseStationMeliora,
    processBedDetail,
    getAllRoomTypeDetail,
    getAllRoomCategoryDetail,
    getAllRoomMasterDetail,
    getAllBedDetail } = require('./elliderData.service')

module.exports = {
    getOutlet: (req, res) => {
        getOutlet((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },


    getNursingStation: (req, res) => {
        getNursingStation((err, results) => {
            if (err) {
                console.log(err);
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getRoomType: (req, res) => {
        getRoomType((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getRoomCategory: (req, res) => {
        getRoomCategory((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getRoomDetails: (req, res) => {
        getRoomDetails((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },

    getInpatientDetails: (req, res) => {
        const body = req.body;
        getInpatientDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },


    getPatientDetails: (req, res) => {
        getPatientDetails((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,
            });
        });
    },
    getNursingBed: (req, res) => {
        const data = req.body;
        getNursingBed(data, (err, results) => {
            if (err) {
                console.log(err, "err");
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,
            });
        })
    },
    getCurrentPatient: (req, res) => {
        const body = req.body;
        getCurrentPatient(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found',
                    data: [],
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },
    getDisChargedPatient: (req, res) => {
        const body = req.body;
        getDisChargedPatient(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found',
                    data: [],
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },
    getInpatientFollowUp: (req, res) => {
        const body = req.body;
        getInpatientFollowUp(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found',
                    data: [],
                })
            }
            return res.status(200).json({
                success: 2,
                data: results,

            });
        });
    },
    // Meliora Master Insert Data
    getBedMasterDetail: async (req, res) => {
        const data = req.body;
        try {
            // Fetch base data from Ellider
            const elliderResult = await new Promise((resolve, reject) => {
                getBedMasterDetail(data, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if (!Array.isArray(elliderResult) || elliderResult?.length === 0) {
                return res.status(200).json({ success: 0, message: "No data found from Ellider" });
            }

            // Fetching all deatil for Checking if any change Occures
            const MelioraRoomTypeDetail = await new Promise((resolve, reject) => {
                getAllRoomTypeDetail((err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            const MelioraRoomCategoyDetail = await new Promise((resolve, reject) => {
                getAllRoomCategoryDetail((err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            const MelioraRoomMasterDetail = await new Promise((resolve, reject) => {
                getAllRoomMasterDetail((err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            const MelioraBedDetail = await new Promise((resolve, reject) => {
                getAllBedDetail((err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });


            //make unique list by key and map fields
            const RoomType = [
                ...new Map(
                    elliderResult.map(item => [
                        item?.ROOMTYPE_RT_CODE,  // key to ensure uniqueness
                        {
                            fb_rt_code: item?.ROOMTYPE_RT_CODE,
                            fb_rc_code: item?.ROOMTYPE_RC_CODE,
                            fb_rt_desc: item?.RTC_DESC,
                            fb_rt_alias: item?.RTC_ALIAS,
                            fb_rt_status: item?.RTC_STATUS,
                            fb_rt_icu: item?.ICU,
                            fb_rt_mhcode: item?.RTC_MHCODE,
                        }
                    ])
                ).values(),
            ];

            const RoomCategory = [
                ...new Map(
                    elliderResult.map(item => [
                        item?.ROOMCATEGORY_RC_CODE,
                        {
                            fb_rc_code: item?.ROOMCATEGORY_RC_CODE,
                            fb_rc_desc: item?.RCC_DESC,
                            fb_rc_alias: item?.RCC_ALIAS,
                            fb_rc_status: item?.RCC_STATUS,
                            fb_rc_mhcode: item?.RCC_MHCODE,
                        }
                    ])
                ).values(),
            ];

            const RoomMaster = [
                ...new Map(
                    elliderResult.map(item => [
                        item?.ROOMMASTER_RM_CODE,
                        {
                            fb_rm_code: item?.ROOMMASTER_RM_CODE,
                            fb_rm_desc: item?.RMC_DESC,
                            fb_rm_alias: item?.RMC_ALIAS,
                            fb_rm_status: item?.RMC_STATUS,
                            fb_rm_mhcode: item?.RMC_MHCODE,
                            fb_ns_code: item?.ROOMMASTER_NS_CODE,
                        }
                    ])
                ).values(),
            ];

            const BedMaster = [
                ...new Map(
                    elliderResult.map(item => [
                        item?.BD_CODE,
                        {
                            fb_bd_code: item?.BD_CODE,
                            fb_bdc_no: item?.BDC_NO,
                            fb_ns_code: item?.BED_NS_CODE,
                            fb_rt_code: item?.BED_RT_CODE,
                            fb_bdc_occup: item?.BDC_OCCUP,
                            fb_bdn_cccno: item?.BDN_OCCNO,
                            fb_bdc_status: item?.BDC_STATUS,
                            fb_hkd_cleaningreq: item?.HKD_CLEANINGREQ,
                            fb_rm_code: item?.BED_RM_CODE,
                            fb_bdc_mhcode: item?.BDC_MHCODE,
                            fb_bdc_vipbed: item?.BDC_VIPBED
                        }
                    ])
                ).values(),
            ];


            // filtering data befor submitting
            const filteredRoomType = Array.isArray(RoomType)
                ? RoomType.filter(item =>
                    Array.isArray(MelioraRoomTypeDetail)
                        ? !MelioraRoomTypeDetail.some(local => local?.fb_rt_code === item?.fb_rt_code)
                        : true
                )
                : [];

            const FilteredRoomCategory = Array.isArray(RoomCategory)
                ? RoomCategory.filter(item =>
                    Array.isArray(MelioraRoomCategoyDetail)
                        ? !MelioraRoomCategoyDetail.some(local => local?.fb_rc_code === item?.fb_rc_code)
                        : true
                )
                : [];

            const FilteredRoomMaster = Array.isArray(RoomMaster)
                ? RoomMaster.filter(item =>
                    Array.isArray(MelioraRoomMasterDetail)
                        ? !MelioraRoomMasterDetail.some(local => local?.fb_rm_code === item?.fb_rm_code)
                        : true
                )
                : [];

            const FilteredBedDetail = Array.isArray(BedMaster)
                ? BedMaster.filter(item =>
                    Array.isArray(MelioraBedDetail)
                        ? !MelioraBedDetail.some(local => local?.fb_bd_code === item?.fb_bd_code)
                        : true
                )
                : [];

            // console.log({
            //     filteredRoomType,
            //     FilteredRoomCategory,
            //     FilteredRoomMaster,
            //     FilteredBedDetail
            // });


            // If Nothing exist then send a response show no data found
            if (
                (!filteredRoomType || filteredRoomType?.length === 0) &&
                (!FilteredRoomCategory || FilteredRoomCategory?.length === 0) &&
                (!FilteredRoomMaster || FilteredRoomMaster?.length === 0) &&
                (!FilteredBedDetail || FilteredBedDetail?.length === 0)
            ) {
                return res.status(200).json({
                    success: 2,
                    message: " No update required — all data is already up to date.",
                });
            }

            const MapRoomTypeDetail = filteredRoomType?.map(val => [
                val?.fb_rt_code,
                val?.fb_rt_desc,
                val?.fb_rt_alias,
                val?.fb_rc_code,
                val?.fb_rt_status,
                val?.fb_rt_icu,
                val?.fb_rt_mhcode
            ]);

            const MapRoomCategoryDetail = FilteredRoomCategory?.map(val => [
                val?.fb_rc_code,
                val?.fb_rc_desc,
                val?.fb_rc_alias,
                val?.fb_rc_status,
                val?.fb_rc_mhcode
            ]);

            const MapRoomMasterDetail = FilteredRoomMaster?.map(val => [
                val?.fb_rm_code,
                val?.fb_rm_desc,
                val?.fb_rm_alias,
                val?.fb_rm_status,
                val?.fb_rm_mhcode,
                val?.fb_ns_code
            ]);

            const MapBedDetail = FilteredBedDetail?.map(val => [
                val?.fb_bd_code,
                val?.fb_bdc_no,
                val?.fb_ns_code,
                val?.fb_rt_code,
                val?.fb_bdc_occup,
                val?.fb_bdn_cccno,
                val?.fb_bdc_status,
                val?.fb_hkd_cleaningreq,
                val?.fb_rm_code,
                val?.fb_bdc_mhcode,
                val?.fb_bdc_vipbed
            ]);


            if (Array.isArray(filteredRoomType) && filteredRoomType?.length > 0) {
                await insertRoomTypeMeliora(MapRoomTypeDetail, (err, result) => {
                    if (err) return res.status(200).json({ success: 0, message: "Error in Inserting Room Type Details...!" });
                });
            }

            if (Array.isArray(FilteredRoomCategory) && FilteredRoomCategory?.length > 0) {
                insertRoomCategoryTypeMeliora(MapRoomCategoryDetail, (err, result) => {
                    if (err) return res.status(200).json({ success: 0, message: "Error in Inserting Room Catergory Details...!" });
                });
            }

            if (Array.isArray(FilteredRoomMaster) && FilteredRoomMaster?.length > 0) {
                insertRoomMasterTypeMeliora(MapRoomMasterDetail, (err, result) => {
                    if (err) return res.status(200).json({ success: 0, message: "Error in Inserting Room Master Details...!" });
                });
            }

            if (Array.isArray(FilteredBedDetail) && FilteredBedDetail?.length > 0) {
                insertFbBedMeliora(MapBedDetail, (err, result) => {
                    if (err) return res.status(200).json({ success: 0, message: "Error in Inserting Bed Detail Details...!" });
                });
            }

            // Final success response
            return res.status(200).json({
                success: 2,
                message: "All master data synchronized successfully"
            });

        } catch (error) {
            // Global error handling
            console.error("Error during master data sync:", error);
            return res.status(500).json({
                success: 0,
                message: error.message || "Unexpected server error"
            });
        }
    }

}





//   await processNursingStation(nurseStationTypeCodes, (err, melioraNsResult) => {
//                     if (err) {
//                         return res.status(200).json({
//                             success: 0,
//                             message: err
//                         })
//                     }
//                     //  New records (present in Ellider but missing in Meliora)
//                     const newNurseStationTypes = nursingStationData?.filter(
//                         elliderItem =>
//                             !melioraNsResult?.some(m => m?.fb_ns_code === elliderItem?.fb_ns_code)
//                     );

//                     console.log(newNurseStationTypes, "newNurseStationTypes");

//                     // extracting rc code from the filtered data
//                     const newNsTypeCodes = newNurseStationTypes?.map(item => item?.fb_ns_code);

//                     // if new Code Present Get the master Detail From Ellider
//                     if (newNsTypeCodes && newNsTypeCodes?.length > 0) {
//                         getNsDetailEllider(newNsTypeCodes, (err, nsresultEllider) => {
//                             if (err) {
//                                 return res.status(200).json({
//                                     success: 0,
//                                     message: err
//                                 })
//                             }

//                             if (nsresultEllider && nsresultEllider?.length > 0) {
//                                 const MelioraNsDetail = nsresultEllider?.map(value => [
//                                     value?.NS_CODE,
//                                     value?.NSC_DESC
//                                 ]);

//                                 //then insert the room detail to the Meliora
//                                 insertnurseStationMeliora(MelioraNsDetail, (err, nsresult) => {
//                                     if (err) {
//                                         console.log(err, "err");
//                                         return res.status(200).json({
//                                             success: 0,
//                                             message: err
//                                         })
//                                     }
//                                     console.log(" successfully inserted insertnurseStationMeliora");
//                                 })
//                             }

//                         })
//                     }
//                 });