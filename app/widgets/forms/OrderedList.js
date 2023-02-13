var control_ol = {
	type			: 'ol',
	control_label		: 'List',
	control_category	: 'Common',
	control_thumbnail	: 'images/widgets/list.png',
	properties	: {
			height			: 200,
			width			: 200,
			default_value	: 'list-item-1\nlist-item-2\nlist-item-3\nlist-item-4',
			value			: '',
		},
	
	style_list	: ['list-unstyled', 'list-group', 'list-inline'],
	
	ignore_properties: [
			'on-click',
			'display name',
			'allow inline editor',
		],
	
	open_mapper: function(){
		//ON THIS CHANGE WE LOAD THE TABLES
		var col = null,
			key = 0,
			fields = [],
			tbl = this.datasource.entity,
			mapper = $('<div>');
		if (typeof this.field_mapping !== 'object') this.field_mapping = {};
		var ds = App.datasources[this.datasource.name];
		if (!ds) return;
		
		for(col in ds.entities[tbl].fields){
			fields.push(ds.entities[tbl].fields[col]);
		}
		
		fields = fields.sort(function(a, b){
			return a.index - b.index;
		});
		
		var field = this.create_attribute('heading', fields);
			field.find('select').before('<label>Heading</label>');
			mapper.append(field);
		
		field = this.create_attribute('text', fields);
		field.find('select').before('<label>Text</label>');
		mapper.append(field);
		
		field = this.create_attribute('key', fields);
		field.find('select').before('<label>Key</label>');
		mapper.append(field);
					
		open_card(mapper,{
			title: 'Leave blank the fields you don\'t want to map',
		});
	},
	
	create_attribute : function(attribute, fields){
		var div = $('<div>').addClass('form-group');
		var $this = this;
		
		var select = $('<select>')
						.addClass('form-control attribute-type')
						.append('<option>')
						.appendTo(div);
		select.on('change', this, function(evt){
			evt.stopPropagation();
			var field = $(this).find('option:selected').val();
			evt.data.field_mapping[attribute] = field;
			if (field.length !== 0){
				if (evt.data.datasource.value.indexOf(field) === -1)
					evt.data.datasource.value.push(field);
			}
		});
		
		for(var key = 0; key < fields.length; key++){
			var col = fields[key];
			var opt = $('<option value=\''+ col.uuid +'\'>' + col.title + '</option>').appendTo(select);
			
			if (this.field_mapping[attribute] === col.uuid)
				opt.attr('selected', 'selected');
		}
							
		return div;
	},
	
	get_attribute : function(attribute){
		var tbl = this.datasource.entity,
			fields = App.datasources[this.datasource.name].entities[tbl].fields,
			field_uuid = null;
		
		if (typeof this.field_mapping !== 'object') return null;
		
		if (attribute in this.field_mapping)
			field_uuid = this.field_mapping[attribute];
		
		if (!field_uuid) return null;
		
		return fields[field_uuid].title;
	},
	
	_toObject : function(obj){
		delete obj.style_list;
		
		return obj;
	},
	
	get_settings	: function(){
			var $this = this,
				key = 0,
				style = null;
			
			var list_types = $('<select setting="list-style-type" class="form-control">' +
								'<option></option>' +
								'<option>initial</option>' +
								'<option>circle</option>' +
								'<option>square</option>' +
								'<option>decimal</option>' +
								'<option>decimal-leading-zero</option>' +
								'<option>lower-alpha</option>' +
								'<option>lower-roman</option>' +
								'<option>lower-latin</option>' +
								'<option>upper-alpha</option>' +
								'<option>upper-roman</option>' +
								'<option>upper-latin</option>' +
							'</select>');
			
			list_types.find('option').each(function(){
				if ($(this).val() === $this.list_type){
					$(this).attr('selected', 'selected');
				}
			});
			
			list_types.on('change', function(){
					$this.list_type = $(this).val();
					$this._format();
				});
			
			var list_styles = $('<select class="form-control">' +
									'<option></option>' +
									'<option>list-group</option>' +
									'<option>list-unstyled</option>' +
									'<option>list-inline</option>' +
								'</select>');
			
			list_styles.find('option').each(function(){
				if ($(this).val() === $this.list_style){
					$(this).attr('selected', 'selected');
				}
			});
			
			list_styles.on('change', function(){
					$this.list_style = $(this).val();
					$this._format();
				});

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
		for(key in App.datasources){
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

		return [
			['list-type', list_types],
			['list-style', list_styles]
		].concat(settings);
	},
	
	_format		: function(){
		this.ctrl.css('list-style-type', this.list_type);
		var tag = 'li';
		if (this.ctrl.find('a').length !== 0)
			tag = 'a';
			
		this.ctrl.removeClass(this.style_list.join(' '));
		this.ctrl.addClass(this.list_style);
		this.ctrl.find(tag).removeClass('list-group-item');
		this.ctrl.find(tag).off('mouseenter').off('mouseleave');
		if (this.list_style === 'list-group'){
			this.ctrl.find(tag).addClass('list-group-item');
			this.ctrl
					.on('mouseenter', tag, function(){ $(this).addClass('active'); })
					.on('mouseleave', tag, function(){ $(this).removeClass('active'); });
		}
		
		this.ctrl.css({
			'list-style-type': this.list_type
		});
		
		this.ctrl.css({
			overflow : 'auto',
			display : 'inline-block',
		});
	},
	
	on : function(event_name, data, callback){
		this.ctrl.on(event_name, '.list-item', data, callback);
		return this;
	},
	
	val	: function(){
		var item = this.ctrl.find('.list-item.active').data('key');
		if (!item)
			item = this.ctrl.find('.list-item.active').text();

		return item;
	},
	
	clear : function(){
		this.ctrl.children().remove();
		this.value = [];
	},
	
	append_item	: function(item){
		if (typeof item === 'string'){
			item = {text: item, heading: null, image: null};
		}
		this.value.push(item);
		var text = item.text,
			li = null,
			hdr = null;
		
		if (typeof text === 'string'){
			if(text.indexOf('{{') !== -1 && text.indexOf('}}') !== -1){
				var parts = text.split('{{');
				text = parts[0];
				parts = parts[1].split('}}');
				text = text + "<span class='badge pull-right'>"+parts[0]+'</span>';
			}
		}
		
		if (typeof item.heading === 'string' && (typeof item.heading === 'string') && item.heading.length > 0){
			li = $('<a>')
					.addClass('list-group-item list-item')
					.appendTo(this.ctrl);
							
			hdr = $('<h4>')
					.addClass('list-group-item-heading')
					.text(item.heading)
					.appendTo(li);
							
			text = $('<p>')
					.addClass('list-group-item-text')
					.text(item.text)
					.appendTo(li);
			
			
		} else {
			li = $('<li>').addClass('list-item').append(text).appendTo(this.ctrl);
		}
		
		if (item.key){
			li.data('key', item.key);
		}
		
		this._format();
	},
		
	setValue		: function(value){
			var $this = this,
				index = 0,
				item = null;
			this.value = typeof value !== 'undefined' ? value : this.value;
			
			
		},
	
	getControl	: function(owner){
		this.ctrl = $('<div><ol class="list-group" ></ol></div>');
		return this.ctrl;
	}
};
