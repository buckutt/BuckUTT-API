<?php

error_reporting(E_ALL);
echo "Buckutt - Old buckutt replication\n";

# Truncate all db :
# mysql -uroot -ptoor -Nse 'show tables' buckutt_dev_demo | while read table; do mysql -uroot -ptoor -e "truncate table $table" buckutt_dev_demo; done

# Remote config
$host = "127.0.0.1";
$db   = "buckutt_old_fake";
$user = "root";
$pwd  = "toor";

# Local config
$lhost = "127.0.0.1";
$ldbn   = "buckutt_dev_demo";
$luser = "root";
$lpwd  = "toor";

try {
    $db  = new PDO("mysql:host=" . $host . ";dbname=" . $db, $user, $pwd);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    exit($e->getMessage());
}

try {
    $ldb = new PDO("mysql:host=" . $lhost . ";dbname=" . $ldbn, $luser, $lpwd);
    $ldb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    exit($e->getMessage());
}

do {
    $line = readline("Do you want to truncate the destination database (" .$ldbn . "@" . $lhost . ") [y/n] ");
} while ($line !== 'y' && $line !== 'n');

$doTruncate = ($line === 'y') ? true : false;

function copyTable ($table, $ltable, $fields) {
    echo "Copying table " . $table . " to " . $ltable . "\n";
    # Get back the PDO variables
    global $db, $ldb;

    $oldFields = array_keys($fields);
    $newFields = array_values($fields);
    $oldFieldsJoined = implode(", ", $oldFields);
    $newFieldsJoined = implode(", ", $newFields);

    # get PDO flags : ":name, :name2"
    $pdoFlags = ":" . implode(", :", $newFields);

    # Select the wanted fields
    $response = $db->query("SELECT " . $oldFieldsJoined . " FROM " . $table);
    if ($response === false) {
        var_dump($db->errorInfo());
        exit();
    }
    # Fetch with FETCH_ASSOC to prevent numeric indexes
    while ($row = $response->fetch(PDO::FETCH_ASSOC)) {
        # Preparing the insert query
        $reqStr = "INSERT IGNORE INTO " . $ltable . " (" . $newFieldsJoined . ") VALUES (" . $pdoFlags . ")";
        # Let"s make the associative array PDO needs
        # new fields as keys, old fields" values as data
        $prepareData = array_combine($newFields, $row);

        # Prepare and do the request
        try {
            $req = $ldb->prepare($reqStr);
            $resEx = $req->execute($prepareData);
        } catch (Exception $e) {
            var_dump($e->getMessage());
            exit(1);
        }
    }
    $response->closeCursor();
}

# Disable warnings
$ldb->exec("SET GLOBAL FOREIGN_KEY_CHECKS=0;");

# Tables truncater
if ($doTruncate) {
    echo "Truncating tables...\n";
    $tables = $ldb->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
    foreach ($tables as $table) {
        $query = "TRUNCATE TABLE " . $table[0];
        $ldb->exec($query);
        echo "Truncated " . $table[0] . "\n";
    }
    echo "Done.\n";
}

# Columns remover
echo "Adding useless columns...\n";
$columns_remover = array(
    "Users"       => array("img_id", "int(10)"),
    "Articles"    => array("img_id", "int(10)"),
    "Purchases"   => array("pur_type", "enum('product','promotion')"),
    "ReloadTypes" => array("rty_mode", "varchar(10)")
);
foreach ($columns_remover as $table => $field) {
    $fieldName = $field[0];
    $fieldType = $field[1];
    $query = 'SHOW COLUMNS FROM ' . $table . ' LIKE "' . $fieldName . '"';
    $columnsExists = count($ldb->query($query)->fetchAll());

    if ($columnsExists === 0) {
        $ldb->exec("alter table " . $table . " add column " . $fieldName . " " . $fieldType);
    }
}
echo "Done.\n";

# tj_object_link_oli/ArticlesLinks
$ArticlesLinks = array(
    "oli_id"        => "id",
    "obj_id_parent" => "ParentId",
    "obj_id_child"  => "ArticleId",
    "oli_step"      => "step",
    "oli_removed"   => "isRemoved"
);

copyTable("tj_object_link_oli", "ArticlesLinks", $ArticlesLinks);

# tj_obj_poi_jop/ArticlesPoints
$ArticlesPoints = array(
    "obj_id" => "id",
    "jop_priority" => "priority",
    "poi_id" => "PointId"
);
copyTable("tj_obj_poi_jop", "ArticlesPoints", $ArticlesPoints);

# Old fields tj_usr_grp_jug/UsersGroups
$UsersGroups = array(
    "jug_id" => "id",
    "usr_id" => "UserId",
    "grp_id" => "GroupId",
    "per_id" => "PeriodId",
    "jug_removed" => "isRemoved"
);
copyTable("tj_usr_grp_jug", "UsersGroups", $UsersGroups);

# Old fields tj_usr_mol_jum/MeanOfLoginsUsers
# Added id (autoincrement -> ok)
# Added isRemoved (default false -> ok)
$MeanOfLoginsUsers = array(
    "usr_id" => "id",
    "mol_id" => "MeanOfLoginId",
    "jum_data" => "data"
);
copyTable("tj_usr_mol_jum", "MeanOfLoginsUsers", $MeanOfLoginsUsers);

