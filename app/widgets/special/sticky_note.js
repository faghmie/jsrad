import ControlInterface from "../_base/ControlInterface.js";

export default class StickyNote extends ControlInterface {
	properties = {
		height: 120,
		width: 120,
		width_control: '600'
	};

	style_to_exclude = ['border-width', 'border-color'];
	ignore_properties = [
		'on-click',
		'display name',
		'value',
		'allow inline editor',
	];

	get_settings() {
		if (typeof this.value !== 'string') this.value = '';

		var $this = this;

		var text = $("<textarea class='form-control'>").val(this.value);

		text.on('input', function () {
			$this.setValue($(this).val());
		});

		return [
			["notes", text]
		];
	}

	setValue(value) {
		if (true === this.in_run_mode) return;

		this.value = typeof value === 'undefined' ? this.value : value;

		this.ctrl.find('.stickynotes').val(this.value).show();
	}

	format() {
		super.format();

		var ctrl = this.ctrl.find('.stickynotes'),
			key = null;

		for (key in this.style) {
			if (this.style_to_exclude.indexOf(key) !== -1) continue;
			ctrl.css(key, this.style[key]);
		}

		this.ctrl.find('.stickynotes').val(this.value).show();

		this.ctrl.find('.stickynotes')
			.css({
				'z-index': 15,
			})
			.attr('disabled', 'disabled');
		this.ctrl.find('.stickytop').css('z-index', 10);
	}

	getControl(owner) {
		this.ctrl = $('<div class="sticky ui-corner-all">' +
			'<div class="stickytop" ></div>' +
			'<div class="stickytext">' +
			'<textarea class="stickynotes" ></textarea>' +
			'</div>' +
			'</div>');

		return this.ctrl;
	}
}