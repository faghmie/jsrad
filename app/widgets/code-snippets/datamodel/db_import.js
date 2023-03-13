const { default: Dialog } = require("../../../common/Dialog");

var control_db_import = {
	type				: 'db_import',
	control_label		: 'Database Import Record',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	description			: 'Import a db record into a table',
	
	open_mapper: function(){
		//ON THIS CHANGE WE LOAD THE TABLES
		var col = null,
			key = 0,
			fields = [],
			tbl = this.datasource.entity,
			mapper = $('<div>');
		
		var ds = App.datasources[this.datasource.name];
		if (!ds) return;
		
		for(col in ds.entities[tbl].fields){
			fields.push(ds.entities[tbl].fields[col]);
		}
		
		fields = fields.sort(function(a, b){
			return a.index - b.index;
		});
		
		for(key = 0; key < fields.length; key++){
			col = fields[key];
		
			if (ds.implementation_fields.indexOf(col.name) !== -1) continue;
			var field = this.create_attribute(col.uuid, true);
			field.find('input').before('<label>'+ col.title + '</label>');
			mapper.append(field);
		}
		
		new Dialog(mapper,{
			title: 'Map database fields',
		});
	},
	
	_get_settings: function(){
		var $this = this;
		var settings = [];
		
		var datasource = $('<select class="form-control">');
		var tables = $('<select class="form-control">');
		var btn = $('<button type="button">map fields</button>').addClass('btn btn-light btn-flat');
		settings.push(['data to import', this.create_attribute('_import_data_')]);
		settings.push(['datasource', datasource]);
		settings.push(['entity', tables]);
		settings.push(['Now map your fields',btn]);
		
		datasource.on('change', function(){
			tables.children().remove();
			$this.datasource.name = $(this).val();
			
			if ($this.datasource.name === '')	return;
			
			var rebuild_tables = function(ds){
				tables.children().remove();
				tables.append('<option>');
				for(var tbl in ds.entities){
					tables.append('<option value="'+tbl+'">'+ds.entities[tbl].title+'</option>');
					if ($this.datasource.entity === tbl)
						tables.find('option:last-child').attr('selected', 'selected');
				}
				
				if (tables.find('option:selected').index() > 0)
					tables.trigger('change');
			};
			
			var ds_name = $this.datasource.name;
			
			if (!(ds_name in App.datasources) || App.datasources[ds_name].is_loaded !== true){
				App.datasource_reload(ds_name).then(function(ds){ 
					//ON THIS CHANGE WE LOAD THE TABLES
					rebuild_tables(ds);
				})
				.catch(function(err){
					App.MessageError(err);
				});
			} else {
				rebuild_tables(App.datasources[ds_name]);
			}
		});
		
		tables.on('change', function(){
			$this.datasource.entity = $(this).val();
		});
		
		btn.on('click', function(){
			$this.open_mapper();
		});
		
		datasource.children().remove();
		tables.children().remove();
		
		datasource.children().remove();
		datasource.append('<option>');
		for(var key in App.datasources){
			datasource.append('<option>'+ key +'</option>');
			if ($this.datasource.name === key)
				datasource.find('option:last-child').attr('selected', 'selected');
		}
		
		if (datasource.find('option:selected').index() > 0)
			datasource.trigger('change');
		
		var ds_div = $('<div>')
							.addClass('input-group')
							.append(datasource);
		var btn_ds = $('<div>').addClass('input-group-btn').appendTo(ds_div);
		var view_ds = $('<a class="btn" title="edit datasource"><i class="la la-fw la-pencil" ></i></a>')
						.appendTo(btn_ds);
						
		view_ds.on('click', function(){
			var src = datasource.val();
			
			if (!src) return;
			show_erd_instance(src, datasource);
		});
		
		
		var tbl_div = $('<div>')
							.addClass('input-group')
							.append(tables);
		btn_tbl = $('<div>').addClass('input-group-btn').appendTo(tbl_div);

		var view_table = $('<a class="btn" title="view data in table"><i class="la la-fw la-th" ></i></a>')
						.appendTo(btn_tbl);
						
		view_table.on('click', function(){
			var tbl = tables.val();
			var src = datasource.val();
			
			if (!src) return;
			if (!(src in App.datasources)){
				App.MessageError('Could not find datasource: '+ src);
				return;
			}
			
			if (typeof App.datasources[src].entities !== 'undefined'){
				if (!(tbl in App.datasources[src].entities)){
					App.MessageError('Could not locate entity ['+tbl+'] in datasource ['+src+']');
					return;
				}
				App.datasources[src].entities[tbl].showEditor();
			} else {
				App.MessageError('Datasource was not loaded.');
			}
		});
				
		return settings;
	},
	
	_unique_list: function(data, group_by){
		//SOURCE: http://stackoverflow.com/questions/9923890/removing-duplicate-objects-with-underscore-for-javascript
		var uniques = _.map(_.groupBy(data, function(doc){
								var comp = 'key';
								if (doc instanceof Array){
									for(var key = 0; key < group_by.length; key++){
									//for(var key = 0; key < doc.length; key++){
										
										comp += doc[group_by[key].key] + '-';
									}
								} else
									comp = doc;
									
								return comp;
								
							}),function(grouped){
								return grouped[0];
							});

		return uniques;
	},
	
	_import_the_list: function(table, list, group_by, on_done){
		var $this = this,
			item = null;
		
		item = list.shift();
		//console.log(table.title);
		if (typeof on_done !== 'function') on_done = function(){};
		
		if (!item){
			return on_done();
		}
		
		table.select(null, function(data){
			var found = true,
				record = {};
			
			for(k = 0; k < group_by.length; k++){
				record[group_by[k].name] = item[group_by[k].key];
				if (group_by[k].field.foreign_key){
					//console.log(group_by[k]);
					record[group_by[k].name] = table.translate_foreign_key(group_by[k].field, item[group_by[k].key]);
				}
			}
			
			for(var k = 0; k < data.length; k++){
				found = true;	//ASSUME THAT IT EXIST
				
				//THIS LOOPS TRIES TO PROOF IT DOESN"T EXIST
				for(var j = 0; j < group_by.length; j++){
					if (data[k][group_by[j].name] != record[group_by[j].name]){
						found = false;
						break;
					}
				}
				
				if (true === found) break;
			}
			
			if (data.length === 0) found = false;
			
			if (true === found){
				//onsole.log('found duplicate record for ?');
				//console.log(item);
				return $this._import_the_list(table, list, group_by, on_done);
			}
			
			//console.log('>CREATE RECORD FOR?');
			//console.log(record);
			//return $this._import_the_list(table, list, group_by, on_done);
			
			table.create(record, function(data, err){
				if (err.length !== 0){
					return new Dialog(err.join('<br>'),{title:'Creation Failed'});
				}
				
				$this._import_the_list(table, list, group_by, on_done);
			});
		});
		
	},
	
	execute: function(){
		var $this = this,
			data = this.get_attribute('_import_data_'),
			group_by = [],
			f = null,
			k = 0,
			hdr = null,
			import_list = null;
		
		
		var ds = App.datasources[this.datasource.name];
		if (!ds) return;
		
		var table = ds.entities[this.datasource.entity];
		if (!table) return;
		
		for(f in this.message_map){
			if (['@types', '_import_data_'].indexOf(f) !== -1) continue;
			group_by.push({
					header: this.get_attribute(f).toLowerCase(),
					field: table.fields[f],
					name: table.fields[f].name,
				});
		}
		
		data = data.slice(0);
		hdr = data[0].join('~^~').toLowerCase().split('~^~');
		for(k = 0; k < group_by.length; k++){
			group_by[k].key = hdr.indexOf(group_by[k].header);
			
		}
		
		import_list = this._unique_list(data, group_by);
		
		import_list.shift();	//REMOVE THE HEADER ROW;
		//console.log(group_by);
		//console.log('record count ? '+ import_list.length);
		this._import_the_list(table, import_list, group_by, function(){
			$this.next();
		});
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
