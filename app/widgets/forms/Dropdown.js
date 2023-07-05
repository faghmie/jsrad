import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";


export default class DropDown extends BaseFormControl(ControlInterface) {

	data_list_field = true;
	is_data_aware = true;

	style_to_exclude = ['border-width', 'border-color'];

	properties = {
		height: 30,
		width: 200,
		label: 'drop down',
		value: 'Option-1\nOption-2\nOption-3',
	};

	ignore_properties = [
		'on-click',
		'display name',
		'allow inline editor',
	];

	get_settings() {
		return super.get_settings();
	}

	format() {
		super.format();
		this.setValue();
	}

	append(opt) {
		this.ctrl.append(opt);
	}

	text() {
		return this.ctrl.find('option:selected').text();
	}

	val(string) {
		if (typeof string !== 'undefined')
			this.setSelected(string);
		else
			return this.ctrl.find('option:selected').val();
	}

	//OVER-RIDE THE "ON" METHOD TO DO SOMETHING SPECIAL FOR 
	//LIST BOX
	on(event_name, data, callback) {
		this.ctrl.on(event_name, 'option', data, callback);

		return this;
	}

	setValue(value) {
		let parts = [];

		//Make sure that you have an array
		if (value instanceof Array) {
			this.value = value;
		} else if (typeof value === "string") {
			parts = value.split(/\n|\r|,/);
			if (parts.length > 1) {
				this.value = parts;
			}
		}

		// this.value = value || this.value;

		this.read_records().then(function (data) {
			if (data) {
				this.value = data;
			}

			if (this.value instanceof Array) {
				parts = this.value;
			} else if (typeof this.value === "string") {
				parts = this.value.split(/\n|\r|,/);
			}

			this.SetFromArray(parts);
		}.bind(this));

		return this;
	}

	SetFromArray(items) {
		let select = this.ctrl.find('select');

		select.find("option").remove();
		select.append('<option>');

		items.forEach(item => {
			select.append(`<option>${item}</option>`);
		});
	}

	setDefault(value) {
		this.setValue(value);
		return this;
	}

	setSelected(value) {
		if (value === null || typeof value === 'undefined') return this;

		this.ctrl.find('option').removeAttr('selected');
		this.ctrl.find('option').each(function () {
			let opt = $(this);

			if (value == opt.val()) {
				opt.attr('selected', 'selected');
			}
		});

		return this;
	}

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group').append('<select class="form-control form-select">');

		return this.ctrl;
	}
}