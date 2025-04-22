<?php
include_once "config.php";
header("Content-Type: text/plain"); // Tell the browser it's plain text
//TODO: validate request method
if(!isset($_POST["email"], $_POST["password"])){
    http_response_code(400);
    echo "The details have not been completely provided, missing either email or password";
    exit;
}

$email = $_POST["email"];
$password = $_POST["password"];

//check that the email matches this pattern:
//*@nileuniversity.edu.ng
$matches = [];
preg_match("/.*@nileuniversity\.edu\.ng$/", $email, $matches);
$mat = $matches[0] ?? false;
//validate that the email is a resonable value
if(empty(trim($email)) || !$mat){
    http_response_code(400);
    echo "the email provided is invalid";
    exit;
}

//use prepared statements to prevent injection attacks
$stmt = $conn->prepare("
    SELECT * FROM users 
    WHERE email = ?
");

$stmt->bind_param("s", $email);
$stmt->bind_result($id, $name, $_, $p, $role);
$res = $stmt->execute();

//if res is null/false, the database operation has failed
if(!$res){
    http_response_code(500);
    echo "internal server error";
    exit;
}

$data = $stmt->fetch();
//if data is null; the user's details are not in our database
if($data === null){
    http_response_code(404);
    echo "this email does not exist";
    exit;
}

if(!password_verify($password, $p)){
    http_response_code(403);
    echo "invalid login credentials";
    exit;
}

http_response_code(200);
echo "You have logged in successfully";
