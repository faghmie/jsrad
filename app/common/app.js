if (typeof FD === 'undefined') FD = {};

var App = {
		message_div		: $('<div class="card notify">'+
								'<div class="side-bar" />'+
								'<div class="content">'+
									'<a class="pull-right close-btn"><i class="la la-fw la-times"></i></a>'+
									'<h3 class="title">#{title}</h3>'+
									'<p class="message">#{text}</p>'+
								'</div>'+
							'</div>')
							.appendTo('body')
							.hide(),
		MessageTypes	: {
								INFO: 0,
								WARNING: 1,
								ERROR: 2
							},
		designer			: null,
		datasources		: {},
		base_path			: './',
		is_web_app		: (location.href.indexOf('file:///') === 0),
		is_mobile		: (/Mobi|Android/i.test(navigator.userAgent)),
		AuthToken		: {
							email: null,
							token: null,
							network: null,
						},
		
		init_auth: function(){
			App.AuthToken = {};
			hello.init({
				google: '26993373135-jg35i8p0sjkdp2jcf8ul5g5554rgcdj8.apps.googleusercontent.com',
				facebook: '238548349921361',
				
			},{
				//redirect_uri: 'http://thefoundry.doagileprojects.com/',
				scope: 'email',
			});
		},
		
		datasources_append : function(settings, on_done, refresh){
				if (typeof refresh === 'undefined') refresh = true;
				if (typeof on_done !== 'function') on_done = function(){};
				
				var defaults = {
						type			: 'datamodel',
						url				: 'projects.php',
						function_name	: 'project_load',
						project			: '',
						filename		: 'project.json',
						dir				: null,
					};
				
				if (typeof settings === 'string') settings = {name: settings, project: settings};
				if (typeof settings === 'object'){
					if (settings.name && !settings.project) settings.project = settings.name;
					if (!settings.name && settings.project) settings.name = settings.project;
				}
				
				
				settings = $.extend(true, defaults, settings);
				if (settings.project in this.datasources){
					return on_done(this.datasources[settings.project]);
				}
				
				this.datasources[settings.project] = $.extend(true, 
							{
								settings: settings,
								is_loaded: false,
								entities: {},
							}, DataInterface.database);
				
				if (true === refresh){
					this.datasource_reload(settings.project).then(function(db){
						on_done(db);
					});
					
				} else
					on_done(this.datasources[settings.project]);
			},
		
        datasources_extend : function(db){
			db.is_json = true;
			if (db.database_type)
				db.is_json = (db.database_type.toLowerCase() === 'json');
			
            for(var tbl in db.entities){
                var entity = db.entities[tbl];
                entity = $.extend(true, entity, DataInterface);	//ADD THE BITS TO MODIFY THE DATASET
                entity = $.extend(true, entity, DataEditor);	//ADD THE GUI BITS TO MODIFY THE DATASET
                entity = $.extend(true, entity, DataImporter);	//ADD THE GUI BITS TO IMPORT INTO THE DATASET

                entity.database = db;
            }
            for(var key in db.entities){
				db.entities[key].upgrade_format();
				break;
			}
            return db;
        },

		datasource_reload: function(ds_name){
			var $this = this;
			
			return new Promise(function(fullfill, reject){
				var ds = null;
				
				if (!(ds_name in $this.datasources)) return reject(new Error('Given datasource not available ['+ ds_name + ']'));
				
				ds = $this.datasources[ds_name];
				if (!ds.entities) ds.entities = {};
				if (!ds.settings) ds.settings = {};
				ds.settings.type = (typeof ds.type !== 'undefined' ? ds.type : 'datamodel');
				
				if (ds.database_type.toLowerCase() === 'json' && ds.is_loaded === true){
					return fullfill($this.datasources[ds_name]);
				}
				
				Project.load_server_file(ds_name, 'datamodel', function(db){
					
					db.is_loaded = true;
					
					db = $this.datasources_extend(db);
					
					$this.datasources[ds_name] = db;
					if (typeof $this.datasources[ds_name].settings !== 'object') $this.datasources[ds_name].settings = {};
					
					$this.datasources[ds_name].settings.url = ds.settings.url;
					$this.datasources[ds_name].settings.function_name = ds.settings.function_name;
					$this.datasources[ds_name].is_loaded = true;
					
					fullfill($this.datasources[ds_name]);
				},
				function(err){
					reject(new Error('Unable to load datasource(s) from server.'));
				});
			});
		},
		    
		refresh_datasources	: function(on_done, single_db, on_error){
			var $this = this,
				key = null,
				ds = null,
				all_done = false;
			
			for(key in this.datasources){
				this.datasources[key].is_loaded = false;
			}
			if (typeof on_done !== 'function') on_done = function(){};
			
			for(key in this.datasources){
				ds = this.datasources[key];
				if (!ds.entities) ds.entities = {};
				if (!ds.settings) ds.settings = {};
				ds.settings.type = (typeof ds.type !== 'undefined' ? ds.type : 'datamodel');
				if (ds.settings.url === undefined){
					//ASSUME IT WAS LOADED LOCALLY
					ds.is_loaded = true;
					continue;
				} 
				
				if (ds.database_type.toLowerCase() === 'json' && ds.is_loaded === true){
					continue;
				}
				
				Project.load_server_file(key, 'datamodel', function(db){
					db.is_loaded = true;
					
					db.is_json = (db.database_type.toLowerCase() === 'json');
					db = $this.datasources_extend(db);
					
					$this.datasources[db.name] = db;
					$this.datasources[db.name].url = ds.settings.url;
					$this.datasources[db.name].function_name = ds.settings.function_name;
					$this.datasources[db.name].is_loaded = true;
					
					var all_done = true;
					for(var d in $this.datasources){
						if ($this.datasources[d].is_loaded === false){
							all_done = false;
						}
					}
					if (true === all_done && typeof on_done === 'function')
						on_done();
				},
				function(err){
					if (typeof on_error !== 'function'){
						App.MessageError('Unable to load datasource(s) from server.');
					} else {
						on_error(err);
					}
				});
			}
			
			//THIS IS MEANT TO CATCH THE FACT THAT THERE IS NO 
			//DATA-SOURCES AND WE NEED TO INVOKE THE CALLBACK
			all_done = true;
			for(key in this.datasources){
				if (this.datasources[key].is_loaded === false) all_done = false;
			}
			
			if (true === all_done && typeof on_done === 'function')
				on_done();
		},
		
		post: function(url, data, on_done_callback, on_error_callback){
			data.ajax_type = 'POST';
			App.ajax_call(url, data, on_done_callback, on_error_callback);
		},
		
		ajax_call: function(url, data, on_done_callback, on_error_callback){
			if (url === undefined){
				App.MessageError('URL cannot be undefined for AJAX call');
				return;
			}
			if (typeof on_done_callback !== 'function') on_done_callback = function(){};
			
			if (typeof data.ajax_type === 'undefined'){
				data.ajax_type = 'GET';
			}
			
			if (data.ajax_type === 'GET'){
				url += '?json='+ encodeURI(JSON.stringify(data)) +
						'&access_token='+ googleDrive.authToken;
			} else {
				if (url[url.length - 1] != '/') url += '/';
				data.access_token = googleDrive.authToken;
			}
				
			var result = null;
			$.ajax({
					type			: data.ajax_type,
					method			: data.ajax_type,
					dataType		: 'json',
					contentType		: 'application/json; charset=UTF-8',
					url				: url,
					// data			: encodeURI(JSON.stringify(data)),
					data			: data.ajax_type !== 'GET' ?  JSON.stringify(data) : '',
					cache			: false, // Important.
					processData		: false, // Important.
					success			: function(data){
						// try{
							// result = data;
							
							// if (result.error && typeof result.error.code !== 'undefined'){
							// 	result.error.code = parseInt(result.error.code);

							// 	if (result.error.code !== 0){
							// 		// console.log(result);
							// 		App.MessageError(result.error.message);
							// 		if (typeof on_error_callback === 'function'){
							// 			on_error_callback(result.error.message);
							// 		}
							// 	} else{
							// 		on_done_callback(result.response);
							// 	}
							// } else {
								on_done_callback(data);
							// }
						// }
						// catch(e){
						// 	if (typeof on_error_callback === 'function'){
						// 		return on_error_callback(e);
						// 	}
						// 	App.MessageError('Unexpected server result:\r\n'+e+'\r\nURL: '+url +'\r\n\r\n'+data);
						// 	// console.trace();
						// 	console.log('Unexpected server result:\r\n'+e+'\r\nURL: '+url +'\r\n');
						// 	console.log(data);
						// }
					},
					error : function(e){
						if (typeof on_error_callback === 'function'){
							return on_error_callback(e);
						}
						console.log(e);
						console.log(e.responseText);
						App.MessageError('ERROR: '+ e.responseText); 
					}
			});
		},
		
		closeModal: function(){
			if ($('div.modal').length > 0) $('div.modal').modal('hide');
		},

		Input: function(options){
			var defaults = {
					default_value	: '',
					title			: '',
					ok_title		: 'Ok',
					cancel_title	: 'Cancel',
					width			: null,
					on_done			: function(){},
					on_show			: function(){},
					
				},
				card = null,
				dlg = $('<div class=\'container-fluid\'>' +
						'<div class=\'row content-area\'/>' +
						'<div class=\'row button-area\'/>' +
					'</div>');
			
			if (typeof options !== 'object')
				options = $.extend(true, {}, defaults);
			else
				options = $.extend(true, defaults, options);
			
			
			var content = $("<input type='text' class='form-control'/>").appendTo(dlg.find('.content-area'));
			content.val(options.default_value);
			var btn_ok = $("<button type='button' class='btn btn-success btn-flat pull-right'>"+options.ok_title+'</button>');
			btn_ok.on('click', function(){
				options.on_done(content.val());
				card.close();
			});

			var btn_cancel = $("<button type='button' class='btn btn-danger btn-flat btn-outline pull-left'>"+options.cancel_title+'</button>');
			btn_cancel.on('click', function(){
				card.close();
			});
			
			dlg.find('.button-area')
				.css('padding', '10px')
				.append(btn_ok)
				.append(btn_cancel);
				
			card = open_card(dlg,{
				title: options.title,
				'min-width': '300px',
			});
			
			return card;
		},
		
		Modal: function(options){
			var defaults = {
					content		: null,
					title			: '',
					width			: '100%',
					'min-width'	: '300px',
					'max-width' : '100%',
					height		: '70vh',
					'max-height': '70vh',
					'overflow' : 'auto',
					on_done		: null,
					on_show		: null,
					buttons		: {}
				};
			
			if (typeof options !== 'object')
				options = $.extend(true, {}, defaults);
			else
				options = $.extend(true, defaults, options);
			
			var dlg = $('<div>').append(options.content);
			
			dlg.css({
				height: options.height,
				'max-height': options['max-height'],
				width: options.width,
				'max-width': options['max-width'],
				'overflow' : options.overflow,
				'display' : 'inline-block',
			});
			
			for(var b in options.buttons){
				var btn = options.buttons[b];
				var $btn = null;
				
				if (typeof btn === 'object'){
					if (typeof btn.title !== 'string') btn.title = b;
					if (typeof btn.type !== 'string') btn.type = ' btn-light ';
					$btn = $("<button type='button' class='btn "+btn.type+"'>"+btn.title+'</button>');
					
					if (typeof btn.click === 'function'){
						$btn.on('click', btn, function(evt){ evt.data.click(); });
					}
				
				} else if (typeof btn === 'function'){
					$btn = $("<button type='button' class='btn btn-light'>"+b+'</button>');
					$btn.on('click', btn);
				}
				
				dlg.append($btn);
			}
			
			return open_card(dlg, options);
		},
			
		Dialog : function(options){
			var defaults = {
					content		: null,
					title			: '',
					width			: null,
					on_done		: null,
					on_show		: null,
					buttons		: {}
				};
			
			if (typeof options !== 'object')
				options = $.extend(true, {}, defaults);
			else
				options = $.extend(true, defaults, options);
			
			var dlg = $('<div>').append(options.content);
			for(var b in options.buttons){
				var btn = options.buttons[b];
				var $btn = null;
				
				if (typeof btn === 'object'){
					if (typeof btn.title !== 'string') btn.title = b;
					if (typeof btn.type !== 'string') btn.type = ' btn-light ';
					$btn = $("<button type='button' class='btn "+btn.type+"'>"+btn.title+'</button>');
					
					if (typeof btn.click === 'function'){
						$btn.on('click', btn, function(evt){ evt.data.click(); });
					}
				
				} else if (typeof btn === 'function'){
					$btn = $("<button type='button' class='btn btn-light'>"+b+'</button>');
					$btn.on('click', btn);
				}
				
				dlg.append($btn);
			}
			
			return open_card(dlg, {
				title: options.title,
				'min-width': '300px'
			});
		},
		
		Confirm : function(msg, title, on_done, ok_button, cancel_button){
			var no_header = false;
			
			if (typeof ok_button !== 'string') ok_button = 'Yes';
			if (typeof cancel_button !== 'string') cancel_button = 'No';
			if (typeof title !== 'string'){
				title = 'Confirm';
				no_header = true;
			}
			
			var dlg = $('<div>');
			dlg.append("<p class='message'>"+msg+'</p>');
			ok_button = $("<button type='button' class='btn btn-success pull-right'><i class='la la-check'/>  "+ok_button+'</button>');
			cancel_button = $("<button type='button' class='btn btn-light btn-danger pull-left'><i class='la la-times'/>  "+cancel_button+'</button>');
			
			ok_button.on('click', dlg, function(evt){
				if (typeof on_done === 'function') on_done();
				card.close();
			});
			cancel_button.on('click', dlg, function(evt){
				card.close();
			});
			
			dlg.append(ok_button).append(cancel_button).show();
			dlg.find('.btn').css({
			   'min-width': '80px' 
			});
			var card = open_card(dlg,{
				title: title,
				no_header: no_header,
				'min-width': '300px',
				height: '15vh',
				'max-height': '20vh',
				'min-height': '20vh',
				on_done: function(){
					logger.log('confirm done');
				}
			});
			
			return card;
		},
		
		notify: function(defaults){
			var options = $.extend(
								{
									message: '',
									title: null,
									type: App.MessageTypes.INFO,
									auto_close: true,
									timeout: 5000,
								},
								defaults
							),
				$this = this;
			
			
			if (typeof options.title === 'undefined' || options.title === null){
				this.message_div.find('.title').hide();
			}
			this.message_div.removeClass('text-success text-info text-danger');
			switch(options.type){
				case this.MessageTypes.ERROR:
					this.message_div.find('.side-bar').css('background', 'red');
					this.message_div.addClass('text-danger');
					this.message_div.find('.message').css('font-weight', 'bold');
					this.message_div.css({
						border: '2px solid red'
					});
					
					break;
				case this.MessageTypes.WARNING:
					this.message_div.find('.side-bar').css('background', '#FFA500');
					this.message_div.css({
						border: '2px solid #FFA500'
					});

					break;
					
				case this.MessageTypes.INFO:
					this.message_div.find('.side-bar').css('background', '#0BAD0B');
					this.message_div.css({
						border: '2px solid #0BAD0B'
					});
					break;
			}
			this.message_div.find('.title').html(options.title);
			this.message_div.find('.message').html(options.message);
			this.message_div.show('blind');
			
			this.message_div.find('.close-btn').off('click').on('click', this.message_div, function(evt){
				evt.data.hide();
			});
			
			if (options.auto_close === true){
				setTimeout(function(){
					$this.message_div.hide('blind');
				}, options.timeout);
			}
			
			return this.message_div;
		},
		
		MessageInfo	: function(msg, title){
			return this.notify({
					message: msg, 
					title: title, 
					type: this.MessageTypes.INFO
				});
		},
		
		MessageWarning : function(msg, title){
			return this.notify({
					message: msg, 
					title: title, 
					type: this.MessageTypes.WARNING
				});
		},
		
		MessageError	: function(msg, title){
			return this.notify({
					message: msg, 
					title: title, 
					type: this.MessageTypes.ERROR,
					auto_close: false,
				});
		},

		load_module : function(module){
			if (module === undefined) {
				return;
			}
			for(var key in module.forms){
				var ctrl = module.forms[key];
				
				if (typeof ctrl.display_type !== 'undefined' && ctrl.display_type === 'widget'){
					//MAKE A COPY INTO THE WINDOW SO THAT THE IDE CAN PICK IT UP
					window[ctrl.custom_type] = $.extend(true, {}, ctrl);
				}
				
				var form = new FD.Control(null, 'form', 0, 0);
				form.fromObject(ctrl);
				form.display_type = form.display_type === 'normal' ? 'popup' : form.display_type;
				this[form.name] = form;
				form.panel = null;
				form.change_mode(true);	//PUT INTO RUN MODE
			}
		},
		
		getUrlParameter	: function(name){
			if (!name) return null;
			
			name = name.replace(/[\[]/,'\\\[').replace(/[\]]/,'\\\]');
			var regexS = '[\\?&]'+name+'=([^&#]*)';
			var regex = new RegExp( regexS );
			var results = regex.exec( window.location.href );
			if( results === null )
				return null;
			else
				return unescape(results[1]);
		},
		
		copy_message : function(source, destination){
			if (typeof destination === 'undefined') return;
			
			for(var key in source){
				destination[key] = source[key];
			}
		}
};
