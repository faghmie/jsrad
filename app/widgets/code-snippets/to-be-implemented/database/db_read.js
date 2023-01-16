var control_get_record = {
	type				: 'get_record',
	control_label		: 'Database Get Record',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	description			: 'Use the database settings to configure this '+
							'activity. It will only return one record '+
							'with the column names as attributes that '+
							'can be assigned, for use in subsequent '+
							'activities ',
	
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
			var field = this.create_attribute('out::' + col.name, true);
			field.find('input').before('<label>'+ col.title + '</label>');
			mapper.append(field);
		}
		console.log('opening the field mapper');
		open_card(mapper,{
			title: 'Map Fields',
			width: '25vw',
		});
	},

	clear_message: function(){
		//ON THIS CHANGE WE LOAD THE TABLES
		var col = null,
			form = this.getForm(),
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
			if (!this.has_attribute('out::' + col.name)) continue;
			var attr = this.get_attribute('out::' + col.name);
			if (!attr) continue;
			
			attr = attr.toString().trim();
			if (attr.length === 0) continue;
			delete this.message[attr];
		}
	},
		
	_get_settings: function(){
		var $this = this;
		var settings = [];
		
		var datasource = $('<select class="form-control">');
		var tables = $('<select class="form-control">');
		var btn = $('<button type="button">map fields</button>').addClass('btn btn-light btn-flat');
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
		var view_ds = $('<a class="btn" title="edit datasource"><i class="fa fa-fw fa-pencil" /></a>')
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

		var view_table = $('<a class="btn" title="view data in table"><i class="fa fa-fw fa-th" /></a>')
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
		
	execute: function(){
		//console.log(this.label);
		//console.log(Object.assign({}, this.message));
		var $this = this;
		
		
		this.get_datasource(null, true, function(data_){
			if (!data_){
				console.log('no data available ? ' + $this.label);
				return;
			}
			$this.clear_attributes();
			
			for(var m in data_[0]){
				if (!$this.has_attribute('out::' + m)) continue;
				var attr = $this.get_attribute('out::' + m);
				
				if (!attr) continue;
				
				attr = attr.toString().trim();
				if (attr.length === 0) continue;
				
				$this.message[attr] = data_[0][m];
			}
			$this.next();
		});		
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
