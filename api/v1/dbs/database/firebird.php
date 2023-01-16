<?php
	
class CDatabase {
	var $host;
	var $username;
	var $password;
	var $dbh;
	var $sth;
	var $is_open;
	var $current_row;
	var $eof;

	function CDatabase(){
		$this->password		= "masterkey";
		if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
			$this->host 		= "localhost:C:/Users/osfdavid/projects/AQUA.FDB";
		} else {
			$this->host 		= "localhost:/home/faghmie/projects/database/aqua.fb";
		}
		
		
		$this->username 	= "SYSDBA";
		$this->is_open		= false;
		$this->current_row	= null;
		$this->eof			= false;
	}

	function OpenDB(){
		$this->dbh 		= ibase_connect( $this->host, $this->username, $this->password);//, "ISO8859_1");
		$this->is_open	= true;
	}

	function CloseDB(){
		ibase_close( $this->dbh );
		$this->is_open = false;
	}

	function run_query($query){
		$json = array();
		$this->OpenDB();
		$this->sth = ibase_query ($this->dbh, $query);
		if (ibase_errcode() !== false)
			exit_with_response(-1, $query.">>>>>".ibase_errmsg());
		
		while($data = ibase_fetch_assoc($this->sth)) {
			$json[] = array_change_key_case($data);
		}

		return $json;
	}
	
	function run_statement($sql){
		$this->OpenDB();
		$query = ibase_prepare($this->dbh, $sql );
		$result =  ibase_execute( $query );
		if (ibase_errcode() !== false)
		{
			$db_msg = ibase_errmsg();
			$description = 'Failed to run query on database';
			//$this->db_new_note($description, $db_msg);
			exit_with_response(-1, $sql."<<<\r\n>>>".$db_msg);
		}
		
		return true;
	}
}

?>
