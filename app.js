require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.json());

//IMPORT MODULES
const emplyeeRoutes = require("./api/employee/emp.router");

//MAP ROUTES
app.use("api/employee", emplyeeRoutes)

app.listen(process.env.APP_PORT, (val) => {
    console.log(`Server Up and Running ${process.env.APP_PORT}`)
})