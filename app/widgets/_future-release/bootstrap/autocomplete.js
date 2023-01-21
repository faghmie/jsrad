const { default: IconSelector } = require("../IconSelector");

var control_auto_complete = {
	type				: 'auto_complete',
	control_label		: 'Auto-complete',
	control_category	: 'Forms',
	control_thumbnail	: 'images/widgets/textbox.png',
	style_to_exclude	: ['border-width', 'border-color'],
	properties	: {
			height		: 30,
			width			: 300,
			height_fixed	: true,
			value			: {
                    data: 'Apple,Orange,Banana,Kiwi,Lemon,Naartjie,Plum,Nectarine',
                    icon_position	: 'right',
					icon			: 'la la-question',
                    placeholder: 'type to search'
                }
		},
	
	get_settings : function(){
			if (typeof this.value !== 'object') this.value = {};
			
			var $this = this;
			
			//SIZE
			var input_size = $('<select  class=\'form-control\'>')
					.append('<option></option>')
					.append('<option>input-lg</option>')
					.append('<option>input-sm</option>');
			
			input_size.on('change', function(){
				$this.value.input_size = $(this).val();
				$this._format();
			});
			
			if (this.value.input_size === 'input-lg')
				input_size.find('option').eq(1).attr('selected', 'selected');
			else if (this.value.input_size === 'input-sm')
				input_size.find('option').eq(2).attr('selected', 'selected');
			else
				input_size.find('option').eq(0).attr('selected', 'selected');
			
			//PLACEHOLDER
			var placeholder = $('<input type=\'text\' class=\'form-control\'/>').val(this.value.placeholder);
			
			placeholder.on('keyup', function(evt){
                evt.stopPropagation();
				$this.value.placeholder = $(this).val();
				$this._format();
			});
			
			//ADD-ON TEXT
			var add_on_text = $("<input type='text' class='form-control'/>").val(this.value.text);
			
			add_on_text.on('keyup', function(evt){
                evt.stopPropagation();
				$this.value.text = $(this).val();
				$this._format();
			});
			
			//ICON POSITION
			var icon_position = $("<select  class='form-control'>")
					.append('<option>left</option>')
					.append('<option>right</option>');
			
			icon_position.on('change', function(){
				$this.value.icon_position = $(this).val();
				$this._format();
			});
			
			if (this.value.icon_position === 'left')
				icon_position.find('option').eq(0).attr('selected', 'selected');
			else
				icon_position.find('option').eq(1).attr('selected', 'selected');

			//ICONS
			var icon_select = $("<a class='btn btn-sm btn-light'>").html("<i class='la la-fw "+ this.value.icon +"'>");
			
            if (false === this.value.use_icon)
                icon_select.html('No Icon');

            icon_select.on('click', function(){
                var icons = new IconSelector({
                    on_selected: function(icon_class, use_icon){
                        $this.value.icon = icon_class;
                        $this.value.use_icon = use_icon;
                        $this._format();
                        if (true === use_icon){
                            icon_select.remove('i');
                            icon_select.html("<i class='la la-fw "+ icon_class +"'>");
                        } else {
                            icon_select.html('No Icon');
                        }
                    }
                }).open();
            });
			
			//COLOR SELECTION
			var color_select = $("<select class='form-control'>");
			
			$(this.color_list).each(function(key,value){
				var selected = '';
				
				var cls = value;
				var opt = $("<option value='"+cls+"'>")
							.append("<span><i class='"+cls+"'/> "+cls.replace(/btn-/g, '')+'</span>')
							.appendTo(color_select);
				
				if (cls === $this.value.theme){
					opt.attr('selected', 'selected');
				}
			});
			
			color_select.on('change', function(){
				$this.value.theme = $(this).val();
				$this._format();
			});

			return [
				['size', input_size],
				['place-holder', placeholder],
				['add-on text', add_on_text],
				['icon', icon_select],
				['icon position', icon_position],
				['theme', color_select]
			];
		},
	
	_format : function(){
			if (typeof this.value !== 'object') this.value = {};
			if (typeof this.value.text !== 'string') this.value.text = '';
			if (typeof this.value.icon_position !== 'string') this.value.icon_position = 'left';
			if (typeof this.value.icon !== 'string') this.value.icon = '';
			if (typeof this.value.placeholder !== 'string') this.value.placeholder = this.label;
			if (typeof this.value.input_size !== 'string') this.value.input_size = '';
			
			
			this.ctrl.removeClass('input-group');
			this.ctrl.find('span').remove();
			this.ctrl.find('input').attr('placeholder', this.value.placeholder);
			this.ctrl.find('input').removeClass('input-lg input-sm');
			this.ctrl.find('input').addClass(this.value.input_size);
						
			this.ctrl.find('input').attr('placeholder', this.value.placeholder);
			
			var icon = null;
			this.value.use_icon = this.value.icon.length !== 0;
			if (this.value.use_icon === true){
				icon = $("<span class='input-group-addon'><i class='la-fw "+this.value.icon+"'></i></span>");
				
			} else if (this.value.text !== ''){
				icon = $("<span class='input-group-addon'>").text(this.value.text);
			}
			
			if (icon !== null){
				if (this.value.icon_position === 'left')
					this.ctrl.find('input').before(icon);
				else
					this.ctrl.find('input').after(icon);
				
				this.ctrl.addClass('input-group');
				
			}
		},
		
	_refresh	: function(datasource){
			this.setValue();
		},
	
	setValue : function(value){
		this.value.data = (typeof value !== 'undefined' && value !== null) ? value : this.value.data;
		var $this = this;
		this.get_datasource(null, null, function(data_){
			if (data_){
				$this.value.data = data_[1];
			}

			var tags = [];
			if (typeof $this.value.data === 'string')
				tags = $this.value.data.split(/\n|\r|,/);
			else if ($this.value.data instanceof Array) {
				tags = $this.value.data;
				tags[0] = '';
			}
			
			var text = $this.ctrl.find('input');
			
            if (text.data('typeahead')){
				text.data('typeahead').source = tags;
            } else {
                text.typeahead({source: tags});
                if (!text.hasClass('typeahead')) text.addClass('typeahead');
            }

			$this._format();	
		});
		
		},
	
    val: function(value){
		if (!value) return this.ctrl.find('input').val();
		this.ctrl.find('input').val(value);
	},
    
	getControl : function(owner){
		this.ctrl = $('<div class=\'input-group\'>'+
						'<span class=\'input-group-addon\'>'+
							'<i class=\'la la-pencil\'/>'+
						'</span>'+
						'<input type=\'text\' autocomplete=\'off\' class=\'main-control form-control\'/>'+
					'</div>');
					
		//this.ctrl = $("<input type='text' autocomplete='off' class='form-control' />");
		return this.ctrl;
	}
};
