<?php

/**
 * Requires your Wordpress blog has the https://github.com/WP-API/WP-API plugin
 */

require_once("Base.php");

class WordpressData extends DataBase {

    private $baseUrl;

    public function __construct($baseUrl)
    {
        $this->baseUrl = $baseUrl;
        parent::__construct();
    }

    /**
     *
     * @return array() a collection of blog post objects decoded from the wordpress api response
     */
    public function getPosts($ids)
    {
        $cacheKey = "wordpressPosts:".implode("|", $ids);
        $cache = $this->retrieveCache($cacheKey);

        if(!$cache) {
            // echo $cacheKey; die();
            foreach ($ids as $id) {
                $response = $this->httpClient->get($this->baseUrl . '/wp-json/wp/v2/posts/' . $id)->send();
                $response = json_decode($response->getBody(true));

                if($response->featured_image > 0) {
                    $mediaResponse = $this->httpClient->get($this->baseUrl . '/wp-json/wp/v2/media/' . $response->featured_image)->send();
                    $response->featured_image = json_decode($mediaResponse->getBody(true));
                }

                $data[] = $response;
            }
            $this->storeCache($cacheKey, $data);
            return $data;
        } else {
            return $cache;
        }
    }
}
