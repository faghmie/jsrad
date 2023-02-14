import Button from "./Button.js";

export default class ButtonDataInsert extends Button {

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	is_data_aware = true;

	handle_insert(){
		let record = this.form_to_table();

		//Check if form is empty
		let is_empty = true;
		for(let key in record){
			if (record[key] !== undefined || record[key] !== null){
				if (record[key].toString().trim().length > 0){
					is_empty = false;
				}
			}
		}

		if (is_empty){
			App.notifyError('No Data to Insert');
			return;
		}

		this.insert_record(record).then(() =>{
			App.notifyInfo('Record inserted');
			this.ctrl.hide();
		});
	}
	
	form_to_table(){
		let form = this.getForm();
		let record = {}

		for(let key in form.controls){
			let ctrl = form.controls[key];
			let col = this.field_name_to_uuid(ctrl.name);
			if (!col){
				continue;
			}

			record[col] = ctrl.val();
		}

		return record;
	}

	field_name_to_uuid(name){
		let result = null;
		let table = this.datamodel.TableManager.tables[this.entity];
		for(let field of table){
			if (field.title == name){
				result = field.uuid;
			}
		}
		return result;
	}

	getControl() {
		this.ctrl = $(`<button class="btn btn-primary"></button>`);
		this.ctrl.on('click', this.handle_insert.bind(this));

		return this.ctrl;
	}
}
