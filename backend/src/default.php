<?php
define('APP_STARTED', true);

$getcwd = getcwd();
// Windows or Unix separators
$DIR_SEP = (strpos($getcwd, "\\") != 0) ? "\\" : "/";
define("DIR_SEP", $DIR_SEP);
define("ABSPATH", $getcwd . $DIR_SEP);

define ("LOGS_DIR",  ABSPATH .'_logs');
define ("LOG_PREFIX", 'notesee');

define("FULL_DATETIME_FORMAT", "Y-m-d G:i:s");
define("YEAR_MONTH_FORMAT", "Y-m");