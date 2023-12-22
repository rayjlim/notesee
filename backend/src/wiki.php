<?php
if (!defined('APP_STARTED')) {
    die('Forbidden!');
}

define("LIBRARY", __DIR__ . "/library");

class Wiki
{
    protected $_ignore = "/^\..*|^CVS|.html|.jpg$/"; // Match dotfiles and CVS
    protected $_force_unignore = false; // always show these files (false to disable)

    protected $_action;

    protected $_default_page_data = array(
        'title' => false,
        'description' => 'Notesee wiki.',
        'tags' => array('Notesee', 'wiki'),
        'page' => ''
    );

    /**
     * Given a string with a page's source, attempts to locate a
     * section of JSON Front Matter in the heading, and returns
     * the remaining source, and an array of extracted meta data.
     *
     * JSON Front Matter will only be considered when present
     * within two lines consisting of three dashes:
     *
     * ---
     * { "title": "hello world" }
     * ---
     *
     * Additionally, the opening and closing brackets may be dropped,
     * and this method will still interpret the content as a hash:
     *
     * ---
     * "title": "hello, world",
     * "tags":  ["hello", "world"]
     * ---
     *
     * @param  string $source
     * @return array  array($remaining_source, $meta_data)
     */
    protected function _extractJsonFrontMatter(string $source): array
    {
        static $front_matter_regex = "/^---[\r\n](.*)[\r\n]---[\r\n](.*)/s";

        $source = ltrim($source);
        $meta_data = array();

        if (preg_match($front_matter_regex, $source, $matches)) {
            $json = trim($matches[1]);
            $source = trim($matches[2]);

            // Locate or append starting and ending brackets,
            // if necessary. I lazily only check the first
            // character for a bracket, so that it'll work
            // even if the user includes a hash in the last
            // line:
            if ($json[0] != '{') {
                $json = '{' . $json . '}';
            }

            // Decode & validate the JSON payload:
            $meta_data = json_decode($json, true, 512);

            // Check for errors:
            if ($meta_data === null) {
                $error = json_last_error();
                $message = 'There was an error parsing the JSON Front Matter for this page';

                if ($error == JSON_ERROR_SYNTAX) {
                    $message .= ': Incorrect JSON syntax (missing comma, or double-quotes?)';
                }
                echo $message;
                throw new RuntimeException($message);
            }
        }

        return array($source, $meta_data);
    }

