<?php 

require 'fb/facebook.php';

$facebook = new Facebook(array(
    'appId'  => '411664055513252',
    'secret' => '7e8b0e70e147953329f73de98a9d45b6',
));

// Get User ID
$user = $facebook->getUser();

if ($user) {
    try {
        //Proceed knowing you have a logged in user who's authenticated.
        $user_profile = $facebook->api('/me');
        ?><pre><?php
        print_r($user_profile);
        ?></pre><?php
    } catch (FacebookApiException $e) {
        error_log($e);
        $user = 0;
    }
}