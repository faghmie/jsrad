import BaseActivity from "../BaseActivity.js";

export default class DataRead extends BaseActivity {
	execute() {

		this.read_records().then(function(result){
			this.message[this.get_attribute('result')] = result;
	
			this.next();
		}.bind(this))
	}
}
