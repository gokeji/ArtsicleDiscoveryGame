<?php

require 'fb/facebook.php';

$email = 0;

session_start();

$facebook = new Facebook(array(
  'appId'  => '411664055513252',
  'secret' => '7e8b0e70e147953329f73de98a9d45b6',
));

// Get User ID
$fb_user = $facebook->getUser();

if ($fb_user) {
    try {
        //Proceed knowing you have a logged in user who's authenticated.
        $user_profile = $facebook->api('/me');
        $email = $user_profile['email'];
    } catch (FacebookApiException $e) {
        error_log($e);
        $fb_user = 0;
    }
}

// is cURL installed
if (!function_exists('curl_init')){
    die('Sorry cURL is not installed!');
}

$api_key = "lYfF8kAmPyRZ0Wr0G_9R";
$api_url = "http://$api_key:artsicle@www.artsicle.com/api/v1";

//$email = isset($_GET['email']) ? trim($_GET['email']) : '';

function get_user($email)
{
	global $api_url;
    
	// create a new cURL resource handle 
	$ch = curl_init();
  
	$url = $api_url."/user/get";
  
	// Set URL
	curl_setopt($ch, CURLOPT_URL, $url);
	 
    $data = array('email' => $email);
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
 
	$obj = json_decode($output, true);
	$user_id = $obj['user'];
	
    $_SESSION['email'] = $email;

	if ($user_id)
        return $user_id;
    else
        return $output;
}

function new_user($email) 
{ 
	global $api_url;

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
	if ($user_id)
        return $user_id;
    else
        return false;
}

$user_id = "";

if ($email && !isset($_SESSION['email'])) {
	$user_id = new_user($email);
    if(!$user_id)
    {
        $user_id = get_user($email);
    }
    $_SESSION['user'] = $user_id;
    $_SESSION['fb_login'] = true;
}
elseif ($email || (isset($_SESSION['user']) && !isset($_SESSION['fb_login'])))
{
    $user_id = $_SESSION['user'];
}
else
{
    $user_id = new_user();
    $_SESSION['user'] = $user_id;
    if (isset($_SESSION['fb_login']))
    {
       unset($_SESSION['fb_login']);
    }
    if (isset($_SESSION['email']))
    {
       unset($_SESSION['email']);
    }
    if (isset($_SESSION['picks']))
    {
       unset($_SESSION['picks']);
    }
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

if (preg_match("/bad/i", $output))
    echo json_encode(array("email" => $_SESSION['email'], "user" => $_SESSION['user']));
else
    echo $output;

?>