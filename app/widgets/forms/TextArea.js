import TextEntry from "./TextEntry.js";

export default class TextArea extends TextEntry {
	properties = {
		height: 50,
		width: 200,
		label: 'notes',
		text: '',
		placeholder: 'enter text'
	};

	setDefault(txt){
		this.ctrl.find('textarea').val(txt);
	}
	
	val(txt){
		if (typeof txt === 'undefined'){
			return this.ctrl.find('textarea').val();
		} else {
			this.ctrl.find('textarea').val(txt);
		}
	}
	getControl() {
		super.getControl();
		this.ctrl.find('input').remove();
		this.ctrl.find('.control-group').append(`<textarea style='resize:none' class='form-control'/>`);
		
		return this.ctrl;
	}
}