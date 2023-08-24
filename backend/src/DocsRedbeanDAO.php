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
     * @param string $path    Logical Path
     * @param string $content Markdown content
     *
     * @return object Document with new id
     */
    public function insert(string $path, string $content): object
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
     * @param string $path    Logical Path
     * @param string $content Markdown content
     *
     * @return object Document Object
     */
    public function update(string $path, string $content): object
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
     * @param string $path    Logical Path
     * @param bool $favorite  is setting/unsetting to favorite 
     *
     * @return object Document Object
     */
    public function favoriteByPath(string $path, bool $favorite): object
    {
        $doc = R::findOne(DOCS, ' path = ? ', [$path]);

        $doc->isFavorite = $favorite == 'true' ? 1 : 0;
        // echo $doc;
        R::store($doc);
        return $doc;
    }

    /**
     * Get Docs By Update Date
     * 
     * @param string $startDate    Range Starting Date
     * @param string $endDate Range End date
     *
     * @return array Documents found
     */
    public function getDocsByUpdateDate($startDate, $endDate): array
    {
        $found = R::find(DOCS, ' update_date >= ? AND update_date <= ? ORDER BY `update_date` ASC', [$startDate, $endDate]);

        return R::exportAll($found);
    }
    

    /**
     * Get a Document by Path
     * 
     * @param $path logical folder location
     *
     * @return array Log entries
     */
    public function getByPath(string $path): array
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
     * @param string $path logical folder location
     *
     * @return bool was successful?
     */
    public function deleteByPath(string $path): bool
    {
        $doc  = R::findOne(DOCS, ' path = ? ', [$path]);
        R::trash($doc);
        return true;
    }

    /**
     * Get All Paths
     *
     * @return array[Strings] Paths
     */
    public function getPaths(): array
    {
        $found = R::getCol('SELECT path from ' . DOCS . ' order by path');
        return $found;
    }

    public function getMaps(): array
    {
        $found = R::getAll('select target, source from ' . MAPPING . '');
        return $found;

    }

    public function getBacklinks($path): array
    {
        $found = R::getCol('SELECT source from ' . MAPPING . ' where target = \'' . $path . '\'');
        return $found;
    }

    public function getFavorites(): array
    {
        $found = R::getCol('SELECT path FROM ' . DOCS . ' WHERE `is_favorite` = 1 ORDER BY `path` ASC');
        return $found;
    }

    public function getForwardlinks(string $path): array
    {
        $found = R::getCol('SELECT target from ' . MAPPING . ' where source = \'' . $path . '\'');
        return $found;
    }
    public function addMapping(string $source, string $target): int
    {
        $mapping = R::getRedBean()->dispense(MAPPING);
        $mapping->source = $source;
        $mapping->target = $target;
        $id = R::store($mapping);
        return $id;
    }

    public function deleteMapping(string $source, string $target): void
    {
        $mapping  = R::findOne(MAPPING, ' source = ? AND target = ?', [$source, $target]);
        R::trash($mapping);
    }

    public function deleteSourceMapping(string $source): void
    {
        $mappings  = R::find(MAPPING, ' source = ? ', [$source]);
        foreach ($mappings as $mapping) {
            R::trash($mapping);
        }
    }
    
    // SEARCH
    public function contentsContains(string $text): array
    {
        $found = R::find(DOCS, ' content LIKE ? ', ['%' . $text . '%']);
        return $found;
    }

    /**
     * Get All Paths with search option
     *
     * @return array[Objects] Paths
     */
    public function getPathsWithSearch(string $searchParam): array
    {
        $found = R::getAll('SELECT id, path, CASE WHEN content like \'%' 
            . $searchParam
            .'%\' THEN 1 ELSE 0 END as hasString FROM ' 
            . DOCS 
            . ' order by path');
            return $found;
    }
}
