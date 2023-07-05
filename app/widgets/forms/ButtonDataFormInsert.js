import DataForm from "../_base/DataForm.js";
import Button from "./Button.js";

export default class ButtonDataFormInsert extends Button {

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	is_data_aware = true;

	toObject() {
		let obj = super.toObject();
		
		console.log(obj)
		return obj;
	}

	handle_insert() {
		let dataForm = new DataForm();

        dataForm.Open(this, null);
	}

	getControl() {
		this.ctrl = $(`<button class="btn btn-primary"></button>`);
		this.ctrl.on('click', this.handle_insert.bind(this));

		return this.ctrl;
	}
}
