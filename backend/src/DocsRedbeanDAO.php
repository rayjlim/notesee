<?php

namespace Notesee;

define('DOCS', 'ns_documents');
define('MAPPING', 'ns_maps');
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
        $doc  = \R::findOne(DOCS, ' path = ? ', [$path]);
        $doc->content = str_replace("\n", "\\n", $content);
        \R::store($doc);
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
        $found = \R::findAll(
            DOCS,
            ' path = ?',
            [$path]
        );
        $sequencedArray = array_values(
            array_map(
                function ($item) {
                    return $item->export();
                },
                $found
            )
        );
        return $sequencedArray;
    }

    /**
     * Delete a Document by Path
     * 
     * @param $path logical folder location
     *
     * @return Boolean was successful
     */
    public function deleteByPath($path)
    {
        $doc  = \R::findOne(DOCS, ' path = ? ', [$path]);
        \R::trash($doc);
        return true;
    }

    /**
     * Get All Paths
     *
     * @return Array[Strings] Paths
     */
    public function getPaths()
    {
        $found = \R::getCol('SELECT path from ' . DOCS . ' order by path');
        return $found;
    }

    public function getMaps()
    {
        $found = \R::findAll(MAPPING);
        $sequencedArray = array_values(
            array_map(
                function ($item) {
                    return $item->export();
                },
                $found
            )
        );
        return $sequencedArray;
    }

    public function getBacklinks($path)
    {
        $found = \R::getCol('SELECT source from ' . MAPPING . ' where target = \'' . $path . '\'');
        return $found;
    }

    public function getForwardlinks($path)
    {
        $found = \R::getCol('SELECT target from ' . MAPPING . ' where source = \'' . $path . '\'');
        return $found;
    }
    public function addMapping($source, $target)
    {
        $mapping = \R::getRedBean()->dispense(MAPPING);
        $mapping->source = $source;
        $mapping->target = $target;
        $id = \R::store($mapping);
        return $id;
    }

    public function deleteMapping($source, $target)
    {
        $mapping  = \R::findOne(MAPPING, ' source = ? AND target = ?', [$source, $target]);
        \R::trash($mapping);
    }

    public function deleteSourceMapping($source)
    {
        $mappings  = \R::find(MAPPING, ' source = ? ', [$source]);
        foreach ($mappings as $mapping) {
            \R::trash($mapping);
        }
    }
    
    // SEARCH
    public function contentsContains($text)
    {
        $found = \R::find(DOCS, ' content LIKE ? ', ['%' . $text . '%']);
        return $found;
    }
}
