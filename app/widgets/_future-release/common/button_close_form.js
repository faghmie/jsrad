import {Button} from '../../forms/Button.js';

var ButtonCloseForm = class ButtonCloseForm extends Button {
	static type = "button_close_form";
	static control_label = "Button Close Form";
	static control_category = "Actions";
	static control_thumbnail = "images/widgets/button.png";

	ignore_properties = [
		'when the user click go to....',
		'name',
		'allow inline editor',
	];

	change_mode(in_run_mode) {
		super.change_mode(in_run_mode);

		if (false === this.in_run_mode) return;

		this.ctrl.off('click').on('click', this, function (evt) {
			evt.data.getForm().close();
		});
	}

	getControl() {
		this.ctrl = $("<button class='btn btn-light'></button>");

		return this.ctrl;
	}
}