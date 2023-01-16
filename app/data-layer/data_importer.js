var DataImporter = {
	import_columns		: [], //CONTAINS OBJECTS {id:column-number, name: field-name}
	row_count			: 0,
	current_row			: 0,
	start_row			: "",
	processed_data		: [],
	ignore_duplicates	: true,
	
	_dlg				: null,
	
	_set_title: function(msg){
		var m = this._dlg.find('.screen-message');
		m.show();
		m.html('<h3>'+msg+'</h3>');
	},
	
	_hide_title: function(){
			this._dlg.find('.screen-message').hide();
	},
	
	import_data: function(){
		var $this = this;
		this._dlg = $('<div title="Import">'+
					'<div class="bg-danger screen-message">&nbsp;</div>'+
					'<ul class="nav nav-tabs">'+
						'<li><a href="#import_select_file" data-toggle="tab">Select File</a></li>'+
						'<li><a href="#import_prepare_file" data-toggle="tab">Prepare File</a></li>'+
						'<li><a href="#import_errors" data-toggle="tab">Import Errors</a></li>'+
					'</ul>'+
					'<div class="tab-content">'+
					'<div class="tab-pane active" id="import_select_file">'+
						'<div id="import_data_form">'+
							'<input type="file" size=100 id="file_to_import" name="myfile"><br>'+
							'<button class="btn btn-primary" id="import_load_file">Load File</button>'+
						'</div>'+
						'<br/>'+
						'<br />'+
						'<p style="font-size:14px;font-weight:bold;">'+
						'<a id="import_sample_url" href="samples/members.csv">Click here to download a sample file</a>'+
						'</p>'+
					'</div>'+
					'<div class="tab-pane" id="import_prepare_file" style="border-bottom: 3px solid grey">'+
						'<fieldset>'+
							'<p>'+
							'<label for="import_has_header">First row is header</label>'+
							'<input id="import_has_header" type="checkbox" checked/>'+
							'</p>'+
							'<p>'+
							'<label for="ignore_dups">Ignore duplicates (in file)</label>'+
							'<input id="for="ignore_dups" "class="ignore_duplicates" type="checkbox" checked/>'+
							'</p>'+
						'</fieldset>'+
						'<p>'+
							'<button class="btn btn-primary" id="import_data_file" >Import File</button>'+
						'</p>'+
						'<div id="import_progress_label"></div>'+
						'<div id="import_progress_bar" class="progress">'+
							'<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">'+
								'</div>'+
						'</div>'+
						'<div class="import_result_table" style="width:100%;height:100%;display:inline-block;overflow:auto;"></div>'+
					'</div>'+
					'<div id="import_errors" class="tab-pane" ></div>'+
					'</div>'+
				'</div>');
		
		if (this.sample_url === null || $.trim(this.sample_url) === '')
			this._dlg.find('#import_sample_url').hide();
		else
			this._dlg.find('#import_sample_url').show();
			
		this._dlg.find('#import_sample_url').attr('href', this.sample_url);
		
		App.Modal({
				  content		: this._dlg
				, width			: 800
				, height		: 600
				, title			: 'Import - '+this.title
				, on_show		: function(context){ $this._init_dialog(); }
				, on_done		: function(){ $this._dlg.remove(); }
			});
	},
	
	_init_dialog: function(){
		var $this = this;
		
		this._dlg.find('#import_data_file').on('click', function(){
			$this._validate_data_to_import();
		});
		
		this._dlg.find('#import_data_form').hide();
		this._dlg.find('#import_load_file').on('click', function(){
				var files = $this._dlg.find('#file_to_import')[0].files;
				if (files.length === 0){
					return App.MessageWarning('No files selected to import');
				}
				var reader = new FileReader();
				reader.onload = function(){
					var json = $.trim(reader.result);
					var lines = csv_to_array(json);
					$this.buildImportTable(lines);
					import_data = json;
				};

				reader.readAsText(files[0]);  
			});
		
		this._dlg.find('#import_data_form').show();
		this._dlg.find('.import_result_table').children().remove();
	},

	_generate_import_header_column: function(){
		var select = $('<select>')
				.addClass('form-input input-sm')
				.append('<option>');
		var fields = [],
			field = null,
			opt = null,
			k = null;
		
		for(k in this.fields){
			fields.push({uuid:k, name:this.fields[k].name, title: this.fields[k].title});
		}
		fields.sort(function(a,b){
			return a.title.localeCompare(b.title);
		});
		
		for(k = 0; k < fields.length; k++){
			field = this.fields[fields[k].uuid];
			
			if (this.implementation_fields.indexOf(field.name) !== -1) continue;
			
			opt = $("<option value='"+field.name+"'>"+field.title+'</option>');
			opt.prop('field', field);
			select.append(opt);
		}
		return select;
	},

	_validate_data_to_import: function(){
		var $this		= this,
			table		= this._dlg.find('.import_result_table').find('table'),
			thead		= table.find('thead'),
			tr			= table.find('tr').eq(0),
			err_tbl		= $('<table>'),
			err_body 	= $('<tbody>');
		
		this._dlg.find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
		this._dlg.find('#import_errors').children().remove();
		this._dlg.find('#import_errors').append(err_tbl);
		err_tbl.append('<thead><tr><th>Row#</th><th>Field</th><th>Errors</th></tr></thead>');
		
		err_tbl.append(err_body);
		
		this._set_title('Validating data to be imported...');
		tr.find('th').each(function(){
			select = $(this).find('select');
			col_type = select.find('option:selected').text();
			if (this.cellIndex <= 0 || select.val() === '') return;  //COLUMN ZERO IS THE ROW NUMBER
			
			var errors		= [];
			var field_name	= select.val();
			var field		= select.find('option:selected').prop('field');
			
			$this.import_columns.push({
					id		: $(this).index(),
					name	: field.name,
					data	: null,
				});
			//IF THERE IS A FOREIGN KEY, THEN GO AND CHECK
			//THE CACHE TO DO CLIENT-SIDE VALIDATIONS
			if (field.foreign_key){
				if (field.foreign_key.sql_table in $this.database.entities){
					
					errors = $this.validate_column_type(
											$(this).index(),
											err_body, col_type,
											field.name,
											$this.database.entities[field.foreign_key.sql_table].data,
											$this.database.entities[field.foreign_key.sql_table].fields[field.foreign_key.value].name
										);
					
					$this.import_columns[$this.import_columns.length-1].data = {
							key	: $this.database.entities[field.foreign_key.sql_table].fields[field.foreign_key.key].name,
							value : $this.database.entities[field.foreign_key.sql_table].fields[field.foreign_key.value].name,
							data	: $this.database.entities[field.foreign_key.sql_table].data,
						};
				}
			}
		});
		
		this._hide_title();
		if (err_body.find('tr').length !== 0){
			this._set_title('There was errors validating the data...');
			this._dlg.find('.nav-tabs li:eq(2) a').tab('show');
		} else {
			//DO THE ACTUAL IMPORT
			var tbl					= this._dlg.find('.import_result_table').find('tbody');
			var start_row			= this._dlg.find('#import_has_header').is(':checked') ? ':gt(0)' : '';
			
			this.current_row = 0;
			if (start_row !== '') this.current_row++;
			this.row_count = tbl.find('tr'+start_row).length;
			
			this._dlg.find('#import_progress_label').children().remove();
			this._dlg.find('#import_progress_label').append('<h1>Importing data</h1>');
			this._dlg.find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);

			this.ignore_duplicates = this._dlg.find('.ignore_duplicates').is(':checked');
			this.processed_data = [];
			this.import_data_send_to_server();
		}
	},
	
	in_array: function(obj, arr_list){
		//DOES NOT DEAL WITH NESTED ARRAYS.....NOT OF INTEREST IN MY PROJECT.
		for(var index = 0; index < arr_list.length; index++){
			var item = arr_list[index];
			if (typeof(obj) === typeof(item)){
				var same = true;	//ASSUME IT IS THE SAME
				for(var key in obj){
					if (typeof(item[key]) === 'undefined') {
						same = false;
					} else if (typeof(item[key]) !== typeof(obj[key])) {
						same = false;
					} else if (item[key] !== obj[key]) {
						same = false;
					}
				}
				if (same === true) return true;
			}
		}
		return false;
	},
	
	import_data_send_to_server: function(on_done){
		var $this					= this,
			row_index				= 0,
			tbl						= this._dlg.find('.import_result_table').find('tbody'),
			fields = $.extend(true, {}, this.fields),
			request = {
				  ajax_url			: this.remote_url 
				, server_call		: this.remote_create
				, ignore_duplicates : this._dlg.find('.ignore_duplicates').is(':checked')
				, sql_table			: this.name
				, fields			: fields
				, data				: {}
			};
		
		request.data = {};
		for(var f in this.fields){
			request.data[f] = this.field_default_value(this.fields[f], null);
		}
		
		var row = tbl.find('tr').eq(this.current_row);
		var empty_row = true;
		
		$(this.import_columns).each(function(){
			value = null;
			col = $(row).find('td').eq(this.id);
			value = $.trim(col.text());
			if (typeof value !== 'undefined' && value !== '') empty_row = false;
			
			if (this.data !== null){
				request.data[this.name] = $this.import_get_key_from_name(value, this.data);
			}
			else
				request.data[this.name] = value;
		});
		
		$(row).addClass('bg-success');
		var w = (this.current_row/this.row_count)*100;
		
		//this._dlg.find('#import_progress_bar').progressbar({value:w});
		this._dlg.find('.progress-bar').css('width', w+'%').attr('aria-valuenow', w);
		
		var post_import = function(data){
				if ($this.current_row <= $this.row_count){
					$this.current_row++;
					$this.import_data_send_to_server(on_done);
				} else {
					$this._set_title('Import Complete');
					if (typeof on_done === 'function') on_done();
					
				}
			};

		if (false === empty_row){
			if (true === this.ignore_duplicates){
				if (true === this.in_array(request.data, this.processed_data)){
					post_import(request.data);
					return;
				}
			}
			
			this.processed_data.push(request.data);
			this._set_title('Importing row '+this.current_row);
			if (true !== this.database.is_json){
				get_server_data(request, function(data){
					post_import(data);
				});
			} else {
				this.create(request.data, function(data, errors){
					if (errors.length === 0)
						post_import(data);
					else
						App.MessageError(errors.join('<br/>'));
				});
			}
		}
		else {
			post_import(request.data);
		}
	},
	
	import_get_key_from_name: function(value, data_set){
		var result = null;
		$(data_set.data).each(function(){
			for(var k in this)
			{
				if (unescape(this[k][data_set.value]).toLowerCase() === value.toLowerCase()){
					result = this[k][data_set.key];
				}
			}
		});
		
		return result;
	},
	
	validate_column_type: function(col_index, err_body, col_type, field_name, data_set, search_field){
		var row_index	= 1;
		var $this		= this;
		var tbl			= this._dlg.find('.import_result_table tbody');
		var start_row	= this._dlg.find('#import_has_header').is(':checked') ? ':gt(0)' : '';
		this._dlg.find('#import_progress_label').children().remove();
		this._dlg.find('#import_progress_label').append('<h1>Validating '+ col_type+'</h1>');
		this._dlg.find('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
		
		row_cnt = tbl.find('tr:gt(0)').length;
		if (start_row !== '') row_index++;
		
		if (typeof search_field === 'undefined') search_field = 'name';
		
		tbl.find('tr'+start_row).each(function(){
			value = null;
			col = $(this).find('td').eq(col_index);
			value = col.text();
			if (typeof value === 'undefined') return;
			if ($.trim(value) === '') return;
			var w = ($this.row_index/$this.row_cnt)*100;
			$this._dlg.find('.progress-bar').css('width', w+'%').attr('aria-valuenow', w);
			var found_it = false;
			//console.log(search_field);
			$(data_set).each(function(){
				for(var item in this){
					//console.log(this[item]);
					if ($.trim((this[item][search_field]).toLowerCase()) === $.trim((value).toLowerCase())){
						found_it = true;
					}
				}
			});
			
			if (field_name.toLowerCase() === 'name'){
				if (value.length > 150){
					err_body.append('<tr><td>'+row_index+'</td><td>'+col_type+'</td><td>Text must be less than 150 characters: '+value+'</td></tr>');
				}
			}
			else{
				if (false === found_it){
					err_body.append('<tr><td>'+row_index+'</td><td>'+col_type+'</td><td>Item not found: '+value+'</td></tr>');
				}
			}
			row_index++;
		});
	},
	
	buildImportTable: function(data){
		var tbl = $('<table>')
					.css({
						height: '300px',
						overflow: 'auto',
						display: 'inline-block'
					});
		var thead = $('<thead>');
		var tbody = $('<tbody>');
		var tr = $('<tr>');
		thead.append(tr);
		
		tbl.append(thead);
		tbl.append(tbody);
		tr.append('<th>#</th>');
		
		//BUILD FIELD MAPPER FOR EACH COLUMN OF DATA
		for(var col = 0; col < data[0].length; col++){
			var td = $('<th>').append(this._generate_import_header_column());
			
			tr.append(td);
		}
		
		var row_cnt = 1;
		for(var row = 0; row < data.length; row++){
			tr = $('<tr>').appendTo(tbody);
			
			tr.append('<td>'+row_cnt+'</td>');
			for(col = 0; col < data[row].length; col++){
				tr.append('<td>'+data[row][col]+'</td>');
			}
			row_cnt++;
		}
		
		this._dlg.find('.import_result_table').children().remove();
		this._dlg.find('.import_result_table').append(tbl);
		this._dlg.find('.nav-tabs li:eq(1) a').tab('show');
	}
};
