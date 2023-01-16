<?php
	//session_start();
	header('Access-Control-Allow-Orgin: *');
    header('Access-Control-Allow-Methods: *');
    header('Content-Type: application/json');
    
    date_default_timezone_set('Africa/Johannesburg');
	//echo var_export($_FILES, true);
	$db_error_msg	= null;
	$raw_data		= rawurldecode(utf8_encode((file_get_contents('php://input'))));
	$method			= $_SERVER['REQUEST_METHOD'];
	$obj			= json_decode($raw_data, false);
	
	if ($obj === NULL){
		if (array_key_exists('json', $_REQUEST)){
			$obj = json_decode($_REQUEST['json']);
		} else {
			if(!is_object($obj)){
				$obj = new stdClass();
				if (isSet($_SERVER['QUERY_STRING'])){
					parse_str($_SERVER['QUERY_STRING'], $result);
					foreach($result as $key => $p){
						$obj->{$key} = $p;
					}
				}
			}
		}
	}
	
	function logging($text){
		$file = 'log.txt';
		file_put_contents($file, '\r\n'.date('d F Y H:i').':\t', FILE_APPEND);
		file_put_contents($file, $text, FILE_APPEND);
	}
	
	function exit_with_response($errno=null, $errmsg = null, $json = null){
		$result = array();
		if (is_string($json) === true && trim($json) !== '') $json = json_decode($json);
		
		if ($json === null) $json = array();
		
		if ($errno == null) $errno = 0;
		if ($errmsg == null) $errmsg = '';
		$result['response'] = $json;
		$result['error'] = array('code' => $errno, 'message' => $errmsg);
		
		header('Access-Control-Allow-Origin: *');
		header('Content-type: application/json; charset=utf-8');
		echo json_encode($result);
		exit;
	}
	
	function open_auth_db(){
		try{
			//echo __DIR__.'../../config/auth.db';
			$db = new PDO('sqlite:'.__DIR__.'/../../config/auth.db');
			
			//USERS
			$rst = $db->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='users'");

			if ($rst === false){
				exit_with_response(-1, "CONFIG: Failed to check auth.db");
			}
			
			if ($rst->fetchColumn() == 0){
				$res = $db->exec("CREATE TABLE users(first_name, surname, email, password, thumbnail, token, last_update_time, path_uuid)");
				if (false === $res){
					exit_with_response(-1, "CONFIG: Failed to setup auth.db ". var_dump($db->errorCode()));
				}
			}
			
			//FEEDBACK
			$rst = $db->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='feedback'");

			if ($rst === false){
				exit_with_response(-1, "CONFIG: Failed to check auth.db");
			}
			
			if ($rst->fetchColumn() == 0){
				$res = $db->exec("CREATE TABLE feedback(email, relates_to, message, created_on, status, feedback_provided_on)");
				if (false === $res){
					exit_with_response(-1, "CONFIG: Failed to setup auth.db ". var_dump($db->errorCode()));
				}
			}
			
			//PROJECTS
			$rst = $db->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='projects'");

			if ($rst === false){
				exit_with_response(-1, "CONFIG: Failed to check auth.db");
			}
			
			if ($rst->fetchColumn() == 0){
				$res = $db->exec("CREATE TABLE projects(uuid, project_type, name, author, description, thumbnail, created_on, last_updated_on, last_update_by, auth_token)");
				if (false === $res){
					exit_with_response(-1, "CONFIG: Failed to setup auth.db ". var_dump($db->errorCode()));
				}
			}
			
		} catch(PDOException $e){
			exit_with_response(-1, "Could not open auth.db");
		}
		
		return $db;
	}
	
	
	function db_format($value, $format = 'general'){
		if ($value == null) return 'NULL';
		
		switch($format){
			case 'number':
				if (trim($value) == '' || !is_numeric(trim($value)))
					return 'NULL';
				break;
			case 'date':
				if (!is_numeric($value)){
					if (strtotime($value) === false)
						return 'NULL';
					
					$value = strtotime($value);
				}
					
				$value = date('Y-m-d', $value);
				break;
			case 'time':
				 $value = date('H:i:s', $value);
				 break;
			case 'datetime':
				if (!is_numeric($value)){
					if (strtotime($value) === false)
						return 'NULL';
					
					$value = strtotime($value);
				}

				$value = date('Y-m-d H:i:s', $value);
				break;
		}
		
		$value = str_replace("'", "\'", $value);
		
		return "'".$value."'";
	}
?>
