import PropertyBase from "./PropertyBase.js";

export default class DatabaseProperties extends PropertyBase{
	
	datasource = {};
	attached_object		= null;
	
	get_datasource(source_name){
		return new Promise(function(fulfill, reject){
				if ((source_name in App.datasources)){
					fulfill(App.datasources[source_name]);
				} else {
					Project.load_server_file(source_name, 'datamodel', function(data){
						fulfill(data);
					});
				}
			});
	}

	get_settings(obj){
		if (!obj.datasource) obj.datasource = {name : null , entity : null, key : null, value : [] };
	
		if (obj.datasource.value === null) obj.datasource.value = [];
		
		var $this = this,
			datasource = $('<select class="form-control">'),
			tables = $('<select class="form-control">'),
			field = $('<select multiple class="form-control">'),
			reference_key = $('<select class="form-control">'),
			filter_by = $('<select class="form-control">'),
			aggregate = $('<select class="form-control">'),
			filter_on = $('<select class="form-control">');
		
		datasource.on('change', function(){
			var $this = $(this),
				ds_name = $this.val();
				
			tables.children().remove();
			field.children().remove();
			
			if ($this.val() === ''){
				obj.datasource = null;
				return;
			}
			
			var rebuild_tables = function(ds){
				if (!obj.datasource) obj.datasource = {};
				
				obj.datasource.name = $this.val();
				tables.children().remove();
				field.children().remove();
				
				tables.append('<option>');
				for(var tbl in ds.entities){
					tables.append('<option value="'+tbl+'">'+ds.entities[tbl].title+'</option>');
					if (obj.datasource.entity === tbl)
						tables.find('option:last-child').attr('selected', 'selected');
				}
				
				if (tables.find('option:selected').index() > 0)
					tables.trigger('change');
			};
			
			App.datasource_reload(ds_name).then(function(ds){ 
				rebuild_tables(ds);
			})
			.catch(function(err){
				App.MessageError(err);
			});
		});
		
		tables.on('change', function(){
			//ON THIS CHANGE WE LOAD THE TABLES
			var col = null,
				key = 0,
				skip = false,
				ignore = null,
				fields = [];
				
			obj.datasource.entity = $(this).val();
			var ds = App.datasources[obj.datasource.name];
			var tbl = obj.datasource.entity;
			
			if (!ds) return;
			if (!(tbl in ds.entities)) return;
			
			field.children().remove();
			reference_key.children().remove();
			for(col in ds.entities[tbl].fields){
				fields.push(ds.entities[tbl].fields[col]);
			}
			
			fields = fields.sort(function(a, b){
				return a.index - b.index;
			});
			
			reference_key.append('<option>');
			for(key = 0; key < fields.length; key++){
				col = fields[key];
			
				if (ds.implementation_fields.indexOf(col.name) !== -1) continue;
				
				reference_key.append('<option value="'+col.uuid+'">'+col.title+'</option>');
				if (obj.datasource.reference_key && obj.datasource.reference_key.indexOf(col.uuid) !== -1)
					reference_key.find('option:last-child').attr('selected', 'selected');
				
				if (col.show_on_grid === false) continue;
				
				field.append('<option value="'+col.uuid+'">'+col.title+'</option>');
				
				
				if (obj.datasource.value && obj.datasource.value.indexOf(col.uuid) !== -1)
					field.find('option:last-child').attr('selected', 'selected');
			}
			
			field.trigger('change');
			reference_key.trigger('change');
		});
		
		field.on('change', function(){
			if (null === $(this).val()) return;
			
			var ds = App.datasources[obj.datasource.name];
			obj.datasource.value = $(this).val();
			if (!obj.datasource.value) obj.datasource.value = [];
			obj.refresh();
		});
		
		reference_key.on('change', function(){
			if (null === $(this).val()) return;
			
			var ds = App.datasources[obj.datasource.name];
			obj.datasource.reference_key = $(this).val();
			if (!obj.datasource.reference_key) obj.datasource.reference_key = [];
			obj.refresh();
		});
		
		datasource.children().remove();
		tables.children().remove();
		field.children().remove();
		reference_key.children().remove();
		
		this.load_datasources(datasource, obj);
		
		var btn_filter = $('<a>filter</a>').addClass('btn btn-light btn-flat');
		btn_filter.on('click', obj, function(evt){
			evt.stopPropagation();
			this.open_filter_mapper(evt.data);
		}.bind(this));
		
		var btn_sort_order = $('<a>sort by</a>').addClass('btn btn-light btn-flat');
		btn_sort_order.on('click', function(evt){
			evt.stopPropagation();
			this.open_sort_mapper(obj);
		}.bind(this));
		
		var tbl_div = $('<div>')
							.addClass('input-group')
							.append(tables);
		
		var btn_tbl = $('<div>').addClass('input-group-btn').appendTo(tbl_div);
		
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
		
		aggregate
			.append('<option value=\'\'>')
			.append('<option>count</option>')
			.append('<option>sum</option>')
			.append('<option>avg</option>')
			.append('<option>max</option>')
			.append('<option>min</option>')
			.find('option').removeAttr('selected');
		
		aggregate.on('change', function(){
			obj.datasource.aggregation = $(this).val();
			obj.refresh();
		});
		
		tbl_div = $('<div>').append(tbl_div);
		
		aggregate.find('option').each(function(){
			if ($(this).val() == obj.datasource.aggregation)
				$(this).attr('selected', 'selected');
		});
		
		return [
			['datasource', datasource],
			['table', tbl_div],
			['filter setting', btn_filter],
			['field', field],
			['key', reference_key],
			['aggregation', aggregate],
			['sort by', btn_sort_order],
		];
	}
	
