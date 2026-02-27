const {query} = require("../../config/mysqldbconfig");
module.exports = {
  userGroupInsert: async (data) => {
    return await query(`ellider`, `insert into user_group (user_group_name, pass_expiry_days, user_group_active) values (?,?,?)`, [data.user_group_name, data.pass_expiry_days, data.group_active]);
  },
  groupAlreadyExist: async (data) => {
    return await query(`ellider`, `select user_group_name from user_group where user_group_name = ?`, [data.user_group_name]);
  },

  getUserGroup: async () => {
    return await query(`ellider`, `select * from user_group order by user_group_name`);
  },

  userGroupUpdate: async (data) => {
    return await query(`ellider`, `update user_group set user_group_name = ?, pass_expiry_days = ?, user_group_active = ? where user_group_id = ?`, [
      data.user_group_name,
      data.pass_expiry_days,
      data.user_group_active,
      data.user_group_id,
    ]);
  },

  searchUserGroup: async (data) => {
    return await query(`ellider`, `select * from user_group where user_group_name like ? order by user_group_name`, ["%" + data.user_group_name + "%"]);
  },

  activetUserGroup: async () => {
    return await query(`ellider`, `select * from user_group where user_group_active=1 order by user_group_name`);
  },
};
