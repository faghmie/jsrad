import BaseActivity from "../BaseActivity.js";

export default class DataRead extends BaseActivity {
	is_data_aware = true;
	
	execute() {

		this.read_records().then(function(result){
			this.message[this.get_attribute('result')] = result;
			console.log(result)
			this.next();
		}.bind(this))
	}
}
