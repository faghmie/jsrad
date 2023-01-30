var control_comment_box = {
	type				: 'comment_box',
	control_label		: 'Comment Box',
	control_category	: 'Containers',
	control_thumbnail	: 'images/widgets/div.png',
	properties	: {
			height		: 200,
			width		: 300,
		},
	ignore_properties: [
			'display name',
			'required',
			'make it a card',
			'name',
			'value',
			'tab index',
			'id',
			'allow inline editor',
		],
	
	open_mapper: function(){
		//ON THIS CHANGE WE LOAD THE TABLES
		var col = null,
			key = 0,
			fields = [],
			tbl = this.datasource.entity,
			mapper = $('<div>');
		
		var ds = App.datasources[this.datasource.name];
		if (!ds) return;
		
		for(col in ds.entities[tbl].fields){
			fields.push(ds.entities[tbl].fields[col]);
		}
		
		fields = fields.sort(function(a, b){
			return a.index - b.index;
		});
		
		var field = this.create_attribute('message', fields);
			field.find('select').before('<label>message</label>');
			mapper.append(field);
		
		field = this.create_attribute('username', fields);
		field.find('select').before('<label>person</label>');
		mapper.append(field);
		
		field = this.create_attribute('timestamp', fields);
		field.find('select').before('<label>timestamp</label>');
		mapper.append(field);
			
		open_card(mapper,{
			title: 'Leave blank the fields you don\'t want to map',
		});
	},
	
	create_attribute : function(attribute, fields){
		var div = $('<div>').addClass('form-group');
		var $this = this;
		
		if (typeof this.field_mapping !== 'object') this.field_mapping = {};
		
		var select = $('<select>')
						.addClass('form-control attribute-type')
						.append('<option>')
						.appendTo(div);
		select.on('change', {ctrl: this, attr: attribute}, function(evt){
			evt.stopPropagation();
			var field = $(this).find('option:selected').val();
			evt.data.ctrl.field_mapping[evt.data.attr] = field;
			if (field.length !== 0){
				if (evt.data.ctrl.datasource.value.indexOf(field) === -1)
					evt.data.ctrl.datasource.value.push(field);
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
	
	append_comment_line: function(msg){
		
		var comment =$("<a class='-media list-group-item'>").appendTo(this.ctrl);
		comment.append("<p class='pull-right comment-date small'>");
		comment.append("<div class='media-body'>" +
						"<h4 class='media-heading comment-user'></h4>" +
						"<div class='comment-content'></div>" +
					   '</div>');
		
		comment.find('.comment-date')
						//.append(msg.timestamp.getDate()+'-'+(msg.timestamp.getMonth()+1)+'-'+ (msg.timestamp.getFullYear()))
						.css({
							'font-size': '0.6em',
							'font-weight': 'bold',
							'color': '#4D4D4D',
						});
		if (typeof msg.timestamp === 'string'){
			msg.timestamp = new Date(msg.timestamp);
			if (msg.timestamp){
				comment.find('.comment-date')
						.append(msg.timestamp.getDate()+'-'+(msg.timestamp.getMonth()+1)+'-'+ (msg.timestamp.getFullYear()));
			}
		}
		
		comment.find('.comment-user')
					.append(msg.username)
					.css({
						'font-size': '0.7em',
						'font-weight': 'bold',
						'color': '#4D4D4D',
					});
		
		if (typeof msg.message === 'string')
			comment.find('.comment-content').append(msg.message.replace(/(\r)|(\n)|(\r\n)/g,'<br>'));

		return this;
		
		//var li = $('<li>').addClass('list-group-item').appendTo(this.ctrl);
		//var img_div = $('<div>').addClass('comment-image').append('<img>').appendTo(li);
		//var text = $('<div>').addClass('comment-text').append('<p>').appendTo(li);
		//var sub_text = $('<span>').addClass('date sub-text pull-right').appendTo(text);
		
        //img_div.find('img').attr('src', comment.image_url).addClass('img-circle');
        //text.find('p')
			//.html(comment.text);
        //text.find('.sub-text').html(comment.sub_text);
        
        //return this;
	},

	get_settings: function(){
		var $this = this;
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
	
	setValue: function(value){
		this.ctrl.children().remove();
		
		if (false === this.in_run_mode){
			this
				.append_comment_line({
					image_url: 'images/profile.jpg',
					username: 'test...',
					message: 'said something',
					timestamp: '23 August 2017 13:45',
				})
				.append_comment_line({
					image_url: 'images/profile.jpg',
					username: 'test2',
					message: 'now talk some more',
					timestamp: '23 August 2017 14:45',
				})
				.append_comment_line({
					image_url: 'images/profile.jpg',
					username: 'test3',
					message: 'I have so much more to say...',
					timestamp: '23 August 2017 15:45',
				});
		}
		
		this.value = typeof value !== 'undefined' ? value : this.value;
		var $this = this;
		
		this.get_datasource(function(data_){
			if (!data_) return;
			$this.value = data_;
			
			if (!($this.value instanceof Array)) return;
			
			var item = {username:null, message: null, timestamp: null};
			var map = $this.field_mapping;

			var col = null,
				key = 0,
				fields = [],
				tbl = $this.datasource.entity,
				mapper = $('<div>');
			
			var ds = App.datasources[$this.datasource.name];
			if (!ds) return;
			
			fields = ds.entities[tbl].fields;
			var titles = {};
			var hdr = $this.value[0];
			
			for(var m in map){
				if (map[m] in fields){
					titles[m] = hdr.indexOf(fields[map[m]].title);
				}
			}
			for(key = 1; key < $this.value.length; key++){
				var row = $this.value[key];
				if (!(row instanceof Array)) row = [row];
				
				for(m in map){
					if (titles[m] !== -1)
						item[m] = row[titles[m]];
					else
						item[m] = '';
				}
				$this.append_comment_line(item);
			}
			
		});
	},
	
	_format: function(){
		
		this.ctrl.show();
	},
	
	getControl	: function(owner){
		this.ctrl = $('<ul>').addClass('comment-list list-group');

		return this.ctrl;
	}
};
