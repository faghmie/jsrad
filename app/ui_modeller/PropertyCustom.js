import PropertyBase from "./PropertyBase.js";

export default class CustomProperties extends PropertyBase {
	widget				= null;
	
	attached_object		= null;

	constructor(_designer){
		super();
		this._designer = _designer;
	}

	attach(obj){
		var widget = $(`<div>`);
		
		this.attached_object = obj;
		
		widget.append(this.make_custom(obj));
		widget.append(this.make_technical(obj));
		
		widget.find('input').on('keydown', function(evt){
			evt.stopPropagation();
		});
		
		return widget;
	}
	
	make_custom(obj){
		var widget = $('<div class="text-formater nowrap">');
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
			s.unshift(['allow inline editor',`<input type="checkbox" id="inline-editor" >`]);
		
		s.unshift(['name',"<input type='text' class='' id='name'>"]);
		s.unshift(['when the user click go to....', obj.get_link_form(false)]);
		
		if (typeof obj.dm_is_data_aware === 'function'){
			s.unshift(['map fields', btn_field_map]);
			s.unshift(['data operation', make_data_model(obj, widget)]);
		}
		
		s.unshift(['display name','<input type="text" id="label">']);
		
		this._append_item('Control Type', `<span>${obj.type.replaceAll('./', '').toTitle()}</span>`, null, widget);

		if (s instanceof Array){
			for(var index = 0; index < s.length; index++){
				var attribute = null;
				
				if (!s[index]) continue;
				
				if (s[index].length === 3)
					attribute = s[index][2];
					
				this._append_item(s[index][0], s[index][1], attribute, widget);
				
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
            if (!this.attached_object) return;
            this.attached_object.setName(evt.target.value);
		}.bind(this));
		
		widget.on('input', '#label', function(evt){
			evt.stopPropagation();
			if (!this.attached_object) return;
			if (this.attached_object.label === evt.target.value) return;
			
			this.attached_object.setLabel(evt.target.value);
		}.bind(this));
		
		widget.find('.data-model-action-selector').trigger('change');
		
		return widget;
	}

	make_technical(obj){
		var widget = $('<div class="text-formater nowrap">');
		
		var s =[
				['value',`<textarea class="value"></textarea>`],
				// ["tab index","<input type='number' id='tabindex' class=''>"],
				// ["control type","<input type='text' readonly class='' id='type'>"],
				// ["id","<input type='text' readonly class='' id='uuid'>"]
			];
        
        for(var index = 0; index < s.length; index++){
            this._append_item(s[index][0], s[index][1], null, widget);
        }
        
        
		widget.find('#tabindex').val(obj.tab_index);
		widget.find('#uuid').val(obj.uuid);	
		widget.find('#type').val(obj.control_label);
		widget.find('.value').val(JSON.stringify(obj.value));
		       
		widget.find('.value').on('input', obj, function(evt){
			var obj = evt.data;
			
			if (!obj) return;
			evt.stopPropagation();
			obj.setValue(evt.target.value);
		});
        
        widget.find('#tabindex').on('input', obj, function(evt){
			var obj = evt.data;
			if (!obj) return;
			evt.stopPropagation();
			obj.setTabIndex(evt.target.value);
		});
		
		return widget;
	}
	
	make_data_model(obj, container){
		var select = $('<select>').addClass('data-model-action-selector');
		
		_.each(data_aware_base.dm_operation_types, function(item, key){
			select.append('<option value="'+key+'">'+item+'</option>');
			if (obj.data_model_action === key)
				select.find('option:last-child').attr('selected', 'selected');
		});
		
		select.on('change', obj, function(evt){
			evt.stopPropagation();
			var obj = evt.data;
			var sel = container.find('.linked-form-selector');
			var mapper = container.find('.dm-field-mapper');
			sel = sel.parents('div.form-group:first');
			mapper = mapper.parents('div.form-group:first');
			
			obj.data_model_action = $(this).val();
			
			if (!(obj.data_model_action in data_aware_base)){
				sel.show();
				mapper.hide();
			} else {
				mapper.show();
				sel.hide();
				obj.linked_form = null;
			}
		});
		
		return select;
	}
	
	detach(){
		this.attached_object = null;
	}
}
