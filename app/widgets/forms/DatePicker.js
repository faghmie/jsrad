import { TextEntry } from "./TextEntry.js";

export default class DateControl extends TextEntry {
	properties = {
		height: 35,
		width: 200,
		label: 'Date',
		value: '',
		placeholder: 'start typing...',
		icon_position: 'right',
		use_icon: false

	};
	getControl() {
		super.getControl();
		this.ctrl.find('input').remove();
		this.ctrl.find('.control-group').append(`<input type="date" class="form-control"/>`);

		return this.ctrl;
	}
}