import SqlDesigner from '../../data_modeller/SqlDesigner.js';
import { ControlActivityBase } from '../_base/ControlActivityBase.js';
import ControlInterface from '../_base/ControlInterface.js';

export default class BaseActivity extends ControlActivityBase(ControlInterface) {
	style = {
		'font-size': '12px',
		'background-color': '#A6AAC9',
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

	/** @type {SqlDesigner|undefined} */
	datamodel = {};

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
