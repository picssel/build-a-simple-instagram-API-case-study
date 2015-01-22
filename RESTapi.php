<?php
/*
 * Instagram's proxy API
 * reads Instagram pages and gets embedded data,
 * then returns it as json or jsonp.
 * By Francisco Diaz :: picssel.com
 * December 2014
 */
/***** get request origin and set domain restrictions *****/
$http_origin = $_SERVER['HTTP_ORIGIN'];
// 1). ALL domains
// header("Access-Control-Allow-Origin: *");
// 2). Single domain
  /*
  if ($http_origin == "http://www.picssel.com"){
      header("Access-Control-Allow-Origin: $http_origin");
  }
  */
// 3). Several domains, e.g. http://picssel.com, http://fiddle.jshell.net, etc.
$domains_allowed = array("http://www.picssel.com", "http://www.picssel.ca");
if(in_array( $http_origin, $domains_allowed )){
    header("Access-Control-Allow-Origin: $http_origin");
}

/***** functions *****/
// clean up file contents
function cleanup_data($data){
    $data = trim($data);
    $data = strip_tags($data);
    return $data;
};
// sanitize input
function sanitize_input($input){
    $input = trim($input);
    $input = stripslashes($input);
    $input = strip_tags($input);
    $input = htmlspecialchars($input);
    return $input;
};
// process data
function process_data($dataFile, $requestType){
    $data_length = strlen($dataFile);
    if( $data_length > 0 ){
        $start_position = strpos( $dataFile ,'{"static_root"' ); // start position
        $trimmed = trim( substr($dataFile, $start_position) ); // trim content
        $jsondata = substr( $trimmed, 0, -1); // remove extra trailing ";"
        header("HTTP/1.0 200 OK");
        // JSONP response
        if(array_key_exists('callback', $_GET)){
            header('Content-Type: text/javascript; charset=utf8');
            $callback = $_GET['callback'];
            return $callback."(".$jsondata.");";
        }
        // JSON response
        else {
            header('Content-Type: application/json; charset=utf-8');
            return $jsondata;
        }
    } else {
        // invalid username or media
        header("HTTP/1.0 400 BAD REQUEST");
        header('Content-Type: text/html; charset=utf-8');
        die("invalid $requestType");
    }
};

/***** Get user's input *****/
$user  = sanitize_input( $_GET['user'] );  // expects something like "instagram" (username)
$media = sanitize_input( $_GET['media'] ); // expects something like "mOFsFhAp4f" (shortcode)

/***** validate request type and return response *****/
// user, including last 20 media posts
if( !empty($user) && empty($media) ){
    $requestType = "user";
    $dataFile = cleanup_data( @ file_get_contents("http://instagram.com/".$user) );
    echo process_data($dataFile, $requestType);
}
// media
elseif( empty($user) && !empty($media) ){
    $requestType = "media";
    $dataFile = cleanup_data( @ file_get_contents("http://instagram.com/p/".$media) );
    echo process_data($dataFile, $requestType);
}
// invalid : two or more parameters were passed
elseif( !empty($user) && !empty($media) ){
    header("HTTP/1.0 400 BAD REQUEST");
    header('Content-Type: text/html; charset=utf-8');
    die("only one parameter allowed");
}
// invalid : none or invalid parameters were passed
elseif( empty($user) && empty($media) ){
    header("HTTP/1.0 400 BAD REQUEST");
    header('Content-Type: text/html; charset=utf-8');
    die("invalid parameters");
};
?>