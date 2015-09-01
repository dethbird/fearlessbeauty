<?php

class DataBase {

    /**
     * Guzzle Http Client
    */
    protected $httpClient;
    
    public function __construct()
    {
        $this->httpClient = new Guzzle\Http\Client();
    }

    protected function retrieveCache($key)
    {
        return apc_fetch($key);
    }

    protected function storeCache($key, $data, $ttl)
    {
        apc_store($key, $data, $ttl);
    }
}