export default class FormatProperties {

	attach(obj) {
		let widget = $(`<div class="text-formater"></div>`);
		let font_list = [
			this.get_font_family(obj),
			this.get_font_size(obj),
			this.get_font_color(obj),
			this.get_font_style(obj),
			this.get_font_alignment(obj),
			this.get_vertical_align(obj),
			this.get_font_decoration(obj),
		];

		
		// widget.append(`<div class="title-line">font</div>`);
		
		let body = $(`<div class="row">`).appendTo(widget);
		font_list.forEach(item => body.append(item));

		obj.setControlStyle();
		return widget;
	};

	get_font_alignment(obj) {
		let div = $(`<div class="btn-group-toggle" data-toggle="buttons">
						<label class="text-align btn" css-value="left">
							<input type="radio" class="btn-check">
							<i class="la la-align-left" ></i>
						</label>
						<label class="text-align btn" css-value="center">
							<input type="radio" class="btn-check">
							<i class="la la-align-center" ></i>
						</label>
						<label class="text-align btn" css-value="right">
							<input type="radio" class="btn-check">
							<i class="la la-align-right" ></i>
						</label>
					</div>`);

		div.find('.text-align').each(function () {
			if (this.getAttribute('css-value') == obj.style['text-align']) {
				this.classList.add('active');
				this.getElementsByTagName('input')[0].setAttribute('checked', 'checked');
			}
		});

		div.find('.text-align').on('click', function () {
			let selected = this;
			Array.from(div[0].getElementsByTagName('label')).forEach(item => {
				item.classList.remove('active');
				if (selected == item) {
					obj.style['text-align'] = item.getAttribute('css-value');
				}
			});

			selected.classList.add('active');

			obj.format();
		});

		return div;
	}

	get_font_decoration(obj) {
		let font_decoration = ['none', 'underline', 'line-through', 'overline'];
		let prop = $('<select class="form-control form-select"></select>')
			.css({
				width: '80px',
				'max-width': '80px'
			});

		font_decoration.forEach(item => {
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['text-decoration'] && item !== '') {
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function (evt) {
			evt.data.style['text-decoration'] = this.value;
			evt.data.format();
		});

		return prop;
	}

	get_vertical_align(obj) {
		let list = ['top', 'middle', 'bottom'];
		let prop = $('<select class="form-control form-select"></select>')
			.css({
				width: '80px',
				'max-width': '80px'
			});

		list.forEach(item => {
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['vertical-align'] && item !== '') {
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function (evt) {
			evt.data.style['vertical-align'] = this.value;
			evt.data.format();
		});

		return prop;
	}

	get_font_style(obj) {
		let div = $(`
			<div class="btn-group-toggle" role="group">
				<label class="la la-bold font-weight btn" css-type="font-weight" css-value="bold"></label>
				<label class="la la-italic font-style btn" css-type="font-style" css-value="italic"></label>
			</div>`);

		if (obj.style['font-weight'] == 'bold') {
			div.find('.font-weight').addClass('active');
		}

		if (obj.style['font-style'] == 'italic') {
			div.find('.font-style').addClass('active');
		}

		div.find('label').off('click').on('click', function (evt) {
			evt.target.classList.toggle('active');

			if (evt.target.classList.contains('active') === false){
				obj.style[this.getAttribute('css-type')] = '';
			}
			else{
				obj.style[this.getAttribute('css-type')] = this.getAttribute('css-value');
			}

			obj.format();
		});

		return div;
	}

	get_font_family(obj) {
		let font_family = ['Arial', 'Helvetica', 'Times New Roman',
			'Times', 'Courier New', 'Courier', 'Verdana',
			'Georgia', 'Palatino', 'Garamond', 'Bookman',
			'Trebuchet MS', 'Arial Black', 'Impact',
			'Gadget', 'Comic Sans MS', 'sans-serif', 'serif',
			'monospace', 'inherit'];

		let prop = $('<select class="form-control form-select"></select>')
			.css({
				width: '120px',
				'max-width': '120px'
			});

		font_family.forEach(item => {
			let opt = $(`<option>${item}</option>`)
				.appendTo(prop);

			if (item === obj.style['font-family'] && item !== '') {
				opt.attr('selected', 'selected');
			}
		});

		prop.on('change', obj, function (evt) {
			evt.data.style['font-family'] = this.value;
			evt.data.format();
		});

		return prop;
	}

	get_font_size(obj) {
		let prop = $(`<input type="number" class="form-control" min=0>`)
			.val(parseInt(obj.style['font-size']))
			.css({
				width: '50px',
				'max-width': '50px'
			})
			.on('input', obj, function (evt) {
				evt.data.style['font-size'] = this.value + 'px';
				evt.data.format();
			});

		return prop;
	}

	get_font_color(obj) {
		let fc = $('<input type="color">')
			.attr("value", obj.style.color)
			.on("input", function (event) {
				obj.style.color = event.target.value;
				obj.format();
			});

		return fc;
	}
}
