import BaseActivity from "../BaseActivity.js";

export default class DataRemove extends BaseActivity {
	is_data_aware = true;
	execute() {
		this.remove_records().then(function(){
			this.next();
		}.bind(this))
	}
}
