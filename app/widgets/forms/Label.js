import ControlInterface from "../_base/ControlInterface.js";

export default class LabelControl extends ControlInterface {
	properties = {
		height: 30,
		width: 200,
	};

	ignore_properties = [
		'when the user click go to....',
		//'display name',
		'name',
		'allow inline editor',
	];

	style = {
		'font-weight': 'bold',
	};

	format() {
		super.format();
		this.setLabel();
	}

	setValue() {}

	setLabel(string) {

		this.label = typeof string !== 'undefined' ?
			string :
			this.default_value.length !== 0 ?
			this.default_value :
			this.label;
		var $this = this;
		this.get_datasource(null, null, function (data_) {

			if (data_) {
				$this.label = data_[1];
			}

			$this.ctrl.html($this.label);
		});
	}

	getControl() {
		this.ctrl = $('<label>');

		return this.ctrl;
	}
}