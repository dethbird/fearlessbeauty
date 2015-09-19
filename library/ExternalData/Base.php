<?php

require_once(APPLICATION_PATH . "/library/Cache/Manager.php");

class DataBase {

    /**
     * Guzzle Http Client
    */
    protected $httpClient;
    protected $cacheManager;
    
    public function __construct()
    {
        $this->cacheManager = new CacheManager();
        $this->httpClient = new Guzzle\Http\Client();
    }

    protected function retrieveCache($key)
    {
        return $this->cacheManager->retrieve($key);
    }

    protected function storeCache($key, $data)
    {
        $this->cacheManager->store($key, $data);
    }
}