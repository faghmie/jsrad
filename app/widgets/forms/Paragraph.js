import ControlInterface from "../_base/ControlInterface.js"

export default class Paragraph extends ControlInterface {

	properties = {
		height: 150,
		width: 400,
		value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ultricies nisi eget nisi vehicula, at bibendum elit facilisis. Duis ultricies nulla in odio congue dictum. Sed imperdiet lorem non nulla lobortis, in tempor erat consectetur. Morbi sagittis justo consectetur leo hendrerit ullamcorper. Nunc tempor sem ut convallis bibendum. Curabitur sit amet velit nec tellus ornare aliquam ac eget massa. Vivamus sed mauris augue. Mauris commodo a massa vitae auctor. Sed rutrum sed orci tempus tristique. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',

	};

	ignore_properties = [
		'when the user click go to....',
		'display name',
		'value',
		//'allow inline editor',
	]

	get_settings() {
		var text = $('<textarea>').addClass('form-control').val(this.value);

		text.on('input', function (evt) {
			this.value = evt.target.value;
			this.format();
		}.bind(this));

		return [
			['text', text]
		];
	}

	text(string) {
		if (typeof string === 'undefined') {
			return this.value;
		} else {
			this.setValue(string);
		}
	}

	setDefault(){
		//prevent run-mode from clearing text
	}

	setValue(string) {
		this.value = (typeof string !== 'undefined' ? string : this.value);

		var $this = this;
		this.get_datasource(null, null, function (data_) {
			if (data_) {
				$this.value = data_[1];
			}

			$this.ctrl.html($this.value);
		});
	}

	format(){
		super.format();

		this.ctrl.html(this.value);

		this.ctrl.css({
			'text-overflow': 'ellipsis',
			'white-space': 'pre-wrap',
		});
	}

	getControl() {
		this.ctrl = $('<div>');

		return this.ctrl;
	}
}
