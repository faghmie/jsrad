import BaseActivity from "../BaseActivity.js";

export default class CSVToArray extends BaseActivity {
	get_settings() {
		return [
			...super.get_settings(),
			...this.create_attribute('csv data'),
			...this.create_attribute('map response to', true)
		];
	}

	execute() {
		this.message[this.get_attribute('map response to')] = csv_to_array(this.get_attribute('csv data'));
		this.next();
	}
}
