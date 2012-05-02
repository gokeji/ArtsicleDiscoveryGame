<?php

// Try to connect to the database
try
{
	$host = "localhost";
	$user = "root";
	$dbname = "artsicle";
	$socket = "/tmp/mysql.sock";
	$password = "";
	$port = "3306";
	//print_r($cfg);
	//$db_conn = mysql_connect($host, $user, $password) or die('Error connecting to db: ' . mysql_error());
	//mysql_select_db($dbname, $db_conn) or die('Error selecting db: ' . mysql_error());
	$dbh = new PDO('mysql:dbname=' . $dbname. ';host=' . $host, $user, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\''));
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e)
{
	print "Error!: " . $e->getMessage() . "<br/>";
	exit;
}
	

?>