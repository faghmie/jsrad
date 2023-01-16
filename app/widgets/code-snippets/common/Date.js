import BaseActivity from "../BaseActivity.js";

export default class DateOperationActivity extends BaseActivity {
	get_settings() {
		let settings = super.get_settings();
		
		let transformations = [
			'current timestamp',
			'is a date',
			'max of',
			'min of',
			'diff in days',
			'diff in hours',
			'diff in minutes',
			'get weekday',
			'get weekday name',
			'get short-date',
			'get time',
		];
		//ICON POSITION
		let transformation = $("<select class='form-control input-sm'>")
			.append("<option></option>");

		transformations.forEach(item => {
			transformation.append(`<option>${item}</option>`);
			if (this.transformation == item){
				transformation.find('option:last-child').attr('selected', 'selected');
			}
		});

		transformation.on('change', function (evt) {
			this.transformation = evt.target.value;
		}.bind(this));

		return [
			...settings,
			...this.create_attribute('map response to', true),
			['operation', transformation],
			...this.create_attribute('first date'),
			...this.create_attribute('second date'),
		];
	}

	execute() {
		let first_value = this.get_attribute('first date'),
			second_value = this.get_attribute('second date'),
			result_value = null,
			denominator = null,
			weekDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		if (!isNaN(Date.parse(first_value))) {
			first_value = new Date(first_value);
		} else {
			first_value = null;
		}
		if (!isNaN(Date.parse(second_value))) {
			second_value = new Date(second_value);
		}

		console.log(this.transformation, first_value)

		switch (this.transformation) {
			case 'current timestamp':
				result_value = new Date().toLocaleString('en-GB');
				break;
			case 'is a date':
				result_value = !isNaN(Date.parse(first_value));

				break;
			case 'max of':
				if (first_value && second_value){
					result_value = first_value > second_value ? first_value : second_value;
				}
				break;
			case 'min of':
				if (first_value && second_value){
					result_value = first_value < second_value ? first_value : second_value;
				}
				break;
			case 'diff in days':
				denominator = 1000 * 60 * 60 * 24;
				break;
			case 'diff in hours':
				denominator = 1000 * 60 * 60;
				break;
			case 'diff in minutes':
				denominator = 1000 * 60;
				break;
			case 'get weekday':
				if (first_value){
					result_value = first_value.getDay();
				}
				break;
			case 'get weekday name':
				if (first_value){
					result_value = weekDayName[first_value.getDay()];
				}
				break;
			case 'get short-date':
				if (first_value) {
					console.log(first_value.toISOString().split('T')[0])
					result_value = first_value.toISOString().split('T')[0];
				}
				break;
			case 'get time':
				if (first_value) {
					result_value = first_value.toISOString().split('T')[1];
					result_value = result_value.split('.')[0];
				}
				break;
		}

		if (null !== denominator) {
			if (first_value && second_value){
				result_value = (first_value - second_value) / denominator;
			}
			else{
				result_value = null;
			}
		}

		this.message[this.get_attribute('map response to')] = result_value;
		this.next();
	}
}
