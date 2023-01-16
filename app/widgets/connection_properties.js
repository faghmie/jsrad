export default class ConnectionProperties {

	constructor(line) {
		this.line = line;
	}

	GetProperties() {
		var div = $(`<div class="text-formater row">
						<a class="btn btn-warning btn-remove-line">remove</a>
                        <input type="color" class="border-color"/>
					</div>`);

		div.find('.btn-remove-line').on('click', this.#remove_connector.bind(this));

		div.find('.border-color')
			.attr('value', this.line.current_bg || this.line.style['border-color'])
			.on('input', this.line, function (evt) {
				evt.data.style['border-color'] = evt.target.value;
				evt.data.connect();
			});

		div.append(this.#get_border_width());
		div.append(this.#get_border_style());

		return div;
	}

	#remove_connector(){
		this.line.destroy();
		document.dispatchEvent(new CustomEvent(this.line.options.event_prefix + 'connector-removed', {
			detail: {
				connector: this.line,
			}
		}));
	}

	#get_border_style() {
		var border_style = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];

		var div = $(`<select class="form-control">`)
			.on('change', this.line, evt => {
				evt.data.style['border-style'] = evt.target.value;
				evt.data.connect();
			})
			.css({
				'width': '70px',
				'max-width': '70px',
			})

			for(var k = 0; k < border_style.length; k++){
			var opt = $(`<option>${border_style[k]}</option>`);

			div.append(opt);

			if (border_style[k] === this.line.style['border-style']) {
				opt.attr('selected', 'selected');
			}
		}

		return div;
	}

	#get_border_width() {
		var prop = $(`<input type="number" min=0 class="form-control">`)
			.val(parseInt(this.line.style['border-width']))
			.css({
				'min-width': '50px',
				'max-width': '50px',
			});

		prop.on('input', this.line, evt => {
			evt.data.style['border-width'] = evt.target.value + 'px';
			evt.data.connect();
		});

		return prop;
	}
}