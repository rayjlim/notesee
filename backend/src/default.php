<?php
define('APP_STARTED', true);

// Conditionally load configuration from a config.php file in
// the site root, if it exists.

if (is_file($config_file = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'config.php')) {
    require_once $config_file;
}

if (!defined('APP_NAME')) {
    define('APP_NAME', 'Notesee');
}

if (!defined('DEFAULT_FILE')) {
    define('DEFAULT_FILE', 'index.md');
}
