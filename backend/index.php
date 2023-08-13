<?php

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use \RedBeanPHP\R as R;

R::setup('mysql:host=' . $_ENV['DB_HOST'] . ';dbname=' . $_ENV['DB_NAME'], $_ENV['DB_USER'], $_ENV['DB_PASSWORD']);
R::freeze(true);

$request_uri = parse_url($_SERVER['REQUEST_URI']);
$script_name = dirname($_SERVER['SCRIPT_NAME']);
$app_dir = substr($request_uri['path'], 0, strlen($script_name));
define('APP_DIR', rtrim($app_dir, '/'));

$https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on";

define('BASE_URL', "http" . ($https ? "s" : "") . "://" . $_SERVER['HTTP_HOST'] . APP_DIR);

// unset($config_file, $request_uri, $script_name, $app_dir, $https);

// APP_DIR  ex. /projects/notesee/backend
// BASE_URL ex. http://localhost/notesee/backend

if(str_contains($request_uri['path'], 'notesee_settings')){
    if(!isset($_ENV['FE_APP_IMG_PATH'])) {
        header('HTTP/1.0 500 Error');
        echo "Missing .env config FE_APP_IMG_PATH";
        exit;
    }
    $page_data['IMG_PATH'] = $_ENV['FE_APP_IMG_PATH'];
    if(isset($_ENV['FE_APP_GOOGLE_OAUTH_CLIENTID'])) {
        $page_data['GOOGLE_OAUTH_CLIENTID'] = $_ENV['FE_APP_GOOGLE_OAUTH_CLIENTID'];
    }
    echo json_encode($page_data);
    exit;
}

Login::instance()->dispatch();
Wiki::instance()->dispatch();
