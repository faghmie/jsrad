var mobile_toolbar = function(_designer) {
	var widget	= null,
		toolbar	= $('.jsrad-mobile-toolbar'),
		$this = this;
		
	this.attached_object		= null;
	IControl.extend(this, base_property);
	
	this.hide = function(){ toolbar.hide(); };

	this.show = function(){ toolbar.show(); };
	
	this.attach = function(obj){
		this.attached_object = obj;
		// console.log('mobile attach widget properties');
		remove_widget(obj);
		widget_settings(obj);
		
		toolbar.find('.btn-open-project').off('click').on('click', obj, function(evt){
			console.log('open new project');
			evt.data.getForm().designer.openProject();
		});
		
		toolbar.find('.btn-ui-overview').off('click').on('click', obj, function(evt){
			(new product_tour(this)).show();
		});
		
		toolbar.find('.btn-feedback').off('click').on('click', obj, function(evt){
			jsrad_feedback();
		});

		toolbar.find('.btn-jsrad-sign-in').off('click').on('click', obj, function(evt){
			googleDrive.handleAuthClick();
		});
		
		return widget;
	};
	
	function remove_widget(obj){
		toolbar.find('.btn-design-remove-widget').off('click').on('click', obj, function(evt){
			var widget = evt.data;
			if (widget.form)
				widget.getForm().designer.removeControl(widget);
		});
	}
	
	function widget_settings(obj){
		var hide_it = true;
		if ($('.custom-props').is(':visible')) hide_it = false;
		
		var widget = make_settings(obj);
		if (hide_it) widget.hide();
		
		toolbar.find('.btn-design-area-props').off('click').on('click', widget, function(evt){
			console.log('show the properties', evt.data);
			// $('.mobile-design-toolbox-panel').hide();
			evt.data.show();
			evt.data.find('input').on('keydown', function(evt){
				evt.stopPropagation();
			});
		});
	}
	
	function make_custom(obj){
		$('.custom-props').remove();
		var widget = $('<div>').addClass('custom-props list-group props-edit');
		
		var s = obj.get_settings();
		
		//FIELD MAPPER
		var btn_field_map = $('<a>')
							.addClass('btn btn-sm btn-light dm-field-mapper')
							.html('mapper');
		
		btn_field_map.on('click', obj, function(evt){
			open_card(evt.data.dm_get_field_map(),{
					title: 'Map Fields',
					height: '80vh',
				});
		});

		if (!(s instanceof Array)) s = [];
		
		if (obj !== obj.getForm())
			s.unshift(['allow inline editor','<input type=\'checkbox\' id=\'inline-editor\' />']);
		
		s.unshift(['name',"<input type='text' class='' id='name'/>"]);
		s.unshift(['when the user click go to....', base_activity.get_link_form(false, obj)]);
		
		// if (typeof obj.dm_is_data_aware === 'function'){
		// 	s.unshift(['map fields', btn_field_map]);
		// 	s.unshift(['data operation', make_data_model(obj, widget)]);
		// }
		
		s.unshift(['display name','<input type="text" id="label"/>']);
		
		if (s instanceof Array){
			for(var index = 0; index < s.length; index++){
				var attribute = null;
				
				if (!s[index]) continue;
				
				if (s[index].length === 3)
					attribute = s[index][2];
					
				$this._append_item(s[index][0], s[index][1], attribute, widget);
				
				if (s[index][0] == 'when the user click go to....'){
					var el = widget.find('.design-props-group:last-child');
					el.find('label').html('on click');
				}
			}
		}
		
		widget.find('#label').val(obj.label);
		widget.find('#name').val(obj.name);
		widget.find('#inline-editor').removeAttr('checked');
		
		if (obj.inline_editing === true)
			widget.find('#inline-editor').attr('checked', 'checked');
		
		widget.find('#inline-editor').off('click').on('click', function(){
			obj.make_inline(this.checked);
		});
		
		widget.find('#name').on('input', function(evt){
			evt.stopPropagation();
            if (!$this.attached_object) return;
            $this.attached_object.setName($(this).val());
		});
		
		widget.on('input', '#label', function(evt){
			evt.stopPropagation();
			if (!$this.attached_object) return;
			if ($this.attached_object.label === $(this).val()) return;
			
			$this.attached_object.setLabel($(this).val());
		});
		
		widget.find('.data-model-action-selector').trigger('change');
		
		return widget;
	}

	this.detach = function(){
		this.attached_object = null;
	};

	function make_settings(obj){
		var ui = $('<div class="design-toolbox-panel"><div class="d-flex align-items-stretch">'+
					'<div class="ui-props-bar p-2"/>'+
					'<div class="ui-props-content p-2 flex-grow-1"/>'+
				'</div></div>').appendTo(obj.getForm().designer.dom.workspace);
		
		var props = ui.find('.ui-props-bar');
		props.css({
			width: '40px',
			'max-width': '40px',
			'margin-right': '5px',
			'text-align': 'center',
			background: '#ECECEC',
		});
		props.append('<a class="btn-text"><i class="la la-fw la-font"></i></a>');
		props.append('<a class="btn-styler"><i class="la la-fw la-paint-brush"></i></a>');
		props.append('<a class="btn-project"><i class="la la-fw la-gear"></i></a>');
		props.find('a').css({
				display: 'block',
				'margin-bottom': '15px',
				color: '#4D4D4D',
				'text-decoration': 'none',
				'font-size': '1.5em',
				'font-weight': 'bold',
				'text-align': 'center',
			});
		
		function show_settings(ui_setting, workspace){
			$('.mobile-design-toolbox-panel').hide();
			
			open_card(ui_setting.attach((workspace !== undefined ? workspace : obj)),{
					'width': '40vw',
					'min-width': '300px',
					'min-height': '50vh',
					'max-height': '80vh',
				});
		}
		
		props.find('.btn-text').on('click', function(evt){
			show_settings(new format_property(_designer));
		});
		
		props.find('.btn-styler').on('click', function(evt){
			show_settings(new property_styler(_designer));
			
		});
		
		props.find('.btn-project').on('click', function(evt){
			show_settings(new project_property(), _designer);
		});
		
		ui.find('.ui-props-content').append(make_custom(obj));
		
		return ui;
	}
};
