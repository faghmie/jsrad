import Button from "./Button.js";

export default class ButtonDataInsert extends Button {

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	is_data_aware = true;

	get_settings() {
		let btn = $(`<button>control map</button>`).on('click', this.open_field_mapper.bind(this));

		return [
			['control map', btn],
			...super.get_settings()
		];
	}

	handle_insert() {
		let record = this.form_to_table();

		//Check if form is empty
		let is_empty = true;
		for (let key in record) {
			if (record[key] !== undefined || record[key] !== null) {
				if (record[key].toString().trim().length > 0) {
					is_empty = false;
				}
			}
		}

		if (is_empty) {
			App.notifyError('No Data to Insert');
			return;
		}

		this.insert_record(record).then(() => {
			App.notifyInfo('Record inserted');
			this.ctrl.hide();
		});
	}

	form_to_table() {
		let form = this.getForm();
		let table = this.datamodel.TableManager.tables[this.entity];

		let keys = Object.keys(this.control_map);
		let by_control = true;

		for (let field of table) {
			if (keys.indexOf(field.uuid) != -1) {
				by_control = false;
			}
		}

		if (by_control){
			return this.record_from_control_names(form);
		}

		return this.record_from_control_map(form);
		
	}

	record_from_control_map(form){
		let record = {}

		for (let key in this.control_map) {
			let ctrl = form.controls[this.control_map[key]];
			if (ctrl){
				record[key] = ctrl.val();
			}
		}

		return record;
	}

	record_from_control_names(form){
		let record = {}

		for (let key in form.controls) {
			let ctrl = form.controls[key];
			let col = this.field_name_to_uuid(ctrl.name);
			if (!col) {
				continue;
			}

			record[col] = ctrl.val();
		}

		return record;
	}

	field_name_to_uuid(name) {
		let result = null;
		let table = this.datamodel.TableManager.tables[this.entity];
		for (let field of table) {
			if (field.title == name) {
				result = field.uuid;
			}
		}
		return result;
	}

	open_field_mapper() {
		//ON THIS CHANGE WE LOAD THE TABLES
		let fields = [],
			mapper = $(`<div class="process-atrr-map"></div>`);

		/** @type{SqlField|undefined} */
		let col = null;

		let table = this.datamodel.TableManager.tables[this.entity];
		if (!table) return;

		for (col of table) {
			fields.push(col);
		}

		fields = fields.sort(function (a, b) {
			return (a.title || '').localeCompare(b.title);
		});
		mapper.append(`
			<div class="header">Entity</div>
			<div class="header">Field</div>
			<div class="header">Control</div>
		`);

		fields.forEach(function (col) {
			this.#make_field_row(mapper, col);
		}.bind(this));

		open_card(mapper, {
			title: 'Define Filter',
			'width': '60vw',
			'min-width': '60vw',
			'max-width': '60vw',
			'height': '60vh',
			'min-height': '60vh',
			'max-height': '60vh',
		});
	}

	#make_field_row(mapper, field) {
		let form = this.getForm();

		mapper.append(`<div>${field.table.title}</div>`);
		mapper.append(`<div>${field.title}</div>`);
		this.control_map ||= {};

		let select = $('<select class="form-control form-select">');

		select.append(`<option>`);

		for (let uuid in form.controls) {
			let ctrl = form.controls[uuid];

			let title = ctrl.label.trim();
			
			if (title.length == 0){
				title = ctrl.name.trim();
			}
			
			if (title.length == 0){
				title = ctrl.uuid;
			}

			select.append(`<option value="${ctrl.uuid}" datamodel-field-uuid="${field.uuid}">${title}</option>`);

			if (this.control_map[field.uuid] == ctrl.uuid){
				select.find('option:last-child').attr('selected', 'selected');
			}
		}

		select.on('change', this, function (evt) {
			evt.stopPropagation();
			let opt = evt.target.options[evt.target.selectedIndex];
			this.control_map[opt.getAttribute('datamodel-field-uuid')] = evt.target.value;

			//Fire off event to ensure change is stored
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

		let div = $(`<div></div>`).append(select).appendTo(mapper);
	}


	getControl() {
		this.ctrl = $(`<button class="btn btn-primary"></button>`);
		this.ctrl.on('click', this.handle_insert.bind(this));

		return this.ctrl;
	}
}
