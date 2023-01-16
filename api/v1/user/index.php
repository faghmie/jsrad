<?php
	//GLOBALS MUST BE HERE BEFORE THE COMMON.PHP FILE.
	//$projects_folder = $_SERVER['DOCUMENT_ROOT'].'/projects/';
	$projects_folder = '../../../projects/';
	
	include_once '../common.php';
	//----------------------------------------------------------------------
	$request = @explode('/', trim($_SERVER['PATH_INFO'],'/'));
	if (!is_array($request)){
		$request = [''];
	}
	//echo var_dump($request);
	//echo is_array($request);
	// Call function based on HTTP method
	switch ($method) {
	  case 'GET':
		user_sign_in($obj); break;
		break;
	  case 'PUT':
		//user_register($obj); break;
	  case 'POST':
		switch($request[0]){
			case 'login':
				user_credential_login($obj);
				break;
			
			case 'register':
			default:
				user_sign_in($obj);
				break;
		}
		break;
	  case 'DELETE':
		//project_remove($obj); 
		break;
	}
	
	function user_credential_login($obj){
		$db = open_auth_db();
		$result = [];
		
		if (trim($obj->email) == ""){
			exit_with_response(-1, "Email cannot be blank");
		}
		
		$query = "SELECT * FROM users WHERE email = '". trim($obj->email) ."'";
		$rst = $db->prepare($query);
		$rst->execute();
		
		if ($rst === false){
			exit_with_response(-1, "USER: Query Failed");
		}
		
		$row = $rst->fetch(PDO::FETCH_OBJ);
		if ($row === false){
			exit_with_response(-1, "Email not found in database");
		}
		
		if ($row->password != hash('md5', $obj->password)){
			exit_with_response(-1, "Password does not match");
		}

		$result = [
			"email" => $obj->email,
			"token" => "App.Login.Standard",
			"first_name" => $row->first_name
		];
		
		exit_with_response(null, null, $result);
	}
	
	function user_sign_in($obj){
		$db = open_auth_db();
		$result = [];
		
		oauth_user_register($db, $obj);
		
		$rst = $db->query("SELECT * FROM users WHERE email='". $obj->email ."'");

		
		if ($rst === false){
			exit_with_response(-1, "Failed retrieve user");
		}
		
		$row = $rst->fetch(PDO::FETCH_OBJ);
		$result = [
			"email" => $obj->email,
			"token" => "App.Login.OAuth",
			"first_name" => $row->first_name
		];
		
		exit_with_response(0, null, $result);
	}
	
	function oauth_user_register($db, $obj){
		$rst = $db->query("SELECT COUNT(*) FROM users WHERE email='". $obj->email ."'");
		
		if ($rst === false){
			exit_with_response(-1, "Failed to check users.db");
		}
		
		if ($rst->fetchColumn() == 0){
			$res = $db->exec("INSERT INTO users(first_name, surname, email, password, thumbnail, token, path_uuid) VALUES(".
					"'". $obj->first_name. "',".
					"'". $obj->surname. "',".
					"'". $obj->email. "',".
					"'". hash('md5', $obj->password). "',".
					"'". $obj->thumbnail. "',".
					"'". $obj->token. "',".
					"'". uniqid() ."')");
			
			if (0 == $res){
				exit_with_response(-1, $db->errorInfo());
			}
		} else {
			$res = $db->exec("UPDATE users ".
					"SET token = '". $obj->token. "',".
					"thumbnail = '". $obj->thumbnail. "',".
					"last_update_time = CURRENT_TIMESTAMP ".
					"WHERE email = '". $obj->email. "'");
			
			if (0 == $res){
				exit_with_response(-1, "Token update failed");
			}
		}
	}
?>
