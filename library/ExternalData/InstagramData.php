<?php

require_once("Base.php");

class InstagramData extends DataBase {

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
                $response = $this->httpClient->get('https://api.instagram.com/v1/media/shortcode/' . $id . '?client_id=a6c4e37cd91b4020a09a74a40cf836d6')->send();
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