# Old fields tj_usr_rig_jur/UsersRights
$UsersRights = array(
    "jur_id" => "id",
    "usr_id" => "UserId",
    "rig_id" => "RightId",
    "per_id" => "PeriodId",
    "fun_id" => "FundationId",
    "poi_id" => "PointId",
    "jur_removed" => "isRemoved"
);
copyTable("tj_usr_rig_jur", "UsersRights", $UsersRights);

# Old fields ts_mean_of_login_mol/MeanOfLogins
$MeanOfLogins = array(
    "mol_id" => "id",
    "mol_name" => "name",
    "mol_removed" => "isRemoved"
);
copyTable("ts_mean_of_login_mol", "MeanOfLogins", $MeanOfLogins);

# Old fields ts_right_rig/Rights
$Rights = array(
    "rig_id" => "id",
    "rig_name" => "name",
    "rig_description" => "description",
    "rig_admin" => "isAdmin",
    "rig_removed" => "isRemoved"
);
copyTable("ts_right_rig", "Rights", $Rights);

# Old fields ts_user_usr/Users
# img_id to remove : create column, import, drop column
$Users = array(
    "usr_id" => "id",
    "usr_pwd" => "password",
    "usr_firstname" => "firstname",
    "usr_lastname" => "lastname",
    "usr_nickname" => "nickname",
    "usr_mail" => "mail",
    "usr_credit" => "credit",
    "img_id" => "img_id",
    "usr_temporary" => "isTemporary",
    "usr_fail_auth" => "failedAuth",
    "usr_blocked" => "isRemoved"
);
copyTable("ts_user_usr", "Users", $Users);

# Old fields t_fundation_fun/Fundations
$Fundations = array(
    "fun_id" => "id",
    "fun_name" => "name",
    "fun_removed" => "isRemoved"
);
copyTable("t_fundation_fun", "Fundations", $Fundations);

# Old fields t_group_grp/Groups
$Groups = array(
    "grp_id" => "id",
    "grp_name" => "name",
    "grp_open" => "isOpen",
    "grp_public" => "isPublic",
    "fun_id" => "FundationId",
    "grp_removed" => "isRemoved"
);
copyTable("t_group_grp", "Groups", $Groups);

# Old fields t_object_obj/Articles
# img_id to remove : create column, import, drop column
$Articles = array(
    "obj_id" => "id",
    "obj_name" => "name",
    "obj_type" => "type",
    "obj_stock" => "stock",
    "obj_single" => "isSingle",
    "img_id" => "img_id",
    "fun_id" => "FundationId",
    "obj_removed" => "isRemoved"
);
copyTable("t_object_obj", "Articles", $Articles);

# Old fields t_period_per/Periods
$Periods = array(
    "per_id" => "id",
    "fun_id" => "FundationId",
    "per_name" => "name",
    "per_date_start" => "startDate",
    "per_date_end" => "endDate",
    "per_removed" => "isRemoved"
);
copyTable("t_period_per", "Periods", $Periods);


# Old fields t_point_poi/Points
$Points = array(
    "poi_id" => "id",
    "poi_name" => "name",
    "poi_removed" => "isRemoved"
);
copyTable("t_point_poi", "Points", $Points);

# Old fields t_price_pri/Prices
$Prices = array(
    "pri_id" => "id",
    "obj_id" => "ArticleId",
    "grp_id" => "GroupId",
    "per_id" => "PeriodId",
    "pri_credit" => "credit",
    "pri_removed" => "isRemoved"
);
copyTable("t_price_pri", "Prices", $Prices);


# Old fields t_purchase_pur/Purchases
# pur_type to remove : create column, import, drop column
$Purchases = array(
    "pur_id" => "id",
    "pur_date" => "date",
    "pur_type" => "pur_type",
    "obj_id" => "ArticleId",
    "pur_price" => "price",
    "usr_id_buyer" => "BuyerId",
    "usr_id_seller" => "SellerId",
    "poi_id" => "PointId",
    "fun_id" => "FundationId",
    "pur_ip" => "ip",
    "pur_removed" => "isRemoved"
);
copyTable("t_purchase_pur", "Purchases", $Purchases);

# Old fields t_recharge_rec/Reloads
$Reloads = array(
    "rec_id" => "id",
    "rty_id" => "ReloadTypeId",
    "usr_id_buyer" => "BuyerId",
    "usr_id_operator" => "OperatorId",
    "poi_id" => "PointId",
    "rec_date" => "date",
    "rec_credit" => "credit",
    "rec_trace" => "trace",
    "rec_removed" => "isRemoved"
);
copyTable("t_recharge_rec", "Reloads", $Reloads);

# Old fields t_recharge_type_rty/ReloadTypes
# rty_mode to remove : create column, import, drop column
$ReloadTypes = array(
    "rty_id" => "id",
    "rty_name" => "name",
    "rty_type" => "type",
    "rty_mode" => "rty_mode",
    "rty_removed" => "isRemoved"
);
copyTable("t_recharge_type_rty", "ReloadTypes", $ReloadTypes);

# Columns remover
echo "Removing useless columns...\n";
foreach ($columns_remover as $table => $field) {
    $fieldName = $field[0];
    $fieldType = $field[1];
    $ldb->exec("alter table " . $table . " drop column " . $fieldName);
}
echo "Done.\n";

$ldb->exec("SET GLOBAL FOREIGN_KEY_CHECKS=1;");

?>