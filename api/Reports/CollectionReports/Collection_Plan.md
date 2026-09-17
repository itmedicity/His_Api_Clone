## Backend api - Ellider_Mis_Api

@Ellider_Mis_Api/api/Reports/CollectionReports/collection.sql @Ellider_Mis_Api/api/Reports/CollectionReports/Collection_Plan.md

In CollectionReports i have 4 reports folder

1- CollectionQmt

2- CollectionTmc

3- CollectionTssh

4- CollectionGrouped

Now all the 4 reports collection.sql.js are the same sql code .

In above 4 reports CollectionQmt is the main Report folder.

All other Reports folder Collection.sql.js file sql code i want to IP_No based grouping needed like my hospitalIncomeReports .

In @Ellider_Mis_Api/api/Reports/CollectionReports/collection.sql this file i added this flag

`-- BOTH IP AND OP BILLS -- ONLY IP TABLE -- OP TABLE -- NULL EFFECT`

2- CollectionTmc

i want to filter like (NOT IN(ip numbers)) each table mentioned in the `Collection.sql.js` file with above flag and query mentioned in the `collection.sql` file. In CollectionTmc needs to keep all sql codes in Collection.sql.js

3- CollectionTssh and CollectionGrouped i want to filter like (IN(ip numbers)) each table mentioned in the `Collection.sql.js` file with above flag and query mentioned in the `collection.sql` file. In CollectionTmc needs to keep all sql codes in Collection.sql.js .And `-- OP TABLE ` and `-- NULL EFFECT` TABLES included section can remove. for `-- BOTH IP AND OP BILLS` tables only `IN ('I')` only inpatient needed.

CollectionQmt = CollectionTmc + CollectionTssh + CollectionGrouped

## Frondend - ellider_clone

In Mis/CollectionRepors

1 , For tmch -> ip number and date post data same as @TopOfficials/hospitalincomereport/tmch/IncomeReportsTmch.jsx

2 , For tssh and grouped check the tssh and grouped folder for the post data
