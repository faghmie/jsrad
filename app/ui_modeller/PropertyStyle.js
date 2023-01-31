export default class StyleProperties {

	attach = function(obj){
		let props = $(`<div class="text-formater">`);

		let widget = $(`<div class="row">`);
		let div = null;

		props.append(`<div class="title-line">border</div>`);
		props.append(widget);
		widget.append(this.get_border_style(obj));
		widget.append(this.get_border_width(obj));
		widget.append(this.get_border_color(obj));
		
		props.append(`<div class="title-line"></div>`);
		div = $(`<div class="control-with-label"><label>background</label></div>`).append(this.get_background_color(obj));
		props.append(div);
		
		div = $(`<div class="control-with-label"><label>opacity</label></div>`).append(this.get_opacity(obj));
		props.append(div);

		div = $(`<div class="control-with-label"><label>rotation</label></div>`).append(this.get_rotation(obj));
		props.append(div);

		obj.setControlStyle();
		
		return props;
	};

	_init_fields(obj, widget){
		widget.find('#hover').off('click').on('click', function(){
			obj.setHover(this.checked);
		});
		
		widget.find('#required').off('click').on('click', function(){
			obj.setRequired(this.checked);
		});
		
		widget.find('#disabled').off('click').on('click', function(){
			obj.setDisabled(this.checked);
		});

		widget.find('#make_a_card').removeAttr('checked');
		if (obj.is_a_card === true)
			widget.find('#make_a_card').attr('checked', 'checked');

		widget.find('#hover').removeAttr('checked');
		if (obj.hover === true)
			widget.find('#hover').attr('checked', 'checked');
		
		if (widget.find('#required').length !== 0)
			widget.find('#required')[0].checked = obj.required;
		
		if (widget.find('#disabled').length !== 0)
			widget.find('#disabled')[0].checked = obj.disabled;
	}
	
	get_opacity(obj){
		let num = 100;
		if (!isNaN(parseFloat(obj.opacity))){
			num = parseFloat(obj.opacity)*100;
		}
		
		let opacity = $(`<input  class="form-control" type="number" min="0" max="100" value=100 >`)
			.val(num)
			.on('input', function(evt){
				obj.opacity = parseFloat(evt.target.value)/100;
				obj.format();
			});
		
		return opacity;
	}
	
	get_rotation(obj){
		let rotation = $(`<input class="form-control" type="number" min="0" max="360" value=0 >`)
			.val(obj.rotation)
			.on("input", function(evt){
				obj.rotation = parseFloat(evt.target.value);
				obj.format();
			});
		
		return rotation;
	}
	
	get_background_color(obj){
		
		let fc = $(`<input type="color">`)
					.attr("value", obj.style['background-color'])
					.on("input", obj, function(evt){
						evt.data.style['background-color'] = evt.target.value;
						evt.data.format();
					});
		
		return fc;
	}
	
	get_border_color(obj){
		let prop = $(`<input type="color">`)
					.attr("value", obj.style['border-color'])
					.on("input", obj, function(evt){
						evt.data.style['border-color'] = this.value;
						evt.data.format();
					});
		
		return prop;
	}
	
	get_border_style(obj){
		let border_style = ['', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];
		let prop = $('<select class="form-control form-select">')
			.css({
				width: '80px',
				'max-width': '80px'
			});

		border_style.forEach(item =>{
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['border-style'] && item !== ''){
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function(evt){
			evt.data.style['border-style'] = this.value;
			evt.data.format();
		});

		return prop;
	}
	
	get_border_width(obj){
		let prop = $(`<input type="number" class="form-control" min=0>`)
			.val(parseInt(obj.style['border-width']))
			.css({
				width: '50px',
				'max-width': '50px'
			})
			.on('input', obj, function(evt) {
				evt.data.style['border-width'] = this.value + 'px';
				evt.data.format();
			});

		return prop;
	}
}
