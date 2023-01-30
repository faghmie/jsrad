var DataInterface = {
	 database : {	//REFERENCE TO THE DATABASE THE TABLE BELONGS TO
				database_type	: 'json',
				is_json			: true,
				entities		: {},
			},
	error_buffer		: [],
	
	message			: {},	//PASS VALUE IN HERE IF WE NEED TO PASS DATA TO AND FROM.
	
	upgrade_format: function(database) {
		var fix_me = false,
			table = null,
			field = null,
			f = null,
			t = null;
			
		if (typeof database === 'undefined') database = this.database;
		
        for(t in database.entities){
            table = database.entities[t];
            
            if (!table.uuid){ //FIX OLD MODELS
				fix_me = true;
				table.uuid = generate_uuid();
				database.entities[table.uuid] = table;
				table = database.entities[table.uuid];
				for(f in table.fields){
					field = table.fields[f];
					if (!field.uuid){
						field.uuid = generate_uuid();
						table.fields[field.uuid] = field;
						delete table.fields[f];
					}
				}
				
				delete database.entities[t];
			}
        }
        
        //RESTORE RELATIONSHIPS
		for(t in database.entities){
			table = database.entities[t];
			for(f in table.fields){
				field = table.fields[f];
				
				if (!field.foreign_key) continue;
				if (true === fix_me){
					for(var tx in database.entities){
						if (database.entities[tx].name == field.foreign_key.sql_table){
							field.foreign_key.sql_table = tx;
							break;
						}
					}
				}
				var fk_table = database.entities[field.foreign_key.sql_table];
				
				if (true === fix_me){
					for(var fx in fk_table.fields){
						if (fk_table.fields[fx].name == field.foreign_key.key){
							field.foreign_key.key = fx;
						} else if (fk_table.fields[fx].name == field.foreign_key.value){
							field.foreign_key.value = fx;
						} 
					}
				}
			}
		}
		
		//ADD DATA HEADERS
		for(t in database.entities){
			table = database.entities[t];
			if (typeof table.data_header !== 'undefined') continue;
			table.data_header = {};
			
			for(f in table.fields){
				table.data_header[f] = table.fields[f].name;
			}
		}
		
		//UPDATE DATA STORAGE FORMAT
		for(t in database.entities){
			table = database.entities[t];
			if (!table.data){
				this.data = {};
				continue;
			}
			
			if (table.data instanceof Array){
				var rows = {};
				
				for(var key = 0; key < table.data.length; key++){
					var uuid = generate_uuid();
					rows[uuid] = $.extend({}, table.data[key]);
				}
				delete table.data;
				table.data = $.extend({}, rows);
			}
		}
		
		return database;
	},
	
	fromData : function(data, fields){
		var result = $.extend(true, {
			  name			: this.name
			, title			: this.title
			, comment		: null
			, description	: null
			, selected		: false
			, hide_connector: false
			, object_type	: null
			
			, form_code 	: {
							  ui_group			: '__MAIN__'
							, ui_alignment		: 'horizontal'
							, ui_field_type		: 'text'
							, default_value		: null
							, visible			: true
							, show_on_editor	: true
							, show_on_grid		: true
							, show_on_import	: true
							, readonly			: false
							, links				: []
						}
			}, DataInterface);
		
		result.data = data;
		
		if (fields)
			result.fields = $.extend(true, {}, fields);
		else
			result.fields = $.extend(true, {}, this.fields);
		return result;
	},
	
	field_default_value: function(field, data){
		value = null;
		
		if (!field) return value;
		
		if (this.database.special_fields && typeof this.database.special_fields[field.name] === 'function'){
			if (null === value){
				value = this.database.special_fields[field.name]();
			}
		}
		
		if (value !== null) return value;
		
		if (data && (field.name in data))
			value = data[field.name];
		else if (this.message && (field.name in this.message))
			value = this.message[field.name];
		
		return value;
	},
	
	translate_foreign_key: function(field, value){
		var $this = this;
		var result = value;

		var fk = field.foreign_key;
		if (!fk) return value;

		if (fk.sql_table in this.database.entities){
			var fk_table = this.database.entities[fk.sql_table];
			
			var data = fk_table.data,
				fk_key = fk_table.fields[fk.key].name,
				fk_value = fk_table.fields[fk.value].name;

			for(var key in data){
				var row = data[key];
				if ((fk_key in row) && (row[fk_value] == value)){
					result = row[fk_key];
				}
			}
		}
		
		if (result && typeof result === 'string') result = result.replace(/(\n)/g, '<br></br>');
		//if (result === null) result = '';
		return result;
	},
	
	translate_field_value: function(field, value){
		var $this = this;
		var result = value;

		switch(field.data_type){
			case 'boolean':
				result = (value == 1 ? 'Y' : '');
				break;
		}
		
		//WITH NO URL, IT MEANS WE NEED TO TRANSLATE THE SELECTED ID INTO A NAME
		var fk = field.foreign_key;
		if (fk){ //IF THE FOREIGN-KEY FIELD IS SET THEN WE NEED TO GO LOOKUP THE ACTUAL VALUE TO DISPLAY
			if (fk.sql_table in this.database.entities){
				var fk_table = this.database.entities[fk.sql_table];
				var data = fk_table.data,
					fk_key = fk_table.fields[fk.key].name,
					fk_value = fk_table.fields[fk.value].name;
				
				for(var key in data){
					var row = data[key];
					if ((fk_value in row) && (row[fk_key] == value)){
						result = row[fk_value];
					}
				}
			}
			
			if (typeof fk.foreign_key !== 'undefined'){
				result = this.translate_field_value(fk, result);
			}
		}
		
		if (result && typeof result === 'string') result = result.replace(/(\n)/g, '<br></br>');
		if (result === null) result = '';
		return result;
	},
	
	validate_data: function (data, fields){
		var valid = true;
		if (typeof fields === 'undefined') fields = this.fields;
		//CHECK THAT REQUIRED FIELDS ARE PROVIDED
		var email_filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		var number_filter = /^-?\d*\.?\d*$/;
		
		this.error_buffer = [];
		for(var col in fields){
			var field = fields[col],
				fk = field.foreign_key,
				found = false,
				val = $.trim(data[field.name]);
			
			//CHECK IF FOREIGN-KEY CONSTRAINT WILL BE VIOLATED
			if (fk){
				if (!(fk.sql_table in this.database.entities)){
					this.error_buffer.push('Foreign Key table not found');
					valid = false;
					continue;
				}
				var fk_table = this.database.entities[fk.sql_table];
				
				var fk_data = fk_table.data,
					fk_key = fk_table.fields[fk.key].name,
					fk_value = fk_table.fields[fk.value].name;

				for(var key in fk_data){
					var row = fk_data[key];
					if ((fk_key in row) && (row[fk_key] == val)){
						found = true;
						break;
					}
				}
				
				if (false === found){
					this.error_buffer.push('Foreign Key violation for field: '+ field.title +'. Attempting to insert ['+val+']');
					valid = false;
					continue;
				}
			}
			
			if (field.required !== true) continue;
			
			if ((typeof val === 'undefined' ||
				null === val ||
				'' === val) && field.auto_increment === false) { //auto-increment fields can be null
				console.log(data);
				this.error_buffer.push(field.title+' cannot be empty');
				valid = false;
				continue;
			}
			
			if (field.data_type && field.data_type.toLowerCase() === 'email'){
				if (!email_filter.test(val)) {
					this.error_buffer.push('Please provide a valid email address');
					valid = false;
				}
			}
			
			if (field.data_type && field.data_type.toLowerCase() === 'number'){
				if (!number_filter.test(val) && field.auto_increment === false) {	//auto-increment fields can be null
					this.error_buffer.push('Please provide a valid number');
					valid = false;
				}
			}
		}
		
		return valid;
	},
	
	create: function (data, on_done){
		var $this = this;

		if (typeof(on_done) !== 'function') on_done = function(){};
		
		var _create_item_ex = function(data_to_return){
			if (true === $this.database.is_json){
				var uuid = generate_uuid();
				data_to_return.__row_id__ = uuid;
				$this.data[uuid] = $.extend({}, data_to_return);
				
				$this.database.is_dirty = true;
			}
			
			on_done(data_to_return, $this.error_buffer);
		};
		
		if (true !== $this.database.is_json){
			var fields = {};
			for(var f in this.fields){
				if (!(this.fields[f].name in data)){
					if (this.fields[f].primary_key !== true)
						 continue;
				}
				
				fields[f] = $.extend(true, {}, this.fields[f]);
				for(var p in fields[f]){
					if (['name', 'data_type', 'primary_key', 'readonly'].indexOf(p) === -1)
						delete fields[f][p];
				}
			}
			
			var request = {
							ajax_type	: 'POST',
							sql_table	: this.name,
							database	: this.database.database,
							server		: this.database.database_server,
							username	: this.database.database_username,
							password	: this.database.database_password,
							fields		: fields,
							data		: data,
						};
			
			App.ajax_call('api/v1/dbs/'+$this.database.database_type, request, function(_data){
				_create_item_ex(_data);
			});
		} else {
			if (false === this.validate_data(data)){
				return on_done(data, this.error_buffer);
			}			
			//NEED TO FAKE THE PRIMARY/AUTO-NUMBER FIELD
			var pk = null;
			var max = 0;

			for(var col in this.fields){
				var field = this.fields[col];
				if (field.primary_key === true) pk = field.name;
			}
			
			for(col in this.data){
				var row = this.data[col];
				if (parseFloat(row[pk]) > max) max = parseFloat(row[pk]);
			}
			max++;
			data[pk] = max;

			_create_item_ex(data);
		}
	},
	
	remove: function (data_to_remove, on_done){
		var $this = this,
			f = null,
			p = null,
			row = null,
			db_key = null,
			data_set = data_to_remove;
		
		if (typeof on_done !== 'function') on_done = function(){};
		
		if (typeof this.data !== 'object') this.data = {};
		
		if (typeof data_to_remove !== 'object') {
			db_key = data_to_remove;
			data_set = this.data[db_key];
		}
		//console.log(data_to_remove);
		//console.log($this.data);
		var _remove_ex = function(data_set){
			var row = $.extend({}, data_set);
			
			delete $this.data[data_set['@db-key']];
			delete $this.data[data_set.__row_id__];
			//if ($this.database.is_json === true)
			//	$this.database.is_dirty = true;
			
			on_done(row, $this.error_buffer);
		};
			
		if (true === this.database.is_json){
			//GO THROUGH THE DATABASE AND DO REFERENTIAL CHECKS
			var is_referenced = false;
			var msg = '';
			this.error_buffer = [];
			
			if (db_key !== null)
				row = this.data[db_key];
			else
				row = data_set;
			
			for(var tbl in this.database.entities){
				if (tbl == this.uuid) continue;
				var table = this.database.entities[tbl];
				var found = false;
				var fk_field = null;
				for(f in table.fields){
					//IGNORE IF NOT A FOREIGN KEY
					if (!table.fields[f].foreign_key) continue;
					
					//IGNORE IF NOT REFERENCING THIS TABLE
					if (table.fields[f].foreign_key.sql_table !== this.uuid) continue;
					
					//IF WE GET HERE THEN IT IS REFERENCING THE TABLE.
					fk_field = table.fields[f];
					
					//FIGURE OUT WHICH FIELD IS IS REFERENCING
					var pk = this.fields[fk_field.foreign_key.key];
					for(var key in table.data){
						var ref_row = table.data[key];
						if (ref_row[table.fields[f].name] == row[pk.name]){
							this.error_buffer.push('Value is referenced in: ['+ table.title +']');
							is_referenced = true;
							break;
						}
					}
					
				}
			}

			if (this.error_buffer.length !== 0){
				return on_done(db_key, this.error_buffer);
			}
			
			_remove_ex(data_set);
			
		} else {
			var fields = {};
			for(f in this.fields){
				fields[f] = $.extend(true, {}, this.fields[f]);
				delete fields[f].prototype;
				for(p in fields[f]){
					if (['name', 'data_type', 'primary_key', 'readonly'].indexOf(p) === -1)
						delete fields[f][p];
				}
			}
			
			var request = {
							ajax_type	: 'DELETE',
							sql_table	: this.name,
							database	: this.database.database,
							server		: this.database.database_server,
							username	: this.database.database_username,
							password	: this.database.database_password,
							fields		: fields,
							data		: data_set,
						};

			App.ajax_call('api/v1/dbs/'+$this.database.database_type, request, function(data){
					on_done(data_to_remove, $this.error_buffer);
				});
		}
	},
	
	update: function (old_data, new_data, on_done){
		var $this = this;
		if (typeof on_done !== 'function') on_done = function(){};
		
		//LOCATE THE PRIMARY KEY....FOR LATER USE
		var pk = null,
			pk_uuid = null,
			fields = {};
			
		for(var col in this.fields){
			var field = this.fields[col];
			if (field.primary_key === true){
				pk = field.name;
				pk_uuid = col;
			}
			
			if (field.name in new_data) fields[col] = field;
		}

		//THIS IS REALLY JUST TO FIX THE MOVE FROM
		//var to_remove = [];
		//for(col in new_data){
			//if (col in this.fields){
				//new_data[this.fields[col].name] = new_data[col];
				//to_remove.push(col);
			//}
		//}
		
		//for(var index = 0; index < to_remove.length; index++){
			//delete new_data[to_remove[index]];
		//}

		function __update_cache(old_data, new_data){
			//NOW UPDATE THE MAIN LIST
			
			for(var key in $this.data){
				var d = $this.data[key],
					col = null,
					field = null,
					found = null,
					index = null;
				
				//FIRST TRY TO UPDATE BASED ON PRIMARY KEY
				if (pk !== null && d[pk] == new_data[pk]){
					for(col in $this.fields){
						field = $this.fields[col];
						if (field.name in new_data){
							d[field.name] = new_data[field.name];
						}
					}
					
				//NO PK SO WE COMPARE EVERY FIELD IN THE ROW.
				} else { 
					//found = true; //ASSUME THE ROW IS FOUND
					
					//for(index in old_data){
						//if (old_data[index] !== d[index])
							//found = false;
					//}
					
					//if (true === found){
						//for(col in $this.fields){
							//field = $this.fields[col];
							//if (field.name in new_data){
								//d[field.name] = new_data[field.name];
							//}
						//}
					//}
				}
			}
			
			if (true === $this.database.is_json)
				$this.database.is_dirty = true;
			
			on_done(new_data, $this.error_buffer);
		}
		
		if (false === this.database.is_json){
			fields = {};
			for(var f in this.fields){
				if (!(this.fields[f].name in new_data)) continue;
				
				fields[f] = $.extend(true, {}, this.fields[f]);
				for(var p in fields[f]){
					if (['name', 'data_type', 'primary_key', 'readonly'].indexOf(p) === -1)
						delete fields[f][p];
				}
			}
			
			var request = {
							ajax_type	: 'PUT',
							sql_table	: this.name,
							database	: this.database.database,
							server		: this.database.database_server,
							username	: this.database.database_username,
							password	: this.database.database_password,
							fields		: fields,
							data		: new_data,
						};

			App.ajax_call('api/v1/dbs/'+$this.database.database_type, request, function(data){
					on_done(new_data, $this.error_buffer);
				});
		} else {
			//VALIDATE ALL THE ENTRIES RECEIVED.
			if (false === this.validate_data(new_data, fields)){
				return on_done(new_data, this.error_buffer);
			}
			
			__update_cache(old_data, new_data);
		}

	},

	select : function(where, on_done, on_error){
			//WHERE-CLAUSE STRUCTURE
			var WHERE_SAMPLE =	{
					  _join		: "OR"									//DEFAULT IF MISSING IS AND`
					, field1	: "some-value"							//FIND SPECIFIC VALUE
					, field2	: ["some-value", "another-value"]		//FIND ANY OF THESE VALUES
					, field3	: {from: "start", to: "end"}			//LOOK FOR THINGS IN A RANGE
					, field4	: {_not: true, from: "value"}			//FIND VALUES WHERE FIELD IS NOT A SPECIFIC VALUE
					, field5	: {_contains: true, from: "value"}		//FIND VALUES THAT CONTAIN FROM
					, field6	: {_startswith: true, from: "value"}	//FIND VALUES THAT STARTS FROM
					, field7	: {_endswith: true, from: "value"}		//FIND VALUES THAT ENDS FROM
				};
				
			var $this = this,
				result = [],
				key = null;
			
			if (typeof on_done !== 'function') on_done = function(){};
			if (typeof on_error !== 'function') on_error = on_done;
			if (!where) where = [];
			
			function select_json(){
				var key = null,
					rows = {};
				if (!(where instanceof Array)){
					alert("Where-clause is not in the correct state");
					return result;
				}

				if (!$this.data){
					if ($this.sql_table in $this.database.entities){
						$this.data = $this.database.entities[$this.sql_table].data;
					} else {
						$this.data = {};
					}
				}
				
				if ($this.data instanceof Array){
					rows = {};
					
					for(key = 0; key < $this.data.length; key++){
						var uuid = generate_uuid();
						rows[uuid] = $.extend({}, $this.data[key]);
					}
					delete $this.data;
					$this.data = $.extend(true, {}, rows);
				}
				
				if (where.length === 0 ){
					 result = $this.data;
				
				} else {
					for(key in $this.data){
						//WILL DO THIS LATER....30 MARCH 2014
						var select_item = true;
						var row = $this.data[key];
						for(var index = 0; index < where.length; index++){
							for(var field in where[index]){
								var condition = where[index][field];
								if (condition instanceof Array){
									select_item = false;
									$(condition).each(function(){
										if (row[field] == this)
											select_item = true;
									});
								} else {
									if (typeof row[field] == "string"){
										if (row[field].indexOf(condition) === -1)
											select_item = false;
									} else {
										if (row[field] != condition)
											select_item = false;
									}
								}
							}
						}
						
						if (true === select_item)
							result.push(row);
					}
				}
				
				rows = [];
				for(key in result){
					rows.push(result[key]);
					rows[rows.length - 1].__row_id__ = key;
				}
				on_done(rows);
			}
			
			if (this.is_a_view === true){
				var sql_view = new SQLView();
				sql_view.get_tree(this.database, this.uuid, function(data){
					on_done(data);
				});
				return;
			}

			if (true === this.database.is_json){
				select_json();
			
			} else {
				var fields = {};
				var tables = [];
				tables.push(this.name);
				for(var f in this.fields){
					if (!this.fields[f].foreign_key) continue;
					var fk = this.fields[f].foreign_key;
					if (fk){
						var fk_table = this.database.entities[fk.sql_table];
						tables.push(fk_table.name);
					}
				}
				
				var request = {
								sql_table	: tables,
								database	: this.database.database,
								server		: this.database.database_server,
								username	: this.database.database_username,
								password	: this.database.database_password,
								data		: {}
						};
				
				this.data_last_updated = (new Date()).getTime();
				
				App.ajax_call(
					'api/v1/dbs/'+$this.database.database_type, 
					request, 
					function(data){
						for(var table_name in data){
							for(var ent in $this.database.entities){
								if (table_name != $this.database.entities[ent].name) continue;
								
								$this.database.entities[ent].data = data[table_name];
								break;
							}
						}
						on_done($this.data);
					}, 
					function(e){
						on_error(e);
					});
			}
			return result;
		},
	
	select_multiple: function(tables, erd, on_done){
		var key = null;
		
		if (typeof on_done !== 'function') on_done = function(){};
		if (!tables){
			tables = [];
			for(var tbl in erd.tables){
				tables.push(tbl);
			}
		}
		
		if (true === erd.project.is_json){
			on_done();
		
		} else {
			var request = {
							sql_table	: [],
							database	: erd.project.database,
							server		: erd.project.database_server,
							username	: erd.project.database_username,
							password	: erd.project.database_password,
							data		: {}
					};
			
			for(key = 0; key < tables.length; key++){
				if (erd.tables[tables[key]].is_a_view === true) continue;
				var table = erd.tables[tables[key]].name;
				if (request.sql_table.indexOf(table) === -1)
					request.sql_table.push(table);
			}
			
			App.ajax_call('api/v1/dbs/'+this.database.database_type, request, function(data){
				for(key = 0; key < tables.length; key++){
					var name = erd.tables[tables[key]].name;
					if (name in data){
						erd.tables[tables[key]].data = data[name];
						erd.tables[tables[key]].data_last_updated = (new Date()).getTime();
					}
				}
				on_done();
			});
		}
	},
	
	get_parameter_list: function(field, on_done){
		var data = $.extend({}, this.data),
			fk_table = null,
			$this = this;
		if (typeof on_done !== 'function') on_done = function(){};
		
		if (typeof field.default_value === 'undefined') field.default_value = null;
		
		function sort_select_data(field, data){
			var value = null;
				
			if (field.foreign_key && (field.foreign_key.sql_table in $this.database.entities)) 
				fk_table = $this.database.entities[field.foreign_key.sql_table];
			
			value = fk_table.fields[field.foreign_key.value];
			
			if (typeof field.sort_order !== 'undefined'){
				if ($.trim(field.sort_order.toLowerCase()) === 'asc'){
					data.sort(function(a,b){
						return a[value].localeCompare(b[value]);
					});
				} else if ($.trim(field.sort_order.toLowerCase()) === 'desc'){
					data.sort(function(a,b){
						return b[value].localeCompare(a[value]);
					});
				}
			}
			
			on_done(field, data);
		}

		var skip_ajax = false;
		if (field.foreign_key && (field.foreign_key.sql_table in this.database.entities)) 
			fk_table = this.database.entities[field.foreign_key.sql_table];
			
		if (null !== fk_table){
			data = fk_table.data;
			skip_ajax = true;
		}

		if (true !== this.database.is_json){
			//THIS IS NOW BROKEN....SINCE MOVING TO UUIDS
			fk_table = this.database.entities[field.foreign_key.sql_table];
			
			fk_table.select([], function(data){
				sort_select_data(field, data);
			});
		}
		else
			sort_select_data(field, data);
	},

	get_view: function(on_done){
		var $this = this,
			view = null,
			row = null,
			field = null;
		if (typeof on_done !== 'function') on_done = function(){};
		
		this.select(null, function(data){
			for(var item in data){
				var data_row = data[item];
				row = {};
				if (!(view instanceof Array)) view = [];
				
				view.push(row);
				for(field in $this.fields){
					row[$this.fields[field].name] = $this.translate_field_value($this.fields[field], data_row[$this.fields[field].name]);
				}
			}
			on_done(view);
		});
        
		return view;
	},

};


