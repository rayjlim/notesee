<?php
if (!defined('APP_STARTED')) {
    die('Forbidden!');
}

class Wiki
{

    protected $_ignore = "/^\..*|^CVS$/"; // Match dotfiles and CVS
    protected $_force_unignore = false; // always show these files (false to disable)

    protected $_action;

    protected $_default_page_data = array(
        'title' => false, // will use APP_NAME by default
        'description' => 'Wikitten is a small, fast, PHP wiki.',
        'tags' => array('wikitten', 'wiki'),
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

                // todo: Better error information?
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
            echo '\n\n'.$content.'\n\n';
            throw new Exception("View $view not found");
        }
    }

    protected function _getTree($dir = LIBRARY)
    {
        $return = array('directories' => array(), 'files' => array());

        $items = scandir($dir);
        foreach ($items as $item) {
            if (preg_match($this->_ignore, $item)) {
                if ($this->_force_unignore === false || !preg_match($this->_force_unignore, $item)) {
                    continue;
                }
            }

            $path = $dir . DIRECTORY_SEPARATOR . $item;
            if (is_dir($path)) {
                $return['directories'][$item] = $this->_getTree($path);
                continue;
            }

            $return['files'][$item] = $item;
        }

        uksort($return['directories'], "strnatcasecmp");
        uksort($return['files'], "strnatcasecmp");

        return $return['directories'] + $return['files'];
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
        echo(is_string($data) ? $data : json_encode($data));
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
        header('HTTP/1.0 '.$code.' '.$message, true);
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
        $page = str_replace("###" . APP_DIR . "/", "", "###" . urldecode($request['path']));

        // if (!$page) {
        //     if (file_exists(LIBRARY . DIRECTORY_SEPARATOR . DEFAULT_FILE)) {
        //         $this->_render(DEFAULT_FILE);
        //         return;
        //     }

        //     $this->_view('index', array(
        //         'page' => $this->_default_page_data
        //     ));
        //     return;
        // }

        try {
            $this->_render($page);
        } catch (Exception $e) {
            $this->_404($e->getMessage());
        }
    }

    /**
     * /?a=edit
     */
    public function editAction()
    {
        // echo 'edit action';
        $ORM = new \Notesee\DocsRedbeanDAO();
        
        // Bail out early if we don't get the right request method && params
        if ($_SERVER['REQUEST_METHOD'] != 'POST'
            || empty($_POST['ref']) || !isset($_POST['source'])
        ) {
            
            throw new Exception("Invalid/Missing parameters");
        }

        $ref = $_POST['ref'];        // path in the library
        $source = $_POST['source'];  // markdown content

        $file = base64_decode($ref);

        // Check if the file is safe to work with, otherwise just
        // give back a generic 404 aswell, so we don't allow blind
        // scanning of files:
        // @todo: we CAN give back a more informative error message
        // for files that aren't writable...


        // Check if empty
        if(trim($source)){
            // TODO: error handling
            // TODO: Update Tree cache
            $entry = $ORM->update($file, $source);
            $entry->action = 'edit';
            $entry->status = 'success';
            $this->_json($entry);

        }else{
            echo 'Content was empty, Delete Document?';
            // Delete file and redirect too (but it will return 404)
            // unlink($path);
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

        if(count($entrys)){
            throw new Error('record exists');
        }
        // TODO: error handling
        // TODO: Update Tree cache
        $entry = $ORM->insert($page, $content);
        $entry->action = 'create';
        $entry->status = 'success';
        $this->_json($entry);      
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

    protected function _render($page)
    {
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

        
        
        $extension = substr($page, strrpos($page, '.') + 1, 20);
        // echo ' check extension'. $extension;
        if (false === $extension) {
            // $not_found();
            throw new Exception('No Extension');
        }

        if ( $extension != 'md') {
            $path = realpath(LIBRARY . DIRECTORY_SEPARATOR . $page);
            $finfo = finfo_open(FILEINFO_MIME);
            $mime_type = trim(finfo_file($finfo, $path));


            echo ('pass through: '.$mime_type);
            // not an ASCII file, send it directly to the browser
            $file = fopen($path, 'rb');

            header("Content-Type: $mime_type");
            header("Content-Length: " . filesize($path));

            fpassthru($file);
            exit();
        }

        // echo "Page: ". $page;
        $entrys = $ORM->getByPath($page);

        $source="";
        if(!count($entrys) == 0){
            $source = $entrys[0]['content'];
        }

        $pageData = new stdClass();
        $pageData->page = $this->_default_page_data;
        $pageData->parts = ["index.md"];
        $pageData->tree = "[]";
        $pageData->source = str_replace("\\n", "\n", $source);;
        
        $this->_json($pageData);

    }
}
