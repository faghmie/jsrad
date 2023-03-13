import App from "../../../common/App.js";
import BaseActivity from "../BaseActivity.js";

export default class SimpleRestGetServiceActivity extends BaseActivity {
	get_settings() {
		let settings = super.get_settings();

		return [
			...settings,
			...this.create_attribute('ws-url'),
			...this.create_attribute('map response to', true),
		];
	}

	execute() {
		let url = this.get_attribute('ws-url');

		fetch(url)
			.then(response => response.json())
			.then(function (data) {
				this.message[this.get_attribute('map response to')] = data;
				this.next();
			}.bind(this))
			.catch(err => {
				console.log(err);
				App.notifyError('Failed to call remote-service at: ' + url);
			})
	}
}