var SQLView = function(){
	var nodes = {
			  entity	: null
			, link	: []
		};
	
	var table_stack = [];
	var view = null;
	var view_main_table = null;
	var dataset = [];
	var header = [];
	var already_loaded = [];
	
	function start_here(erd, table_name, on_done){
		if (typeof on_done !== 'function') on_done = function(data){console.log(data);};
		view = {entity: table_name, link: []};
		view_main_table = null;
		var view_tbl = erd.entities[table_name];
		var links = {};
		
		//TAKE FIRST FOREIGN KEY AS THE MAIN VIEW TABLE
		for(var f in view_tbl.fields){
			if (!view_tbl.fields[f].foreign_key) continue;
			
			view_main_table = erd.entities[view_tbl.fields[f].foreign_key.sql_table];
			break;
		}
		
		if (!view_main_table){
			return on_done(null);
		}
		
		nodes = {entity: view_main_table.uuid, link: []};
		table_stack.push(view_main_table.uuid);
		parse_table(nodes, erd);
		parse_fk_table(nodes, erd);
		batch_load(table_stack.slice(0), erd, function(){
			build_node_list(erd, table_name, on_done);
		});
	}

	function batch_load(tables, erd, on_done){
		var $this = this,
			result = [],
			key = null;
		
		if (typeof on_done !== 'function') on_done = function(){};

		if (true === erd.is_json){
			on_done();
		
		} else {
			var request = {
							sql_table	: [],
							database	: erd.database,
							server		: erd.database_server,
							username	: erd.database_username,
							password	: erd.database_password,
							data		: {}
					};
			
			for(key = 0; key < tables.length; key++){
				if (erd.entities[tables[key]].is_a_view === true) continue;
				var table = erd.entities[tables[key]].name;
				if (request.sql_table.indexOf(table) === -1)
					request.sql_table.push(table);
			}
			
			App.ajax_call('api/v1/dbs/'+erd.database_type, request, function(data){
				for(key = 0; key < tables.length; key++){
					var name = erd.entities[tables[key]].name;
					if (name in data){
						erd.entities[tables[key]].data = data[name];
					}
				}
				
				on_done();
			});
		}
	}
	
	function build_node_list(erd, table_name, on_done){
		view = {entity: table_name, link: []};
		view_main_table = null;
		var view_tbl = erd.entities[table_name];
		var links = {};
		var node_paths = [],
			aggregation_needed = false,
			aggr_fields = [],
			group_by = [],
			col = null,
			target = null,
			path = null;
		
		for(var f in view_tbl.fields){
			col = view_tbl.fields[f];
			if (!col.foreign_key) continue;
			
			target = {entity: erd.entities[col.foreign_key.sql_table].uuid};
			path = [];
			
			search(path, nodes, target);
			links[col.foreign_key.sql_table] = path;
			header.push({field: col.foreign_key, path: path});
			
			//CHECK FOR AGGREGATION
			if (col.aggregate_type && col.aggregate_type.length > 0){
				aggregation_needed = true;
				aggr_fields.push(col);
			} else {
				group_by.push(col);
			}
		}
		
		for(f in links){
			node_paths.push(links[f]);
		}
		
		var dataset = [];
		header = [];
		
		node_paths.sort(function(a, b){
					return b.length - a.length;
				});
		dataset = retrieve_data(node_paths, header, erd);
		var data = [];
		_.each(dataset, function(row, key, list){
			var item = {};
			_.each(view_tbl.fields, function(field, key, list){
				item[field.name] = null;
				if (!field.foreign_key) return;
				var fk_field = erd.entities[field.foreign_key.sql_table].fields[field.foreign_key.value];
				
				_.each(row, function(column, key, list){
					if (column.__table__ !== field.foreign_key.sql_table) return;
					if (column[fk_field.name] !== undefined)
						item[field.name] = column[fk_field.name];
				});
			});
			
			data.push(item);
		});
		
		if (aggr_fields.length > 0)
			data = aggregate(data, group_by, aggr_fields);
		
		on_done(data);
		
		return data;
	}
	
	function aggregate(data, group_by, aggregate){

		//FOK...I CAN'T REMEMBER WHAT I DID HERE....NEED TO REVIEW AND COMMENT AT SOME POINT
		var group_data = _.chain(data)
			.groupBy(function(item){
				var group_key = '';
				_.each(group_by, function(field){
					group_key += item[field.name] + '-';
				});
				return group_key;
			})
			.map(function(items, node){
					return items;
				})
			.value();
		
		var rows = [];
		
		_.each(group_data, function(items){
			var row = null;
			
			if ((items instanceof Array) && items.length === 1){
				row = items[0];
				_.each(aggregate, function(field){
					switch (field.aggregate_type.toLowerCase()){
						case 'count':
								if (row[field.name] !== null)
									row[field.name] = 1;
							break;
					}
				});
					
				rows.push(row);
				return;
			}

			var first_time = true;
			row = _.reduce(items, function(memo, item){
						_.each(aggregate, function(field){
							memo[field.name] = parseFloat(memo[field.name]);
							
							switch (field.aggregate_type.toLowerCase()){
								case 'count':
										if (true === first_time)
											memo[field.name] = 1;
										
										memo[field.name]++;
										first_time = false;
									break;
								
								case 'sum':
										item[field.name] = parseFloat(item[field.name] || 0);
										memo[field.name] += item[field.name];
									break;
								
								case 'max':
									item[field.name] = parseFloat(item[field.name] || 0);
									if (item[field.name] && (memo[field.name] < item[field.name]))
										memo[field.name] = item[field.name];
									break;
								
								case 'min':
									if (item[field.name]){
										item[field.name] = parseFloat(item[field.name]);
										if (memo[field.name] > item[field.name])
											memo[field.name] = item[field.name];
									}
									break;
							}
						});
						
						return memo;
				});
			
			rows.push(row);
		});

		return rows;
	}
	
	function search(path, dataset, target) {
		if (dataset.entity != view.entity)
			path.push(dataset);
		
		if (dataset.entity == target.entity)
			return;
		
		for(var i = 0; i < dataset.link.length; i++){
			var node = dataset.link[i];
			if (node.entity == target.entity){
				path.push(node);
				return;
			}
			search(path, node, target);
			
			if (path.length <= 0) continue;
			
			var last_node = path[path.length - 1];
			if (last_node.entity != target.entity){
				while(path[path.length - 1].entity != dataset.entity && path.length !== 0){
					path.pop();
				}
			} else {
				break;
			}
		}
	}
	
	function parse_fk_table(node, erd){
		var table = erd.entities[node.entity],
			new_node = null,
			column = null,
			col = null;
		
		for(col in table.fields){
			column = table.fields[col];
			
			if (!column.foreign_key) continue;
			
			if(table_stack.indexOf(column.foreign_key.sql_table) !== -1) continue;
			table_stack.push(column.foreign_key.sql_table);
			
			new_node = {
					  entity: erd.entities[column.foreign_key.sql_table].uuid
					, parent: true
					, link: []
				};
			
			if (view.entity !== new_node.entity)
				node.link.push(new_node);
			
			parse_fk_table(new_node, erd);
		}
		
		//NOW DO THE SAME FOR THE LINKS IN THIS ENTITY
		for(var i = 0; i < node.link.length; i++){
			new_node = node.link[i];
			if (view.entity !== new_node.entity)
				parse_fk_table(new_node, erd);
		}
	}
	
	function parse_table(node, erd){
		for(var key in erd.entities){
			var table = erd.entities[key];
			for(var col in table.fields){
				var column = table.fields[col];
				
				if (!column.foreign_key) continue;
				
				if (column.foreign_key.sql_table !== node.entity) continue;
				
				if(table_stack.indexOf(table.uuid) !== -1) continue;
				table_stack.push(table.uuid);
				
				var new_node = {
						  entity: table.uuid
						, link: []
					};
				
				node.link.push(new_node);
				parse_table(new_node, erd);
			}
		}
	}
	
	function retrieve_data(path, header, erd, on_done){
		dataset = [];
		header = [];
		var dt = null,
			cell = null,
			table = null;

		for(var i = 0; i < path.length; i++){ //ELEMENTS IN PATH
			var el = path[i];
			for(var t = 0; t < el.length; t++){ //TABLES IN ELEMENT
				table = erd.entities[el[t].entity];
				if (header.indexOf(table.uuid) !== -1) continue;
				
				header.push(table.uuid);
				if (header.length === 1){ 
					//MEANS THIS IS THE FIRST TABLE
					//SO JUST COPY THE DATA ACROSS
					for(var d in table.data){
						dt = table.data[d];
						dt.__table__ = table.uuid;
						dataset.push([dt]);
					}
					
					continue;
				}
				
				var join_table = erd.entities[el[t - 1].entity];
				var join_index = header.indexOf(join_table.uuid);
				for(var di = 0; di < dataset.length; di++){ //DATASET
					var data_row = dataset[di],
						join_cell = data_row[join_index];
					
					cell = join(table, join_table); //TABLE HAS A FK TO JOIN-TABLE
					
					table_name = null;
					if (cell){
						dt = _.filter(table.data, function(item){
							return item[cell.name] == join_cell[join_table.fields[cell.foreign_key.key].name];
						});
						table_name = table.uuid;
					} else {
						cell = join(join_table, table); //JOIN-TABLE HAS A FK TO TABLE
						if (cell){
							dt = _.filter(table.data, function(item){
								return item[table.fields[cell.foreign_key.key].name] == join_cell[cell.name];
							});
							table_name = table.uuid;
						} else {
							continue;
						}
					}
					
					if (dt.length === 0){
						dataset[di].push({'__table__':table.uuid});
						continue;
					}
					
					var first_time = true;
					var new_row = clone(dataset[di]);
					
					for(var id = 0; id < dt.length; id++){
						var data = dt[id];
						data.__table__ = table.uuid;
						if (id === 0){
							dataset[di].push(data);
							
						} else {
							var r = clone(new_row);
							r.push(data);
							dataset.splice(di, 0, r);
							di++;
						}
					}
				}
			}
		}

		return dataset;
	}
	
	function join(table, join_table){

		var result = null;
		for(var f in table.fields){
			var col = table.fields[f];
			if (!col.foreign_key) continue;
			if (col.foreign_key.sql_table == join_table.uuid){
				result = col;
				break;
			}
		}
		
		return result;
	}
	
	return {
			get_tree: start_here,
			aggregate: aggregate,
		};
};
