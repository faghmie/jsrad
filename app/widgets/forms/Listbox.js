import DropDown from "./Dropdown.js";

export default class ListBox extends DropDown {
	properties = {
		width: 200,
		height: 200,
		value: "Option-1\nOption-2\nOption-3"
	};

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group select').remove()
		this.ctrl.find('.control-group').append(`<select multiple class="form-control form-select">`);

		return this.ctrl;
	}
};