<?php
function web_request($url, $data = 0){
 
    // is cURL installed yet?
    if (!function_exists('curl_init')){
        die('Sorry cURL is not installed!');
    }
 
    // OK cool - then let's create a new cURL resource handle
    $ch = curl_init();
  
    // Set URL to getch
    curl_setopt($ch, CURLOPT_URL, $url);
 
    if ($data) {
		curl_setopt($ch, CURLOPT_POST, 1); 
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 
	}
 
    // Include header in result? (0 = yes, 1 = no)
    curl_setopt($ch, CURLOPT_HEADER, 0);
 
    // Should cURL return or print out the data? (true = return, false = print)
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
 
    // Timeout in seconds
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
 
    // Download the given URL, and return output
    $output = curl_exec($ch);
 
    // Close the cURL resource, and free system resources
    curl_close($ch);
 
    return $output;
}

$api_key = "lYfF8kAmPyRZ0Wr0G_9R";

$method = "/discovery_game/comparison/new";
$data = array('user' => 'ykgbzgtkdtfn');
$url = "http://$api_key:artsicle@www.artsicle.com/api/v1".$method;
$response = web_request($url, $data);

$obj = json_decode($response, true);

echo "<pre>".var_dump($obj)."</pre>";

echo "<fieldset style='width:500px;text-align:center;'><legend>Game</legend><br/>";
echo "<a href='".$obj['art1']['image']."'><img src='".$obj['art1']['image']."' /></a><br/><br/>";
echo "VS<br/><br/>";
echo "<a href='".$obj['art2']['image']."'><img src='".$obj['art2']['image']."' /></a><br/><br/>";
echo "</fieldset>";

?>