<?php

namespace Notesee;
use \RedBeanPHP\R as R;
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
        $doc = R::getRedBean()->dispense(DOCS);
        $doc->path = $path;
        $doc->content = $content;

        $doc->update_date = (new \DateTime())->format(DATE_FORMAT);
        $doc->isFavorite = false;
        $id = R::store($doc);

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
        $doc  = R::findOne(DOCS, ' path = ? ', [$path]);
        if ($doc) {
            $doc->content = str_replace("\n", "\\n", $content);
            $doc->update_date = (new \DateTime())->format(FULL_DATETIME_FORMAT);
            R::store($doc);
            return $doc;
        } else {
            throw new \Exception("Document not found");
        }
    }

    /**
     * Favorite a Record
     * 
     * @param $path    Logical Path
     * @param $content markdown content
     *
     * @return Document Object
     */
    public function favoriteByPath($path, $favorite)
    {
        $doc = R::findOne(DOCS, ' path = ? ', [$path]);

        $doc->isFavorite = $favorite == 'true' ? 1 : 0;
        // echo $doc;
        R::store($doc);
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
        $found = R::findAll(
            DOCS,
            ' path = ?',
            [$path]
        );
        return R::exportAll($found);

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
        $doc  = R::findOne(DOCS, ' path = ? ', [$path]);
        R::trash($doc);
        return true;
    }

    /**
     * Get All Paths
     *
     * @return Array[Strings] Paths
     */
    public function getPaths()
    {
        $found = R::getCol('SELECT path from ' . DOCS . ' order by path');
        return $found;
    }

    public function getMaps()
    {
        $found = R::findAll(MAPPING);
        return R::exportAll($found);
    }

    public function getBacklinks($path)
    {
        $found = R::getCol('SELECT source from ' . MAPPING . ' where target = \'' . $path . '\'');
        return $found;
    }

    public function getFavorites()
    {
        $found = R::getCol('SELECT path FROM ' . DOCS . ' WHERE `is_favorite` = 1 ORDER BY `path` ASC');
        return $found;
    }

    public function getForwardlinks($path)
    {
        $found = R::getCol('SELECT target from ' . MAPPING . ' where source = \'' . $path . '\'');
        return $found;
    }
    public function addMapping($source, $target)
    {
        $mapping = R::getRedBean()->dispense(MAPPING);
        $mapping->source = $source;
        $mapping->target = $target;
        $id = R::store($mapping);
        return $id;
    }

    public function deleteMapping($source, $target)
    {
        $mapping  = R::findOne(MAPPING, ' source = ? AND target = ?', [$source, $target]);
        R::trash($mapping);
    }

    public function deleteSourceMapping($source)
    {
        $mappings  = R::find(MAPPING, ' source = ? ', [$source]);
        foreach ($mappings as $mapping) {
            R::trash($mapping);
        }
    }
    
    // SEARCH
    public function contentsContains($text)
    {
        $found = R::find(DOCS, ' content LIKE ? ', ['%' . $text . '%']);
        return $found;
    }
}
