import ControlInterface from "./_base/ControlInterface.js";
import resolutions from '../../config/device_resolutions.js';
import Dialog from "../common/Dialog.js";
import App from "../common/App.js";

export default class Form extends ControlInterface {

	static control_description = 'resolutions was retrieved from: https://www.mydevice.io/';

	properties = {
		height: 480,
		width: 680,
		label: 'New Form',
		refresh_rate: 0,
		draggable: false,
	};

	display_type = 'normal';
	busy_card = null;
	is_open = false;
	style_to_exclude = ['border', 'border-style', 'border-width', 'border-color'];
	message = null;
	pre_message = null;
	post_message = null;
	is_a_process = false;

	/** @type {UiDesigner | undefined} */
	designer = null;

	ignore_properties = [
		'on-click',
		'name',
		'allow inline editor',
		'value',
		'tab index',
		'rotation',
		'opacity',
		'required',
		'disabled',
		'hover',
		'make it a card',
	];

	setValue() {
		this.message ||= {};

		for (let f in this.controls) {
			this.controls[f].setValue(this.message[this.controls[f].name]);
		}
	}

	format() {
		super.format();
		for (let f in this.controls) {
			this.controls[f].format();
		}
	}

	change_mode(in_run_mode) {
		super.change_mode(in_run_mode);

		this.dom.container.addClass('app-run-mode');

		App.active_form = null;

		if (this.designer) {
			this.designer.dom.app_area.removeAttr('form-id');
			this.designer.dom.app_area.removeAttr('design-panel');
		}

		this.set_auto_refresh();

		this.ctrl.off('click');

		//Ensure form from a previous run is not loaded by accident
		this.designer.dom.app_area.removeData('form');

		if (false === this.in_run_mode) {
			this.ctrl.addClass('design-mode');
			this.ctrl.removeClass('app-run-mode');


			for (let ctrl in this.controls) {
				this.controls[ctrl].deselect();
				this.controls[ctrl].change_mode(this.in_run_mode);
			}

			this.ctrl.on('click', this, function (evt) {
				evt.stopPropagation();
				let form = evt.data;

				form.find('.widget-label-editor').trigger('focusout');
				for (let ctrl in form.controls) {
					form.controls[ctrl].deselect();
				}
				form.select();
			});
		}
	}

	//Populate form with any message that was passed to the form
	pre_load(message) {
		this.pre_message = Object.assign(this.pre_message, message || {});

		this.message = Object.assign({}, this.pre_message);

		this.ctrl.find('input, textarea, select').each(function () {
			switch (this.tagName) {
				case 'INPUT':
				case 'TEXTAREA':
					$(this).val('');
					break;
				case 'SELECT':
					$(this).find('option').removeAttr('selected');
					break;
			}
		});

		for (let key in this.message) {
			let ctrl = this.findControlByName(key);
			if (!ctrl) continue;
			if (typeof ctrl.setDefault === 'function') {
				ctrl.setValue(this.message[key]);
			}
		}
	}


	/**
	 * Build message to pass from current form onto next form
	 * Message should contain key-value pair of all current controls on the form
	 * 
	 * @param {Form} context
	 * @return {*} 
	 * @memberof Form
	 */
	pre_close(context) {
		if ((true !== this.in_run_mode)) return {};
		if (typeof context !== 'object') context = this;

		context.message = Object.assign(context.message, context.pre_message);

		for (let key in context.controls) {
			if (context.controls[key].is_an_activity === true) {
				continue;
			}
			let name = context.controls[key].name;
			if (typeof context.controls[key].val === 'function') {
				switch (context.controls[key].type) {
					case 'label':
					case 'heading':
					case 'hr':
					case 'img':
					case 'icon':
					case 'paragraph':
					case 'button':
					case 'link':
					case 'box':
						break;

					default:
						context.message[name] = context.controls[key].val();

						$(this).find('option').removeAttr('selected');
						break;
				}

				//MAKE ALL ARRAYS FLAT
				if (context.message[name] instanceof Array) {
					context.message[name] = context.message[name][0];
				}
			}
		}

		context.post_message = Object.assign({}, context.message);

		return context.post_message;
	}

	destroy() {
		this.panel.remove();
		this.dom.container.remove();
	}

