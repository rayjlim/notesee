<?php
if (!defined('APP_STARTED')) {
    die('Forbidden!');
}

/**
 * This class is only instantiated if the ACCESS_USER and ACCESS_PASSWORD constants are defined
 *
 */
class Login
{
    /**
     * Constructor
     */
    public function __construct()
    {
        if (isset($_GET['action']) && $_GET['action'] === 'logout') {
            $this->doLogout();

            header("location: " . BASE_URL);
            exit;
        }
    }

    /**
     * Check if the user is logged
     * @return boolean
     */
    private function isLogged()
    {
        // print_r(apache_request_headers());
        $headers = getallheaders();
        $header_key = $_ENV['HEADER_APP_TOKEN'];

        if(!isset ($headers[$header_key]) )  {
            return null; 
        }
        $headerStringValue = $headers[$header_key];

        // echo 'headerStringValue: '.$headerStringValue;
        $token = base64_encode( $_ENV['ACCESS_USER'].$_ENV['ACCESS_PASSWORD'] );
        // echo 'header: '.$headerStringValue.", token: ".$token;
        return  ($headerStringValue === $token);
    }

    /**
     * Do the login
     * @param  string $ip       IP address
     * @param  string $username Username
     * @param  string $password Password
     * @return boolean
     */
    private function doLogin($ip, $username, $password)
    {



        // Check credentials
        if ($username !== $_ENV['ACCESS_USER'] || $password !== $_ENV['ACCESS_PASSWORD']) {
            return false;
        }
        echo "{\"token\": \"".base64_encode( $username.$password )."\"}" ;
        exit;
    }

    /**
     * Logout from the password protected area
     * @return boolean Always true
     */
    private function doLogout()
    {
        return true;
    }

    /**
     * Get the IP address of the visitor
     * @return string
     */
    private function getRealIpAddr()
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {   //check ip from share internet
            return $_SERVER['HTTP_CLIENT_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {   //to check ip is pass from proxy
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        }

        return $_SERVER['REMOTE_ADDR'];
    }

    /**
     * Render the login page, if the authentication is not performed
     */
    public function dispatch()
    {
        if (!array_key_exists('ACCESS_USER', $_ENV)){
            return true;
        }
        // Stop if user is aready logged in (exception from negative first)
        if ($this->isLogged()) {
            return true;
        }

        $ip = $this->getRealIpAddr();

        $username = isset($_POST['username']) ? htmlspecialchars($_POST['username']) : null;
        $password = isset($_POST['password']) ? htmlspecialchars($_POST['password']) : null;

        if (isset($_POST['login'])) {
            if (!$username || !$password) {
                $error = 'Please complete both fields.';
            } else {
                if (!$this->doLogin($ip, $username, $password)) {
                    $error = "Wrong password.";
                } else {
                    return true;
                }
            }
        }

        // Show the login layout and stop
        // $layout = __DIR__ . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'login.php';
        // include($layout);
        echo "login required";
        exit;
    }

    /**
     * Singleton
     * @return Login
     */
    public static function instance()
    {
        static $instance;
        if (!($instance instanceof self)) {
            $instance = new self();
        }
        return $instance;
    }
}
