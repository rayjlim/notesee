<?php
if (!defined('APP_STARTED')) {
    die('Forbidden!');
}



// Sanitize html content:
function e($dirty)
{
    return htmlspecialchars($dirty, ENT_QUOTES, 'UTF-8');
}

// var_dump($html);
$output = new stdClass();
$output->page = $page;
$output->parts = $parts;
$output->source = $source;

$tree = include('tree.php');
$output->tree = $tree;
echo json_encode($output);


?>
 