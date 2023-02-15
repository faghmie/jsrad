import ControlInterface from "../_base/ControlInterface.js"

export default class HorizontalLine extends ControlInterface {

	properties = {
		height: 30,
		width: 200,
		height_fixed: true,
	};
	
	style = {
		display: 'block',
		height: '1px'
	};

	ignore_properties = [
		'on-click',
		'display name',
		'label',
		'allow inline editor',
	];

	getControl() {
		this.ctrl = $('<hr>');

		return this.ctrl;
	}
};
