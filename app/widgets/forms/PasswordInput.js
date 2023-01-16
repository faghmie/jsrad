import TextEntry from "./TextEntry.js";

export default class Password extends TextEntry {
	getControl() {
		super.getControl();
		this.ctrl.find('input').remove();
		this.ctrl.find('.control-group').append(`<input type="password" class="form-control"/>`);

		return this.ctrl;
	}
};