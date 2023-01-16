import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class ListBox extends BaseFormControl(ControlInterface) {

	properties = {
		width: 200,
		value: "Option-1\nOption-2\nOption-3"
	};

	ignore_properties = [
		//'when the user click go to....',
		'display name',
		'allow inline editor',
	];

	refresh() {
		super.refresh();
		this.setValue();
	}
	format(){
		super.format();
		
		this.setValue();
	}

	get_settings(){
		return super.get_settings();
	}

	setValue(value) {
		this.value = typeof value !== "undefined" ? value : this.value;
		var $this = this;
		this.get_datasource(null, null, function (data_) {
			var hdr = [];
			var select = $this.ctrl.find('select');

			if (data_) {
				$this.value = data_;
				hdr = $this.value.shift();
			}

			select.find("option").remove();
			var parts = [];
			if ($this.value instanceof Array) {
				parts = $this.value;
			} else if (typeof $this.value === "string") {
				parts = $this.value.split(/\n|\r|,/);
			}

			for (var index = 0; index < parts.length; index++) {
				var item = parts[index];
				if (item instanceof Array) {
					if (item.length < 2) {
						select.append("<option>" + item[0] + "</option>");
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
		});
	}

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group').append('<select multiple>');

		return this.ctrl;
	}
};