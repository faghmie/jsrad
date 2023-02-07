var DataEditor = {	//YOU ARE MEANT TO EXTEND THE JSON DATA WITH THIS OBJECT TO CREATE THE DYNAMIC FORMS.
	defaults	: {
			context			: null,
			eventName		: 'click',
			content_area	: null,
			width			: '80vw',
			height			: '80vh',
			overflow		: 'auto',
			ui_groups		: [],
			link_buttons	: [],
			toolbar			: ['create', 'update', 'remove', 'import', 'export', 'search', 'clone', 'save'],
			effect			: 'blind',
			
			update_mode		: false,
			search_mode		: false,
			use_dialog		: false,
			table			: null,
			panel_main		: null,
			panel_create	: null,
			panel_update	: null,
			row_to_update	: null,
		},
	
	options		: {},
	_modal		: null,
	
	init : function(options){
			var $this = this;
			if (typeof options === 'undefined') options = {};
			
			$this.options = $.extend(true, {}, $this.defaults, options);
			
			if (!($this.options.toolbar instanceof Array) || !$this.options.toolbar) $this.options.toolbar = [];
			
			if (!$this.options.content_area){
				$this.options.use_dialog = true;
				$this.options.content_area = $('<div>');
			} else {
				$this.options.content_area = $($this.options.content_area);
			}
			
			this.options.panel_main		= $this._build_data_table();
			this.options.panel_create	= $this._build_create_dlg();
			this.options.panel_update	= $this._build_update_dlg();
			
			if (!this.data) this.data = {};
		}

	, _remove_item				: function(on_done){
		var $this = this;
		var data = null;
		var db_key = null;
		var cnt = $this.options.table.find('tr td input[type=checkbox]:checked').length;

		if (cnt === 0){
			alert('Nothing was selected.');
			return;
		}
		
		App.Confirm('Are you sure you want to remove the selected item(s)?', function(){
			$this.options.table.find('tr td input[type=checkbox]:checked').each(function(){
				var row = $(this).parents('tr');

				data = $(this).parents('tr').prop('row_data');
				db_key = $(this).parents('tr').data('db-key');
				//console.log(data);
				$this.remove(data, function(data_set, err){
					if (err.length !== 0){
						return App.MessageError(err.join('<br>></br>'));
					}
					console.log(data_set);
					$this.options.table.find('tr').each(function(){
						var row_data = $(this).prop('row_data');
						if (!row_data) return;
						if (row_data['@db-key'] == data_set['@db-key'] || row_data.__row_id__ == data_set.__row_id__){
							$(this).remove();
						}
					});
				});
			});
			
			if (typeof(on_done) === 'function') on_done();
		});
	}

	, _format_date_fields		: function(context){
		context.find('.is-date').datetimepicker({format: 'LL'});
		context.find('.is-time').datetimepicker({format: 'LT'});
		context.find('.is-datetime').datetimepicker({format: 'LLL'});
	}

	, _build_foreign_key		: function(context, field, data, where){
		var $this = this;
		var value = this.field_default_value(field, data);
		select = context.find('#'+field.uuid);
		select.off('change');
		
		for(var c in this.fields){
			if (!field.foreign_key) break;
			
			var col = this.fields[c];
			
			if (!col.foreign_key) continue;
			
			var fk_table = null;
			for(var tbl in this.database.entities){
				if (this.database.entities[tbl].uuid == col.foreign_key.sql_table){
					fk_table = this.database.entities[tbl];
					break;
				}
			}
			
			if (null === fk_table) continue;
			
			//NOW GO THROUGH THE FOREIGN-KEYS OF THIS TABLE
			//TO SEE IF THERE IS ANY LINK TO OUR FIELD
			for(var c_fk in fk_table.fields){
				var fk_col = fk_table.fields[c_fk];
				
				if (!fk_col.foreign_key) continue;
				fk = fk_col.foreign_key;
				
				if (fk_col.foreign_key.sql_table === field.foreign_key.sql_table && field.uuid !== fk_col.uuid){ //LAST AND IS TO CATER TO SELF REFERENCING TABLES
					//SETUP RELOAD EVENT FOR THE REFERENCING DROP-DOWN
					var drop_down = context.find('#' + field.uuid);
					drop_down.on('change', {column: field, fk: fk_col, ref_col: col, ref_table: fk_table}, function(evt){
						var ref_field = evt.data.column;
						var ref_col = evt.data.ref_col;
						var ref_table = evt.data.ref_table;
						var ref_dd = context.find('#' + ref_field.uuid);
						var ref_where = {};
						ref_where[ref_field.foreign_key.key] = {
								'value'	: ref_dd.val(),
								'on'		: evt.data.fk.name,
							};
						
						$this._build_foreign_key(context, ref_col, ref_table.data, ref_where);
					});
				}
			}
		}
		
		this.get_parameter_list(field, function(field, data){
			select = context.find('#'+field.uuid);
			select.children().remove();
			
			var fk_table = null,
				key = null;
				
			if (field.foreign_key.sql_table in $this.database.entities)
				fk_table = $this.database.entities[field.foreign_key.sql_table];
			
			else {
				return App.MessageError('Unable to locate foreign table');
			}
				
			if (field.required === false)
				select.append('<option>');
			
			var filtered_data = Object.assign({}, data);
			if (where){
				for(var f_key in where){
					var crit = where[f_key];
					filtered_data = _.filter(filtered_data, function(item){
						return crit.value === item[crit.on];
					});
				}
			}
			
			//$(filtered_data).each(function(){
			for(key in filtered_data){
				var row = filtered_data[key];
				selected = '';
				//console.log(field.foreign_key);
				//console.log(fk_table);
				var field_key = fk_table.fields[field.foreign_key.key].name,
					field_value = fk_table.fields[field.foreign_key.value].name;
				if (row[field_key] == value)
					selected = 'selected';

				select.append('<option '+
								selected +
								' value="'+
								row[field_key]+
								'">'+
								row[field_value]+
								'</option>');
			}
		});
	}

	, _format_table				: function(table){
		table = $(table);
		if (table.hasClass('has-stripes'))
			table.find('tbody tr:odd').addClass('table-stripe');

		var thead = table.children('thead');
		var tbody = table.children('tbody');

		tbody.find('tr')
			.hover(
				function(){
					$(this).addClass('ui-state-highlight');
					$(this).css('cursor', 'pointer');
				}
				, function(){
					$(this).removeClass('ui-state-highlight');
					$(this).css('cursor', 'default');
				}
			);
	}
	
	, _prepare_grid				: function(){
			var $this = this;
			if (!$this.options.table) return;
			var _dlg = $this.options.table.parents('.widget-content');
			
			if ($this.options.toolbar.indexOf('update') !== -1 && $this.options.search_mode === false){
				$this.options.table.find('tbody tr').off('dblclick').on('dblclick', function(){
					$(this).parents('table').find('td input[type=checkbox]').removeAttr('checked');
					$(this).find('td input[type=checkbox]').attr('checked', 'checked');
					
					$this.message = $(this).prop('row_data');
					$this.options.row_to_update = $(this);
					
					$($this.options.content_area).find('.fd-lookup-table #btn_update').trigger('click');
				});
			}
			
			if (true === $this.options.search_mode){
				$this.options.table.find('tbody tr').off('dblclick').on('dblclick', function(){
					$this.message = $(this).prop('row_data');
					if (this._modal)
						this._modal.close();//.modal('hide');
					else
						App.closeModal();
				});
			}
		}

	, set_row_data				: function(tr, data){
			var $this = this;
			
			tr.find('td:gt(0)').each(function(){
					if (!this.field) return;
					if (!(this.field.name in data)) return;
					
					$(this).html($this.translate_field_value(this.field,data[this.field.name]));
					
					if (this.field.data_type === 'color')
						$(this).css('background', data[this.field.name]);
				});
		}
		
	, add_row_to_grid			: function(data){
			var $this = this;
			
			if (true === this.create_mode) {
				return;
			}

			//UPDATE THE GRID
			if (!$this.options.table){
				return;
			}
			
			$(data).each(function(){
				var row = this;
				var tr = $('<tr style="text-align:center">')
							.prop('row_data', this)
							.data('__row_id__', this.__row_id__)
							.appendTo($this.options.table);

				var td = $('<td>')
						.append('<input type="checkbox" class="ui-widget">')
						.prop('field',{})
						.appendTo(tr);

				for(var col in $this.fields){
					var field = $this.fields[col];
					if (field.show_on_grid !== false){
						td = $('<td>')
									.prop('field', field)
									.appendTo(tr);
					}
				}
				
				$this.set_row_data(tr, this);
			});
			
			$this._prepare_grid();
		}

	, _init_controls			: function(context, data){
		var $this = this;
		if (!data) data = this.message;
		
		//NOW DO THE FOREIGN-KEY FIELDS
		for(var col in this.fields){
			var field = this.fields[col];
			if (field.foreign_key){
				$this._build_foreign_key(context, field, data);
			}
		}
		
		$this._format_date_fields(context);
		
		//INITIALISE FIELDS WITH DATA PROVIDED
		if (!data) return;
		
		context.find('.form_data').each(function(){
			//FIRST CLEAR THE FIELD
			if (this.tagName !== 'SELECT'){
				$(this).val('');
			} else if (this.type === 'checkbox'){
				this.checked = false;
			}
			
			var value = $this.field_default_value($this.fields[this.id], data);
			if (this.type === 'checkbox'){
				this.checked = (parseFloat(value) === 1);
			
			} else if (this.tagName === 'SELECT') {
				$(this).children().each(function(){
					$(this).removeAttr('selected');
					if ($(this).val() === value){
						$(this).attr('selected', 'selected');
					}
				});
			
			} else {
				if (value instanceof Array){
					$(this).val(value.join('\n'));
				
				} else {
					if (typeof value === 'string')
						$(this).val(unescape(value.replace(/<br>/g,'\n')));
					else
						$(this).val(value);
				}
			}
		});
	}
	
	, _build_create_dlg			: function(){
		var $this = this;
		var ui_group = this._create_form();
		var _dlg = $('<div title="'+this.title+' - Create New" class="fd-lookup-create">');
		var $toolbar = $('<div class="btn-toolbar">').appendTo(_dlg);//,
			//$body = $('<div class="data-body">').append(ui_group).appendTo(_dlg);
		
		$toolbar.append('<div class="btn-group">'+
					'<button id="btn_cancel" type="button" class="btn btn-flat btn-light"><i class="la la-power-off"></i></button>'+
					'<button id="btn_create" type="button" class="btn btn-flat btn-light"><i class="la la-plus"></i></button>'+
				'</div>');
		
		$toolbar.find('#btn_create').click(function(){
			data = {
					created_on: (new Date()).toString()
				};
			
			$(this).parents('.fd-lookup-create').find('.form_data').each(function(){
				var name = $this.fields[this.id].name;
				
				if (this.type === 'checkbox')
					data[name] = ($(this).is(':checked') ? 1 : 0);
				else
					data[name] = $(this).val();
			});
			
			//ADD MISSING FIELDS FROM MESSAGE THAT WAS PASSED IN
			for(var key in $this.fields){
				var field = $this.fields[key].name; 
				if (!(field in data)) data[field] = $this.field_default_value($this.fields[key], $this.message);
			}

			$this.create(data, function(data, errors){
				if (errors.length !== 0) return App.MessageError(errors.join('<br></br>'));
				
				//$this.message = $.extend(true, {}, data[0]);
				$this.add_row_to_grid(data);
				$($this.options.content_area).find('.fd-lookup-create #btn_cancel').trigger('click');
			});
		});
		
		_dlg.append(ui_group);
		
		return _dlg;
	}

	, _build_update_dlg		: function(){
		var $this = this;
		var ui_group = $this._create_form();
		var _dlg = $('<div title="'+$this.title+' - Update Existing" class="fd-lookup-update">');
		var $toolbar = $('<div class="btn-toolbar" role="toolbar">').appendTo(_dlg);

		$toolbar.append('<div class="btn-group">'+
					'<button id="btn_cancel" type="button" class="btn btn-flat btn-light"><i class="la la-power-off"></i></button>'+
					'<button id="btn_update" type="button" class="btn btn-flat btn-light"><i class="la la-save"></i></button>'+
					'<button id="btn_remove" type="button" class="btn btn-flat btn-light"><i class="la la-times"></i></button>'+
					'<button id="btn_clone" type="button" class="btn btn-flat btn-light"><i class="la la-copy" ></i></button>'+
				'</div>');

		$toolbar.find('#btn_clone').click(function(){
					var data = {};
					_dlg.find('.form_data').each(function(){
						var name = $this.fields[this.id].name;
						if (this.type === 'checkbox')
							data[name] = ($(this).is(':checked') ? 1 : 0);
						else
							data[name] = $(this).val();
					});

					$this.create(data, function(data, errors){
						if (errors.length !== 0) return;
						
						$this.message = $.extend(true, {}, data);
						
						$this.add_row_to_grid(data);
						$($this.options.content_area).find('.fd-lookup-create #btn_cancel').trigger('click');
					});
				});
		
		$toolbar.find('#btn_remove').click(function(){
			$($this.options.content_area).find('.fd-lookup-table #btn_remove').trigger('click');
		});
		
		$toolbar.find('#btn_update').click(function(){
			//BUILD THE DATA TO PASS BACK
			var data		= {}; //START OFF WITH THE DATA THAT WAS PASSED IN
			var old_data	= $.extend(true, {}, $this.message);
			var key = null;
			
			//FILL DATA WITH THE ORIGINAL DATA
			if ($this.options.row_to_update){
				old_data = $($this.options.row_to_update).prop('row_data');
			}
			
			//NOW COPY THE CHANGES
			_dlg.find('.form_data').each(function(){
				//console.log('field id ? ' + this.id + ' --> '+ $this.fields[this.id].name);
				var name = $this.fields[this.id].name;
				if (this.type === 'checkbox')
					data[name] = ($(this).is(':checked') ? 1 : 0);
				else
					data[name] = $(this).val();
			});
			
			//ADD MISSING FIELDS FROM MESSAGE THAT WAS PASSED IN
			for(key in $this.fields){
				if (!($this.fields[key].name in data)){
					data[$this.fields[key].name] = $this.field_default_value($this.fields[key], $this.message);
				}
			}
			
			$this.update(old_data, data, function(data, errors){
				if (errors.length !== 0){
					App.MessageError(errors.join('<br></br>'));
					return;
				}
				
				//UPDATE THE MESSAGE
				$this.message = $.extend(true, {}, data);
				
				if ($this.options.update_mode === false){
					//NOW UPDATE THE TABLE ROW THAT WAS SELECTED
					$($this.options.row_to_update).find('input[type=checkbox]').removeAttr('checked');
					$this.set_row_data($this.options.row_to_update, data);
				}
				
				_dlg.find('#btn_cancel').trigger('click');
			});
		});

		_dlg.append(ui_group);
		
		if ($this.options.toolbar.indexOf('clone') === -1)
			$toolbar.find('#btn_clone').hide();
		
		if ($this.options.toolbar.indexOf('remove') === -1)
			$toolbar.find('#btn_remove').hide();
			
		return _dlg;
	}

	, show_home_panel			: function(){
		if (this.options.update_mode === true || this.options.create_mode === true){
			if (true === this.options.use_dialog){
				if (this._modal)
					this._modal.close();//modal('hide');
				else
					App.closeModal();
			}
			
			if (typeof this.options._on_done === 'function') this.options._on_done(this.message);
			
		} else {
			this.options.content_area.find('.fd-lookup-create').hide(this.options.effect);
			this.options.content_area.find('.fd-lookup-update').hide(this.options.effect);
			this.options.content_area.find('.fd-lookup-table').show(this.options.effect);
		}
	}
	
	, _create_data_table		: function(data){
		var $this = this,
			col = null,
			th = null,
			field = null,
			fields = [],
			div = $('<div class="data-table">'),
			tr = $('<tr>');
		
		$this.options.table = $('<table class="table-editor table table-condensed table-responsive">').appendTo(div);
		this.options.table.append($('<thead>').append(tr));
		tr.append('<th><input type="checkbox"></th>'); //THIS IS FOR THE CHECKBOX
		
		for(col in this.fields){
			field = this.fields[col];
			if (field.show_on_grid !== true) continue;
			fields.push(field);
		}

		fields = fields.sort(function(a, b){
			if (a.index < b.index)
				return -1;
			else if (a.index > b.index)
				return 1;
			else
				return 0;
		});

		for(col = 0; col < fields.length; col++){
			field = fields[col];

			th = $('<th>')
					.html(field.title)
					.prop('field', field)
					.appendTo(tr);
		}
		
		$this.options.table.find('thead tr th input[type=checkbox]').off('click').on('click', function(){
			if (true === this.checked){
				tbody.find('tr:visible td input[type=checkbox]').attr('checked', 'checked');
			}
			else{
				tbody.find('td input[type=checkbox]').removeAttr('checked');
			}
		});
		
		var tbody = $('<tbody>');
		$this.options.table.append(tbody);
		
		for(var key in data){
			var row = data[key];
			tr = $('<tr style="text-align:center;">')
						.prop('row_data', row)
						.data('__row_id__', row.__row_id__)
						.appendTo(tbody);

			var td = $('<td class="fix-first-col">')
					.append('<input type="checkbox" class="ui-widget">')
					.prop('field',{})
					.appendTo(tr);
			
			for(col = 0; col < fields.length; col++){
				field = fields[col];
				var name = field.name;
				var display_value = null;
				
				if ($this.is_a_view !== true){
					display_value = $this.translate_field_value(field, row[name]);
					row[name] = $this.translate_foreign_key(field, row[name]);
				} else {
					display_value = row[name];
				}
				
				
				
				td = $('<td>')
						.html(display_value)
						.prop('field', field)
						.appendTo(tr);
			}
		}
		
		$this._prepare_grid();
		
		return div;
	}
	
	, _build_data_table		: function(){
		var $this = this,
			_dlg = $('<div class="fd-lookup-table widget-content" title="'+this.title+'" >'),
			$toolbar = $('<div class="btn-toolbar" role="toolbar">').appendTo(_dlg);

		$toolbar.append('<div class="btn-group">'+
					'<button id="btn_cancel" type="button" class="btn btn-flat btn-light"><i class="la la-power-off" ></i></button>'+
					'<button id="btn_create" type="button" class="btn btn-flat btn-light"><i class="la la-plus" ></i></button>'+
					'<button id="btn_update" type="button" class="btn btn-flat btn-light"><i class="la la-pencil" ></i></button>'+
					'<button id="btn_import" type="button" class="btn btn-flat btn-light"><i class="la la-arrow-down" ></i></button>'+
					'<button id="btn_export" type="button" class="btn btn-flat btn-light"><i class="la la-arrow-up" ></i></button>'+
					'<button id="btn_remove" type="button" class="btn btn-flat btn-light"><i class="la la-times" ></i></button>'+
				'</div>');
		
		if ($this.options.toolbar.indexOf('create') === -1)$toolbar.find('#btn_create').hide();
		if ($this.options.toolbar.indexOf('remove') === -1) $toolbar.find('#btn_remove').hide();
		if ($this.options.toolbar.indexOf('update') === -1) $toolbar.find('#btn_update').hide();
		if ($this.options.toolbar.indexOf('import') === -1) $toolbar.find('#btn_import').hide(); 
		if ($this.options.toolbar.indexOf('export') === -1) $toolbar.find('#btn_export').hide();
		
		$toolbar.append('<form class="pull-right">'+
							'<input type="text" class="search_string" class="form-control" placeholder="Search" >'+
						'</form>');
				
		if ($this.options.toolbar.indexOf('search') === -1) $toolbar.find('.btn-search').hide();
		
		$toolbar.find('.search_string')
			.on('keydown', function(evt){
					evt.stopPropagation();
				})
			.on('input', function(evt){
				evt.stopPropagation();
				var find_me = $.trim($(this).val().toLowerCase());
				var find_list = find_me.split('+');
				for(var i = 0; i < find_list.length; i++){
					find_list[i] = $.trim(find_list[i]);
				}
				var tbody = _dlg.find('table tbody');
				tbody.find('tr').each(function(){
					var found = true;	//ASSUME THE ROW CAN BE SHOWN.
					var tr = $(this);
					tr.show();
					
					//FIND ALL MATCHES
					for(i = 0; i < find_list.length; i++){
						if (find_list[i] === '') continue;
						if (find_list[i][0] === '!') continue;
						
						found = false;	//ASSUME IT IS NOT THERE
						tr.find('td').each(function(){
							value = $.trim($(this).text().toLowerCase());
							if (find_list[i] !== '' && find_list[i][0] !== '!'){
								if (value.indexOf(find_list[i]) !== -1){
									found = true;
								}
							}
						});
						
						if (false === found) break;
					}

					//FIND ALL NOT(!)-MATCHES
					for(var i = 0; i < find_list.length; i++){
						if (find_list[i] === '') continue;
						if (find_list[i][0] !== '!') continue;
						
						var find_me2 = $.trim(find_list[i].substr(1));

						tr.find('td').each(function(){
							value = $.trim($(this).text().toLowerCase());
							if (find_me2 !== '' && value.indexOf(find_me2) >= 0){
								tr.hide();
							}
						});
					}

					if (false === found && find_me !== ''){
						tr.hide();
					}
				});
			});

		//TOOLBAR

		$toolbar.find('#btn_cancel').off('click').on('click', function(){
			if (this._modal)
				this._modal.close();//.modal('hide');
			else
				App.closeModal();
			
			if (typeof $this.options._on_done === 'function') $this.options._on_done();
		});
		
		$toolbar.find('#btn_import').off('click').on('click', function(){
			$this.import_data();
		});

		$toolbar.find('#btn_export').off('click').on('click', function(){
			var table	= _dlg.find('table');
			var header	= '';
			var data	= '';
			var tbl		= $('<table>');
			var head	= $('<thead>').appendTo(tbl);
			var tbody	= $('<tbody>').appendTo(tbody);
			$this.options.table.find('thead tr').each(function(){
				if (header.length !== 0) header += '\r\n';
				var tr = $('<tr>').appendTo(head);
				var start = true;
				$(this).find('th:gt(0)').each(function(){
					tr.append('<th>'+$(this).html()+'</th>');
					if (true === start){
						start = false;
						header += '"'+$(this).text()+'"';
					} else {
						header += ',"' + $(this).text()+'"';
					}
				});
			});
			
			$this.options.table.find('tbody tr').each(function(){
				if ($(this).is(':visible') !== true) return;
				var tr = $('<tr>').appendTo(head);
				if (data.length !== 0) data += '\r\n';
				var start = true;
				$(this).find('td:gt(0)').each(function(){
					tr.append('<td>'+$(this).html()+'</td>');
					if (true === start){
						start = false;
						data += '"'+$(this).text()+'"';
					} else {
						data += ',"' + $(this).text()+'"';
					}
				});
			});

			var text = '<table>'+ tbl.html() + '</table>';
			
			var $dlg = $('<div title="Export Data">');
			var $txt = $('<textarea style="width:100%;height:300px">').appendTo($dlg);
			$txt.val(text);
			
			var blob		= new Blob([text], {type: 'text/html;charset=utf-8'});
			saveAs(blob, $this.title+'.html');
		});

		$toolbar.find('#btn_remove').off('click').on('click', function(){
			$this._remove_item(function(){
				$($this.options.content_area).find('.fd-lookup-create, .fd-lookup-update').hide();
				$($this.options.content_area).find('.fd-lookup-table').show();
			});
		});

		return _dlg;
	}
	
	, showSearch	: function(on_done){
			this.showEditor({search_mode: true}, [], on_done);
		}
	
	, showImport	: function(data, on_done){
			this.showEditor({toolbar: ['save'], import_mode: true}, data, on_done);
		}
	
	, showCreate	: function(data, on_done){
			this.showEditor({toolbar: ['save'], create_mode: true, width:'40vw'}, data, on_done);
		}
	
	, showUpdate	: function(data, on_done){
			this.showEditor({toolbar: ['save'], update_mode : true, width:'40vw'}, data, on_done);
		}
	
	, showEditor	: function(options, data, on_done){
		var $this = this;
		$this.init(options);
		$this.options._on_done = null;
		$this.options.row_to_update = null;
		
		if (typeof data === 'object')
			this.message = data;
		else if (typeof data === 'function')
			$this.options._on_done = on_done;
		
		if (typeof on_done === 'function')
			$this.options._on_done = on_done;

		$this.options.panel_main.find('#btn_create').off('click').on('click', function(){
			$this.options.panel_main.hide($this.options.effect);
			$this.options.panel_update.hide($this.options.effect);
			if (true !== $this.options.create_mode) $this.message = {};
			
			$this._init_controls($this.options.panel_create, $this.message);
			$this.options.panel_create.show($this.options.effect);
			$this.options.panel_create.find('input:first').focus();
		});
		
		$this.options.panel_main.find('#btn_update').off('click').on('click', function(){
			var data = $this.message;
			if ($this.options.update_mode === false){
				//GET THE ROW SELECTED
				var row = $this.options.table.find('td input[type=checkbox]:checked');
				if (row.length === 0){
					App.MessageError('Nothing selected');
					return;
				}
				$this.options.row_to_update = row.parents('tr');
				row = $this.options.row_to_update;
				data = row.prop('row_data');
			}
			
			for(var f in $this.fields){
				var field = $this.fields[f];
				$this.message[field.name] = $this.field_default_value(field, $this.message);
			}
			$this._init_controls($this.options.panel_update, $this.message);
			$this.options.panel_main.hide($this.options.effect);
			$this.options.panel_create.hide($this.options.effect);
			$this.options.panel_update.show($this.options.effect);
			$this.options.panel_create.find('input:first').focus();
		});
		
		$this.options.panel_update.find('#btn_cancel').off('click').on('click', function(){
			$this.show_home_panel();
		});
		
		$this.options.panel_create.find('#btn_cancel').off('click').on('click', function(){
			$this.show_home_panel();
		});
		
		$this.options.panel_main.hide();
		$this.options.panel_create.hide();
		$this.options.panel_update.hide();
		
		var on_open = function(data){
			if (true === $this.options.update_mode){
				$this.options.panel_main.find('#btn_update').trigger('click');
				
			} else if (true === $this.options.create_mode){
				$this.options.panel_main.find('#btn_create').trigger('click');
				
			} else if (true === $this.options.import_mode){
				$this.import_data();
				$this._modal.close();

			} else {
				$this.options.panel_create.find('#btn_cancel').trigger('click');
			}
			
			if ($this.is_a_view === true || $this.options.search_mode === true){
				$this.options.panel_main.find('#btn_create').remove();
				$this.options.panel_main.find('#btn_update').remove();
				$this.options.panel_main.find('#btn_remove').remove();
				$this.options.panel_main.find('#btn_import').remove();
			}
		};
		
		if (false === $this.options.use_dialog){
			//FIRST CLEAR THE AREA
			$($this.options.content_area).children().remove();

			//NOW ADD THE CONTENT
			$($this.options.content_area)
				.append($this.options.panel_main)
				.append($this.options.panel_create)
				.append($this.options.panel_update);
			
		} else {
			$this.options.content_area
				.append($this.options.panel_main)
				.append($this.options.panel_create)
				.append($this.options.panel_update);

				this._modal = App.Modal({
					content	: $this.options.content_area,
					title	: $this.title,
					width	: $this.options.width,
					height	: $this.options.height,
					overflow: $this.options.overflow,
					on_done	: function(){
							if ($this.options.update_mode === true ||
								$this.options.create_mode === true ||
								$this.options.import_mode === true){
								return;
							}
							
							if (typeof $this.options._on_done === 'function') $this.options._on_done();
						},
				});
		}
		

		
		if (this.options.update_mode === true ||
			this.options.create_mode === true ||
			this.options.import_mode === true){
			on_open();
			return;
		}
		
		$this.select(data, function(data){
			$this.options.panel_main.append($this._create_data_table(data));
			on_open();
		});

	},

	_create_form_input	: function(field, with_primary_key){
		var name = field.uuid;
		//if (typeof field.alias !== 'undefined' && $.trim(field.alias) !== '' && field.alias !== null){
			//name = field.alias;
		//}
		
		var result = '<div class="form-group">';
		
		result += '<label for="'+ name +'">'+field.title+'</label>';
		
		var data_type = $.trim(field.data_type).toLowerCase();

		if (data_type === 'date' || data_type === 'datetime' || data_type === 'time'){
			var icon = 'la-calendar';
			if (data_type === 'time') icon = 'la-clock-o';
			
			result += '<div class="input-group date widget-datepicker is-'+ data_type +'">'+
							'<span class="input-group-addon"><i class="fa '+ icon +'" ></i></span>'+
							'<input id="'+name+'" type="text" placeholder="'+field.title+'" class="form_data form-control" ></i>'+
						'</div>';
			
		}
		else if (data_type === 'boolean'){
			
			result = '<div class="checkbox">' +
						'<label>' +
							'<input type="checkbox" id="'+name+'" class="form_data ">' +
							field.title +
						'</label>';
		}
		else if (data_type === 'number')
			result += '<input type="number" id="'+name+'" placeholder="'+field.title+'"  class="form_data form-control number" >';
		else if (data_type === 'color')
			result += "<input type='color' id='"+name+"' class='form_data form-control' placeholder='"+field.title+"' >";
		else if (data_type === "lookup" || typeof field.foreign_key !== "undefined")
			result += "<select id='"+name+"' class='form_data form-control' placeholder='"+field.title+"'></select>";
		else if (data_type === "notes")
			result += "<textarea id='"+name+"' class='form_data form-control notes' placeholder='"+field.title+"'></textarea>";
		else if (data_type === "editor")
			result += "<textarea id='"+name+"' class='form_data form-control editor' placeholder='"+field.title+"'></textarea>";
		else if (data_type === "password")
			result += "<input type='password' id='"+name+"' class='form_data form-control' placeholder='"+field.title+"'>";
		else
			result += "<input type='text' id='"+name+"' class='form_data form-control'  placeholder='"+field.title+"'>";
		
		result += "</div>";
		result = $(result);
		if (field.required) result.find(".form_data").addClass("required");
		return result;
	},
	
	_create_form: function(){
		var $this = this;
		var _dlg_fieldset = "";
	
			//FIND ALL FIELDS THAT SHOULD BE IN THE PANEL
			var fields = [];
			for(var col in $this.fields){
				var field = $this.fields[col];
				if (field.show_on_editor === true){
					fields.push(field);
				}
			}
			
			fields = fields.sort(function(a, b){
				if (a.index < b.index)
					return -1;
				
				if (a.index > b.index)
					return 1;
				
				return 0;
			});
			
			var form = $("<form>");
			$(fields).each(function(){
				form.append($this._create_form_input(this));
			});

		return form;
	}
};
