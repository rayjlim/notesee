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
        // if (isset($_GET['action']) && $_GET['action'] === 'logout') {
        //     $this->doLogout();

        //     header("location: " . BASE_URL);
        //     exit;
        // }
    }

    /**
     * Check if the user is logged
     * @return boolean
     */
    private function isLogged(): bool
    {
        $headers = getallheaders();
        $token = $_ENV['HEADER_APP_TOKEN'];

        if(!isset ($headers[$token]) )  {
            return null; 
        }
        $headerStringValue = $headers[$token];
        $decryptedString = decrypt($headerStringValue);
        $userObj = json_decode($decryptedString);
        return ($userObj 
            && $userObj->username == $_ENV['ACCESS_USER'] 
            && $userObj->password == $_ENV['ACCESS_PASSWORD']);
    }

    /**
     * Logout from the password protected area
     * @return boolean Always true
     */
    // private function doLogout()
    // {
    //     Logger::log("Logout");
    //     return true;
    // }

    /**
     * Get the IP address of the visitor
     * @return string Identifier for the client
     */
    private function getRealIpAddr(): string
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
     * @return string Identifier for the client
     */
    public function dispatch(): bool
    {
        // CHECK if Login is enabled
        if (!array_key_exists('ACCESS_USER', $_ENV)){
            return true;
        }
        // Stop if user is aready logged in (exception from negative first)
        if ($this->isLogged()) {
            return true;
        }

        $entityBody = file_get_contents('php://input');
        $loginParams = json_decode($entityBody);
        $username = isset($loginParams->username) ? htmlspecialchars($loginParams->username) : null;
        $password = isset($loginParams->password) ? htmlspecialchars($loginParams->password) : null;

        if (!isset($loginParams->login)) {
            $this->loginError('Invalid payload' . $_SERVER['REQUEST_URI']);
        } elseif (!$username || !$password) {
            $this->loginError('Missing Fields');
        }

        if (isset($loginParams->id) && $loginParams->id !== '') {
            if(!isset($_ENV['ACCESS_GOOGLE_ID'])) {
                header('HTTP/1.0 500 Error');
                echo "Missing .env config ACCESS_GOOGLE_ID";
                exit;
            }
            if ($loginParams->id == $_ENV['ACCESS_GOOGLE_ID']) {
                Logger::log("login by id");
                $token = $this->generateToken();
                echo $token;
                exit;
            }
            $this->loginError('Wrong id: '.$loginParams->id);
        }
        
        if ($username === $_ENV['ACCESS_USER'] && $password === $_ENV['ACCESS_PASSWORD']) {            
            Logger::log("login by username/password");
            $token = $this->generateToken();
            echo $token;
            exit;
        }
        $this->loginError('Wrong username/password: '. $username.' '. $password);
    }

    private function generateToken(): string
    {
        $tokenObj = new stdClass();
        $tokenObj->username = $_ENV['ACCESS_USER'];
        $tokenObj->password = $_ENV['ACCESS_PASSWORD'];
        $responseObj = new stdClass();
        $responseObj->token = encrypt(json_encode($tokenObj));
        return json_encode($responseObj);
    }

    private function loginError(string $message)
    {
        $ipaddress = $this->getRealIpAddr();
        $response = new stdClass();
        $response->status = "fail";
        $response->message = $message;
        
        Logger::log('User Login: '.$message.' from IP Address: ' . $ipaddress);
        header('HTTP/1.0 403 Forbidden');
        echo json_encode($response);
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

function encrypt(string $simple_string): string
{
    $ciphering = "AES-128-CTR"; // the cipher method

    // Use OpenSSl Encryption method
    openssl_cipher_iv_length($ciphering);
    $options = 0;

    // Non-NULL Initialization Vector for encryption
    $encryption_iv = '1234567891011121';

    // Use openssl_encrypt() function to encrypt the data
    $encryption = openssl_encrypt(
        $simple_string,
        $ciphering,
        $_ENV['ENCRYPTION_KEY'],
        $options,
        $encryption_iv
    );
    return $encryption;
}

function decrypt(string $encryption): string
{
    $ciphering = "AES-128-CTR"; // the cipher method
    // Non-NULL Initialization Vector for decryption
    $encryption_iv = '1234567891011121';
    $options = 0;

    // Use openssl_decrypt() function to decrypt the data
    $decryption = openssl_decrypt(
        $encryption,
        $ciphering,
        $_ENV['ENCRYPTION_KEY'],
        $options,
        $encryption_iv
    );

    return $decryption;
}