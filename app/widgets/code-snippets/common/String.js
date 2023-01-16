import BaseActivity from "../BaseActivity.js";

export default class StringOperation extends BaseActivity {

	get_settings() {
		let settings = super.get_settings();

		let transformations = ['concatenate', 'trim', 'length', 'uppercase', 'lowercase', 'left', 'right'];

		//ICON POSITION
		let transformation = $("<select class='form-control input-sm'>")
			.append("<option></option>");

		transformations.forEach(function (item) {
			transformation.append(`<option>${item}</option>`);
			if (this.value.transformation == item) {
				transformation.find('option:last-child').attr('selected', 'selected');
			}
		}.bind(this));


		transformation.on('change', function (evt) {
			this.value.transformation = evt.target.value;
		}.bind(this));

		return [...settings,
		['operation to perform', transformation],
		...this.create_attribute('first-value'),
		...this.create_attribute('second-value'),
		...this.create_attribute('map response to', true)
		];
	}

	execute() {
		let first_value = this.get_attribute('first-value'),
			second_value = this.get_attribute('second-value'),
			result_value = '',
			num = null;

		delete this.message[this.get_attribute('map response to')];

		switch (this.value.transformation) {
			case 'concatenate':
				result_value = first_value.concat(second_value);
				break;
			case 'trim':
				result_value = first_value.trim();
				break;
			case 'length':
				result_value = first_value.length;
				break;
			case 'uppercase':
				result_value = first_value.toUpperCase();
				break;
			case 'lowercase':
				result_value = first_value.toLowerCase();
				break;
			case 'left':
				if (!isNaN(parseInt(second_value.trim()))) {
					num = parseInt(second_value.trim());
				}

				result_value = first_value;
				if (num) {
					result_value = first_value.substring(0, num);
				}
				break;
			case 'right':
				if (!isNaN(parseInt(second_value.trim()))) {
					num = parseInt(second_value.trim());
				}

				result_value = first_value;
				if (num) {
					result_value = first_value.substr(-1 * num);
				}
				break;
		}

		//console.log('>>>' +this.label);
		//console.log('1st-value ? '+ this.get_attribute('first-value'));
		//console.log('2nd-value ? '+ this.get_attribute('second-value'));
		//console.log('result-value ? '+ result_value);
		//console.log(this.message);
		//console.log('<<<');

		this.message[this.get_attribute('map response to')] = result_value;
		this.next();
	}
}
