<?php

// is cURL installed
if (!function_exists('curl_init')){
    die('Sorry cURL is not installed!');
}

$api_key = "lYfF8kAmPyRZ0Wr0G_9R";
$api_url = "http://$api_key:artsicle@www.artsicle.com/api/v1";

// create a new cURL resource handle
$ch = curl_init();

$url = $api_url."/art/pieces/popular";

// Set URL
curl_setopt($ch, CURLOPT_URL, $url);

// Include header in result
curl_setopt($ch, CURLOPT_HEADER, 0);

// Return the data
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// 10 second timeout
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

// Fetch resource
$output = curl_exec($ch);

// Close the cURL
curl_close($ch);

echo $output;

?>