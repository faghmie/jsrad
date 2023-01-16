var mssql_datatypes = {
	type		: 'mssql',
	description	: 'MS SQL Server',
	field_by_type	: {},
	
	
	getSQLType	: function(field){
			var sql = '';
			switch(field.data_type){
				case 'number':
					sql = 'BIGINT';
					this.field_by_type[field.name] = 'number';
					break;
				case 'decimal':
					sql = 'DECIMAL(12,2)';
					this.field_by_type[field.name] = 'number';
					break;
				case 'text': 
				case 'color':
					sql = 'VARCHAR(MAX)';
					this.field_by_type[field.name] = 'text';
					break;
				case 'number':
					sql = 'BIGINT(20) UNSIGNED';
					this.field_by_type[field.name] = 'number';
					break;
				case 'date':
					sql = 'DATE';
					this.field_by_type[field.name] = 'text';
					break;
				case 'datetime':
					sql = 'DATETIME';
					this.field_by_type[field.name] = 'text';
					break;
				case 'time':
					sql = 'TIME';
					this.field_by_type[field.name] = 'text';
					break;
				case 'notes':
					sql = 'VARCHAR(MAX)';
					this.field_by_type[field.name] = 'text';
					break;
				case 'editor':
					sql = 'VARCHAR(MAX)';
					this.field_by_type[field.name] = 'text';
					break;
				case 'boolean':
					sql = 'SMALLINT';
					this.field_by_type[field.name] = 'number';
					break;
				case 'password':
					sql = 'VARCHAR(150)';
					this.field_by_type[field.name] = 'text';
					break;
				case 'email':
					sql = 'VARCHAR(150)';
					this.field_by_type[field.name] = 'text';
					break;
				}
			
			return sql;
		},
	
	build_table : function(table, erd) {
		var sql = 'IF OBJECT_ID(\''+ table.name +'\', \'U\') IS NOT NULL\nDROP TABLE ['+ table.name + '];\n',
			primary_key = '',
			keys = '',
			field = null,
			first = false,
			f = null;
		
		if (table.is_a_view === true) return '';
		
		sql += 'CREATE TABLE [' + table.name + '](\n';
		
			first = true;
			for(f in table.fields){
				field = table.fields[f];
				sql += '\t';
				if (true === first){
					sql += '  ';
					first = false;
				} else {
					sql += ', ';
				}
				
				sql += '['+ field.name +']';
				
				if (true === field.auto_increment){
					sql += ' BIGINT';
					primary_key = ', CONSTRAINT pk_'+ table.name + '_' + field.name +' PRIMARY KEY ('+ field.name +')';
					this.field_by_type[field.name] = 'number';
				} else if (field.foreign_key){
					sql += ' BIGINT';
					this.field_by_type[field.name] = 'number';
				} else {
					sql += ' '+this.getSQLType(field);
					
				}
				
				sql += (true === field.nullable ? '' : ' NOT NULL');
				
				sql += (true === field.auto_increment ? ' IDENTITY' : '');
				
				sql += (field.sql_default && field.sql_default.length > 0 ? " DEFAULT '"+field.sql_default+"' " : " ");
				
				
				sql += '\n';
			}
		
		sql += '\t'+ primary_key +'\n';
		
		if (keys !== '') sql += '\t,'+keys;
		
		sql += ');\n';
		
		return sql;
	},
	
	getStructure: function(erd){
		var text = 'USE ' + erd.project.name.replace(/ /g, '_') + ';\n';
		for(var table in erd.tables){
			text += this.build_table(erd.tables[table], erd) + '\n';
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
			console.log('******** '+table.title);
			for(var f in table.fields){
				field = table.fields[f];
				if (!field.foreign_key) continue; 
				
				console.log(field);
				var fk_table = erd.tables[field.foreign_key.sql_table];
				var fk_field = fk_table.fields[field.foreign_key.key];
				
				fk += 'ALTER TABLE ['+table.name+'] ADD CONSTRAINT ['+table.name+'_ibfk_'+(index++)+'] FOREIGN KEY (['+field.name+']) REFERENCES ['+ fk_table.name +'] (['+ fk_field.name +']) ON UPDATE NO ACTION ON DELETE NO ACTION ';
				
				fk += '\n';
			}
			
			if (fk !== '') sql += fk+'\n';//'\nALTER TABLE ['+table.name+']\n'+fk+';';
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
				if (true === table.fields[f].primary_key)
					has_pk = true;
			}
			if (true === has_pk)
				sql += 'SET IDENTITY_INSERT [' + table.name + '] ON;\n';
				
			//for(var index = 0; index < table.data.length; index++){
			for(var index in table.data){
				var values = table.data[index];
				
				sql += 'INSERT INTO ['+ table.name + '] ';
				var fields = '';
				var value = '';
				for(f in values){
					if (field_list.indexOf(f) === -1) continue;
					if (fields.length !== 0) fields += ',';
					if (value.length !== 0) value += ',';
					fields += '[' + f + ']';
					if (values[f] && values[f].toString().toLowerCase() !== 'null'){
						if (this.field_by_type[f] === 'number')
							value += values[f];
						else
							value += '\'' + values[f] + '\'';
					} else {
						value += 'NULL';
					}
				}
				sql += '('+ fields + ') VALUES ('+ value + ');\n'; 
			}
			
			if (true === has_pk)
				sql += 'SET IDENTITY_INSERT [' + table.name + '] OFF;\n';			
		}
		
		return sql;
	},
};
