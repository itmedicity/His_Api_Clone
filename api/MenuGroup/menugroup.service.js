const {query} = require("../../config/mysqldbconfig");
module.exports = {
  getModuleList: async () => {
    return await query(`ellider`, `select * from module_master`);
  },

  getMenuList: async (data) => {
    return await query(`ellider`, `select * from menugroup_master where module_id=?`, [data.module_id]);
  },

  menuGroupInsert: async (data) => {
    return await query(`ellider`, `insert into menuname_details (module_id,menugroup_id,menu_name,menuname_active) values (?,?,?,?)`, [
      data.module_id ?? null,
      data.menugroup_id ?? null,
      data.menu_name ?? null,
      data.menuname_active ?? 1,
    ]);
  },
  menugroupAlreadyExist: async (data) => {
    return await query(`ellider`, `select * from menuname_details where module_id=? and menugroup_id=? and menu_name=?`, [data.module_id, data.menugroup_id, data.menu_name]);
  },
  getGroupMapDetails: async () => {
    return await query(
      `ellider`,
      `select menuname_id,module_master.module_name,menugroup_master.menugroup_name,menu_name,menuname_active,
            menuname_details.module_id,menuname_details.menugroup_id from menuname_details
            left join module_master on module_master.module_id=menuname_details.module_id
            left join menugroup_master on menugroup_master.menugroup_id=menuname_details.menugroup_id`,
    );
  },

  menuGroupUpdate: async (data) => {
    return await query(`ellider`, `update menuname_details set module_id = ?, menugroup_id = ?, menu_name = ?, menuname_active = ? where menuname_id = ?`, [
      data.module_id,
      data.menugroup_id,
      data.menu_name,
      data.menuname_active,
      data.menuname_id,
    ]);
  },

  getMenuNameDetails: async (data) => {
    return await query(
      `ellider`,
      `select  ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SlNo,menuname_id,menuname_details.module_id,
            menuname_details.menugroup_id, menugroup_master.menugroup_name,menu_name from menuname_details
            left join menugroup_master on menugroup_master.menugroup_id=menuname_details.menugroup_id
            where menuname_details.module_id = ? and menugroup_master.menugroup_id = ? and 
            menuname_details.menuname_active=1 order by menugroup_master.menugroup_name`,
      [data.module_id, data.menugroup_id],
    );
  },
};
