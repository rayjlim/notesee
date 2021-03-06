<?php
// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers:        {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}
require_once __DIR__ . '/vendor/autoload.php';

\R::setup('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASSWORD);
\R::freeze(true);

$request_uri = parse_url($_SERVER['REQUEST_URI']);
$request_uri = explode("/", $request_uri['path']);
$script_name = explode("/", dirname($_SERVER['SCRIPT_NAME']));

$app_dir = array();
foreach ($request_uri as $key => $value) {
    if (isset($script_name[$key]) && $script_name[$key] == $value) {
        $app_dir[] = $script_name[$key];
    }
}

define('APP_DIR', rtrim(implode('/', $app_dir), "/"));

$https = false;
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") {
    $https = true;
}

define('BASE_URL', "http" . ($https ? "s" : "") . "://" . $_SERVER['HTTP_HOST'] . APP_DIR);

unset($config_file, $request_uri, $script_name, $app_dir, $https);

// APP_DIR  ex. /projects/notesee/backend
// BASE_URL ex. http://localhost/notesee/backend

Login::instance()->dispatch();

Wiki::instance()->dispatch();
