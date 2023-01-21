import ControlInterface from '../_base/ControlInterface.js';

export default class BaseActivity extends ControlInterface {
	style = {
		'font-size': '12px',
		'background-color':'#A6AAC9',
		'text-align': 'center',
		'border-style': 'solid',
		'border-color': '#64558B',
		'color': '#FFFFFF',
		'font-weight': 'bold',
		'border-width': '2px',
		'vertical-align': 'middle'
	};

	ignore_properties = [
		'when the user click go to....',
		'name',
		'value',
		'tab index',
		'allow inline editor',
	];

	is_an_activity = true;

	properties = {
		height: 60,
		width: 120,
	};

	/**
	 * initialize to one element - 
	 * this is meant to represent the default next step
	 * when not set it cannot move to a next step
	 * but when set, it will simply move the process along
	 * It is important to set this to prevent other activities
	 * from overriding the "default" next step with their alternative next-step
	 * @memberof BaseActivity
	 */
	next_steps = [null];
	message_map = {};
	message = {};

	getControl() {
		this.ctrl = $(`<div>`);

		return this.ctrl;
	}

	//Every activity should be overriding this function
	execute(previous_step) {
		this.next();
	}

	setValue() {
		//DOING THIS TO PREVENT VALUE FROM BEING OVERWRITTEN.
	}

	get_settings() {
		let settings = [];

		settings.push(['next', this.create_next_step_selector()]);

		return settings;
	}

	create_next_step_selector() {
		let form = this.getForm();
		let next = $(`<select class="form-control input-sm">`)
			.append('<option>');

		for (let ctrl in form.controls) {
			let p = form.controls[ctrl];
			if (ctrl == this.uuid) {
				continue;
			}

			if (typeof p.execute !== 'function' || p.__start__ === true) {
				continue;
			}

			next.append(`<option value="${ctrl}">${p.label}</option>`);
			if (this.next_steps[0] === ctrl) {
				next.find('option:last-child').attr('selected', 'selected');
			}
		}

		next.on('change', function (evt) {
			this.remove_connection();
			if (this.next_steps.length === 0) {
				this.next_steps = [evt.target.value];
			} else {
				this.next_steps[0] = evt.target.value;
			}
			this.create_connection();
		}.bind(this),
		);

		return next;
	}

	refresh_connection() {
		if (typeof this.value !== 'object' || this.value === null) this.value = {};

		this.next_steps.forEach(
			function (step) {
				this.create_connection(step);
			}.bind(this),
		);
	}

	remove_connection() {
		document.dispatchEvent(new CustomEvent('ui-disconnect-control', {
			detail: this,
		}));

		return this;
	}

	create_connection() {
		let form = this.getForm();
		this.next_steps.forEach(next_step => {
			let next_control = form.controls[next_step];

			if (!next_control) {
				return;
			}

			document.dispatchEvent(
				new CustomEvent('ui-control-add-connector', {
					detail: {
						form: this.getForm(),
						from: this,
						to: next_control,
					},
				}),
			);
		});
	}

	create_attribute(attribute, hide_selector) {
		let form = this.getForm(),
			key = null;

		if (typeof this.message_map !== 'object') {
			this.message_map = { '@types': {} };
		}

		if (typeof this.message_map['@types'] !== 'object') {
			this.message_map['@types'] = {};
		}

		if (!this.message_map['@types'][attribute]) {
			this.message_map['@types'][attribute] = 'static';
		}

		let message = $(`<input type="text" class="form-control attribute-value">`)
			.val(this.message_map[attribute])
			.on('input', this, function (evt) {
				evt.stopPropagation();
				evt.data.message_map[attribute] = evt.target.value;
			});

		let list = [];
		for (let msg in this.message) {
			list.push(msg);
		}

		let prev_step = this.getForm().controls[this.previous_step];
		if (prev_step) {
			for (let msg in prev_step.message) {
				if (list.indexOf(msg) !== -1) continue;
				list.push(msg);
			}
		}

		list.sort(function (a, b) {
			return a.localeCompare(b);
		});

		let ctrl = $('<select>').addClass('form-control');

		for (key in form.controls) {
			if (key == this.uuid) continue;
			let text = form.controls[key].label.trim();

			if (text.length === 0) text = form.controls[key].name.trim();

			ctrl.append(`<option value="${key}">${text}</option>`);
		}

		ctrl.on('change', this, function (evt) {
			evt.data.message_map[attribute] = evt.target.value;
		});

		let select = $('<select>')
			.addClass('form-control attribute-type')
			.append("<option value='message'>Read From Message</option>")
			.append("<option  value='static'>Is Static Value</option>");

		select.on('change', this, function (evt) {
			evt.stopPropagation();
			evt.data.message_map['@types'][attribute] = evt.target.value;

			ctrl.hide();
			message.show();

			if (evt.target.value == 'control') {
				ctrl.show();
				message.hide();
			}
		});

		if (this.message_map['@types'][attribute] === 'message') {
			select.find('option:first-child').attr('selected', 'selected');
		}
		else {
			select.find('option:last-child').attr('selected', 'selected');
		}

		select.trigger('change');

		let result = [[attribute, message]];
		if (hide_selector !== true) {
			result.push(['get value from?', select])
		}
		return result;
	}

