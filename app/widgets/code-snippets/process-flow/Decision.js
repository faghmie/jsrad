import BaseActivity from "../BaseActivity.js"

export default class Decision extends BaseActivity {
	get_settings() {
		let settings = super.get_settings();
		let $this = this;

		//ALTERNATE STEP STEP
		let alt_step = this.create_next_step_selector();

		alt_step.find('option').each(function (key, item) {
			let opt = $(item);
			opt.removeAttr('selected');
			if (item.value == this.alternate_next) {
				opt.attr('selected', 'selected');
			}
		}.bind(this));


		alt_step.off('change').on('change', function (evt) {
			this.remove_connection();

			if (this.next_steps.indexOf(this.alternate_next) !== -1) {
				let idx = this.next_steps.indexOf(this.alternate_next);
				this.next_steps.splice(idx, 1);
			}

			this.next_steps.push(evt.target.value);

			this.alternate_next = evt.target.value;

			this.create_connection();
		}.bind(this));

		//ALTERNATE STEP STEP
		let comparison = $(`<select class="form-control">`)
			.append('<option>is blank</option>')
			.append('<option>less than zero</option>')
			.append('<option>greater than zero</option>')
			.append('<option>equals</option>')
			.append('<option>greater than</option>')
			.append('<option>less than</option>')
			.append('<option>not the same</option>')
			.append('<option>contains</option>')
			.append('<option>starts with</option>')
			.append('<option>ends with</option>');

		comparison.find('option:first-child').attr('selected', 'selected');

		comparison.on('change', function (evt) {
			this.comparison = evt.target.value;
		}.bind(this));

		comparison.find('option').each(function () {
			let opt = $(this);
			opt.removeAttr('selected');
			if (opt.val() == $this.comparison)
				opt.attr('selected', 'selected');
		});

		comparison.trigger('change');

		return [...settings,
		['condition for next step', comparison],
		...this.create_attribute('first-value'),
		...this.create_attribute('second-value'),
		['alternate next', alt_step],
		];
	}

	execute() {
		let first_value = this.get_attribute('first-value');
		let second_value = this.get_attribute('second-value');
		let next_step = null;

		// console.log(`FIRST [${first_value}]; 2ND [${second_value}]`)
		if (!first_value) first_value = '';
		if (!second_value) second_value = '';
		if (typeof first_value === 'string') {
			first_value = first_value.trim();
		}

		if (typeof second_value === 'string') {
			second_value = second_value.trim();
		}

		// console.log('first-value ? ' + first_value);
		//console.log('comparison ? '+ this.comparison);
		//console.log('before choosing action...');
		//console.log(Object.assign({}, this.value));

		switch (this.comparison) {
			case 'is blank':
				first_value = first_value.toString().trim();

				if (first_value.length !== 0) {
					next_step = this.alternate_next;
				}

				break;
			case 'less than zero':
				if (isNaN(parseFloat(first_value))) {
					next_step = this.alternate_next;
				} else {
					if (parseFloat(first_value) >= 0) {
						next_step = this.alternate_next;
					}
				}
				break;
			case 'greater than zero':
				if (isNaN(parseFloat(first_value))) {
					next_step = this.alternate_next;
				} else {
					if (parseFloat(first_value) <= 0) {
						next_step = this.alternate_next;
					}
				}
				break;
			case 'equals':
				if (first_value != second_value) {
					next_step = this.alternate_next;
				}

				break;
			case 'greater than':
				if (isNaN(parseFloat(first_value))) {
					next_step = this.alternate_next;
				}
				if (isNaN(parseFloat(second_value))) {
					next_step = this.alternate_next;
				} else {
					if (parseFloat(first_value) <= parseFloat(second_value)) {
						next_step = this.alternate_next;
					}
				}
				break;
			case 'less than':
				if (isNaN(parseFloat(first_value))) {
					next_step = this.alternate_next;
				}
				if (isNaN(parseFloat(second_value))) {
					next_step = this.alternate_next;
				} else {
					if (parseFloat(first_value) >= parseFloat(second_value)) {
						next_step = this.alternate_next;
					}
				}
				break;
			case 'not the same':
				if (first_value == second_value) {
					next_step = this.alternate_next;
				}
				break;
			case 'contains':
				if (first_value.toString().indexOf(second_value.toString()) === -1) {
					next_step = this.alternate_next;
				}
				break;
			case 'starts with':
				if (!first_value.toString().startWith(second_value.toString())) {
					next_step = this.alternate_next;
				}

				break;
			case 'end with':
				if (!first_value.toString().endsWith(second_value.toString())) {
					next_step = this.alternate_next;
				}

				break;
		}
		//console.log('before decision...');
		//console.log(Object.assign({}, this.value));
		//console.log('next step ? ' + next_step);
		if (next_step === null)
			this.next();
		else
			this.next(this.alternate_next);
	}

	setControlStyle(css) {
		this.draw();
	}

	resize(width, height) {
		super.resize(width, height);
		this.draw();
	}

	format() {
		super.format();

		this.dom.container.css({
			overflow: 'visible',
		});

		this.ctrl.removeClass('activity');

		this.ctrl.css({
			'text-align': 'center',
			'vertical-align': 'middle',
			position: 'relative',
			'background-color': '#FFFFFF',
			'border-width': 0,
			overflow: 'visible',
		});

		this.draw();
	}

	draw() {
		this.ctrl.children().remove();

		this.dom.container.find('.my-caption').remove();

		let size = Math.min(this.width, this.height);
		this.height_fixed = false;

		let diamond = $('<div>').addClass('diamond').appendTo(this.ctrl);
		diamond.css({
			background: this.style['background-color'],
			width: size * 0.75,
			height: size * 0.75,
			opacity: parseFloat(this.style['opacity']),
			'border-style': this.style['border-style'],
			'border-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			'-ms-transform': 'rotateZ(-45deg)',
			'-webkit-transform': 'rotateZ(-45deg)',
			'-moz-transform': 'rotateZ(-45deg)',
			'transform': 'rotateZ(-45deg)',
			'-webkit-transform-origin': 'center',
			position: 'absolute',
			left: size * 0.125,
			top: size * 0.125,
		});

		let marker = $('<div>').addClass('my-caption').appendTo(this.ctrl);
		let deg = -1 * this.rotation;
		marker
			.text('X')
			.css({
				'z-index': '5',
				position: 'absolute',
				'vertical-align': 'middle',
				top: size / 2 - (size * 0.35),
				left: 0,
				display: 'table-cell',
				overflow: 'hidden',
				height: size,
				width: size,
				background: 'transparent',
				color: '#FFFFFF',
				'font-size': size * 0.4,
				'font-weight': 'bold',
				'text-align': 'center',
				'-ms-transform': 'rotate(' + deg + 'deg)',
				'-webkit-transform': 'rotate(' + deg + 'deg)',
				'-moz-transform': 'rotate(' + deg + 'deg)',
				'-o-transform': 'rotate(' + deg + 'deg)',
				'transform': 'rotate(' + deg + 'deg)'
			});
	}
}
