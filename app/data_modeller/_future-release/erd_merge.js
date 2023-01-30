var erd_merge = function (_designer){
	
	var designer = _designer;
	
	function _append_item(text, control, is_custom, widget){
		if (typeof is_custom === 'undefined') is_custom = false;
		
		control = $(control);
		var opt = $('<a class="list-group-item small">');
		opt.append('<label>' + text + '</label>');
		if (control.is('input[type="checkbox"]')){
			var chk = $('<div class="checkbox">').appendTo(opt);
			var label = $('<label>').appendTo(chk);
			label.append(control);
		} else {
			
			opt.append(control);
			
			if (!control.hasClass('btn') && (
					control.is('input') ||
					control.is('select') ||
					control.is('textarea')
				))
				control.addClass('form-control input-sm');
		}
		opt.prop('custom', is_custom);

		widget.append(opt);
	}
	
	function open(){
		var div = $('<form role="form">');
		var settings = get_settings();
		
		$.each(settings, function(){
			var item = $('<div class="form-group">').appendTo(div);
			
			item.append('<label>'+ this[0] + '</label>');
			item.append(this[1]);
		});
		
		open_card(div,{
			title: 'Re-use an existing model',
			width: '40%',
		});
	}
	
    function load_local_file(files, on_done){
		if (files.length === 0){
			alert('No file selected.');
			return;
		}
		table_name = files[0].name;

		var reader = new FileReader();
		reader.onload = function(){
			var json = $.trim(reader.result);
			var db = import_from_text(json);
			if (typeof on_done === 'function') on_done(db);
			
			App.MessageInfo('Your datasource has been loaded...');
		};

		reader.readAsText(files[0]);  
    }

    function import_from_text(json){
        if (typeof json === 'undefined' || null === json || json.length === 0){
            alert('No JSON text provided');
            return;
        }
        var db          = null;
        var obj			= '';
        var obj_name	= '';
        var bracket_cnt	= 0;
        var prev_char	= '';
        var obj_start	= false;
        var entities	= [];
        for(var index = 0; index < json.length; index++){
            switch(json[index]){
                case '{': 
                    if (bracket_cnt === 0){
                        obj_start = true;
                        obj = '';
                    }
                    bracket_cnt++;
                    break;

                case '}': bracket_cnt--;
                    break;

                case '=':
                    //IF BRACKET COUNT IS STILL ZERO IT MEANS WE HAVE REACHED THE 
                    //OBJECT NAME
                    if (bracket_cnt === 0){
                        obj_name = obj.replace('var ', '');
                    }
                    break;
            }

            obj += json[index];

            if ($.trim(json[index]) !== '') prev_char = json[index];

            if (index > 0 && bracket_cnt === 0 && obj_start === true){
                //FOUND A OBJECT SO CONVERT IT.
                /*jshint evil:true */
                db = eval('('+obj+')');
                App.datasources[db.name] = db;
                App.datasources[db.name].is_loaded = true;
                for(var tbl in db.entities){
                    var entity = db.entities[tbl];
                    entity = $.extend(true, entity, DataInterface);	//ADD THE BITS TO MODIFY THE DATASET
                    entity = $.extend(true, entity, DataEditor);	//ADD THE GUI BITS TO MODIFY THE DATASET
                    entity = $.extend(true, entity, DataImporter);	//ADD THE GUI BITS TO IMPORT INTO THE DATASET

                    entity.database = db;
                }
            }
        }
        
        return db;
    }

	function get_datasource(source_name){
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

	function get_settings(){
		var $this = this;
		
		var datasource = $('<select class="form-control">');
		var tables = $('<select multiple class="form-control">');
		var local_db = $('<div><label for="fileInput" class="btn btn-flat btn-outline btn-light">'+
							 '<i class="la la-cloud-upload"></i> Import file'+
						  '</label>'+
						  '<input type="file" id="fileInput">'+
						  '</div>');
		var btn_import = $('<button type="button" class="btn btn-success btn-flat btn-outline"> import entity </button>');

		local_db.find('input').css('display', 'none');
	
		if (window.File && window.FileReader && window.FileList && window.Blob){
			local_db.find('input').on('change', function(){
				load_local_file(local_db.find('input')[0].files, function(){
					load_datasources(datasource);
				});
			});
		}
	
		datasource.off('change').on('change', function(){
			var $this = $(this);
			tables.children().remove();
			
			if ($this.val() === ''){
				return;
			}
			
			App.datasource_reload($this.val()).then(function(ds){ 
				//ON THIS CHANGE WE LOAD THE TABLES
				tables.children().remove();
				
				for(var tbl in ds.entities){
					tables.append('<option value="'+tbl+'">'+ds.entities[tbl].title+'</option>');
				}

			});
		});
		
		btn_import.on('click', function(){
			function import_entity(ds_name, entity_name){
				var ds = App.datasources[ds_name];
				var entity = ds.entities[entity_name];
				
				var table = designer.addTable(entity.title, entity.left, entity.top, entity.uuid);
				table.fromObject(entity);
				table.visible = true;
			}
			
			tables.find('option:selected').each(function(){
				import_entity(datasource.val(), $(this).val());
			});
			
			//RESTORE RELATIONSHIPS
			for(var t in designer.tables){
				var table = designer.tables[t];
				for(var f in table.fields){
					var field = table.fields[f];
					if (!field.foreign_key) continue;

					var t1 = designer.tables[field.foreign_key.sql_table];
					if (!t1) continue;
					
					var r1 = t1.fields[field.foreign_key.key];
					
					var t2 = designer.tables[table.uuid];
					if (!t2) continue;
					var r2 = t2.fields[field.uuid];
					if (!r2) continue;
					
					designer.addRelation(r1, r2);
				}
			}
		});
		
		datasource.children().remove();
		tables.children().remove();
		var key = null;
		for(key in App.datasources) break;
		
		if (null === key){
			datasources_load(function(){
					load_datasources(datasource);
				});
		} else {
			load_datasources(datasource);
		}
		
		var tbl_div = $('<div>')
							.append(tables)
							.css({
								height: '40px',
							});
		tables
			.css({
				width: '75%'
			})
			.addClass('pull-left');
		var view_table = $('<a class="btn btn-light btn-lg btn-flat btn-outline" title="view data in table"><i class="la la-fw la-th" ></i></a>').appendTo(tbl_div);
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
			['local-db', local_db],
			['datasource', datasource],
			['table', tbl_div],
			['', btn_import],
		];
	}
	
	function load_datasources(datasource, on_done){
		if (typeof on_done !== 'function') on_done = function(){};
		
		datasource.children().remove();
		datasource.append('<option>');
		for(var key in App.datasources){
			datasource.append('<option>'+ key +'</option>');
		}
		
		if (datasource.find('option:selected').index() > 0)
			datasource.trigger('change');
		
		on_done();
	}

	function datasources_load(on_done){
		if (typeof on_done !== 'function') on_done = function(){};

		App.ajax_call('api/v1/projects', {type:'datamodel'}, function(data){
			for(var id = 0; id < data.projects.length; id++){
				App.datasources_append({project: data.projects[id]}, null, false);
			}
			on_done();
		}, false, function(e){
			on_done();
        });
	}
	
	function get_editor(obj){
		var widget = $('<ul class="general-props list-group props-edit">');
		var s = get_settings(obj);
		
		for(var index = 0; index < s.length; index++){
			_append_item(s[index][0], s[index][1], false, widget);
		}
		
		return widget;
	}

	return {
			attach: get_editor,
			open: open,
			get_settings: get_settings,
            //open_local: load_local_file,
		};
};