	show(on_done, message, context) {
		super.show();

		/** @type {UiDesigner | undefined} */
		let designer = (this.designer !== null ? this.designer : {});

		let $this = this;

		this._context = context;
		this._on_done_function_ = null;

		//FIND THE TAB THAT HAS THE FORM

		/** @type {Form | undefined} */
		let prev = designer.dom.app_area.data('form');

		this.close_busy_card();

		this.change_mode(designer.in_run_mode);

		if (designer.in_run_mode === false) {
			this.enable_design_mode();
			return;
		}

		this.ctrl.addClass('run-mode');

		//NEED TO DO THE MESSAGE SAVING STUFF HERE 
		//CAUSE THE CHANGE-MODE FUNCTION ABOVE RESETS
		//THE MESSAGE TO NULL

		if (prev) prev.close_busy_card();

		if (designer.dom && this.is_a_process !== true) {
			if (prev) {
				prev.close();
			}
		}

		//FIRST CLOSE THE PREVIOUS FORM - OTHERWISE YOU DON'T GET THE 
		//MESSAGE OF THE PREVIOUS FORM TRANSFERED CORRECTLY TO THE
		//CURRENT FORM.

		//Call this to build message of form that was previous open
		this.pre_message = {};
		if (prev) {
			this.pre_message = Object.assign(prev.pre_close());
		}

		this.pre_load(message);

		this._on_done_function_ = on_done;
		if (typeof this._on_done_function_ !== 'function') {
			this._on_done_function_ = () => { };
		}

		//SAVE REFERENCE TO FORM - MUST HAPPEN HERE
		if (designer.dom) {
			designer.dom.app_area.data('form', this);
		}

		this.card = null;
		switch (this.display_type) {
			case 'modal':
			case 'popup':
			case 'module':
			case 'message-dialog':
				this.card = new Dialog(this.dom.container, {
					title: this.label,
					width: this.width,
					height: this.height,
					'min-height': this.height,
					on_show: function () {
						$this.dom.container.show();
						$this.format();
					},
					on_close: function () {
						$this.close(on_done);
						if (prev) prev.show();
					}
				});
				break;

			default:
				if (this.is_a_process === false) {
					designer.dom.app_area
						.css({
							width: this.width + 5,
							height: this.height + 5
						});
					designer.dom.app_area.children().hide();
					designer.dom.app_area.append(this.dom.container);
					
					this.dom.container.show();
					this.format();

				} else {
					this.show_busy_card();
					this.start_process();
				}
		}

		//NOW ALLOW ALL CONTROLS TO UPDATE THEIR VALUES
		this.setValue();
	}

	enable_design_mode() {
		this.close();
		this.panel.show(); //Must show form before doing anything else, some controls must be visible to render (e.g. jqplot)
		this.ctrl.removeClass('run-mode');
		this.select();
		this.setValue();
	}

	close(on_done) {
		this.pre_close();
		this.close_busy_card();

		if (this.card && (typeof this.card.close === 'function')) this.card.close();

		if (this.panel) {
			this.panel.append(this.dom.container);
		}

		if (typeof on_done === 'function') {
			on_done(this._context);
		}

		this.card = null;
		this.is_open = false;
	}

	close_busy_card() {
		if (this.busy_card && (typeof this.busy_card.close === 'function')) this.busy_card.close();

		this.busy_card = null;

	}

	show_busy_card() {
		let progress = $(`<div class="process-busy">
			<div class="body-content">
				<i class="la la-fw la-2x la-refresh la-spin" ></i>
				<span>
				in progress...
				</span>
			</div>
		</div>`);

		this.busy_card = new Dialog(progress, {
			// no_header: true,
		});
	}

	setProcessStatus() {
		this.is_a_process = false;
		this.ctrl.removeClass('process-mode').addClass('design-mode');
		for (let key in this.controls) {
			if (this.controls[key].is_an_activity === true) {
				this.is_a_process = true;
				break;
			}
		}

		if (true === this.is_a_process) {
			this.ctrl
				.addClass('process-mode')
		}
	}

	isProcess() {
		return this.is_a_process;
	}

	start_process(on_done) {

		if ((false === this.is_a_process) || (this.in_run_mode !== true)) return;

		//NOW FIND ENTRY FOR PROCESS
		let start_process = null,
			ctrl = null;


		for (ctrl in this.controls) {
			if (this.controls[ctrl].__start__ !== true) continue;

			start_process = this.controls[ctrl];
		}

		if (null === start_process) {
			return App.notifyError('No starting process detected');
		}

		if (!start_process.message) {
			start_process.message = {
				'@types': {}
			};
		}

		start_process.message = Object.assign(start_process.message, this.getForm().message);

		//NOW DELETE ANY MESSAGE THAT WILL BE SET IN THE SUB-PROCESS

		for (ctrl in this.controls) {
			let activity = this.controls[ctrl];
			for (let attr in activity.message_map) {
				if (attr === '@types' || activity.message_map['@types'][attr] === 'message') continue;

				delete start_process.message[activity.message_map[attr]];
			}
		}

		start_process.execute();
	}

