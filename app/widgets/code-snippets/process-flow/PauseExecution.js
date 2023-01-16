import BaseActivity from "../BaseActivity.js"

export default class PauseExecution extends BaseActivity {

	get_settings() {
		return [
			...super.get_settings(),
			...this.create_attribute('wait time (milli-seconds)'),
		];
	}

	execute() {
		let wait_for = parseFloat(this.get_attribute('wait time (milli-seconds)'));
		if (isNaN(wait_for)) {
			this.next();
		}

		setTimeout(this.next.bind(this), wait_for);
	}
}