	load_datasources(datasource, obj, on_done){
		if (typeof on_done !== 'function') on_done = function(){};
		
		datasource.children().remove();
		datasource.append('<option>');
		for(var key in App.datasources){
			datasource.append('<option>'+ key +'</option>');
			if (obj.datasource.name === key)
				datasource.find('option:last-child').attr('selected', 'selected');
		}
		
		if (datasource.find('option:selected').index() > 0)
			datasource.trigger('change');
		
		on_done();
	}
	
	get_linked_control(obj){
		if (!obj) return;
		var container = $('<div>');
		var form_group = $('<div>').addClass('form-group small').appendTo(container);
		
		form_group.append('<label>parent control</label>');
		var select = $('<select>').addClass('form-control input-sm').appendTo(form_group).data('prev', null);
		var evt = 'change';
		
		select.children().remove();
		select.append('<option value="{{none}}">');
		
		if (typeof obj.getForm !== 'function') return select;
		var form = obj.getForm();
		
		for(var ctrl in form.controls){
			if (ctrl === obj.uuid) continue;
			
			select.append('<option value=\''+ctrl+'\'>'+ form.controls[ctrl].label +'</option>');
			if (ctrl === obj.parent_control)
				select.find('option:last-child').attr('selected', 'selected');
		}

		select
			.on('focus', function(){
				$(this).data('prev', $(this).val());
			})
			.on('change', obj, function(evt){
				var obj = evt.data,
					prev_ctrl = $(this).data('prev'),
					ctrl_uuid = $(this).val(),
					ctrl = null,
					form = obj.getForm();
				
				obj.parent_control = $(this).val();
				obj.create_parent_child_link();
		});
		
		form_group = $('<div>').addClass('form-group small').appendTo(container);
		form_group.append('<label>field to filter</label>');
		
		var db_field = $('<select>').addClass('form-control input-sm').appendTo(form_group);
		db_field.on('change', obj, function(evt){
			var field = $(this).find('option:selected').data('field');
			obj.parent_control_field = field.name;
		});
		
		var col = null,
			key = 0,
			fields = [],
			$this = this,
			tbl = obj.datasource.entity,
			mapper = $('<div>');
		
		var ds = App.datasources[obj.datasource.name];
		if (!ds) return null;
		
		if (!(tbl in ds.entities)) return null;
		
		for(col in ds.entities[tbl].fields){
			fields.push(ds.entities[tbl].fields[col]);
		}
		
		fields = fields.sort(function(a, b){
			return a.title.localeCompare(b.title);
		});
		
		for(key = 0; key < fields.length; key++){
			col = fields[key];
		
			if (ds.implementation_fields.indexOf(col.name) !== -1) continue;
			//if (col.show_on_grid === false) continue;
			
			db_field.append('<option>'+ col.title +'</option>');
			db_field.find('option:last-child').data('field', col);
			if (col.name === obj.parent_control_field)
				db_field.find('option:last-child').attr('selected', 'selected');
		}
		
		if (typeof obj.datasource.filter !== 'object') obj.datasource.filter = {};
		
		return container;
	}
	
