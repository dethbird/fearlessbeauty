<?php

require '../vendor/autoload.php';

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
    $app->render(
        'partials/index.html.twig',
        $app->container->get('configs'),
        200
    );
});

$app->get("/comics/:name", $authenticate($app), function ($name) use ($app) {
    $configs = $app->container->get('configs');
    if(!array_key_exists($name, $configs["comics"])){
        $app->notFound();
    } else {
        $app->render(
            'partials/comics.html.twig',
            array("comic" => $configs["comics"][$name]),
            200
        );
    }
});

$app->get("/resume", $authenticate($app), function () use ($app) {
    $resume = Yaml::parse(file_get_contents("../configs/resume.yml"));

    if ($app->request->isAjax()) {
        $app->response->headers->set('Content-Type', 'application/json');
        $app->response->setBody(json_encode($resume));
    } else {
        $app->render(
            'partials/resume.html.twig',
            $resume,
            200
        );
    }
});

$app->get("/posts/:type", $authenticate($app), function ($type) use ($app) {

    $client = new Guzzle\Http\Client();
    $app->response->headers->set('Content-Type', 'application/json');
    $data = array();

    foreach ($app->request->params('ids') as $id) {
        if($type=="instagram") {
            $response = $client->get('https://api.instagram.com/v1/media/shortcode/' . $id . '?client_id=a6c4e37cd91b4020a09a74a40cf836d6')->send();
            $response = json_decode($response->getBody(true));
            $data[] = $response->data;
        } else if( $type=="wordpress" ) {
            $response = $client->get('http://blog.rishisatsangi.com/wp-json/wp/v2/posts/' . $id)->send();
            $response = json_decode($response->getBody(true));

            if($response->featured_image > 0) {
                $mediaResponse = $client->get('http://blog.rishisatsangi.com/wp-json/wp/v2/media/' . $response->featured_image)->send();
                $response->featured_image = json_decode($mediaResponse->getBody(true));
            }

            $data[] = $response;
        }
    };

    $app->response->setBody(json_encode($data));

});



$app->run();