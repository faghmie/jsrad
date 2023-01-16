var mysql_datatypes = {
	type		: 'mysql',
	description	: 'MySQL',
	
	getSQLType	: function(field){
			var sql = "";
			switch(field.data_type){
				case "number":
					sql = "BIGINT(20) UNSIGNED";
					break;
				case "text": case "color":
					sql = "VARCHAR(250)";
					break;
				case "number":
					sql = "BIGINT(20) UNSIGNED";
					break;
				case "date":
					sql = "DATE";
					break;
				case "datetime":
					sql = "DATETIME";
					break;
				case "time":
					sql = "TIME";
					break;
				case "notes":
					sql = "TEXT";
					break;
				case "editor":
					sql = "TEXT";
					break;
				case "boolean":
					sql = "SMALLINT";
					break;
				case "password":
					sql = "VARCHAR(250)";
					break;
				case "email":
					sql = "VARCHAR(250)";
					break;
				}
			
			return sql;
		},
	
	toSQL : function(table) {
		var sql = "DROP TABLE IF EXISTS `"+ table.name + "`;\n",
			primary_key = "",
			keys = "",
			field = null,
			first = false,
			f = null;
		
		if (table.is_a_view === true) return '';
		
		sql += "CREATE TABLE `" + table.name + "`(\n";
		
			first = true;
			for(f in table.fields){
				field = table.fields[f];
				sql += "\t";
				if (true === first){
					sql += "  ";
					first = false;
				} else {
					sql += ", ";
				}
				
				sql += "`"+ field.name +"`";
				
				if (true === field.auto_increment){
					sql += " BIGINT(20) UNSIGNED ";
					primary_key = ", PRIMARY KEY (`"+ field.name +"`)";
				
				} else if (field.foreign_key){
					sql += " BIGINT(20) UNSIGNED ";
					if (keys !== "") keys += "\t,";
					keys += "KEY `index_"+ table.name + '_' + field.name +"` (`"+ field.name +"`)\n";
					
				} else {
					sql += " "+this.getSQLType(field);
					
				}
				
				sql += (true === field.nullable ? " NULL" : " NOT NULL");
				
				sql += (true === field.auto_increment ? " AUTO_INCREMENT" : "");
				
				sql += (field.comment && field.comment.length > 0 ? " COMMENT '"+field.comment.substring(1, 60).replace(/\'/g,"\'")+"'" : "");
				
				sql += (field.sql_default && field.sql_default.length > 0 ? " DEFAULT '"+field.sql_default+"' " : " ");
				
				
				sql += "\n";
			}
		
		sql += "\t"+ primary_key +"\n";
		
		if (keys !== "") sql += "\t,"+keys;
		
		sql += (table.comment && table.comment.length > 0 ? " COMMENT '"+table.comment.substring(1, 60).replace(/\'/g,"\'")+"'" : "");
		
		sql += ");\n";
		
		return sql;
	},
	
	getStructure: function(erd){
		var text = '';
		for(var table in erd.tables){
			text += this.toSQL(erd.tables[table], erd) + '\n';
		}
		
		return text;
	},
	
	getConstraints : function(erd){
		var sql = '';
		
		for(var tbl in erd.tables){
			var table = erd.tables[tbl];
			var fk = '';
			var index = 0;
			
			if (table.is_a_view === true) continue;
			
			for(var f in table.fields){
				field = table.fields[f];
				if (!field.foreign_key) continue;

				var fk_table = erd.tables[field.foreign_key.sql_table];
				var fk_field = fk_table.fields[field.foreign_key.key];
				
				fk += " ADD CONSTRAINT `"+table.name+"_ibfk_"+(index++)+"` FOREIGN KEY (`"+field.name+"`) REFERENCES `"+ fk_table.name +"` (`"+ fk_field.name +"`) ON UPDATE CASCADE ";
				
				fk += "\n";
			}
			
			if (fk !== "") sql +="\nALTER TABLE `"+table.name+"`\n"+fk+";";
		}
		
		return sql;
	},
	
	getData : function(erd){
		var sql = '';
		
		for(var tbl in erd.tables){
			var table = erd.tables[tbl];
			var field_list = [];
			var has_pk = false;
			if (table.is_a_view === true) continue;
			
			for(var f in table.fields){
				field_list.push(table.fields[f].name);
			}

			for(var index in table.data){
				var values = table.data[index];
				
				sql += 'INSERT INTO `'+ table.name + '` ';
				var fields = '';
				var value = '';
				for(f in values){
					if (field_list.indexOf(f) === -1) continue;
					if (fields.length !== 0) fields += ',';
					if (value.length !== 0) value += ',';
					fields += '`' + f + '`';
					if (values[f] && values[f].toString().toLowerCase() !== 'null')
						value += '\'' + values[f] + '\'';
					else
						value += 'NULL';
				}
				sql += '('+ fields + ') VALUES ('+ value + ');\n'; 
			}
			
		}
		
		return sql;
	},
};
