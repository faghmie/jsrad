export default class FormatProperties {
	
	attach(obj){
		var widget = $('<div class="text-formater row">');
		var font_list = [
					this.get_font_family(obj),
					this.get_font_size(obj),
					this.get_font_color(obj),
					this.get_font_style(obj),
					this.get_font_alignment(obj),
					this.get_vertical_align(obj),
					this.get_font_decoration(obj),
				];

		widget.append(`<div class="title-line">font</div>`);
		for(var i = 0; i < font_list.length; i++){
			widget.append(font_list[i]);
		}
		
		obj.setControlStyle();
		return widget;
	};

	get_font_alignment(obj){
		var div = $(`<div class="btn-group-toggle" data-toggle="buttons">
						<label class="text-align left btn">
							<input type="radio" data-css-type="text-align" data-css-value="left">
							<i class="la la-align-left" />
						</label>
						<label class="text-align center btn">
							<input type="radio" name="fmt-font-align" data-css-type="text-align" data-css-value="center">
							<i class="la la-align-center" />
						</label>
						<label class="text-align right btn">
							<input type="radio" name="fmt-font-align" data-css-type="text-align" data-css-value="right">
							<i class="la la-align-right" />
						</label>
					</div>`);
		
		div.find('.text-align').removeClass('active');
		div.find('input').removeAttr('checked');
		
		div.find('.text-align').each(function(){
			if ($(this).hasClass(obj.style['text-align']) === true){
				$(this).addClass('active');
				$(this).find('input').attr('checked', 'checked');
			}
		});
		
		div.find('.text-align').on('click', function(){
			$(this).addClass('active').siblings().removeClass('active');
			div.find('.text-align').each(function(item){
				item = $(this);
				
				item = item.find('input');
				if ($(this).hasClass('active') === false) return;
				obj.style[item.data('css-type')] = item.data('css-value');
			});
			
			obj.format();
		});
		
		return div;
	}
	
	get_font_decoration(obj){
		var font_decoration = ['none', 'underline', 'line-through','overline']; 
		var prop = $('<select class="form-control">')
		.css({
			width: '80px',
			'max-width': '80px'
		});

		font_decoration.forEach(item =>{
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['text-decoration'] && item !== ''){
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function(evt){
			evt.data.style['text-decoration'] = this.value;
			evt.data.format();
		});

		return prop;
	}
	
	get_vertical_align(obj){
		var list = ['top', 'middle', 'bottom']; 
		var prop = $('<select class="form-control">')
		.css({
			width: '80px',
			'max-width': '80px'
		});

		list.forEach(item =>{
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['vertical-align'] && item !== ''){
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function(evt){
			evt.data.style['vertical-align'] = this.value;
			evt.data.format();
		});

		return prop;
	}
	
	get_font_style(obj){
		var div = $('<div class="btn-group-toggle" data-toggle="buttons">' +
						'<label class="text-style font-weight btn" data-css-type="font-weight" data-css-value="bold">'+
							'<input type="checkbox">'+
							'<span class="la la-bold"></span>'+
						'</label>' +
						'<label class="text-style font-style btn" data-css-type="font-style" data-css-value="italic">'+
							'<input type="checkbox">'+
							'<span class="la la-italic"><span>'+
						'</label>' +
						'<label class="text-style font-style btn" data-css-type="text-decoration" data-css-value="underline">'+
							'<input type="checkbox">'+
							'<span class="la la-underline"><span>'+
						'</label>' +
					'</div>');
		
		div.find('input').removeAttr('checked');
		div.find('a').removeClass('is-active');
		
		if (obj.style['font-weight'] == 'bold'){
			div.find('.font-weight').addClass('is-active active');
			div.find('.font-weight input').attr('checked', 'checked');
		}
		
		if (obj.style['font-style'] == 'italic'){
			div.find('.font-style').addClass('is-active  active');
			div.find('.font-style input').attr('checked', 'checked');
		}
		
		div.on('click', '.text-style', function(){
			$(this).toggleClass('is-active');
			div.find('.text-style').each(function(item){
				item = $(this);
				
				if ($(this).hasClass('is-active') === false)
					obj.style[item.data('css-type')] = '';
				else
					obj.style[item.data('css-type')] = item.data('css-value');
			});
			obj.format();
		});
		
		return div;
	}
	
	get_font_family(obj){
		var font_family = ['Arial', 'Helvetica', 'Times New Roman', 
						'Times', 'Courier New', 'Courier', 'Verdana', 
						'Georgia', 'Palatino', 'Garamond', 'Bookman', 
						'Trebuchet MS', 'Arial Black', 'Impact', 
						'Gadget', 'Comic Sans MS', 'sans-serif', 'serif',
						'monospace', 'inherit'];
		
		var prop = $('<select class="form-control">')
			.css({
				width: '120px',
				'max-width': '120px'
			});

		font_family.forEach(item =>{
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['font-family'] && item !== ''){
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function(evt){
			evt.data.style['font-family'] = this.value;
			evt.data.format();
		});

		return prop;
	}
	
	get_font_size(obj){
		var prop = $(`<input type="number" class="form-control" min=0>`)
			.val(parseInt(obj.style['font-size']))
			.css({
				width: '50px',
				'max-width': '50px'
			})
			.on('input', obj, function(evt) {
				evt.data.style['font-size'] = this.value + 'px';
				evt.data.format();
			});

		return prop;
	}
	
	get_font_color(obj){
		var div_fc = $('<div>');
		
		var fc = $('<input type="color">')
					.appendTo(div_fc)
					.attr("value", obj.style.color)
					.on("input", function(event){
						obj.style.color = event.target.value;
						obj.format();
					});
		
		return div_fc;
	}
	
	

};