	clear_attributes() {
		//ON THIS CHANGE WE LOAD THE TABLES
		for (let attr in this.message_map) {
			if (attr === '@types') continue;
			this.message[this.message_map[attr]] = null;
		}
	}

	has_attribute(attribute) {
		console.log(Object.assign({}, this.message_map))

		if (typeof this.message_map !== 'object') {
			this.message_map = Object.assign({}, this.value);
		}

		return attribute in this.message_map;
	}

	get_attribute(attribute) {
		if (typeof this.message_map !== 'object')
			this.message_map = Object.assign({}, this.value);
		if (typeof this.message_map !== 'object') return null;
		if (
			this.message_map['@types'] &&
			this.message_map['@types'][attribute] === 'message'
		) {
			return this.message[this.message_map[attribute]];
		} else if (
			this.message_map['@types'] &&
			this.message_map['@types'][attribute] === 'control'
		) {
			if (this.message_map[attribute] in this.getForm().controls) {
				return this.getForm().controls[this.message_map[attribute]].val();
			} else {
				return null;
			}
		} else {
			return this.message_map[attribute];
		}
	}

	next(next_step) {
		let key = null;
		let form = this.getForm();

		if (form.in_run_mode === false) return;
		if (!next_step) next_step = this.next_steps[0];

		let activity = form.controls[next_step];
		if (!activity || typeof activity.execute !== 'function') {
			// console.log('END OF PROCESS (' + form.label + ')');
			// console.log(this.message);
			form.close(function () { });

			for (key in this.message) {
				form.message[key] = this.message[key];
			}

			if (typeof form._on_done_function_ === 'function')
				form._on_done_function_(form);

			if (typeof form.on_process_completed === 'function') {
				form.on_process_completed();
			}

			return;
		}

		if (!activity.message) activity.message = {};

		activity.clear_attributes(); //CLEAR ANY PREVIOUS VALUES

		activity.previous_step = this.uuid;

		// console.log('EXECUTION FLOW: ' + this.label + ' -> ' + activity.label);

		// console.log('PREVIOUS > ' + this.label);
		// console.log(Object.assign({}, this.message));
		// console.log('NEXT > ' + activity.label);
		// console.log(Object.assign({}, activity.message));

		for (key in this.message) {
			activity.message[key] = this.message[key];
		}

		activity.execute(this);
	}

	resize(width, height) {
		super.resize(width, height);
		this.ctrl.find('.caption').css({
			width: parseFloat(this.dom.control.css('width')),
		});
	}

	format() {
		super.format();

		this.ctrl.children().remove();
		if (this.getForm().busy_importing === true) return;

		this.dom.container.find('.caption').remove();

		this.dom.container.css({
			overflow: 'visible',
		});

		this.ctrl
			.css({
				display: 'table-cell',
				overflow: 'visible',
			})
			.addClass('activity');

		this.addCaption();

		let icon = $('<i>').addClass('la la-lg la-fw la-code').appendTo(this.ctrl);
		icon.css({
			position: 'absolute',
			left: 0,
			top: 0,
			padding: '5px',
			display: 'block',
			zIndex: 15,
		});

		this.refresh_connection();
	}

	addCaption() {
		let caption = $('<span>').addClass('caption').appendTo(this.ctrl);
		let deg = -1 * this.rotation;
		caption.text(this.label).css({
			padding: '5px',
			display: 'inline-block',
			overflow: 'auto',
			zIndex: 15,
			background: 'transparent',
			width: this.width,
			'max-width': this.width,
			'word-wrap': 'break-word',

			'-ms-transform': 'rotate(' + deg + 'deg)',
			'-webkit-transform': 'rotate(' + deg + 'deg)',
			'-moz-transform': 'rotate(' + deg + 'deg)',
			'-o-transform': 'rotate(' + deg + 'deg)',
			transform: 'rotate(' + deg + 'deg)',
		});

		for (let css in this.style) {
			if (
				['border-style', 'border-width', 'background-color'].indexOf(css) !== -1
			) {
				continue;
			}
			caption.css(css, this.style[css]);
		}
	}

	setLabel(text) {
		super.setLabel(text);
		this.find('.caption').html(this.label);
	}
}
