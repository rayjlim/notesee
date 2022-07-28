<?php
/**
    * Resource.php
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
    * Resource
    *
    * get contents from an external
    *
    * @date     2007-11-28
    * @category Personal
    * @package  Default
    * @author   Raymond Lim <rayjlim1@gmail.com>
    * @license  lilplaytime http://www.lilplaytime.com
    * @link     www.lilplaytime.com
    * @codeCoverageIgnore
    */
class Resource implements ResourceInterface
{

   /**
     * Content from URL
     *
     * @param string $url site url
     *
     * @return site content
     */
    public function session()
    {
        if (session_id() == '') {
            session_start();// session isn't started
        }

        $numargs = func_num_args();

        if ($numargs == 1) {
            return $_SESSION[func_get_arg(0)];
        } elseif ($numargs == 2) {
            $key = func_get_arg(0);
            $value = func_get_arg(1);
            
            $_SESSION[$key] = $value;
        } else {
            throw new Exception('InvalidArgumentException');
        }
    }

    public function issetSession($key)
    {
        if (session_id() == '') {
            session_start();// session isn't started
        }
        return isset($_SESSION[$key]);
    }

    public function cookie()
    {
        $numargs = func_num_args();

        if ($numargs == 1) {
            return $_COOKIE[func_get_arg(0)];
        } elseif ($numargs == 3) {
            $key = func_get_arg(0);
            $value = func_get_arg(1);
            $expiration = func_get_arg(2);
            setcookie($key, $value, $expiration);
        } else {
            throw new Exception('InvalidArgumentException');
        }
    }

    public function issetCookie($key)
    {
        return isset($_COOKIE[$key]);
    }

    public function destroySession()
    {
        session_destroy();
    }

    public function writeFile($filename, $content)
    {
        $filehandler = fopen($filename, 'a');
        //or throw new("can't open file");
        fwrite($filehandler, $content);
        fclose($filehandler);
    }

    public function readdir($logDirectory)
    {
        $filelist = array();
        if ($handle = opendir($logDirectory)) {
            while (false !== ($file = readdir($handle))) {
                if ($file != "." && $file != ".." && $file != ".svn") {
                    array_push($filelist, $file);
                }
            }
            closedir($handle);
        }

        asort($filelist);
        $filelist2 = array();
        foreach ($filelist as $key => $val) {
            array_push($filelist2, $val);
        }
        return $filelist;
    }

    public function readfile($logfile)
    {
        $myFile = $logfile;
        $fileHandle = fopen($myFile, 'r');
        $fileContents = fread($fileHandle, filesize($myFile));

        fclose($fileHandle);
        return $fileContents;
    }

    public function removefile($myFile)
    {
        unlink($myFile);
    }

    /**
     * putToFile
     *
     * Used to write a binary file
     *
     * @param string $filepath location for the file
     * @param mixed  $content  stuff to put in the file new file
     *
     * @return n/a
     */
    public function putToFile($filepath, $content)
    {
        file_put_contents($filepath, $content);
        return;
    }

    /**
     * exists
     *
     * @param string $filepath location for the file
     *
     * @return boolean file exists
     */
    public function exists($filepath)
    {
        return file_exists($filepath);
    }

    public function getDateTime()
    {
        return new DateTime();
    }

    public function load($url)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, true);
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($curl, CURLOPT_TIMEOUT, 400); //timeout in seconds

        $response = curl_exec($curl);

        curl_close($curl);
        set_time_limit(0);// to infinity for example
        return $response;
    }

    function grab_image($url, $saveto){
        $ch = curl_init ($url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
        $raw=curl_exec($ch);
        curl_close ($ch);
        if(file_exists($saveto)){
            unlink($saveto);
        }
        $fp = fopen($saveto,'x');
        fwrite($fp, $raw);
        fclose($fp);
    }
}
