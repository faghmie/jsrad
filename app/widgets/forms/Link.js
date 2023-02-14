import ControlInterface from "../_base/ControlInterface.js";

export default class LinkControl extends ControlInterface {
	properties = {
		height: 30,
		width: 200,
		label: 'Google',
		default_label: 'Google',
		value: 'http://www.google.co.za'
	};

	ignore_properties = [
		'on-click',
		// 'display name',
		'allow inline editor',
	];

	get_settings() {
		var $this = this;
		var url = $('<input>');
		url.val(this.value);
		url.on('input', function () {
			$this.value = $(this).val();
		});

		return [
			['url', url]
		];
	}

	setValue(value) {
		this.value = typeof value !== 'undefined' ? value : this.value;
		this.ctrl.removeAttr('target');
		if (true === this.in_run_mode) {
			this.ctrl.attr('href', this.value);
			this.ctrl.attr('target', '_blank');
		} else
			this.ctrl.attr('href', '#');

		console.log(value)
		this.ctrl.text(this.label);
	}

	setLabel(text) {
		this.label = typeof text !== 'undefined' ?
			text :
			this.default_label.length !== 0 ?
			this.default_label :
			this.label;
		
		this.ctrl.text(this.label);
	}

	getControl() {
		this.ctrl = $('<a>');

		return this.ctrl;
	}
}