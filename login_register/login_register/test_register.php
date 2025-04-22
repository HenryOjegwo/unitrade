<?php
include_once "config.php";

if(!isset($_POST["name"], $_POST["email"], $_POST["password"], $_POST["role"])){
    var_dump($_POST);
    http_response_code(400);
    echo "malformed request body";
    exit;
}

//TODO: perform some more parameter validation
//check that the email matches this pattern:
//*@nileuniversity.edu.ng
$matches = [];
preg_match("/.*@nileuniversity\.edu\.ng$/", $_POST["email"], $matches);
$mat = $matches[0] ?? false;
if(!$mat){
    http_response_code(400);
    echo "invalid email";
    exit;
}
$stmt = $conn->prepare("
    INSERT INTO users(name, email, password, role)
    VALUES(?, ?, ?, ?)
");
$name = $_POST["name"];
$email = $_POST["email"];
$pass = $_POST["password"];
$role = $_POST["role"];

$stmt->bind_param("ssss", 
    $name,
    $email,
    password_hash($pass, PASSWORD_DEFAULT),
    $role
);
$res = $stmt->execute();
if(!$res){
    http_response_code(500);
    echo "internal server error";
    exit;
}

http_response_code(200);
echo "user has been registered successfully";
$_SESSION['active_form'] = 'login'; 
header("Location: index.php");
exit;