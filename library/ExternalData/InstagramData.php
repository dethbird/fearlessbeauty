<?php

require_once("Base.php");

class InstagramData extends DataBase {

    private $clientId;

    public function __construct($clientId)
    {
        $this->clientId = $clientId;
        parent::__construct();
    }

    /**
     *
     * @return array() a collection of media objects decoded from the youtube api response
     */
    public function getMedia($shortcodes)
    {
        $cacheKey = md5("instagramShortcodes:".implode("|", $shortcodes));
        $cache = $this->retrieveCache($cacheKey);

        if(!$cache) {
            foreach ($shortcodes as $id) {
                $response = $this->httpClient->get( 'https://api.instagram.com/v1/media/shortcode/' . $id . '?client_id=' . $this->clientId )->send();
                $response = json_decode($response->getBody(true));
                $data[] = $response->data;
            }
            $this->storeCache($cacheKey, $data);
            return $data;
        } else {
            return $cache;
        }
    }
}