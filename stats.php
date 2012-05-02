<?php
	
require 'common.php';

// is cURL installed
if (!function_exists('curl_init')){
    die('Sorry cURL is not installed!');
}

$api_key = "lYfF8kAmPyRZ0Wr0G_9R";
$api_url = "http://$api_key:artsicle@www.artsicle.com/api/v1";
$output = '';

$winner = isset($_GET['winner']) ? trim($_GET['winner']) : '';
$loser = isset($_GET['loser']) ? trim($_GET['loser']) : '';

if (!$winner)
{
    die('No winner specified!');
}
if (!$loser)
{
    die('No loser specified!');
}

function getArtInfo($perm){
	// create a new cURL resource handle
	$ch = curl_init();
	
	global $api_url;
	$url = $api_url."/art/" . $perm;
	
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
	
	return $output;
}

function addStats($perm, $isWinner){
	
		global $dbh;
		global $output;
		$battles = 1;
		$wins = 0;
		$winrate = 0;
		
		//$perm = "survival-tip-number-4";
		
		//add stats for artwork
		$artworkData = getArtInfo($perm);
		$artworkInfo = json_decode($artworkData, true);
		
		$query = $dbh->prepare('SELECT * FROM  `artworks` WHERE `artwork_permalink` = :link');
		$query->bindParam(':link', $perm, PDO::PARAM_STR);
		$query->execute();
		$artworks = $query->fetchAll();
		
		//print_r($artworks);
		//echo '\n';
		//print_r($artworkInfo);
		if(count($artworks) == 0){
			
			if($isWinner){
				$wins = 1;
				$winrate = 100;
			}
			//artwork does not exist in database, so insert new artwork into database
			$query = $dbh->prepare('INSERT INTO `artworks`(`artwork_permalink`, `artwork_artist`, `artwork_description`, `artwork_battles`, `artwork_wins`, `artwork_winrate`, `artwork_size`, `artwork_width`, `artwork_height`, `artwork_depth`, `artwork_weight`, `artwork_medium`, `artwork_price`) 
											VALUES (:link,:artist, :description, 1,:wins,:winrate, :size, :width, :height, :depth, :weight, :medium, :price)');
			$query->bindParam(':link', $artworkInfo['permalink'], PDO::PARAM_STR);
			$query->bindParam(':artist', $artworkInfo['artist']['full'], PDO::PARAM_STR);
			$query->bindParam(':description', $artworkInfo['description'], PDO::PARAM_STR);
			$query->bindParam(':wins', $wins, PDO::PARAM_INT);
			$query->bindParam(':winrate', $winrate, PDO::PARAM_INT);
			$query->bindParam(':size', $artworkInfo['size'], PDO::PARAM_STR);
			$query->bindParam(':width', $artworkInfo['dimensions']['width'], PDO::PARAM_INT);
			$query->bindParam(':height', $artworkInfo['dimensions']['height'], PDO::PARAM_INT);
			$query->bindParam(':depth', $artworkInfo['dimensions']['depth'], PDO::PARAM_INT);
			$query->bindParam(':weight', $artworkInfo['dimensions']['weight'], PDO::PARAM_INT);
			$query->bindParam(':medium', $artworkInfo['medium'], PDO::PARAM_STR);
			$query->bindParam(':price', $artworkInfo['price'], PDO::PARAM_INT);
			$query->execute();
		} else {
			//update artwork in database
			$battles = $artworks[0]['artwork_battles'] + 1;
			$wins = $artworks[0]['artwork_wins'];
			if($isWinner){
				$wins = $artworks[0]['artwork_wins'] + 1;
			}
			
			$winrate = (int)(($wins/$battles) * 100);
			$query = $dbh->prepare('UPDATE `artworks` SET `artwork_battles`=:battles,`artwork_wins`=:wins,`artwork_winrate`=:winrate,`artwork_price`=:price WHERE `artwork_permalink` = :link');
			$query->bindParam(':battles', $battles, PDO::PARAM_INT);
			$query->bindParam(':wins', $wins, PDO::PARAM_INT);
			$query->bindParam(':winrate', $winrate, PDO::PARAM_INT);
			$query->bindParam(':link', $perm, PDO::PARAM_STR);
			$query->bindParam(':price', $artworks[0]['artwork_price'], PDO::PARAM_INT);
			$query->execute();
		}
		
		if($isWinner){
			$output = $artworkInfo;
			$output['winrate'] = $winrate;
			$output['battles'] = $battles;
		}
}

addStats($winner, true);
addStats($loser, false);
echo json_encode($output);

?>