	get_field_filters(obj){
		//ON THIS CHANGE WE LOAD THE TABLES
		var col = null,
			key = 0,
			fields = [],
			$this = this,
			tbl = obj.datasource.entity,
			mapper = $('<div>').css({
							height: '50vh',
							'max-height': '50vh',
							overflow: 'auto',
						});
		
		var ds = App.datasources[obj.datasource.name];
		if (!ds) return null;
		
		if (!(tbl in ds.entities)) return null;
		
		for(col in ds.entities[tbl].fields){
			fields.push(ds.entities[tbl].fields[col]);
		}
		
		fields = fields.sort(function(a, b){
			return a.title.localeCompare(b.title);
		});
		
		for(key = 0; key < fields.length; key++){
			col = fields[key];
		
			//if (ds.implementation_fields.indexOf(col.name) !== -1) continue;
			//if (col.show_on_grid === false) continue;
			
			var field = this.create_attribute(obj, col.name);
			field.find('input').before('<label>'+ col.title + '</label>');
			mapper.append(field);
		}
		
		if (typeof obj.datasource.filter !== 'object') obj.datasource.filter = {};
		
		return mapper;
	}
	
	attach(obj){
		var widget = $('<ul class="general-props list-group props-edit">');
		var s = this.get_settings(obj);
		this.attached_object = obj;
		for(var index = 0; index < s.length; index++){
			this._append_item(s[index][0], s[index][1], null, widget);
		}
		
		return widget;
	}

	open_filter_mapper(obj){
		var filter = $('<div>');
		var filter_type = $('<div><label>filter type</label></div>').appendTo(filter);
		var ftype = $('<select>').addClass('form-control input-sm').appendTo(filter_type);
		
		ftype.append('<option value=null>');
		ftype.append('<option value="control">by control</option>');
		ftype.append('<option value="field">by db field</option>');
		
		filter_type
			.addClass('form-group')
			.css({
				'border-bottom': '2px solid #E5E5E5',
				'padding-bottom': '10px',
				'margin-bottom': '10px',
				
			});
		
		filter.append('<div class="filter-by-control">');
		filter.append('<div class="filter-by-field">');
		
		filter.find('.filter-by-control, .filter-by-field').hide();
		
		ftype.on('change', obj, function(evt){
			var value = evt.target.value;
			filter.find('.filter-by-control, .filter-by-field').hide();
			switch(value){
				case 'control':
					evt.data.datasource.filter = {};
					filter.find('.filter-by-control').children().remove();
					filter.find('.filter-by-control')
							.append(this.get_linked_control(obj))
							.show('blind');
					
					break;
				
				case 'field':
					delete evt.data.parent_control;
					delete evt.data.parent_control_field;
					filter.find('.filter-by-field').children().remove();
					filter.find('.filter-by-field')
							.append(this.get_field_filters(obj))
							.show('blind');
					break;
				default:
					evt.data.datasource.filter = {};
					delete evt.data.parent_control;
					delete evt.data.parent_control_field;
			}
		}.bind(this));
		
		ftype.find('option').removeAttr('selected');
		
		if (obj.parent_control in obj.getForm().controls){
			ftype.find('option:eq(1)').attr('selected', 'selected');
		} else {
			var key = null;
			for(key in obj.datasource.filter){
				break;
			}
			if (key !== null){
				ftype.find('option:eq(2)').attr('selected', 'selected');
			}
		}
		
		ftype.trigger('change');
		
		open_card(filter,{
			title: 'Blank fields not to filter on.',
			width: '22vw',
			height: '80vh',
		});
	}
	
