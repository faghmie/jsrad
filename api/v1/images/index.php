<?php
	//GLOBALS MUST BE HERE BEFORE THE COMMON.PHP FILE.
	//$projects_folder = $_SERVER['DOCUMENT_ROOT'].'/projects/';
	$image_base_folder = 'images/app/';
	$projects_folder = '../../../'. $image_base_folder;
	
	include_once '../common.php';
	//----------------------------------------------------------------------
	$request = @explode('/', trim($_SERVER['PATH_INFO'],'/'));

	// Call function based on HTTP method
	switch ($method) {
	  case 'GET':
		if (is_array($request) && $request[0] != ''){
			$obj->image = urldecode($request[0]);
			image_load($obj);
			
		} else if (property_exists($obj, 'image')){
			image_load($obj);
		
		} else
			image_list($obj);
		
		break;
	  case 'PUT':
		image_load($obj); break;
	  case 'POST':
		image_save($obj); break;
	  case 'DELETE':
		image_remove($obj); 
		break;
	}
	
	function image_save($obj){
		global $projects_folder;
		//echo var_export($_FILES, true);
		//exit_with_response(-1, count($_FILES));
		if (count($_FILES) === 0){
			exit_with_response(-1, 'Nothing to upload');
		}
		
		foreach($_FILES as $name=>$file){ 
			//exit_with_response(-1, 'Upload file....'.$name);
			list($file_name, $error) = upload($name, $projects_folder);
			if ($error)
				exit_with_response(-1, $error);
			else{
				exit_with_response();
			}
		}
		
		
	}
	
	function image_load($obj){
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

		exit_with_response(null, null, array('base64_content' => $contents));
	}
	
	function image_remove($obj){
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
	
	function image_list($obj){
		global $projects_folder;
		global $image_base_folder;
		
		$dir = $projects_folder.'/';
		$result = array();
		$result['images'] = array();
		$blacklist = array('.', '..');
		
		$handle = @opendir($dir);
		if (false === $handle) exit_with_response(-1, 'Unable to locate folder ['. $dir .']');
		
		if ($handle){
			while (false !== ($entry = readdir($handle))) {
				if (in_array($entry, $blacklist)) continue;
				if (is_file($dir.$entry))
					array_push($result['images'], $image_base_folder.$entry);
			}
		}
		sort($result['images'], SORT_NATURAL | SORT_FLAG_CASE);
		exit_with_response(null, null, $result);
	}

	/**
	 * A function for easily uploading files. This function will automatically generate a new 
	 *        file name so that files are not overwritten.
	 * Taken From: http://www.bin-co.com/php/scripts/upload_function/
	 * Arguments:    $file_id- The name of the input field contianing the file.
	 *                $folder    - The folder to which the file should be uploaded to - it must be writable. OPTIONAL
	 *                $types    - A list of comma(,) seperated extensions that can be uploaded. If it is empty, anything goes OPTIONAL
	 * Returns  : This is somewhat complicated - this function returns an array with two values...
	 *                The first element is randomly generated filename to which the file was uploaded to.
	 *                The second element is the status - if the upload failed, it will be 'Error : Cannot upload the file 'name.txt'.' or something like that
	 */
	function upload($file_id, $folder="", $types="") {
		if(!$_FILES[$file_id]['name']) return array('','No file specified');

		$file_title = $_FILES[$file_id]['name'];
		//Get file extension
		$ext_arr = preg_split("/[\.]/",basename($file_title));
		$ext = strtolower($ext_arr[count($ext_arr)-1]); //Get the last extension

		//Not really uniqe - but for all practical reasons, it is
		$uniqer = substr(md5(uniqid(rand(),1)),0,5);
		$file_name = $uniqer . '_' . $file_title;//Get Unique Name

		$all_types = explode(",",strtolower($types));
		if($types) {
			if(in_array($ext,$all_types));
			else {
				$result = "'".$_FILES[$file_id]['name']."' is not a valid file."; //Show error if any.
				return array('',$result);
			}
		}

		//Where the file must be uploaded to
		if($folder) $folder .= '/';//Add a '/' at the end of the folder
		$uploadfile = $folder . $file_name;

		$result = '';
		//Move the file from the stored location to the new location
		if (!move_uploaded_file($_FILES[$file_id]['tmp_name'], $uploadfile)) {
			$result = "Cannot upload the file '".$_FILES[$file_id]['name']."'"; //Show error if any.
			if(!file_exists($folder)) {
				$result .= " : Folder don't exist.";
			} elseif(!is_writable($folder)) {
				$result .= " : Folder not writable.";
			} elseif(!is_writable($uploadfile)) {
				$result .= " : File not writable. [". $uploadfile ."]";
			}
			$file_name = '';
			
		} else {
			if(!$_FILES[$file_id]['size']) { //Check if the file is made
				@unlink($uploadfile);//Delete the Empty file
				$file_name = '';
				$result = "Empty file found - please use a valid file."; //Show the error message
			} else {
				chmod($uploadfile,0777);//Make it universally writable.
			}
		}

		return array($file_name,$result);
	}

?>
