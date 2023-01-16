<?php
	include_once './mysql.php';
	include_once '../../config.php';
	include_once '../../common.php';
	//----------------------------------------------------------------------
	
	// Call function based on HTTP method
	switch ($method) {
	  case 'GET':
		if (is_array($obj->sql_table) === false)
			read($obj); 
		else
			read_table_list($obj);
		
		break;
	  case 'PUT':
		update($obj); break;
	  case 'POST':
		create($obj); break;
	  case 'DELETE':
		remove($obj); break;
	}
	
	function create($obj){
		$db = new CDatabase($obj->server, $obj->database, $obj->username, $obj->password);
		$sql_table = $obj->sql_table;
		$sql_fields = '';
		$sql_values = '';
		$sql_where = '';
		$pk_field = '';
		
		foreach($obj->fields as $field){
			if (!property_exists($field, 'primary_key') || (property_exists($field, 'primary_key') && $field->primary_key == false)){
				if ($sql_fields != '') $sql_fields .= ',';
				$sql_fields .= '`'. $field->name .'`';
				
				if ($sql_values != '') $sql_values .= ',';
				foreach($obj->data as $key => $value){
					if ($key == $field->name){
						if ($value != null)
							$sql_values .= db_format($value, $field->data_type);
						else
							$sql_values .= 'NULL';
					}
				}
				
				if ($sql_where != '') $sql_where .= ' AND ';
				foreach($obj->data as $key => $value){
					if ($key == $field->name){
						if ($value != null)
							$sql_where .= '`'. $field->name .'` = '.db_format($value, $field->data_type);
						else
							$sql_where .= '`'. $field->name .'` IS NULL';
					}
				}
			}
			else if ((property_exists($field, 'primary_key') && $field->primary_key == true)){
				$pk_field = $field->name;
			}
		}
		
		$db->run_statement("INSERT INTO `$sql_table`($sql_fields) VALUES($sql_values)");
			
		//FIRST GET THE ID AND SET IT ON THE OBJECT
		$sql_result = $db->run_query("SELECT * FROM `$sql_table` WHERE $sql_where");
		
		exit_with_response(mysqli_errno($db->link), mysqli_error($db->link), $sql_result);
	}

	function update($obj){
		$db = new CDatabase($obj->server, $obj->database, $obj->username, $obj->password);
		
		//can_perform_function(__FUNCTION__, $obj);

		$sql_table = $obj->sql_table;
		$sql_fields = '';
		$sql_values = '';
		$sql_where = '';
		foreach($obj->fields as $field){
			if (!property_exists($field, 'primary_key') || (property_exists($field, 'primary_key') && $field->primary_key == false)){
				if (!property_exists($field, 'readonly') || (property_exists($field, 'readonly') && $field->readonly == false)){
					if ($sql_values != '') $sql_values .= ',';
					foreach($obj->data as $key => $value){
						if ($key == $field->name){
							if ($value != null)
								$sql_values .= '`'. $field->name .'` = '.db_format($value, $field->data_type);
							else
								$sql_values .= '`'. $field->name .'` = NULL ';
						}
					}
				}
			} else if (property_exists($field, 'primary_key') && $field->primary_key == true){
				if ($sql_where != '') $sql_where .= ' AND ';
				foreach($obj->data as $key => $value){
					if (property_exists($field, 'alias') && $key == $field->alias){
						$sql_where .= '`'. $field->name .'` = '.db_format($value, $field->data_type);
					} else if ($key == $field->name){
						$sql_where .= '`'. $field->name .'` = '.db_format($value, $field->data_type);
					}
				}
			}
			
		}
		$sql = "UPDATE `$sql_table` SET $sql_values WHERE $sql_where";
		
		$db->run_statement($sql);
		$rst = $db->run_query("SELECT * FROM `$sql_table` WHERE $sql_where");
			
		exit_with_response(mysqli_errno($db->link), mysqli_error($db->link), $rst);
	}

	function remove($obj){
		$db = new CDatabase($obj->server, $obj->database, $obj->username, $obj->password);
		
		$sql_table = $obj->sql_table;
		$sql_where = '';
		foreach($obj->fields as $field){
			if (property_exists($field, 'primary_key') && $field->primary_key == true){
				if ($sql_where != '') $sql_where .= ' AND ';
				foreach($obj->data as $key => $value){
					if (property_exists($field, 'alias') && $key == $field->alias){
						$sql_where .= '`'. $field->name .'` = '.db_format($value, $field->data_type);
					} else if ($key == $field->name){
						$sql_where .= '`'. $field->name .'` = '.db_format($value, $field->data_type);
					}
				}
			}
		}
		$sql = "DELETE FROM `$sql_table` WHERE $sql_where";

		$result = $db->run_statement($sql);
		exit_with_response(mysqli_errno($db->link), mysqli_error($db->link));
	}
	
	function read($obj){
		$rst = new CDatabase($obj->server, $obj->database, $obj->username, $obj->password);
		
		$sql = get_mysql_for_object($obj);
		$result = json_encode($rst->run_query($sql));

		exit_with_response(null, null, $result);
	}
	
	function read_table_list($obj){
		$rst = new CDatabase($obj->server, $obj->database, $obj->username, $obj->password);
		$result = array();
		
		foreach($obj->sql_table as $table){
			$sql = "SELECT * FROM `$table`";
			$result[$table] = $rst->run_query($sql);
		}
		
		exit_with_response(null,null, $result);
	}
	
	function get_mysql_for_object($obj){
		$sql = '';
		$sql_single = '';
		$alias_list = array();
		//print_r($obj);
		//TODO: EXCEPTION - WHEN THE TABLE IS GROUPS, WE SHOULD ONLY LOAD 
		//		GROUPS WHICH THIS USER OWNS.
		
		/* output in necessary format */
		if (property_exists($obj, 'fields')){
			$sql_fields = '';
			$sql_tables = '';
			$table_alias = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
			$link_cnt = 1;
			$main_table = 'A';
			$alias_list[] = array('alias'=>$main_table, 'table'=>$obj->sql_table);
			foreach($obj->fields as $field){
				if (property_exists($field, 'foreign_key')){
					$tbl = $table_alias[$link_cnt];
					
					$alias_list[] = array('alias'=>$tbl, 'table'=>$field->foreign_key->sql_table);
					
					$sql_tables .= ' LEFT JOIN `'.$field->foreign_key->sql_table. '` $tbl ON $tbl.`'.$field->foreign_key->key.'` = $main_table.`'. $field->name.'`';
					
						if ($sql_fields != '') $sql_fields .= ',';
						
						$sql_fields .= ' $tbl.`'. $field->foreign_key->value.'`';
						if (!property_exists($field, 'alias')){
							$sql_fields .= ' AS `'.$field->name. '`';
						} else {
							$sql_fields .= ' AS `'.$field->alias. '`';
						}
						
					//}
					$link_cnt++;
				}
				else{
					if ($sql_fields != '') $sql_fields .= ',';
					
					$sql_fields .= " `$main_table`.`". $field->name.'`';

					if (property_exists($field, 'alias')){
						$sql_fields .= ' AS `'.$field->alias. '`';
					}

				}
			}

			$sql_where = '';
			//IF THE MAIN TABLE IS THE TEAM-MEMBERS THEN 
			//JOIN WITH GROUP-MEMBERS TABLE AND SELECT THE SPECIFIC SUBSCRIPTION
			//if (property_exists($obj, 'client') && $obj->sql_table != 'clients'){
			//	$sql_where = ' WHERE $main_table.client = ''.$obj->client.'''; 
			//}
			
			if ($sql_single != ''){
				if ($sql_where != '') 
					$sql_where .= ' AND ';
				else
					$sql_where = ' WHERE ';
				$sql_where .= $sql_single;
			}
			
			//NOW BUILD THE WHERE CLAUSE
			if (property_exists($obj, 'filter')){
				foreach($obj->filter as $filter){
					foreach($alias_list as $alias){
						if ($alias['table'] != $filter->sql_table) continue;
						if ($sql_where != '') 
							$sql_where .= ' AND ';
						else
							$sql_where .= ' WHERE ';
						
						if (is_array($filter->value)){
							if (property_exists($filter, 'data_type') && $filter->data_type == 'date'){
								if (count($filter->value) != 2){
									exit_with_response(-1, 'For data-type [date] you must specify an array of two elements');
								}
								
								$sql_where .= "CAST(".$alias["alias"].".".$filter->field. " AS DATE) BETWEEN '".$filter->value[0]."' AND '".$filter->value[1]."'";
							} else {
								$value = '';
								foreach($filter->value as $v){
									$v = trim($v);
									if ($v != ''){
										$v = format_db_field($v);
										if ($value != '') $value .= ',';
										$value .= "'".$v."'";
									}
								}
								if ($value != '')
									$sql_where .= $alias['alias'].'.`'.$filter->field. '` IN ($v)';
							}
						} else {
							if ($filter->value == null){
								$sql_where .= $alias['alias'].'.`'.$filter->field. '` IS NULL ';
							} else {
								$sql_where .= $alias['alias'].'.`'.$filter->field. '` = '.db_format($filter->value);
							}
						}
					}
				}
			}
			
			$sql = "SELECT $sql_fields FROM `".$obj->sql_table."` $main_table $sql_tables $sql_where";
		}
		else{
			$sql_where = '';
			$sql_tables = '';


			$sql = "SELECT `".$obj->sql_table."`.* FROM `".$obj->sql_table."`".$sql_tables.$sql_where;
		}
		
		return $sql;
	}
?>
