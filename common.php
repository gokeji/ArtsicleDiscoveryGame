<?php

// Try to connect to the database
try
{
	$host = "mysql-shared-02.phpfog.com";
	$user = "Custom App-37966";
	$dbname = "discoverygame_phpfogapp_com";
	$password = "d1Hm6s17d49t";
	//print_r($cfg);
	//$db_conn = mysql_connect($host, $user, $password) or die('Error connecting to db: ' . mysql_error());
	//mysql_select_db($dbname, $db_conn) or die('Error selecting db: ' . mysql_error());
	$dbh = new PDO('mysql:host=' . $host .';dbname=' . $dbname, $user, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\''));
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e)
{
	print "Error!: " . $e->getMessage() . "<br/>";
    //print print_r(array('conn' => 'mysql:host=' . $host .';dbname=' . $dbname, 'user' => $user, 'pass' => $password));
	exit;
}

?>