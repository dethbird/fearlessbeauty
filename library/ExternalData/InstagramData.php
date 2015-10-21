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
    public function getMedia($shortcodes, $maxwidth = 525)
    {
        $cacheKey = md5("instagramShortcodes:" . implode("|", $shortcodes) . $maxwidth);
        $cache = $this->retrieveCache($cacheKey);

        if(!$cache) {
            foreach ($shortcodes as $id) {
                $response = $this->httpClient->get( 'http://api.instagram.com/publicapi/oembed/?url=' . $id . '&maxwidth=' .$maxwidth )->send();
                $response = json_decode($response->getBody(true));
                $data[] = $response;
            }
            $this->storeCache($cacheKey, $data);
            return $data;
        } else {
            return $cache;
        }
    }

    /**
     *
     * @param  $userId Instagram user id
     * @return array() a collection of recent instagram posts by user id
     */
    public function getRecentMedia($userId, $count = 6, $maxwidth = 525)
    {
        $cacheKey = md5("instagramRecent:".$userId.$count.$maxwidth);
        $cache = $this->retrieveCache($cacheKey, 86400);

        if(!$cache) {
            $response = $this->httpClient->get( 'https://api.instagram.com/v1/users/' . $userId . '/media/recent/?client_id=' . $this->clientId . '&count=' . $count )->send();
            $response = json_decode($response->getBody(true));
            $data = $response->data;
            $this->storeCache($cacheKey, $data);
        } else {
            $data = $cache;
        }

        // loop through and extract links
        $links = array();
        foreach ($data as $item) {
            $links[] = $item->link;
        }
        // return media
        return $this->getMedia($links, $maxwidth);

    }
}
