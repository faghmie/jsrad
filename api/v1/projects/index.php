<?php
	//GLOBALS MUST BE HERE BEFORE THE COMMON.PHP FILE.
	//$projects_folder = $_SERVER['DOCUMENT_ROOT'].'/projects/';
	$projects_folder = '../../../projects/';
	$template_folder = '../../../projects/template/';
	
	include_once '../common.php';
	//----------------------------------------------------------------------
	$request = @explode('/', trim($_SERVER['PATH_INFO'],'/'));
	
	adjust_for_private_user($obj);
	
	// Call function based on HTTP method
	switch ($method) {
		case 'GET':
			if (is_array($request) && $request[0] != ''){
				$obj->project = urldecode($request[0]);
				project_load($obj);
				
			} else if (property_exists($obj, 'project')){
				project_load($obj);

			} else
				project_list($obj);

			break;
		case 'PUT':
			project_save($obj); break;
		case 'POST':
			project_save($obj); break;
		case 'DELETE':
			project_remove($obj); 
		break;
	}
	
	function adjust_for_private_user($obj){
		global $projects_folder;

		if (!property_exists($obj, 'auth_token')) return;
		if (!property_exists($obj->auth_token, 'email')) return;
		
		$db = open_auth_db();
		
		$rst = $db->query("SELECT * FROM users WHERE email='". $obj->auth_token->email ."'");
				
		if ($rst === false){
			return;
		}
		
		$row = $rst->fetch(PDO::FETCH_OBJ);
		$projects_folder .= "private/".$row->path_uuid."/";
		
		if (!file_exists($projects_folder)){
			mkdir($projects_folder);
			if (!file_exists($projects_folder."application/"))
				mkdir($projects_folder."application/");
			
			if (!file_exists($projects_folder."datamodel/"))
				mkdir($projects_folder."datamodel/");
			
		}
	}
	
	function project_save($obj){
		global $projects_folder;
		$filename = 'project.json';
		//if (property_exists($obj, 'filename'))
		//	$filename = $obj->filename;
		
		//FIRST CREATE THE PROJECT FOLDER IF IT DOES NOT EXIST
		$folder = $projects_folder.$obj->type.'/'.$obj->project;
		if (!file_exists($folder)){
			mkdir($folder);
		}
		
		//NOW SAVE THE JSON TO A FILE
		$file = $folder.'/'.$filename;
		
		file_put_contents($file, ($obj->data));
		
		project_db_save($obj);
		
		exit_with_response(0);
	}
	
	function project_db_save($obj){
		$db = open_auth_db();
		
		$rst = $db->query("SELECT COUNT(*) FROM projects WHERE uuid='". $obj->uuid ."'");
		
		if ($rst === false){
			exit_with_response(-1, "Failed to check projects");
		}
		
		if ($rst->fetchColumn() == 0){
			$res = $db->exec("INSERT INTO projects(uuid, project_type, name, created_on) VALUES(".
					"'". $obj->uuid. "',".
					"'". $obj->type. "',".
					"'". $obj->project. "',".
					"CURRENT_TIMESTAMP)");
			
			if (0 == $res){
				exit_with_response(-1, $db->errorInfo());
			}
		} else {
			$res = $db->exec("UPDATE projects ".
					"SET name = '". $obj->project. "',".
					"last_update_on = CURRENT_TIMESTAMP ".
					"WHERE uuid = '". $obj->uuid. "'");
			
			if (0 == $res){
				exit_with_response(-1, "Token update failed");
			}
		}
	}
	
	function project_load($obj){
		global $projects_folder;
		global $template_folder;
		
		if (!property_exists($obj, 'type')) 
			exit_with_response(-1, 'Invalid request: missing [type] attribute. <br/>');
		
		if (property_exists($obj, 'source') && $obj->source == 'template')
			$dir = $template_folder.$obj->type.'/';
		else
			$dir = $projects_folder.$obj->type.'/';
		
		$filename = 'project.json';
		
		//if (property_exists($obj, 'filename'))
			//$filename = $obj->filename;
		
		//FIRST CREATE THE PROJECT FOLDER IF IT DOES NOT EXIST
		if (property_exists($obj, 'project') || $obj->project !== null){
			
			$dir = $dir.$obj->project;
			if (!file_exists($dir)){
				exit_with_response(-1, 'Project cannot be located: '.$dir);
			}
		}
	
		//NOW SAVE THE JSON TO A FILE
		$file = $dir.'/'.$filename;
		
		$contents = '';
		if (file_exists($file)){
			$contents = file_get_contents($file);
			
		} else {
			//LOOK FOR A JSON FILE
			$handle = opendir($dir);
			$file = null;
			if ($handle){
				$blacklist = array('.', '..');
				while (false !== ($entry = readdir($handle))) {
					if (in_array($entry, $blacklist)) continue;
					$file = $dir.'/'.$entry;
					if (is_file($file)){
						$ext = '.json';
						$f = strtolower($entry);
						if (substr($f,-1*strlen($ext)) === $ext){
							$contents = file_get_contents($file);
							break;
						}
					}
				}
			}
		}

		exit_with_response(null, null, array('base64_content' => ($contents)));
	}
	
	function project_remove($obj){
		global $projects_folder;
		$filename = 'project.json';
		
		if (property_exists($obj, 'filename'))
			$filename = $obj->filename;
		
		//FIRST CREATE THE PROJECT FOLDER IF IT DOES NOT EXIST
		if (property_exists($obj, 'dir') && $obj->dir !== null){
			$dir = $obj->dir;
			
		} else {
			if (property_exists($obj, 'project') || $obj->project !== null){
				$dir = $projects_folder.$obj->type.'/'.$obj->project;
				if (!file_exists($dir)){
					exit_with_response(-1, 'Project cannot be located: '.$dir);
				}
			}
		}
		
		//NOW SAVE THE JSON TO A FILE
		$file = $dir.'/'.$filename;
		
		$contents = '';
		//LOOK FOR A JSON FILE
		$handle = @opendir($dir);
		if ($handle){
			$blacklist = array('.', '..');
			while (false !== ($entry = readdir($handle))) {
				if (in_array($entry, $blacklist)) continue;
				$file = $dir.'/'.$entry;
				if (is_file($file)){
					unlink($file);
				}
			}
		}
		rmdir($dir);
		
		exit_with_response();
	}
	
	function project_list($obj){
		global $projects_folder;
		global $template_folder;
		global $raw_data;
		
		if (!property_exists($obj, 'type')) 
			exit_with_response(-1, 'Invalid request: missing [type] attribute on [data]. <br/>'.$raw_data);
		
		if (property_exists($obj, 'source') && $obj->source == 'template')
			$dir = $template_folder.$obj->type.'/';
		else
			$dir = $projects_folder.$obj->type.'/';
		
		$result = array();
		$result['projects'] = array();
		$blacklist = array('.', '..');
		
		$handle = @opendir($dir);
		if (false === $handle) exit_with_response(-1, 'Unable to locate folder ['. $dir .']');
		
		if ($handle){
			while (false !== ($entry = readdir($handle))) {
				if (in_array($entry, $blacklist)) continue;
				if (is_dir($dir.$entry))
					array_push($result['projects'], $entry);
			}
		}
		sort($result['projects'], SORT_NATURAL | SORT_FLAG_CASE);
		exit_with_response(null, null, $result);
	}

?>
