<?php

require_once("Base.php");

class WordpressData extends DataBase {

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
                $response = $this->httpClient->get('http://fearlessbeautyblog.artistcontrolbox.com/wp-json/wp/v2/posts/' . $id)->send();
                $response = json_decode($response->getBody(true));

                if($response->featured_image > 0) {
                    $mediaResponse = $this->httpClient->get('http://fearlessbeautyblog.artistcontrolbox.com/wp-json/wp/v2/media/' . $response->featured_image)->send();
                    $response->featured_image = json_decode($mediaResponse->getBody(true));
                }

                $data[] = $response;
            }
            $this->storeCache($cacheKey, $data, 86400);
            return $data;
        } else {
            return $cache;
        }
    }
}