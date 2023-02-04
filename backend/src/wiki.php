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
    protected function _extractJsonFrontMatter($source)
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

    protected function _view($view, $variables = array())
    {
        extract($variables);

        $content = __DIR__ . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . "$view.php";

        if (!isset($layout)) {
            $layout = __DIR__ . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'layout.php';
        }

        if (file_exists($content)) {
            ob_start();

            include($content);
            $content = ob_get_contents();
            ob_end_clean();

            if ($layout) {
                include $layout;
            } else {
                echo $content;
            }
        } else {
            echo '\n\n' . $content . '\n\n';
            throw new Exception("View $view not found");
        }
    }

    protected function _getTree()
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $paths = $ORM->getPaths();
        return $paths;
    }

    protected function _getFavorites()
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $paths = $ORM->getFavorites();
        return $paths;
    }

    protected function _getBacklinks($path)
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $links = $ORM->getBacklinks($path);
        return $links;
    }
    public function dispatch()
    {
        $action = $this->_getAction();
        $actionMethod = "{$action}Action";

        if ($action === null || !method_exists($this, $actionMethod)) {
            $this->_404();
        }

        $this->$actionMethod();
    }

    protected function _getAction()
    {
        if (isset($_REQUEST['a'])) {
            $action = $_REQUEST['a'];

            if (in_array("{$action}Action", get_class_methods(get_class($this)))) {
                $this->_action = $action;
            }
        } else {
            $this->_action = 'index';
        }
        return $this->_action;
    }

    protected function _json($data = array())
    {
        header("Content-type: text/x-json");
        echo (is_string($data) ? $data : json_encode($data));
        exit();
    }

    protected function _isXMLHttpRequest()
    {
        if ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {
            return true;
        }

        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if ($headers['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {
                return true;
            }
        }

        return false;
    }

    protected function _404($message = 'Page not found.')
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

    protected function _ErrorCode($code, $message = 'Page not found.')
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

    public function indexAction()
    {
        $request = parse_url($_SERVER['REQUEST_URI']);

        $pagePath = str_replace("###" . APP_DIR . "/", "", "###" . urldecode($request['path']));
        if (str_ends_with($pagePath, '/')) {
            $pagePath .= $_ENV['DEFAULT_FILE'];
        }

        try {

            $ORM = new \Notesee\DocsRedbeanDAO();
            // $parts = explode('/', $page);

            // $not_found = function () use ($page) {
            //     $page = htmlspecialchars($page, ENT_QUOTES);
            //     // throw new Exception("Page '$page' was not found");
            // };

            // Handle directories by showing a neat listing of its
            // contents
            // if (is_dir($path)) {
            //     echo "is dir";
            //     if (!file_exists($path)) {
            //         $not_found();
            //     }

            //     if (file_exists($path . DIRECTORY_SEPARATOR . 'index.md')) {
            //         return $this->_render('index.md');
            //     }

            //     // Get a printable version of the actual folder name:
            //     $dir_name = htmlspecialchars(end($parts), ENT_QUOTES, 'UTF-8');

            //     // Get a printable version of the rest of the path,
            //     // so that we can display it with a different appearance:
            //     $rest_parts = array_slice($parts, 0, count($parts) - 1);
            //     $rest_parts = htmlspecialchars(join("/", $rest_parts), ENT_QUOTES, 'UTF-8');

            //     // Pass this to the render view, cleverly disguised as just
            //     // another page, so we can make use of the tree, breadcrumb,
            //     // etc.
            //     $page_data = $this->_default_page_data;
            //     $page_data['title'] = 'Listing: ' . $dir_name;

            //     $files = scandir($path);
            //     $list = "<h2>I'm just an empty folder</h2>\n";
            //     if (2 < count($files)) {
            //         $list = "<h2>I'm a folder and I have</h2><ul>\n";
            //         foreach ($files as $file) {
            //             if (preg_match('/^\..*$/', $file)) {
            //                 continue;
            //             }
            //             $list .= "<li><a href=\"". $_SERVER['REQUEST_URI'] ."/${file}\">${file}</a></li>\n";
            //         }
            //         $list .= "</ul>\n";
            //     }

            //     $this->_view('render', array(
            //         'parts' => $parts,
            //         'page' => $page_data,
            //         'html' => $list,
            //         'is_dir' => true
            //     ));
            //     return;
            // }

            $extension = substr($pagePath, strrpos($pagePath, '.') + 1, 20);
            // echo ' check extension'. $extension;
            if (false === $extension) {
                // $not_found();
                throw new Exception('No Extension');
            }

            if ($extension != 'md') {
                $path = realpath(LIBRARY . DIRECTORY_SEPARATOR . $pagePath);
                // echo "path: " .$path;
                $finfo = finfo_open(FILEINFO_MIME);
                // $mime_type = trim(finfo_file($finfo, $path));


                // echo ('pass through: ' . $mime_type);
                // not an ASCII file, send it directly to the browser
                // $file = fopen($path, 'rb');

                // header("Content-Type: $mime_type");
                // header("Content-Length: " . filesize($path));

                // fpassthru($file);
                exit();
            }

            // echo "Page: ". $page;
            $entrys = $ORM->getByPath($pagePath);

            $source = "";
            if (count($entrys) !== 0) {
                $source = $entrys[0]['content'];
            }else{
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

            $this->_json($pageData);
        } catch (Exception $e) {
            $this->_404($e->getMessage());
        }
    }

    /**
     * /?a=edit
     */
    public function editAction()
    {
        $ORM = new \Notesee\DocsRedbeanDAO();

        // Bail out early if we don't get the right request method && params
        if (
            $_SERVER['REQUEST_METHOD'] != 'POST'
            || empty($_POST['ref']) || !isset($_POST['source'])
        ) {
            throw new Exception("Invalid/Missing parameters");
        }

        $ref = $_POST['ref'];        // path in the note
        $source = $_POST['source'];  // markdown content

        $path = base64_decode($ref);

        // Check if the file is safe to work with, otherwise just
        // give back a generic 404 as well, so we don't allow blind
        // scanning of files:

        // Check if empty
        \Logger::log("Edit: " . $path);
        if (trim($source)) {
            $entry = $ORM->update($path, $source);

            // get prefix            
            $prefix =  substr($path, 0, strrpos($path, '/'));
            $prefix = strlen($prefix) ? $prefix . '/' : $prefix;

            // get backlinks
            $links = $this->getTargetLinks($source);

            $prefixedLinks = [];

            foreach ($links[2] as $link) {
                if (
                    strpos($link, "http://") === false
                    && strpos($link, "https://") === false
                    && strpos($link, "#") === false
                ) {
                    $targetValue = ($link[0] == '/') ? ltrim($link, '/') : $prefix . $link;
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
    public function createAction()
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $request    = parse_url($_SERVER['REQUEST_URI']);
        $page       = str_replace("###" . APP_DIR . "/", "", "###" . urldecode($request['path']));

        $content    = "# " . htmlspecialchars($page, ENT_QUOTES, 'UTF-8');

        $entrys = $ORM->getByPath($page);

        if (count($entrys)) {
            throw new Error('record exists');
        }
        $entry = $ORM->insert($page, $content);
        \Logger::log("Created: " . $page);
        $entry->action = 'create';
        $entry->status = 'success';
        $this->_json($entry);
    }

    public function networkAction()
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $entrys = $ORM->getMaps();
        $this->_json($entrys);
        // echo "network info";
    }

    public function searchAction()
    {
        $ORM = new \Notesee\DocsRedbeanDAO();
        $text = $_REQUEST['text'];
        $entrys = $ORM->contentsContains($text);

        $reduced_columns = array_map(function ($n) {
            return ($n->path);
        }, $entrys);
        // print_r($b);

        $this->_json($reduced_columns);
        // echo "search info = ".$text;
    }

    public function deleteAction()
    {
        $path = $_REQUEST['path'];
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

    public function getTreeAction()
    {
        $pageData = new stdClass();
        $pageData->tree = $this->_getTree();
        $this->_json($pageData);
    }

    public function getFavoritesAction()
    {
        $pageData = new stdClass();
        $pageData->paths = $this->_getFavorites();
        $this->_json($pageData);
    }


    public function uploadImageAction()
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

    public function favoriteAction()
    {
        // Check if the required parameters (path, favorite) are set in the request
        if (!isset($_REQUEST['path'], $_REQUEST['favorite'])) {
            header('HTTP/1.0 400 Bad Request');
            echo "Missing required parameters (path, favorite)";
            exit;
        }

        $ORM = new \Notesee\DocsRedbeanDAO();
        $status = $ORM->favoriteByPath($_REQUEST['path'], $_REQUEST['favorite']);

        if ($status) {
            // header('HTTP/1.0 204 No Content');
            header('HTTP/1.0 200 OK');
            echo $_REQUEST['path'] . $_REQUEST['favorite'];
        } else {
            header('HTTP/1.0 500 Server Error');
            echo "Unable to Favorite : " . $_REQUEST['path'];
        }
    }

    protected function getTargetLinks($source)
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
    public static function instance()
    {
        static $instance;
        if (!($instance instanceof self)) {
            $instance = new self();
        }
        return $instance;
    }
}
