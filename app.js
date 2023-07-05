require("dotenv").config();

const express = require("express");

const app = express();

//IMPORT MODULES
const emplyeeRoutes = require("./api/employee/emp.router");
const oracleUserTable = require("./api/Reports/oraUsers/user.router");
const collection = require("./api/Reports/misReport/collectionPart/collection.router");
const patientTypeDiscount = require("./api/Reports/misReport/PatientType/patientType.router");
const pharmacy = require("./api/Reports/misReport/incomePart/pharmacyincome/pharmacy.router");
const income = require("./api/Reports/misReport/incomePart/procedureIncome/proincome.router");
const admissionList = require("./api/Reports/InpatientList/admissionList.router");
const usgroup = require("./api/newUsergroup/newgroup.router");
const menugroup = require("./api/MenuGroup/menugroup.router");
const userright = require("./api/userRights/userRights.router");

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

//MAP ROUTES
app.use("/api/employee", emplyeeRoutes)
app.use("/api/oraUser", oracleUserTable)
app.use("/api/collection", collection)
app.use("/api/patientType", patientTypeDiscount)
app.use("/api/pharmacy", pharmacy)
app.use("/api/income", income)
app.use("/api/admission", admissionList)
app.use("/api/usergroup", usgroup)
app.use("/api/menugroups", menugroup)
app.use("/api/userrights", userright)



app.listen(process.env.APP_PORT, (val) => {
    console.log(`Server Up and Running ${process.env.APP_PORT}`)
})