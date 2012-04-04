<?php

// is cURL installed
if (!function_exists('curl_init')){
    die('Sorry cURL is not installed!');
}

$comparison_id = isset($_GET['comp_id']) ? trim($_GET['comp_id']) : '';
$winner = isset($_GET['winner']) ? trim($_GET['winner']) : '';
if (!$comparison_id)
{
    die('No comparison id specified!');
}
if (!$winner)
{
    die('No winner specified!');
}

$i = 0;

$api_key = "lYfF8kAmPyRZ0Wr0G_9R";
$api_url = "http://$api_key:artsicle@www.artsicle.com/api/v1";

$user_id = "";

session_start();

$email = isset($_SESSION['email']) ? trim($_SESSION['email']) : ''; 

if (isset($_SESSION['user']))
{
    $user_id = $_SESSION['user'];
}
else
{
    die('No user specified!');
}

if ($email)
{
	// create a new cURL resource handle
	$ch = curl_init();

	$url = $api_url."/discovery_game/comparison/result";

	// Set URL
	curl_setopt($ch, CURLOPT_URL, $url);

	// Set POST parameters
	$data = array('user' => $user_id, 'comparison' => $comparison_id, 'winner' => $winner);
	curl_setopt($ch, CURLOPT_POST, 1); 
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 

	// Include header in result
	curl_setopt($ch, CURLOPT_HEADER, 0);

	// Return the data
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	// 10 second timeout
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);

	// Fetch resource
	$result = curl_exec($ch);

	// Close the cURL
	curl_close($ch);

	echo $result;
}
else
{
	$data = array('comparison' => $comparison_id, 'winner' => $winner);
	if (isset($_SESSION['picks']) && is_array($_SESSION['picks']))
	{
		array_push($_SESSION['picks'], $data);
	}
	else
	{
		$_SESSION['picks'] = array();
		array_push($_SESSION['picks'], $data);
	}
	
	if (count($_SESSION['picks']) >= 5)
	{
		$warning = array("error" => "email required", "email" => $email);
		echo json_encode($warning);
	}
	else
	{
		$message = array("response" => "Successful comparison!");
		echo json_encode($message);
	}
}

?>