	create_attribute(obj, attribute, fields){
		var div = $('<div>').addClass('form-group small');
		var $this = this;
		
			if (typeof obj.filter_map !== 'object') obj.filter_map = $.extend({}, obj.field_mapper);
			if (typeof obj.filter_map['@types'] !== 'object') obj.filter_map['@types'] = {};
			if (!obj.filter_map['@types'][attribute]) obj.filter_map['@types'][attribute] = 'static';
			
			var value = obj.filter_map[attribute];
			if (value){
				value = value.replace(/(\})|(\{)/g, '');
			} else if (typeof obj.datasource.filter === 'object' && attribute in obj.datasource.filter){
				if (typeof obj.datasource.filter[attribute] === 'string')
					value = obj.datasource.filter[attribute].replace(/(\})|(\{)/g, '');
			}
			
			var message = $("<input type='text'>")
							.addClass('form-control attribute-value input-sm')
							.val(value)
							.appendTo(div);
			
			message
			.on('keydown', function(evt){
				evt.stopPropagation();
			})
			.on('input', {ctrl: obj, attr: attribute}, function(evt){
				var $this = evt.data.ctrl;
				var attribute = evt.data.attr;
				
				evt.stopPropagation();
				delete $this.filter_map[attribute];
				
				var value = $.trim($(this).val());
				
				delete $this.datasource.filter[attribute];
				if (value.length !== 0){
					$this.filter_map[attribute] = value;
					$this.datasource.filter[attribute] = value;
					if ($this.filter_map['@types'][attribute] === 'message'){
						$this.datasource.filter[attribute] = '{' + value + '}';
					}
				}
			});

			var list = [];
			for(var msg in obj.getForm().message){
				list.push(msg);
			}
			
			list.sort(function(a, b){
				return a.localeCompare(b);
			});
			message.typeahead({source: list, updater: function(item){
				message.val(item);
				message.trigger('input');
			}});
			
			var select = $('<select>')
							.addClass('form-control attribute-type input-sm')
							.append('<option value=\'message\'>Is An Attribute Name</option>')
							.append('<option  value=\'static\'>Is Static Value</option>')
							.appendTo(div);
			select.on('change', {ctrl: obj, attr: attribute}, function(evt){
				var $this = evt.data.ctrl,
					attribute = evt.data.attr;
					
				evt.stopPropagation();
				$this.filter_map['@types'][attribute] = $(this).val();
				
				if ($this.filter_map['@types'][attribute] === 'message'){
					if (attribute in $this.datasource.filter){
						var value = $this.datasource.filter[attribute].replace(/(\})|(\{)/g, '');
						$this.datasource.filter[attribute] = '{' + value + '}';
					}
				}
			});
			
			if (obj.filter_map['@types'][attribute] === 'message')
				select.find('option:first-child').attr('selected', 'selected');
			else
				select.find('option:last-child').attr('selected', 'selected');
			
			select.trigger('change');
				
		return div;
	}
	
	open_sort_mapper(obj){
		//ON THIS CHANGE WE LOAD THE TABLES
		var key = 0,
			fields = [],
			$this = this,
			tbl = obj.datasource.entity,
			mapper = $('<div>').addClass('container-fluid'),
			select = $('<select>')
						.addClass('form-control')
						.appendTo(mapper),
			order_by = $('<select>');
		
		if (typeof obj.datasource.sort !== 'object') obj.datasource.sort = {};
		
		var ds = App.datasources[obj.datasource.name];
		if (!ds) return;
		
		for(var col in ds.entities[tbl].fields){
			fields.push(ds.entities[tbl].fields[col]);
		}
		
		fields = fields.sort(function(a, b){
			return a.title.localeCompare(b.title);
		});
		
		for(key = 0; key < fields.length; key++){
			col = fields[key];
			
			if (ds.implementation_fields.indexOf(col.name) !== -1) continue;
			
			select.append('<option>');
			var opt = select.find('option:last');
			opt.text(col.title);
			opt.attr('value', col.uuid);
			if (col.uuid === obj.datasource.sort.field)
				opt.attr('selected', 'selected');
		}
		
		order_by
			.appendTo(mapper)
			.addClass('form-control')
			.append('<option value="asc">small to big</option>')
			.append('<option value="desc">big to small</option>');
		
		if (obj.datasource.sort.order_by === 'desc')
			order_by.find('option:last-child').attr('selected', 'selected');
		else
			order_by.find('option:first-child').attr('selected', 'selected');
		
		order_by.on('change', function(evt){
			obj.datasource.sort.order_by = $(this).val();
		});
		
		select.on('change', function(evt){
			obj.datasource.sort.field = $(this).val();
		});
		
		obj.datasource.sort.field = select.val();
		obj.datasource.sort.order_by = order_by.val();
		
		select.wrap('<div class="form-group">');
		order_by.wrap('<div class="form-group">');
		
		open_card(mapper,{
			title: 'Sort By',
			width: '22vw',
			height: '80vh',
		});
	}
}
