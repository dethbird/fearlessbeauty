<?php

require_once("Base.php");

class YoutubeData extends DataBase {

    private $apiKey;

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;
        parent::__construct();
    }
    /**
     *
     * @return array() a collection of video objects decoded from the youtube api response
     */
    public function getVideos($videoIds)
    {
        $cacheKey = "youtubeVideos:".implode("|", $videoIds);
        $cache = $this->retrieveCache($cacheKey);

        if(!$cache) {
            $client = new Guzzle\Http\Client();
            $response = $this->httpClient->get(
                "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" . urlencode(implode(",", $videoIds)) . "&key=" . $this->apiKey
            )->send();
            $data = json_decode($response->getBody(true));
            $this->storeCache($cacheKey, $data->items);
            return $data->items;
        } else {
            return $cache;
        }
    }
}