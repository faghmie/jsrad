import App from "../../common/App.js";
import Button from "./Button.js";

export default class ButtonDataImport extends Button {

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	is_data_aware = true;

    getControl() {
		this.ctrl = $(`<button class="btn btn-primary"></button>`);
		this.ctrl.on('click', this.custom_click.bind(this));

		return this.ctrl;
	}

	custom_click() {
		this.trigger_file().then(() => {
            App.notifyInfo("File imported");
        });
	}

    trigger_file() {
		return new Promise((resolve, reject) => {
			let file = $(`<input type="file">`);

			file.on('change', function (evt) {
				this.open_file(evt.target.files[0]).then((data) => {
					resolve(data);
				});
			}.bind(this));

			file.trigger('click');
		});
	}

	open_file(file) {
		return new Promise((resolve, reject) => {
			console.log(file.name);
			let reader = new FileReader();
			reader.onload = function (e) {
				let contents = e.target.result;
				this.process_file_contents(file.name, contents).then(() => {
					resolve(contents);
				});
				
			}.bind(this);

			reader.readAsText(file);
		});
	}

	async process_file_contents(filename, contents) {
		let csv = csv_to_array(contents);
		let table = this.get_table(filename);
		let fields = this.get_fields(csv, table);
		await this.insert_into_table(csv, fields);
	}

	get_table(filename) {
		if (!this.entity || !this.datamodel.TableManager.tables[this.entity]) {
			let found = false;
			for (let table of this.datamodel.TableManager) {
				if (table.name === filename) {
					this.entity = table.uuid;
					found = true;
					break;
				}
			}

			if (!found) {
				let table = this.datamodel.TableManager.addTable(filename);
                this.entity = table.uuid;
                return table;
			}
		}

		return this.datamodel.TableManager.tables[this.entity];
	}

	/**
	 *
	 *
	 * @param {[[]]} array
	 * @param {SqlTable} table
	 * @memberof DataFileImport
	 */
	get_fields(array, table) {
		let hdr = array[0];
		let result = [];

		/** @type{SqlField|undefined} */
		let col = null;
		hdr.forEach(c => {
			let found = false;
			for (col of table) {
				if (col.title === c) {
					result.push(col.uuid);
					found = true;
					break;
				}
			}

			if (!found) {
				let f = table.addRow(c);
				result.push(f.uuid);
			}
		});

		return result;
	}

	async insert_into_table(records, fields) {
		//Skip the first row
		for (let k = 1; k < records.length; k++) {
			let row = records[k];
			let record = {};

			row.forEach((f, idx) => {
				record[fields[idx]] = f;
			});

			await this.insert_record(record);
		}


		//Fire off event to ensure change is stored
		document.dispatchEvent(new CustomEvent('ide-is-dirty'));
	}
}
