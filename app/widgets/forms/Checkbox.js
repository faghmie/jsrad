import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class Checkbox extends BaseFormControl(ControlInterface) {
	properties = {
		height: 30,
		width: 200,
		// height_fixed: true,
		label: 'checkbox',
		value: true
	};

	ignore_properties = [
		'when the user click go to....',
		//'display name',
		'allow inline editor',
	];

	isChecked() {
		return this.ctrl.find('input').is(':checked');
	}

	setChecked(bool) {
		bool = typeof bool === 'undefined' ? false : bool;
		this.ctrl.find('input')[0].checked = bool;
	}

	setLabel(string) {
		this.label = typeof string !== 'undefined' ? string : this.label;
		this.format();
	}

	text(string) {
		if (typeof string === 'undefined') {
			return this.label;
		} else {
			this.label = string;

			this.format();
		}
	}

	setDisabled(bool) {
		this.disabled = bool;

		this.ctrl.find('input').removeAttr('disabled');
		if (true === this.disabled)
			this.ctrl.find('input').attr('disabled', 'disabled');
	}

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group').append(`<input type="checkbox" value="">`);

		this.ctrl.addClass('checkbox');
		
		return this.ctrl;
	}
};