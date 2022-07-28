<?php
/**
    * IResourceDAO.php
    *
    * PHP Version 5.4
    *
    * @date     2007-11-28
    * @category Personal
    * @package  Default
    * @author   Raymond Lim <rayjlim1@gmail.com>
    * @license  lilplaytime http://www.lilplaytime.com
    * @link     www.lilplaytime.com
    * 
    */
/**
    * IResourceDAO
    *
    * System resource abstractor
    *
    * @date     2007-11-28
    * @category Personal
    * @package  Default
    * @author   Raymond Lim <rayjlim1@gmail.com>
    * @license  lilplaytime http://www.lilplaytime.com
    * @link     www.lilplaytime.com
    */
interface ResourceInterface
{
    public function session();
    public function issetSession($key);
    public function destroySession();
    public function issetCookie($key);
    public function cookie();
    public function writeFile($filename, $fileData);
    public function readdir($logDirectory);
    public function readfile($logfile);
    public function removefile($logfile);
    public function putToFile($filepath, $content);
    public function exists($filepath);

    public function getDateTime();
    /**
     * Content from URL
     *
     * @param string $url site url
     * @return site content 
     */
    public function load($url);
    public function grab_image($url, $path);
}