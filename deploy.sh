#!/bin/bash

#initial cleanup
rm -rf vendor
rm -rf cache
rm -rf composer.lock

#get composer
curl -sS https://getcomposer.org/installer | php
php composer.phar install

#cache directories
mkdir cache
chmod 777 cache

#cleanup
rm -rf composer.phar