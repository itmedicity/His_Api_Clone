const {pools, query, transaction} = require("../../config/mysqldbconfig");

module.exports = {
  userRightsInsert: async (row = []) => {
    if (!row.length) return;
    return transaction("eliider", [
      {
        sql: `insert into medi_ellider.user_rights_details
            ( user_group_id,
                 module_id, 
                 menugroup_id,
                 menuname_id, 
                 view_menu,
                 pdf_view,
                 excel_view
            ) values ?`,
        values: [row],
      },
    ]);
  },

  getUserRights: async (data) => {
    return query(
      "eliider",
      `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SlNo,user_rights_details.module_id,user_rights_details.menugroup_id,
             user_rights_details.menuname_id, menugroup_master.menugroup_name,menuname_details.menu_name,
             view_menu,pdf_view,excel_view from medi_ellider.user_rights_details 
             left join menugroup_master on menugroup_master.menugroup_id=user_rights_details.menugroup_id
             left join menuname_details on menuname_details.menuname_id=user_rights_details.menuname_id
             where user_rights_details.user_group_id = ? and user_rights_details.menugroup_id = ? order by user_rights_details.menuname_id`,
      [(data.user_group_id, data.menugroup_id)],
    );
  },

  userRightsUpdate: async (body) => {
    if (!body.length) return;
    return transaction(
      "eliider",
      body.map((val) => {
        return {
          sql: `update medi_ellider.user_rights_details 
                  set view_menu = ?, 
                  pdf_view = ?,
                  excel_view = ? 
                where user_group_id = ? and menuname_id = ?`,
          values: [val.view_menu, val.pdf_view, val.excel_view, val.user_group_id, val.menuname_id],
        };
      }),
    );
  },
};
