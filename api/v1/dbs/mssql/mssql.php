<?php
class CDatabase{
	var $host;
	var $database;
	var $username;
	var $password;
	var $link;
	var $is_open;

	function CDatabase($host = null, $database = null, $username = null, $password = null){
		global $config;
		$this->password		= $password != null ? $password : $config["DB_PASSWORD"];
		$this->username 	= $username != null ? $username : $config["DB_USERNAME"];
		$this->host 		= $host != null ? $host : $config["DB_HOST"];
		$this->database		= $database != null ? $database : $config["DB_DATABASE"];
		$this->is_open		= false;
	}

	function OpenDB(){
		if ($this->is_open == true) return $this->link;
		$connectionInfo = array( "UID"=>$this->username,
                         "PWD"=>$this->password,
                         "Database"=>$this->database);
		$this->link = sqlsrv_connect($this->host, $connectionInfo);
		if($this->link === false){
			 exit_with_response(-1, "Cannot connect to the database ".$this->host);
		}
		
		$this->is_open = true;
		return $this->link;
	}

	function CloseDB(){
		//ibase_close( $this->dbh );
		//$this->is_open = false;
	}

	function run_query($query){
		$db = $this->OpenDB();
		$result = sqlsrv_query($db, $query);
		$json = array();
		if($result !== false){
			if(sqlsrv_has_rows($result) === true) {
				while($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
					$json[] = array_change_key_case($row);
				}
			}
			sqlsrv_free_stmt($result);
		}
		
		return $json;
	}
	
	function run_statement($sql){
		$db = $this->OpenDB();
		$result = sqlsrv_query($db, $sql); //ADD THE @ SIGN BACK TO SUPPRESS ERRORS AND WARNINGS
		if ($result === false)
			exit_with_response(-1, $sql);
		
		sqlsrv_free_stmt($result);
	}
}

?>
