var control_table = {
	type				: 'table',
	control_label		: 'Table',
	control_category	: 'Common',
	control_thumbnail	: 'images/widgets/table-tree.png',
	properties	: {
			height		: 150,
			width			: 500,
			label			: 'Sample Table',
			default_value	: 'column-1,column-2,column-3\nvalue-1,value-2,value-3\nvalue-4,value-5,value-6\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9\nvalue-7,value-8,value-9'
		},
	style_to_exclude	: ['border-width', 'border-color'],
	
	panel_types		: ['none', 'bg-light', 'bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger'],
	
    ignore_properties: [
			'on-click',
			//'name',
			'allow inline editor',
		],
	
    _change_mode	: function(){
		this.setValue();
	},
	
	_refresh: function(){
		this.setValue();
    },
	
	_resize: function(){
		this._format();
	},
	
	_format	: function(){
		var $this = this;
		var caption = this.ctrl.find('.caption');
		if (typeof this.panel_type !== 'string') this.panel_type = 'none';
		
		caption.hide();
		this.label = this.label.trim();
		caption.html(this.label);
		if (this.label.length !== 0)
			caption.show();

		var $table = this.ctrl.find('table'),
			$bodyCells = $table.find('tbody tr:first').children();
			
		this.ctrl.find('.table-container').css({
			height: (parseFloat(this.dom.container.css('height')) - parseFloat(caption.css('height')) - 20),
			overflow : 'auto',
			display : 'block',
		});
	
		this.ctrl.find('table').css({
			'max-height' : parseFloat(this.dom.container.css('height')),
		});
		
		this.ctrl.removeClass(this.panel_types.join(' ').replace(/bg-/g, 'border-'));
		this.ctrl.removeClass('border-none none');
		// this.ctrl.removeClass('card');
		
		caption.removeClass('bg-heading').addClass('h4');
		// this.ctrl.find('.table-container').removeClass('bg-body');
		caption.removeClass(this.panel_types.join(' '));
		caption.removeClass('text-dark text-light');
		if (this.panel_type !== 'none'){
			caption.addClass(this.panel_type);
		
			caption.addClass(this.panel_type === 'bg-light' ? 'text-dark' : 'text-white');
			this.ctrl.addClass(this.panel_type.replace('bg-', 'border-'));
	
			caption.addClass('bg-heading').removeClass('h4');
			// this.ctrl.find('.table-container').addClass('bg-body');
		}

		console.log('class ',this.ctrl.attr('class'));
		
		$table
			.on('click', 'tr', function(evt){
				evt.stopPropagation();
				var is_active = $(this).hasClass('row-is-selected');
				
				$table.find('tr').removeClass('row-active row-is-selected');
				
				if (false === is_active || evt.ctrlKey === true)
					$(this).addClass('row-active row-is-selected');
			})
			.on('mouseleave', 'tr', function(){
				var row = $(this);
				
				if (row.hasClass('row-is-selected') !== true)
					row.removeClass('row-active');
			});
		
		var td_height = parseFloat($table.find('.td-content:first-child').closest('td').css('height'));
	},
	
	make_sortable: function(){
		var $this = this;
		this.ctrl.find('th').css({
				cursor: 'pointer'
			});
		
		this.ctrl.off('click').find('th').on('click', function(evt){
			evt.stopPropagation();
			var th = $(this);
			
			var sort_order = th.data('sort-order');
			if (sort_order === 'asc')
				sort_order = 'desc';
			else
				sort_order = 'asc';
			
			th.data('sort-order', sort_order);
			
			var hdr = $this.value.shift();
			
			$this.value = $this.value.sort(function(a, b){
				switch(sort_order){
					case 'asc':
						if ((a instanceof Array) && (b instanceof Array))
							return a[th.index()].toString().localeCompare(b[th.index()].toString());
						else {
							if (a && b)
								return a.toString().localeCompare(b.toString());
							else
								return 0;
						}
						break;
					default:
						if ((a instanceof Array) && (b instanceof Array))
							return b[th.index()].toString().localeCompare(a[th.index()].toString());
						else {
							if (a && b)
								return b.toString().localeCompare(a.toString());
							else
								return 0;
						}
				}
			});
			
			$this.value.unshift(hdr);
			$this._setFromArray($this.value, true);
			$this._format();
			$this.ctrl.find('th i').remove();
			if (sort_order === 'asc')
				th.append('<i class=\'pull-right la la-caret-up\'>');
			else
				th.append('<i class=\'pull-right la la-caret-down\'>');
			
		});		
	},
	
	get_settings : function(){
		if (typeof this.value !== 'object') this.value = {};
		if (typeof this.label !== 'string') this.label = '';
		
		var $this = this;

		var type_list = $('<select>').addClass('form-control');
		type_list.append('<option>');
		for(var i = 0; i < this.panel_types.length; i++){
			type_list.append('<option>'+this.panel_types[i]+'</option>');
		}
		
		type_list.find('option').each(function(){
			var opt = $(this);
			if (opt.val() === $this.panel_type) opt.attr('selected', 'selected');
		});
		
		type_list.on('change', function(){
			$this.panel_type = $(this).val();
			$this._format();
		});
		
		//UNIQUE LIST
		var unique_list = $("<input type='checkbox'>");
		if (this.unique_list === true)
			unique_list.attr("checked", "checked");
		
		unique_list.on("click", this, function(evt){
			evt.data.unique_list = $(this).is(":checked");
			evt.data.setValue();
		});
		
		//TEXT
		var text = $('<textarea>').val(this.default_value);
		
		text.on('input', function(evt){
			evt.stopPropagation();
			$this.default_value = $(this).val();
			$this.setValue($this.default_value);
		});
		
		return [
			['unique table list', unique_list],
			['panel type', type_list],
			['default data', text],
		];
	},
	
	val: function(value){
		var result = null,
			hdr = null;
		
		if (typeof value !== 'undefined') return this.setValue(value);
		
		result = this.getSelection();
		if (result.length === 0) return null;
		
		result = result[0];
		hdr = this.value[0];

		if (hdr[hdr.length - 1].indexOf('reference-key/') !== -1){
			result = result[result.length - 1];
		}
		
		return result;
	},
	
	getSelection : function(){
		var result = [];
		
		this.ctrl.find('tbody tr').each(function(){
			var row = $(this);
			if (row.hasClass('row-is-selected') !== true) return;
			result.push(row.prop('data'));
		});
		
		return result;
	},
	
	removeSelection	: function(){
			var $this = this;
			this.ctrl.find('tbody tr').each(function(){
				if ($(this).hasClass('row-is-selected') !== true) return;
				
				$this.removeRow($(this).prop('data'));
				$(this).remove();
			});
			
			this.format();
		},
	
	removeRow : function(row_data){
		var id = null;
		if (this.value instanceof Array){
			id = this.value.indexOf(row_data);
			if (id !== -1) {
				this.value.splice(id, 1);
				return true;
			}
			
			return false;
		} else if (typeof this.value === 'string'){
			var list = this.value.split(/\n|\r/);
			id = list.indexOf(row_data);
			if (id !== -1) {
				list.splice(id, 1);
				this.value = list.join('\n');
				return true;
			}
		}
		
		return false;
	},
		
	addRow : function(data, after_row, append_data, db_table, fields){
		if (typeof append_data === 'undefined') append_data = true;
		
		var tr = null,
			hdr = this.value[0],
			data_len = data.length,
			reference_key = data,
			col = null,
			index = null;
		
		if (hdr[hdr.length - 1].indexOf('reference-key/') !== -1){
			data_len -= 1;
			reference_key = data[hdr.length - 1];
		}
		
		if (data instanceof Array){
			if (null === db_table || (!(fields instanceof Array)) || fields.length === 0){
				tr = this._get_row_static_data(data, data_len, reference_key);
			} else {
				tr = this._get_row_db_data(data, data_len, reference_key, db_table, fields);
			}
			
			this.ctrl.find('tbody').append(tr);
		} else if ($(data)[0].tagName === 'TR'){
			tr = data;
		}
		
		if (null === after_row || typeof after_row === 'undefined'){
			this.ctrl.find('tbody').append(tr);
		} else {
			after_row.after(tr);
		}

		return tr;
	},
	
	_get_row_static_data: function(data, data_len, reference_key){
		var tr = $('<tr>')
				.prop('data', data)
				.prop('reference', reference_key);
				
		for(var key = 0; key < data_len; key++){
			data[key] = $.trim(data[key]);
			var content = $('<div>')
					.addClass('td-content');
			
			var td = $('<td>')
					.append(content)
					.appendTo(tr);
			
				content.html($.trim(data[key]));
		}
		
		return tr;
	},
	
	_get_row_db_data: function(data, data_len, reference_key, db_table, fields){
		var col = null,
			field = null,
			name = null,
			display_value = null,
			tr = $('<tr>')
					.prop('data', data)
					.prop('reference', reference_key);
			
			
		
		for(var key = 0; key < data_len; key++){
			if (fields instanceof Array)
				field = fields[key];
			
			display_value = db_table.translate_field_value(field, data[key]);
			
			var content = $('<div>')
							.addClass('td-content')
							.append(display_value);
							
			var td = $('<td>')
					.append(content)
					.appendTo(tr);
		}
		
		return tr;
	},
	
	setLabel : function(value){
		this.label = typeof value !== 'undefined' ? $.trim(value) : this.label;
		this._format();
	},
	
	setDefault: function(value){
		this.value = value;
	},
	
	setValue : function(value){
		this.value = typeof value !== 'undefined' ? value : this.value;
		var $this = this;
		
		this.get_datasource(function(data_){
			if (data_){
				$this.value = data_;
			}

			if ($this.in_run_mode === false) $this.value = $this.default_value;

			$this.ctrl.find('table').children().remove();
			
			if (typeof $this.value === 'string'){
				$this.value = $.trim($this.value).split(/\n|\r/g);
				for(var id = 0; id < $this.value.length; id++){
					if (typeof $this.value[id] === 'string')
						$this.value[id] = $this.value[id].split(/,/g);
				}
			}
			
			if (($this.value instanceof Array) && $this.value.length > 0){
				
				if (!($this.value[0] instanceof Array)){
					$this._setFromObjectArray();
				} else {
					$this._setFromArray();
				}
			} else {
				$this._setFromArray();
			}
			
			$this._format();

		});
		
		return this;
	},
	
	_setFromObjectArray: function(){
		var data = [],
			row = null,
			item = null,
			key = null,
			index = null;
		
		row = this.value[0];
		data.push([]);
		for(key in row){
			data[0].push(key);
		}
		for(index = 0; index < this.value.length; index++){
			row = this.value[index];
			item = [];
			
			for(key in row){
				item.push(row[key]);
			}
			data.push(item);
		}
		
		this.value = data;
		
		this._setFromArray();
	},
	
	_setFromArray : function(value, ignore_header){
		var list = value,
			index = 0,
			$this = this,
			db_table = null,
			fields = [],
			row = [],
			tr = null,
			td = null,
			col = null,
			hdr = null;
		
		if (!(value instanceof Array)) list = this.value;
		if (typeof ignore_header === 'undefined') ignore_header = false;
		if (!(list instanceof Array)) return;
		
		if ($this.unique_list === true){
			
			//SOURCE: http://stackoverflow.com/questions/9923890/removing-duplicate-objects-with-underscore-for-javascript
			var uniques = _.map(_.groupBy(list, function(doc){
									var comp = '';
									if (doc instanceof Array){
										for(var key = 0; key < doc.length; key++){
											comp += doc[key] + '-';
										}
									} else
										comp = doc;
										
									return comp;
								}),function(grouped){
									return grouped[0];
								});

			list = uniques;
		}
		
		//$this.value = list;
		this.ctrl.find('tbody').remove();
		hdr = list[0];
		if (list.length >= 1 && ignore_header === false){
			this.ctrl.find('thead').remove();
			
			var thead = $('<thead><tr></tr></thead>').appendTo(this.ctrl.find('table'));
			if (hdr instanceof Array){
				for(index = 0; index < hdr.length; index++){
					if (hdr[index].indexOf('reference-key/') !== -1) continue;
					
					thead.find('tr').append('<th>'+hdr[index]+'</th>');
				}
			} else {
				thead.find('tr').append('<th>'+hdr+'</th>');
			}
			$this.make_sortable();
		}
		
		db_table = this.translate_datasource();
		
		if (null !== db_table){
			for(index = 0; index < hdr.length; index++){
				for(col in db_table.fields){
					if (db_table.fields[col].title == hdr[index]){
						fields.push(db_table.fields[col]);
						break;
					}
				}
			}
		}

		var tbody = $('<tbody>').appendTo(this.ctrl.find('table'));
		for(index = 1; index < list.length; index++){
			row = list[index];
			
			tr = $('<tr>').appendTo(tbody);
			for(col = 0; col < row.length; col++){
				td = $('<td>').appendTo(tr);
				td.html(row[col]);
			}
		}
		
		this.ctrl.show();
	},

	getControl	: function(owner){
		this.ctrl = $('<div class="card">' +
						'<div class="card--header caption h4 text-center"></div>' +
						'<div class="card-body p-2 table-container">'+
							'<table>></table>'+
						'</div>'+
					'</div>');
		this.ctrl.find('table')
					.addClass('table -small -table-bordered table-condensed table-responsive');
		
		return this.ctrl;
	}
};
