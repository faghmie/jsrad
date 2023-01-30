var control_db_read_all = {
	type				: 'db_read_all',
	control_label		: 'Database Read All Records',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	description			: 'Use the database settings to configure this '+
							'activity. It will only return all records '+
							'based on filter criteria ',
	
	_get_settings: function(){
		var $this = this;
		var settings = [];
		
		var datasource = $('<select class="form-control">');
		var tables = $('<select class="form-control">');
		
		settings.push(['datasource', datasource]);
		settings.push(['entity', tables]);
		
		settings.push(['map response to', this.create_attribute('result', true)]);
		
		datasource.on('change', function(){
			tables.children().remove();
			$this.datasource.name = $(this).val();
			
			if ($this.datasource.name === '') return;
			
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
		
	execute: function(){
		var $this = this,
			result = this.get_attribute('result');
		
		this.get_datasource(function(data_){
			
			$this.message[$this.get_attribute('result')] = data_;
			
			$this.next();
		});
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
