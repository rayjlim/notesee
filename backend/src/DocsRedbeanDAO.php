<?php

namespace Notesee;

define('DOCS', 'ns_documents');
/**
 * DocsRedbeanDAO
 *
 * Docs implementation with Redbean 
 *
 * @category Personal
 * @package  Notesee
 * @author   Raymond Lim <rayjlim1@gmail.com>
 * @license  lilplaytime http://www.lilplaytime.com
 * @link     www.lilplaytime.com
 */
class DocsRedbeanDAO 
{
    /**
     * Insert a Record
     * 
     * @param $path    Logical Path
     * @param $content Markdown content
     *
     * @return Document Object
     */
    public function insert($path, $content)
    {
        $doc = \R::getRedBean()->dispense(DOCS);
        $doc->path = $path;
        $doc->content = $content;
        $id = \R::store($doc);
        $doc->id = $id;
        return $doc;
    }
    /**
     * Update a Record
     * 
     * @param $path    Logical Path
     * @param $content markdown content
     *
     * @return Document Object
     */
    public function update($path, $content)
    {
        $doc  = \R::findOne(DOCS, ' path = ? ', [ $path] );
        $doc->content = str_replace("\n", "\\n", $content);
        \R::store($doc);
        return $doc;
    }
    /**
     * Delete a Record
     * 
     * @param $id Record Id
     *
     * @return LogEntry
     */
    public function delete($id)
    {
        $log = \R::load(DOCS, $id);
        \R::trash($log);
    }

    /**
     * Get a Record by Id
     * 
     * @param $id Record Id
     *
     * @return LogEntry
     */
    public function getById($id)
    {
        $doc = \R::load(DOCS, $id);
        return $doc;
    }

    /**
     * Get a Document by Path
     * 
     * @param $path logical folder location
     *
     * @return Array Log entries
     */
    public function getByPath($path)
    {
        $logs = \R::findAll(
            DOCS,
            ' path = ?',
            [$path]
        );
        $sequencedArray = array_values(
            array_map(
                function ($item) {
                    return $item->export();
                },
                $logs
            )
        );
        return $sequencedArray;
    }
    /**
     * Get a Document by Path
     * 
     * @param $path logical folder location
     *
     * @return Array Log entries
     */
    public function getPaths()
    {
        $logs = \R::getCol('SELECT path from '.DOCS);
        return $logs;
    }
    
}
