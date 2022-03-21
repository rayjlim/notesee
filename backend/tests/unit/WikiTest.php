<?php

class WikiTest extends \Codeception\Test\Unit
{
    /**
     * @var \UnitTester
     */
    protected $tester;
    
    protected function _before()
    {
    }

    protected function _after()
    {
    }

    // tests
    public function testAddOne()
    {
        $wiki = new Wiki();
        $this->assertEquals($wiki->addOne(1), 2);
        
    }
}