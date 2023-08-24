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
    public function issetSession(string $key);
    public function destroySession();
    public function issetCookie(string $key);
    public function cookie();
    public function writeFile(string $filename, string $fileData);
    public function readdir(string $logDirectory);
    public function readfile(string $logfile);
    public function removefile(string $logfile);
    public function putToFile(string $filepath, string $content);
    public function exists(string $filepath);

    public function getDateTime();
    /**
     * Content from URL
     *
     * @param string $url site url
     * @return site content 
     */
    public function load(string $url);
    public function grab_image(string $url, string $path);
}