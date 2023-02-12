import BaseActivity from "../BaseActivity.js";

export default class DataRemove extends BaseActivity {
	execute() {
		this.remove_records().then(function(){
			this.next();
		}.bind(this))
	}
}
