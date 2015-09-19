<?php

require_once("Base.php");

class YoutubeData extends DataBase {

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
                "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" . urlencode(implode(",", $videoIds)) . "&key=AIzaSyCybIgvVt-vmF47yFzmKqGYXHe8r1LOzJs"
            )->send();
            $data = json_decode($response->getBody(true));
            $this->storeCache($cacheKey, $data->items);
            return $data->items;
        } else {
            return $cache;
        }
    }
}