	set_responsive(is_responsive) {
		if (typeof is_responsive === 'undefined') is_responsive = this.is_responsive;
		let form = this;

		if (true === is_responsive) {
			form.ctrl
				.addClass('container-fluid')
				.css({
					top: 40,
					left: 0,
					width: '',
					height: '',
				});
		} else {
			form.ctrl.removeClass('container-fluid');
			this.resize();
			this.move();
		}

		let list = [];
		for (let c in this.controls) {
			list.push(this.controls[c]);
		}

		list = list.sort(function (a, b) {
			return a.top - b.top;
		});

		this.ctrl.children().remove();
		list.forEach(function (ctrl) {
			if (true === is_responsive) {
				this.ctrl.append(ctrl.dom.container);
				ctrl.dom.container
					.addClass('row')
					.css({
						left: '',
						top: '',
						width: '100%',
					});
			} else {
				this.append(ctrl);
				ctrl.dom.container.removeClass('row');
				ctrl.change_mode(this.in_run_mode);
				ctrl.select();
				ctrl.resize();
				ctrl.move();
			}
		}.bind(this));

		return this;
	}

	set_auto_refresh() {
		if (typeof this.refresh_rate === 'undefined' || this.refresh_rate === 0) return;
		if (this.in_run_mode === false) return;

		let $this = this;

		let refresh_controls = function () {
			for (let f in this.controls) {
				if (typeof this.controls[f].setValue === 'function')
					this.controls[f].setValue();
			}

			if (this.in_run_mode === false) return;

			setTimeout(refresh_controls, 1000 * this.refresh_rate);
		}.bind(this);

		setTimeout(refresh_controls, 1000 * $this.refresh_rate);
	}

	async fromObject(json) {
		await super.fromObject(json, this);
		this.setProcessStatus();
	}

	toObject() {
		let json = super.toObject();

		delete json.card;
		delete json.busy_card;
		delete json.panel;
		delete json._callback_on_done;
		delete json.is_open;
		delete json._context;

		return json;
	}

	get_settings() {
		let $this = this,
			index = null,
			item = null;
		let select = $('<select>').addClass('form-control');


		let cmb_refresh = $('<select>').addClass('form-control');
		let refresh_intervals = [
			['none', 0],
			['5 seconds', 5],
			['10 seconds', 10],
			['15 seconds', 15],
			['30 seconds', 30],
			['1 minute', 60],
			['5 minutes', 60 * 5],
		];

		for (index = 0; index < refresh_intervals.length; index++) {
			item = refresh_intervals[index];
			cmb_refresh.append('<option value="' + item[1] + '">' + item[0] + '</option>');
			let opt = cmb_refresh.find('option:last');
			opt.prop('resolution', item);
			if (item[1] === this.refresh_rate)
				opt.attr('selected', 'selected');
		}

		cmb_refresh.on('change', function () {
			let opt = $(this).find('option:selected');
			let item = opt.prop('resolution');
			$this.refresh_rate = item[1];
		});

		select.append('<option>Custom[' + $this.width + ' x ' + $this.height + ']</option>');
		let opt = select.find('option:last');
		opt.prop('resolution', ['Custom', $this.width, $this.height]);
		for (index = 0; index < resolutions.length; index++) {
			item = resolutions[index];
			select.append('<option>' + item[0] + ' [' + item[1] + ' x ' + item[2] + ']</option>');
			opt = select.find('option:last');
			opt.prop('resolution', item);
			if (item[0] === this.screen_resolution)
				opt.attr('selected', 'selected');
		}

		select.on('change', function () {
			let opt = $(this).find('option:selected');
			let res = opt.prop('resolution');
			$this.screen_resolution = res[0];
			if ($this.orientation == 'landscape')
				$this.resize(res[2], res[1]);
			else
				$this.resize(res[1], res[2]);

		});

		let form_type = $("<select class='form-control'>");

		form_type.append('<option>normal</option>');
		form_type.append('<option>popup</option>');
		form_type.append('<option>module</option>');

		form_type.find('option').each(function () {
			if ($this.display_type === $(this).val()) $(this).attr('selected', 'selected');
		});

		form_type.on('change', function () {
			let opt = $(this).find('option:selected');
			$this.display_type = opt.val();
		});

		let orientation = $("<select class='form-control'>");

		orientation.append('<option>portrait</option>');
		orientation.append('<option>landscape</option>');

		orientation.find('option').each(function () {
			if ($this.orientation === $(this).val()) $(this).attr('selected', 'selected');
		});

		orientation.on('change', select, function (evt) {
			let opt = $(this).find('option:selected');
			$this.orientation = opt.val();
			evt.data.trigger('change');
		});

		let responsive = $("<input type='checkbox' id='responsive'>");

		if (this.is_responsive === true)
			responsive.attr('checked', 'checked');

		responsive.on('click', function () {
			$this.is_responsive = this.checked;
		});

		return [
			['resolution', select],
			['orientation', orientation],
			['form type', form_type],
			['auto refresh values', cmb_refresh],
		];
	}

	getControl() {
		this.ctrl = $(`<div class="jsrad-form">`);
		this.make_droppable(this.ctrl);

		return this;
	}
};