var data_aware_base = {
	
	dm_operation_types: {
		none: 'None',
		dm_create: 'Create Record',
		dm_update: 'Update Record',
		dm_show_editor: 'Show Editor',
		dm_show_create: 'Show Create',
		dm_show_update: 'Show Update',
		dm_show_search: 'Show Search',
	},
	
	dm_is_data_aware: function(){
		return true;
	},
	
	dm_execute: function(){
		if (!(this.data_model_action in data_aware_base)){
			return;
		}
		
		this
			.off('click')
			.on('click', this, function(evt){
				evt.stopPropagation();
				var $this = evt.data;
				
				$this[$this.data_model_action]();
				
			});
		this.ctrl
			.off('mouseover')
			.on('mouseover', this, function(evt){
				$(this).css('cursor', 'pointer');
			});
		
	},
	
	dm_create	: function(on_done, on_error){
		var $this = this;

		if (typeof on_done !== 'function'){
			on_done = function(data, errors){
				if (errors.length !== 0){
					for(var index = 0; index < errors.length; index++)
						App.MessageError(errors[index], ds.title);
				} else {
					App.MessageInfo("Record created", ds.title);
				}
			};
		}

		if (typeof on_error !== 'function'){
			on_error = function(err){
				logger.log('dm-create ERROR');
			};
		}
		
		if (!(this.datasource.name in App.datasources)){
			App.MessageError("Cannot find datasource: "+this.datasource.name, "Missing Datasource");
			return on_error("Cannot find datasource: "+this.datasource.name, "Missing Datasource");
		}
		
		if (!(this.datasource.entity in App.datasources[this.datasource.name].entities)){
			App.MessageError("Cannot find entity: "+this.datasource.entity, "Missing Entity");
			return on_error("Cannot find entity: "+this.datasource.entity, "Missing Entity");
		}
		
		var ds = App.datasources[this.datasource.name].entities[this.datasource.entity];
		
		var data = {};
		var message = this.getForm().message;
		var form_data = this.getForm().data();
		var key = null;
		for(key in this.field_mapper){
			if (key === '@types') continue;
			data[key] = this.dm_get_attribute(key);
		}
		
		ds.create(data, function(data, errors){
			on_done(data, errors);
		});
	},
	
	dm_update	: function(on_done, on_error){
		var $this = this;
		if (typeof on_done !== 'function'){
			on_done = function(data, errors){
				if (errors.length !== 0){
					for(var index = 0; index < errors.length; index++)
						App.MessageError(errors[index], ds.title);
				} else {
					App.MessageInfo("Record updated", ds.title);
				}
			};
		}

		if (typeof on_error !== 'function'){
			on_error = function(err){
				logger.log('dm-update ERROR');
			};
		}
		
		if (!(this.datasource.name in App.datasources)){
			App.MessageError("Cannot find datasource: "+this.datasource.name, "Missing Datasource");
			return on_error("Cannot find datasource: "+this.datasource.name, "Missing Datasource");
		}
		
		if (!(this.datasource.entity in App.datasources[this.datasource.name].entities)){
			App.MessageError("Cannot find entity: "+this.datasource.entity, "Missing Entity");
			return on_error("Cannot find entity: "+this.datasource.entity, "Missing Entity");
		}
		
		var ds = App.datasources[this.datasource.name].entities[this.datasource.entity];
		
		var data = {};
		var message = this.getForm().message;
		var form_data = this.getForm().data();
		var key = null;
		for(key in this.field_mapper){
			if (key === '@types') continue;
			data[key] = this.dm_get_attribute(key);
		}
		
		ds.update(this.message, data, function(data, errors){
			on_done(data, errors);
		});
	},
	
	dm_show_editor: function(){
		if (this._dm_has_datasource() === false) return;
		App.datasources[this.datasource.name].entities[this.datasource.entity].showEditor();
	},
	
	dm_show_create: function(){
		if (this._dm_has_datasource() === false) return;
		App.datasources[this.datasource.name].entities[this.datasource.entity].showCreate();
	},
	
	dm_show_search: function(){
		if (this._dm_has_datasource() === false) return;
		App.datasources[this.datasource.name].entities[this.datasource.entity].showSearch();
	},
	
	dm_show_update: function(){
		var $table = null;
		var filter = null;
		
		if (this._dm_has_datasource() === false) return;
		
		filter = this.get_filter_by_control();
		if (filter)
			this.datasource.filter = filter;
		
		$table = App.datasources[this.datasource.name].entities[this.datasource.entity];
		

		
	},
	
	_dm_has_datasource: function(){
		if (!this.datasource) return false;
		if (!(this.datasource.name in App.datasources)){
			App.MessageError("Could not find datasource: "+ this.datasource.name);
			return false;
		}
		
		if (typeof App.datasources[this.datasource.name].entities !== "undefined"){
			if (!(this.datasource.entity in App.datasources[this.datasource.name].entities)){
				App.MessageError("Could not locate entity ["+this.datasource.entity+"] in datasource ["+this.datasource.name+"]");
				return false;
			}
		} else {
			App.MessageError("Datasource was not loaded.");
			return false;
		}
		
		return true;
	},
	
	get_filter_by_control: function(obj){
		var $this = typeof obj === 'undefined' ? this : obj;
		var form = $this.getForm();
		var ctrl = form.controls[$this.parent_control];
		var filter_on = null;//ctrl.name;
		var filter_value = null;//ctrl.val();
		var filter = null;
		
		if (!ctrl) return null;
		
		filter_on = ctrl.name;
		filter_value = ctrl.val();
		
		if (typeof $this.parent_control_field === 'string')
			filter_on = $this.parent_control_field;

		if (filter_value == '{null}' || filter_value.length === 0){
			filter = null;
		} else {
			filter = {};
			filter[filter_on] = filter_value;
			filter_type = 'exact';
		}
		
		return filter;
	},
	
	dm_get_field_map: function(ctrl){
		//ON THIS CHANGE WE LOAD THE TABLES
		var col = null,
			key = 0,
			fields = [],
			$this = typeof ctrl === 'undefined' ? this : ctrl,
			tbl = $this.datasource.entity,
			mapper = $('<div>').css({
							overflow: 'auto',
						});
		
		var ds = App.datasources[$this.datasource.name];
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
		
			var field = data_aware_base.dm_create_attribute($this, col.name);
			field.find('input').before('<label>'+ col.title + '</label>');
			mapper.append(field);
		}
		
		return mapper;
	},
	
	dm_get_attribute: function(attribute){
		var result = null,
			map = this.field_mapper,
			form = this.getForm();
			
		if (map['@types'][attribute] === 'message'){
			if (map[attribute] in message){
				result = message[map[attribute]];
			} else {
				result = form_data[map[attribute]];
			}
		} else if (map['@types'][attribute] === 'control'){
			if (map[attribute] in form.controls){
				result = form.controls[map[attribute]].val();
			}
		} else {
			result = map[key];
		}
		
		return result;
	},
	
	dm_create_attribute: function(control_in, attribute, fields){
		var div = $('<div>').addClass('form-group small'),
			$this = typeof control_in === 'undefined' ? this : control_in,
			form = $this.getForm(),
			key = null;
		
			if (typeof $this.field_mapper !== 'object') $this.field_mapper = {'@types':{}};
			if (typeof $this.field_mapper['@types'] !== 'object') $this.field_mapper['@types'] = {};
			if (!$this.field_mapper['@types'][attribute]) $this.field_mapper['@types'][attribute] = 'static';
			
			var value = $this.field_mapper[attribute];
			if (value){
				value = value.replace(/(\})|(\{)/g, '');
			}
			
			var message = $("<input type='text'>")
							.addClass('form-control attribute-value input-sm')
							.val(value)
							.appendTo(div);
			
			message
			.on('keydown', function(evt){
				evt.stopPropagation();
			})
			.on('input', {ctrl: $this, attr: attribute}, function(evt){
				var $this = evt.data.ctrl;
				var attribute = evt.data.attr;
				
				evt.stopPropagation();
				delete $this.field_mapper[attribute];
				
				var value = $.trim($(this).val());
				
				if (value.length !== 0){
					$this.field_mapper[attribute] = value;
				}
			});

			var list = [];
			for(var msg in form.message){
				list.push(msg);
			}
			
			list.sort(function(a, b){
				return a.localeCompare(b);
			});
			message.typeahead({source: list, updater: function(item){
				message.val(item);
			}});
			
			var ctrl = $('<select>')
						.addClass('form-control')
						.appendTo(div);
			
			ctrl.append('<option>');
			for (key in form.controls){
				if (key == $this.uuid) continue;
				if (['label','heading','hr','img','icon','paragraph','button','link','box'].indexOf(form.controls[key].type) !== -1) continue;
				
				var text = $.trim(form.controls[key].label);
				if (text.length === 0) text = $.trim(form.controls[key].name);
				
				ctrl.append('<option value="'+key+'">'+text+'</option>');
				
				if (key == $this.field_mapper[attribute])
					ctrl.find('option:last-child').attr('selected', 'selected');
			}
			
			ctrl.on('change', $this, function(evt){
				evt.data.field_mapper[attribute] = $(this).val();
			});
			
			var select = $('<select>')
							.addClass('form-control attribute-type input-sm')
							.append('<option value=\'message\'>Is An Attribute Name</option>')
							.append('<option  value=\'static\'>Is Static Value</option>')
							.append('<option value="control">Is Control</option>')
							.appendTo(div);
			select.on('change', {ctrl: $this, attr: attribute}, function(evt){
				var $this = evt.data.ctrl,
					attribute = evt.data.attr;
					
				evt.stopPropagation();
				$this.field_mapper['@types'][attribute] = $(this).val();
				switch($(this).val()){
					case 'control':
						ctrl.show();
						message.hide();
						break;
					default:
						ctrl.hide();
						message.show();
				}
			});
			
			if ($this.field_mapper['@types'][attribute] === 'message')
				select.find('option:first-child').attr('selected', 'selected');
			else
				select.find('option:last-child').attr('selected', 'selected');
			
			select.trigger('change');
				
		return div;
	}

};
