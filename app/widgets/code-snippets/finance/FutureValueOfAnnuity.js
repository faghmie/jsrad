import BaseActivity from "../BaseActivity.js";

export default class FutureValueOfAnnuity extends BaseActivity {

	get_settings() {
		return [
			...super.get_settings(),
			...this.create_attribute('monthly-payment'),
			...this.create_attribute('interest rate per annum'),
			...this.create_attribute('number of months'),
			...this.create_attribute('save future-value to', true),
		];
	}

	execute() {
		let amount = this.get_attribute('monthly-payment'),
			interest_rate = this.get_attribute('interest rate per annum'),
			period = this.get_attribute('number of months'),
			result = null;

		amount = parseFloat(amount);
		if (isNaN(amount)) {
			App.MessageError('Loan amount must be a numeric value');
			return;
		}

		interest_rate = parseFloat(interest_rate);
		if (isNaN(interest_rate)) {
			App.MessageError('Interest rate must be a numeric value');
			return;
		}

		period = parseFloat(period);
		if (isNaN(period)) {
			App.MessageError('Period must be a numeric value');
			return;
		} else if (period <= 0) {
			App.MessageError('Period must be greater than zero');
		}

		interest_rate = (interest_rate / 12.0000) / 100.0000;

		try {
			result = (
				amount *
				(
					(
						Math.pow((1 + interest_rate), period) / interest_rate
					) -
					(1 / interest_rate)
				)
			);

			result = result.toFixed(2);
		} catch (e) {
			logger.log(e);
			return;
		}

		this.message[this.get_attribute('save future-value to')] = result;
		this.next();
	}
}
