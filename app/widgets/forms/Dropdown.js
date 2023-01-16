import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";


export default class control_select extends BaseFormControl(ControlInterface) {
	
	style_to_exclude = ['border-width', 'border-color'];

	properties = {
		height: 30,
		width: 200,
		label: 'drop down',
		value: 'Option-1\nOption-2\nOption-3',
	};

	ignore_properties = [
		'when the user click go to....',
		'display name',
		'allow inline editor',
	];

	get_settings() {
		return super.get_settings();
	}

	format(){
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
		this.value = typeof value !== 'undefined' ? value : this.value;
		var $this = this;

		this.get_datasource(function (data_) {
			var hdr = [];

			if (data_) {
				$this.value = data_;
				hdr = $this.value.shift();
			}


			var parts = [];
			if ($this.value instanceof Array) {
				parts = $this.value;
			} else if (typeof $this.value === "string") {
				parts = $this.value.split(/\n|\r|,/);
			}

			$this.SetFromArray(parts, hdr);
		});

		return this;
	}

	SetFromArray(items, hdr) {
		var select = this.ctrl.find('select');

		select.find("option").remove();
		select.append('<option value="{null}">');

		for (var index = 0; index < items.length; index++) {
			var item = items[index];
			if (item instanceof Array) {
				if (item.length < 2) {
					select.append('<option>' + item[0] + '</option>');
				} else {

					var ref_index = -1;
					if (hdr.length > 0) {
						ref_index = hdr[hdr.length - 1].indexOf('reference-key/');
					}

					if (ref_index !== -1) {
						select.append("<option value='" + item[item.length - 1] + "'>" + item[0] + "</option>");
					} else {
						select.append("<option>" + item[0] + "</option>");
					}
				}

			} else if (typeof item === "string") {
				select.append("<option>" + item + "</option>");

			}
		}
	}
	setDefault(value) {
		this.setValue(value);
		return this;
	}

	setSelected(value) {
		if (value === null || typeof value === 'undefined') return this;

		this.ctrl.find('option').removeAttr('selected');
		this.ctrl.find('option').each(function () {
			var opt = $(this);

			if (value == opt.val()) {
				opt.attr('selected', 'selected');
			}
		});

		return this;
	}

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group').append('<select class="form-control">');

		return this.ctrl;
	}
}