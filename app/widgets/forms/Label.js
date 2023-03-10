import ControlInterface from "../_base/ControlInterface.js";

export default class LabelControl extends ControlInterface {
	properties = {
		height: 30,
		width: 200,
	};

	ignore_properties = [
		//'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	style = {
		'font-weight': 'bold',
	};

	format() {
		super.format();
		this.setLabel();
	}

	setValue() {
		this.ctrl.html(this.label);
	 }

	setLabel(string) {
		this.label = typeof string !== 'undefined' ?
			string :
			this.default_value.length !== 0 ?
				this.default_value :
				this.label;
	
		this.setValue()
	}

	getControl() {
		this.ctrl = $('<label>');

		return this.ctrl;
	}
}