<?php

require '../vendor/autoload.php';
require_once '../library/ExternalData/YoutubeData.php';
require_once '../library/ExternalData/WordpressData.php';

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
define("APPLICATION_PATH", __DIR__ . "/..");
date_default_timezone_set('America/New_York');

// Ensure src/ is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
    APPLICATION_PATH ,
    APPLICATION_PATH . '/src',
    get_include_path(),
)));

use Symfony\Component\Yaml\Yaml;

// Load configs and add to the app container
$app = new \Slim\Slim(
    array(
        'view' => new Slim\Views\Twig(),
        'templates.path' => APPLICATION_PATH . '/views'
    )
);
$view = $app->view();
$configs = Yaml::parse(file_get_contents("../configs/configs.yml"));
$app->container->set('configs', $configs);

// This is where a persistence layer ACL check would happen on authentication-related HTTP request items
$authenticate = function ($app) {
    return function () use ($app) {
        if (false) {
            $app->halt(403, "Invalid security context");
        }
    };
};


$app->notFound(function () use ($app) {
    $app->render(
        'partials/404.html.twig'
    );
});

$app->get("/", $authenticate($app), function () use ($app) {

    // apc_clear_cache();

    $youtubeData = new YoutubeData();
    $wordpressData = new WordpressData();
    $configs = $app->container->get('configs');
    $app->render(
        'partials/index.html.twig',
        array(
            "configs" => $configs,
            "section" => "home",
            "embedCodes" => $configs['featured']['videos']['embed_codes'],
            "youtubeVideos" => $youtubeData->getVideos($configs['featured']['videos']['youtube']),
            "embedCodeVideos" => $configs['featured']['videos']['embed_codes'],
            "wordpressPosts" => $wordpressData->getPosts($configs['featured']['blogs']['wordpress'])
        ),
        200
    );
});

$app->get("/about", $authenticate($app), function () use ($app) {

    $configs = $app->container->get('configs');
    $app->render(
        'partials/about.html.twig',
        array(
            "configs" => $configs,
            "section" => "about"
        ),
        200
    );
});

$app->get("/contact", $authenticate($app), function () use ($app) {

    $configs = $app->container->get('configs');
    $app->render(
        'partials/contact.html.twig',
        array(
            "configs" => $configs,
            "section" => "contact"
        ),
        200
    );
});


$app->run();