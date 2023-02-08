import TextEntry from "./TextEntry.js";


export default class TimeControl extends TextEntry {
	properties = {
		height: 35,
		width: 200,
		label: 'TIme',
		value: '',
		placeholder: 'start typing...',
		icon_position: 'right',
		use_icon: false

	};
	getControl() {
		super.getControl();
		this.ctrl.find('input').remove();
		this.ctrl.find('.control-group').append(`<input type="time" class="form-control">`);

		return this.ctrl;
	}
};