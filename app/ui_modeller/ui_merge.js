var ui_merge = function (_designer){
	
	var designer = _designer;
	
	var $this = this;
	this.attached_object		= null;
	IControl.extend(this, base_property);

	
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
			width: '25vw',
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
		var tables = $('<select class="form-control">');
		var local_db = $('<div><label for="fileInput" class="btn btn-flat btn-outline btn-light">'+
							 '<i class="fa fa-cloud-upload"></i> Import file'+
						  '</label>'+
						  '<input type="file" id="fileInput">'+
						  '</div>');
		var preview = $('<img>').css({
				'max-width': '300px',
				'max-height': '200px',
			});
		var btn_import = $('<button type="button" class="btn btn-success btn-flat btn-outline"> import entity </button>');

		local_db.find('input').css('display', 'none');
	
		if (window.File && window.FileReader && window.FileList && window.Blob){
			local_db.find('input').on('change', function(){
				load_local_file(local_db.find('input')[0].files, function(){
					load_datasources(datasource);
				});
			});
		}
	
		datasource.on('change', function(){
			var $this = $(this);
			tables.children().remove();
			
			if ($this.val() === ''){
				return;
			}
			
			designer.load_server_file($this.val(), 'application', function(ui){
				//ON THIS CHANGE WE LOAD THE TABLES
				tables.children().remove();
				tables.append('<option>');
				for(var tbl in ui.forms){
					tables.append('<option value="'+tbl+'">'+ui.forms[tbl].label+'</option>');
					tables.find('option:last-child').data('form', ui.forms[tbl]);
					
				}
			});
		});
		
		tables.on('change', function(){
			var form = $(this).find('option:selected').data('form');
			preview.attr('src', form.preview);
		});
		
		btn_import.on('click', function(){
			var form = tables.find('option:selected').data('form');
			designer.Forms.addForm(form);

		});
		
		datasource.children().remove();
		tables.children().remove();

		available_ui_list().then(function(uix){
			datasource.children().remove();
			datasource.append('<option>');
			for(var key = 0; key < uix.length; key++){
				datasource.append('<option>'+ uix[key] +'</option>');
			}
			
			if (datasource.find('option:selected').index() > 0)
				datasource.trigger('change');
		});
		
		return [
			['local-ui-file', local_db],
			['project', datasource],
			['ui form', tables],
			['', btn_import],
			['preview', preview],
		];
	}

	function available_ui_list(){
		return new Promise(function(resolve, reject){
			var request = {
					type:'application',
					auth_token: App.AuthToken,
				};
				
			App.ajax_call('api/v1/projects', request, function(data){
				resolve(data.projects);
			}, false, function(e){
				reject(e);
			});
		});
	}
	
	function get_editor(obj){
		var widget = $('<ul class="general-props list-group props-edit">');
		var s = get_settings(obj);
		this.attached_object = obj;
		for(var index = 0; index < s.length; index++){
			$this._append_item(s[index][0], s[index][1], null, widget);
		}
		
		return widget;
	}

	return {
			attach: get_editor,
			open: open,
			get_settings: get_settings,
            open_local: load_local_file,
		};
};
