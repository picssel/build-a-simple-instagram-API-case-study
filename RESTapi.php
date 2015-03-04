<?php
/*
 * Instagram's proxy API
 * reads Instagram pages and gets embedded data,
 * then returns it as json or jsonp.
 * By Francisco Diaz :: picssel.com
 * Revision March 2015
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
        $trimmed_before = trim( substr($dataFile, $start_position) ); // trim preceding content
        $end_position = strpos( $trimmed_before, '</script>'); // end position
        $trimmed = trim( substr( $trimmed_before, 0, $end_position) ); // trim content
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

/***** set context *****/
$context = stream_context_create(array(
    'http' => array(
        'timeout' => 10 // in seconds
        )
    )
);

/***** validate request type and return response *****/
// user, including last 20 media posts
if( !empty($user) && empty($media) ){
    $requestType = "user";
    $dataFile = @ file_get_contents("http://instagram.com/".$user,  NULL, $context);
    echo process_data($dataFile, $requestType);
}
// media
elseif( empty($user) && !empty($media) ){
    $requestType = "media";
    $dataFile = @ file_get_contents("http://instagram.com/p/".$media, NULL, $context);
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