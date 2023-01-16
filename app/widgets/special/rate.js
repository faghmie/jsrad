import ControlInterface from "../_base/ControlInterface.js";

export default class RatingControl extends ControlInterface {
	properties = {
		height: 50,
		width: 400,
		value: "Strongly Disagree,Disagree,Neither Agree or Disagree,Agree,Strongly Agree"
	};

	ignore_properties = [
		'when the user click go to....',
		'name',
		'allow inline editor',
		// 'value',
		'tab index',
		'rotation',
		'opacity',
		// 'required',
		// 'disabled',
		// 'hover',
		// 'make it a card',
	];

	resize(width, height) {
		super.resize(width, height);
		this.setValue();
	}

	setValue(value) {
		this.value = typeof value !== "undefined" ? value : this.value;
		var select = this.ctrl.find("select");

		select.children().remove();
		var parts = [];
		if (this.value instanceof Array) {
			parts = this.value;
		} else if (typeof this.value === "string") {
			parts = this.value.split(/\n|\r|,/);
		}

		for (var index = 0; index < parts.length; index++) {
			if (parts[index] instanceof Array) {
				select.append("<option value='" + parts[index][0] + "'>" + parts[index][1] + "</option>");

			} else if (typeof parts[index] === "string") {
				select.append("<option value='" + parts[index] + "'>" + parts[index] + "</option>");

			}
		}
		select.barrating('destroy');
		select.barrating('show', {
			showSelectedRating: true
		});
	}

	getControl() {
		this.ctrl = $("<div><select></select></div>");
		return this.ctrl;
	}
}