<?php

namespace Notesee;

define('DOCS', 'ns_documents');
/**
 * LogsRedbeanDAO
 *
 * Logs implementation with Redbean 
 *
 * @category Personal
 * @package  Tracker
 * @author   Raymond Lim <rayjlim1@gmail.com>
 * @license  lilplaytime http://www.lilplaytime.com
 * @link     www.lilplaytime.com
 */
class DocsRedbeanDAO 
{
    /**
     * Insert a Record
     * 
     * @param $goalId  Goal Id
     * @param $date    Date
     * @param $count   Number
     * @param $comment String
     *
     * @return LogEntry
     */
    public function insert($goalId, $date, $count, $comment)
    {
        $log = \R::getRedBean()->dispense(DOCS);
        $log->goal = $goalId;
        $log->points = 0;
        $log->count = $count;
        $log->comment = $comment;
        $log->date = $date;
        $id = \R::store($log);
        $log->id = $id;
        return $log;
    }
    /**
     * Update a Record
     * 
     * @param $goal    Goal Id
     * @param $date    Date
     * @param $count   Number
     * @param $comment String
     * @param $id      Record Id
     *
     * @return LogEntry
     */
    public function update($path, $content)
    {
        $doc  = \R::findOne(DOCS, ' path = ? ', [ $path] );

        // var_dump( $found);
        // $doc = $found[0];
        // echo ' rb: '. $value;
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
        $log = \R::load(DOCS, $id);
        return $log;
    }


    /**
     * Get a Record by Date Range
     * 
     * @param $params array holding parameters
     *                ['goal'] String goal name
     *                ['start'] String start date range
     *                ['end'] String end of date range
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
     * Get Metrics for Monthly Average
     * 
     * @param $params array holding parameters
     *                ['goal'] String goal name
     *                ['start'] String start date range
     *                ['end'] String end of date range
     *
     * @return Array Month / Average by Month
     */
    public function getMonthTrend($params)
    {
        $logs = \R::getAll(
            '
        SELECT AVG( count ) AS average, month(DATE) as month
        FROM  cpc_logs 
        WHERE goal like ?
             AND year(date) BETWEEN ? AND ? 
        GROUP by month(date) 
        ORDER by month(date) ',
            [$params['goal'], $params['start'], $params['end']]
        );

        return $logs;
    }

    /**
     * Get Metrics for Yearly Average
     * 
     * @param $params array holding parameters
     *                ['goal'] String goal name
     *                ['start'] String start date range
     *                ['end'] String end of date range
     *
     * @return Array Year / Average by each Year
     */
    public function getYearTrend($params)
    {
        $logs = \R::getAll(
            '
        SELECT year(date) as year, avg(count) as average 
        FROM `cpc_logs` 
        WHERE goal = ? 
        AND year(date) between ? AND ? 
        GROUP by YEAR(date) 
        ORDER by YEAR(date) ',
            [$params['goal'], $params['start'], $params['end']]
        );

        return $logs;
    }

}
