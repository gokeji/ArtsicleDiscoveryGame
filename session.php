<?php

$new_userid = isset($_GET['userid']) ? trim($_GET['userid']) : 0;

session_start();
if ($new_userid)
{
    $_SESSION['user'] = $new_userid;
}
?><pre><?php
print_r($_SESSION);
?></pre>