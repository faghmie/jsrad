import BaseActivity from "../BaseActivity.js"

export default class MathOperation extends BaseActivity {

	get_settings() {
		let settings = super.get_settings();

		let transformations = ['add', 'minus', 'multiply', 'divide', 'to the power of', 'max', 'min', 'round','round-up', 'round-down', 'absolute value', 'log'];
		//ICON POSITION
		let transformation = $(`<select class="form-control">`)
			.append(`<option>`);

		transformations.sort();
		transformations.forEach(item => {
			transformation.append(`<option>${item}</option>`);
			if (this.transformation == item) {
				transformation.find('option:last-child').attr('selected', 'selected');
			}
		});

		transformation.on('change', function (evt) {
			this.transformation = evt.target.value;
		}.bind(this));

		return [...settings,
		['operation to perform', transformation],
		...this.create_attribute('first-number'),
		...this.create_attribute('second-number'),
		...this.create_attribute('map response to', true),
		];
	}

	execute() {
		let number_one = this.get_attribute('first-number'),
			number_two = this.get_attribute('second-number'),
			number = 0;

		switch (this.transformation) {
			case 'add':
				number = parseFloat(number_one) + parseFloat(number_two);
				break;
			case 'minus':
				number = parseFloat(number_one) - parseFloat(number_two);
				break;
			case 'multiply':
				number = parseFloat(number_one) * parseFloat(number_two);
				break;
			case 'divide':
				number = parseFloat(number_one) / parseFloat(number_two);
				break;
			case 'to the power of':
				number = Math.pow(parseFloat(number_one), parseFloat(number_two));
				break;
			case 'max':
				number = Math.max(parseFloat(number_one), parseFloat(number_two));
				break;
			case 'min':
				number = Math.min(parseFloat(number_one), parseFloat(number_two));
				break;
			case 'round':
				number = Math.round(parseFloat(number_one));
				break;
			case 'round-up':
				number = Math.ceil(parseFloat(number_one));
				break;
			case 'round-down':
				number = Math.floor(parseFloat(number_one));
				break;
			case 'absolute value':
				number = Math.abs(parseFloat(number_one));
				break;
			case 'log':
				number = Math.log(parseFloat(number_one));
				break;
		}
		this.message[this.get_attribute('map response to')] = number;
		this.next();
	}
}