    protected function _getBacklinks(string $path): array
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $links = $ORM->getBacklinks($path);
        return $links;
    }

    public function dispatch(): void
    {
        $action = $this->_getAction();
        $actionMethod = "{$action}Action";

        if ($action === null || !method_exists($this, $actionMethod)) {
            $this->_404();
        }

        $this->$actionMethod();
    }

    protected function _getAction(): string
    {
        $action = $_REQUEST['a'] ?? 'index';

        if (in_array("{$action}Action", get_class_methods(get_class($this)))) {
            $this->_action = $action;
        }
        return $this->_action;
    }

    protected function _json(mixed $data): void
    {
        header("Content-type: text/x-json");
        echo (is_string($data) ? $data : json_encode($data));
        exit;
    }

    protected function _isXMLHttpRequest(): bool
    {
        if ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {
            return true;
        }

        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            return $headers['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest';
        }

        return false;
    }

    protected function _404(string $message = 'Page not found.'): void
    {
        header('HTTP/1.0 404 Not Found', true);
        $page_data = $this->_default_page_data;
        $page_data['title'] = 'Not Found';
        $output = array(
            'error' => $message,
            'page' => $page_data
        );
        print_r($output);

        exit;
    }

    protected function _500(string $message = 'Server Error.'): void
    {
        header('HTTP/1.0 500 Internal Server Error', true);
        $page_data = $this->_default_page_data;
        $page_data['title'] = 'Not Found';
        $output = array(
            'error' => $message,
            'page' => $page_data
        );
        print_r($output);

        exit;
    }

    protected function _ErrorCode(string $code, string $message = 'Page not found.'): void
    {
        header('HTTP/1.0 ' . $code . ' ' . $message, true);
        $page_data = $this->_default_page_data;
        $page_data['title'] = $message;

        $output =  array(
            'error' => $message,
            'page' => $page_data
        );
        print_r($output);
        exit;
    }

    public function indexAction(): void
    {
        $request = parse_url($_SERVER['REQUEST_URI']);

        $pagePath = str_replace("###" . APP_DIR . "/", "", "###" . urldecode($request['path']));
        if (str_ends_with($pagePath, '/')) {
            $pagePath .= $_ENV['DEFAULT_FILE'];
        }

        try {

            $ORM = new \Notesee\DocsRedbeanDAO();

            $extension = substr($pagePath, strrpos($pagePath, '.') + 1, 20);
            // echo ' check extension'. $extension;
            if (false === $extension) {
                // $not_found();
                throw new Exception('No Extension');
            }

            // if ($extension != 'md') {
            //     $path = realpath(LIBRARY . DIRECTORY_SEPARATOR . $pagePath);
            // echo "path: " .$path;
            // $finfo = finfo_open(FILEINFO_MIME);
            // $mime_type = trim(finfo_file($finfo, $path));


            // echo ('pass through: ' . $mime_type);
            // not an ASCII file, send it directly to the browser
            // $file = fopen($path, 'rb');

            // header("Content-Type: $mime_type");
            // header("Content-Length: " . filesize($path));

            // fpassthru($file);
            //     exit();
            // }

            // echo "Page: ". $page;
            $entrys = $ORM->getByPath($pagePath);

            $source = "";
            if (count($entrys) !== 0) {
                $source = $entrys[0]['content'];
            } else {
                $entrys[0]['is_favorite'] = 0;
                $iResource = new \Resource();
                $date = $iResource->getDateTime();
                $entrys[0]['update_date'] = $date->format(DATE_FORMAT);
            }

            $pageData = new stdClass();
            $pageData->path = $pagePath;
            $pageData->page = $this->_default_page_data;
            $pageData->backlinks = $this->_getBacklinks($pagePath);

            $pageData->source = str_replace("\\n", "\n", $source);
            $pageData->isFavorite = $entrys[0]['is_favorite'] == '1';
            $pageData->modifiedDate = $entrys[0]['update_date'];
            $pageData->isArchive = strstr($source, '#archive') !== false;

            $this->_json($pageData);
        } catch (Exception $e) {
            $this->_404($e->getMessage());
        }
    }

    /**
     * /?a=edit
     */
    public function editAction(): void
    {
        // Bail out early if we don't get the right request method && params
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            header('HTTP/1.0 400 Bad Request');
            echo "Must be POST method";
            exit;
        }
        if (!isset($_POST['ref'], $_POST['source'])) {
            header('HTTP/1.0 400 Bad Request');
            echo "Missing required parameters (ref, source)";
            exit;
        }

        $ref = $_POST['ref'];        // path in the note
        $source = $_POST['source'];  // markdown content

        $path = base64_decode($ref);
        if (str_ends_with($path, '/')) {
            $path .= $_ENV['DEFAULT_FILE'];
        }

        // Check if the file is safe to work with, otherwise just
        // give back a generic 404 as well, so we don't allow blind
        // scanning of files:

        // Check if empty
        \Logger::log("Edit: " . $path);
        if (trim($source)) {
            $ORM = new \Notesee\DocsRedbeanDAO();

            // Validate path exists
            $entrys = $ORM->getByPath($path);
            if (count($entrys) === 0) {
                $this->_500('Invalid Ref');
            }

            $entry = $ORM->update($path, $source);

            // get prefix            
            $prefix =  substr($path, 0, strrpos($path, '/'));
            $prefix = strlen($prefix) ? $prefix . '/' : $prefix;

            // get backlinks
            $links = $this->_getTargetLinks($source);

            $prefixedLinks = [];

            foreach ($links[2] as $link) {
                if (
                    strpos($link, "http://") === false
                    && strpos($link, "https://") === false
                    && strpos($link, "#") === false
                ) {
                    $targetValue = ($link[0] == '/') ? ltrim($link, '/') : $prefix . $link;
                    if (str_ends_with($targetValue, '/')) {
                        $targetValue .= $_ENV['DEFAULT_FILE'];
                    }
                    array_push($prefixedLinks, $targetValue);
                }
            }

            // get existing links for source $files
            $existing = $ORM->getForwardlinks($path);

            $resultToAdd = array_unique(array_diff($prefixedLinks, $existing));
            foreach ($resultToAdd as $item) {
                $ORM->addMapping($path, $item);
            }
            $resultToRemove = array_diff($existing, $prefixedLinks);
            foreach ($resultToRemove as $item) {
                $ORM->deleteMapping($path, $item);
            }

            $entry->action = 'edit';
            $entry->status = 'success';
            $this->_json($entry);
        } else {
            echo 'Content was empty, Delete Document?';
        }
    }

    /**
     * /?a=create
     */
    public function createAction(): void
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $request    = parse_url($_SERVER['REQUEST_URI']);
        $path       = str_replace("###" . APP_DIR . "/", "", "###" . urldecode($request['path']));

        if (str_ends_with($path, '/')) {
            $path .= $_ENV['DEFAULT_FILE'];
        }

        $content    = "# " . htmlspecialchars($path, ENT_QUOTES, 'UTF-8');

        $entrys = $ORM->getByPath($path);

        if (count($entrys)) {
            throw new Error('record exists');
        }
        $entry = $ORM->insert($path, $content);
        \Logger::log("Created: " . $path);
        $entry->action = 'create';
        $entry->status = 'success';
        $this->_json($entry);
    }

    public function deleteAction(): void
    {
        if (!isset($_REQUEST['path'])) {
            header('HTTP/1.0 400 Bad Request');
            echo "Missing required parameters (path)";
            exit;
        }

        $path = $_REQUEST['path'];
        if (str_ends_with($path, '/')) {
            $path .= $_ENV['DEFAULT_FILE'];
        }
        $status = false;
        $ORM = new \Notesee\DocsRedbeanDAO();
        $ORM->deleteSourceMapping($path);
        $status = $ORM->deleteByPath($path);
        \Logger::log("Delete: " . $path);
        if ($status) {
            header('HTTP/1.0 204 No Content');
        } else {
            header('HTTP/1.0 500 Server Error');
            echo "Unable to Delete " . $path;
        }
    }

    public function networkAction(): void
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $entrys = $ORM->getMaps();
        $this->_json($entrys);
    }

    public function searchAction(): void
    {
        if (!isset($_REQUEST['text'])) {
            header('HTTP/1.0 400 Bad Request');
            echo "Missing required parameters (text)";
            exit;
        }
        $text = $_REQUEST['text'];
        $ORM = new \Notesee\DocsRedbeanDAO();
        $entrys = $ORM->contentsContains($text);

        $reduced_columns = array_column($entrys, 'path');

        $this->_json($reduced_columns);
    }

    public function getTreeAction(): void
    {
        $pageData = new stdClass();
        $ORM = new \Notesee\DocsRedbeanDAO();
        $pageData->tree = $ORM->getPaths();
        $this->_json($pageData);
    }

    public function getTreeSearchAction(): void
    {
        $pageData = new stdClass();
        $ORM = new \Notesee\DocsRedbeanDAO();
        $search = "NOSEARCH";
        if (isset($_REQUEST['search']) && $_REQUEST['search'] !== "") {
            $search = $_REQUEST['search'];
        }
        $pageData->tree = $ORM->getPathsWithSearch($search);
        $this->_json($pageData);
    }

    public function getFavoritesAction(): void
    {
        $pageData = new stdClass();
        $ORM = new \Notesee\DocsRedbeanDAO();
        $pageData->paths = $ORM->getFavorites();
        $this->_json($pageData);
    }

    public function uploadImageAction(): void
    {
        // DevHelp::debugMsg('upload' . __FILE__);

        $filePath = $_POST["filePath"] . '/' ?? date(YEAR_MONTH_FORMAT);
        $targetDir = $_ENV['UPLOAD_DIR'] . $filePath;
        $urlFileName = strtolower(preg_replace('/\s+/', '_', trim(basename($_FILES["fileToUpload"]["name"]))));
        $targetFileFullPath = $_ENV['UPLOAD_DIR'] . $filePath . $urlFileName;

        $imageFileType = strtolower(pathinfo($targetFileFullPath, PATHINFO_EXTENSION));
        $validFileExt = array("jpg", "png", "jpeg", "gif");
        $createdDir = false;

        try {
            $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
            if ($check == false) {
                throw new Exception("File is not an image");
            }

            // Check if directory already exists
            if (!file_exists($targetDir)) {
                $createdDir = true;
                mkdir($targetDir, 0755);
            }

            // Check if file already exists
            if (file_exists($targetFileFullPath)) {
                throw new Exception(" file already exists." . "![](../uploads/" . $filePath . $urlFileName . ")" . ' of ' . $_ENV['UPLOAD_SIZE_LIMIT']);
            }

            // Check file size
            if ($_FILES["fileToUpload"]["size"] > $_ENV['UPLOAD_SIZE_LIMIT']) {
                throw new Exception("Sorry, your file is too large." . $_FILES["fileToUpload"]["size"] . ' of ' . $_ENV['UPLOAD_SIZE_LIMIT']);
            }
            // Allow certain file formats
            if (!in_array($imageFileType, $validFileExt)) {
                throw new Exception("only JPG, JPEG, PNG & GIF files are allowed");
            }

            if (!move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $targetFileFullPath)) {
                throw new Exception("Sorry, there was an error moving upload file");
            }
            \Logger::log("Uploaded: " . $filePath . $urlFileName);
            $data['fileName'] = $urlFileName;
            $data['filePath'] = $filePath;
            $data['createdDir'] = $createdDir;

            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo 'Caught exception: ', $e->getMessage(), $targetDir, '\n';
            echo 'targetFileFullPath: ', $targetFileFullPath, '\n';
        }
    }

    public function favoriteAction(): void
    {
        // Check if the required parameters (path, favorite) are set in the request
        if (!isset($_REQUEST['path'], $_REQUEST['favorite'])) {
            header('HTTP/1.0 400 Bad Request');
            echo "Missing required parameters (path, favorite)";
            exit;
        }

        $ORM = new \Notesee\DocsRedbeanDAO();
        $status = $ORM->favoriteByPath($_REQUEST['path'], $_REQUEST['favorite'] == 'true');

        if ($status) {
            // header('HTTP/1.0 204 No Content');
            header('HTTP/1.0 200 OK');
            echo $_REQUEST['path'] . ", " . $_REQUEST['favorite'];
        } else {
            header('HTTP/1.0 500 Server Error');
            echo "Unable to Favorite : " . $_REQUEST['path'];
        }
    }

    public function getByUpdateDateAction(): void
    {
        $startDate = $_REQUEST["startDate"] ?? date(DATE_FORMAT, strtotime('-1 week'));
        $endDate = $_REQUEST["endDate"] ?? date(DATE_FORMAT);
        $pageData = new stdClass();
        $ORM = new \Notesee\DocsRedbeanDAO();

        $pageData = new stdClass();
        $pageData->startDate = $startDate;
        $pageData->endDate = $endDate;
        $pageData->paths = $ORM->getDocsByUpdateDate($startDate, $endDate);
        $this->_json($pageData);
    }

    protected function _getTargetLinks(string $source): array
    {
        preg_match_all('/\[([^]]*)\] *\(([^)]*)\)/', $source, $matches);
        return $matches;
    }

    // Used in testing
    function addOne($number)
    {
        return $number + 1;
    }

    /**
     * Singleton
     * @return Wiki
     */
    public static function instance(): Wiki
    {
        static $instance;
        if (!($instance instanceof self)) {
            $instance = new self();
        }
        return $instance;
    }
}
