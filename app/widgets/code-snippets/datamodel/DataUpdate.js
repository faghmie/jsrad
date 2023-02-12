import BaseActivity from "../BaseActivity.js";

export default class DataUpdate extends BaseActivity {
	execute() {
		let record = {};
		for (let f in this.message_map) {
			if (f === '@types') continue;

			record[f] = this.get_attribute(f);
		}

		this.update_records(record).then(function(){
			let table = this.datamodel.TableManager.tables[this.entity];
			//Map values to message
			for(let uuid in record){
				this.message[table.fields[uuid].title] = record[uuid];
			}
	
			//Fire off event to ensure change is stored
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));

			this.next();
		}.bind(this))

	}
}
