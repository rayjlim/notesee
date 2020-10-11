<?php
if (!defined('APP_STARTED')) {
    die('Forbidden!');
}

function tree($array, $parent, $parts = array(), $step = 0)
{
    if (!count($array)) {
        return '[]';
    }

    $t = '[{}';

    foreach ($array as $key => $item) {
        if (is_array($item)) {
            $open = $step !== false && (isset($parts[$step]) && $key == $parts[$step]);

            $t .= ',{"state": "'. ($open ? 'open' : 'closed') .'",';
            $t .= ' "name": "'.$key.'", ' ;
            $t .= '"children":'.tree($item, "$parent/$key", $parts, $open ? $step + 1 : false);
            $t .=  '}';
        } else {
            $selected = (isset($parts[$step]) && $item == $parts[$step]);
            $t .= ',{"name":"'. $item .'","parent":"'.$parent.'/" , "active":'. ($selected ? 'true' : 'false') .'}';
        }
    }

    $t .= ']';

    return $t;
}

// echo tree($this->_getTree(), BASE_URL, isset($parts) ? $parts : array()); 
// echo BASE_URL;
return tree($this->_getTree(), "", isset($parts) ? $parts : array());

?>