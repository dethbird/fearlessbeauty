<?php

class CacheManager {

    private function filepath($key) 
    {
        return APPLICATION_PATH . "/cache/" . md5($key);
    }

    public function retrieve($key)
    {
        if(file_exists($this->filepath($key))) {
            return unserialize(file_get_contents($this->filepath($key)));
        } else {
            return false;
        }
    }

    public function store($key, $data)
    {
        file_put_contents($this->filepath($key), serialize($data));
    }
}