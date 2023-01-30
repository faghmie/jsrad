import TextEntry from "./TextEntry.js";

export default class NumberControl extends TextEntry {
	getControl() {
		super.getControl();
		this.ctrl.find('input').remove();
		this.ctrl.find('.control-group').append(`<input type="number" class="form-control">`);

		return this.ctrl;
	}
};