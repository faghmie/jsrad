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
		/* connect to the db */
		$this->link = mysqli_connect($this->host, $this->username, $this->password);
		if (false === $this->link){
			exit_with_response(-1, "Cannot connect to the database ".$this->host);
		}
		
		$result = mysqli_select_db($this->link, $this->database);
		if (false === $result){
			exit_with_response(-1, "Cannot select the database name: ".$this->database);
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
		
		/* grab the posts from the db */
		$result = mysqli_query($db, $query);
		if ($result === false){
			exit_with_response(mysqli_errno($db), $query."\r\n".mysqli_error($db));
		}
		
		/* create one master array of the records */
		$json = array();
		if(mysqli_affected_rows($db) != 0) {
			while($row = mysqli_fetch_assoc($result)) {
				$json[] = array_change_key_case($row);
			}
		}

		return $json;
	}
	
	function run_statement($sql){
		$db = $this->OpenDB();
		$result = mysqli_query($db, $sql); //ADD THE @ SIGN BACK TO SUPPRESS ERRORS AND WARNINGS
		if ($result === false)
			exit_with_response(mysqli_errno($db), mysqli_error($db). $sql);
	}
}

?>
