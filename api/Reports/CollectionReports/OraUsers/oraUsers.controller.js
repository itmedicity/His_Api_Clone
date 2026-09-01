const {oraUsers} = require("./oraUsers.service");
const {controllerGETHelper} = require("../../../../utls/controller-helperFun");

module.exports = {
  getOraUsers: controllerGETHelper(oraUsers, "Oracle Users"),
};
