import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class ColorPicker extends BaseFormControl(ControlInterface) {
	properties = {
		height: 30,
		width: 180,
		// height_fixed	: true,
		// resizable: false
	};

	get_settings() {
		return super.get_settings();
	}

	getControl() {
		super.getControl();

		this.ctrl.find('.control-group').append('<input type="color" />');

		return this.ctrl;
	}
};