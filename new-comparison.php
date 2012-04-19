<?php

// is cURL installed
if (!function_exists('curl_init')){
    die('Sorry cURL is not installed!');
}

$api_key = "lYfF8kAmPyRZ0Wr0G_9R";
$api_url = "http://$api_key:artsicle@www.artsicle.com/api/v1";

$email = isset($_GET['email']) ? trim($_GET['email']) : '';

function new_user() 
{ 
	global $api_url;
	global $email;
	// create a new cURL resource handle 
	$ch = curl_init();
  
	$url = $api_url."/user/new";
  
	// Set URL
	curl_setopt($ch, CURLOPT_URL, $url);
	 
	if ($email)
	{
		$data = array('email' => $email);
		curl_setopt($ch, CURLOPT_POST, 1); 
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 
	}
	
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
 
	$obj = json_decode($output, true);
	$user_id = $obj['user'];
	
	if ($email)
	{
		$_SESSION['email'] = $email;
	}
	
	return $user_id;
}

$user_id = "";

session_start();

if ($email && !isset($_SESSION['email'])) {
	$user_id = new_user();
    $_SESSION['user'] = $user_id;
}
elseif (isset($_SESSION['user']))
{
    $user_id = $_SESSION['user'];
}
else
{
    $user_id = new_user();
    $_SESSION['user'] = $user_id;
}

//echo "User id: ".$user_id;

// create a new cURL resource handle
$ch = curl_init();

$url = $api_url."/discovery_game/comparison/new";

// Set URL
curl_setopt($ch, CURLOPT_URL, $url);

// Set POST parameters
$data = array('user' => $user_id);
curl_setopt($ch, CURLOPT_POST, 1); 
curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 

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