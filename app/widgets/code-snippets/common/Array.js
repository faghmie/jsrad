import BaseActivity from "../BaseActivity.js";

export default class ArrayActivity extends BaseActivity {
	get_settings() {
		let transformations = [
			'SUM', 'MAX', 'MIN', 'AVERAGE',
			'COUNT', 'IS AN ARRAY', 'REVERSE',
			'SORT SMALL TO BIG', 'SORT BIG TO SMALL', 'FIRST VALUE', 'LAST VALUE'].sort();

		//ICON POSITION
		let transformation = $('<select>')
			.addClass('form-control input-sm')
			.append("<option></option>");


		transformations.forEach(item => {
			transformation.append(`<option>${item}</option>`);
			if (this.transformation == item) {
				transformation.find('option:last-child').attr('selected', 'selected');
			}
		});

		transformation.on('change', function (evt) {
			this.transformation = evt.target.value;
		}.bind(this));

		return [
			...super.get_settings(),
			['transformation', transformation],
			...this.create_attribute('array'),
			...this.create_attribute('map response to', true),
		];
	}

	execute() {
		let list = this.get_attribute('array'),
			number = 0;


		list = this.make_array(list);

		switch (this.transformation) {
			case 'FIRST VALUE':
				number = list.shift();
				break;
			case 'LAST VALUE':
				number = list.pop();
				break;
			case 'SORT SMALL TO BIG':
				number = list.sort();
				break;
			case 'SORT BIG TO SMALL':
				number = list.sort().reverse();
				break;
			case 'REVERSE':
				number = list.reverse();
				break;
			case 'IS AN ARRAY':
				number = (list instanceof Array);
				break;
			case 'SUM':
				number = this.sum(list);
				break;
			case 'MAX':
				number = this.max(list);
				break;
			case 'MIN':
				number = this.min(list);
				break;
			case 'AVERAGE':
				number = this.average(list);
				break;
			case 'COUNT':
				number = list.length;
				break;
		}
		this.message[this.get_attribute('map response to')] = number;
		this.next();
	}

	sum(list) {
		let number = null;
		list.forEach(val => {
			if (!isNaN(parseFloat(val))) {
				number += parseFloat(val);
			}
		});
		return number
	}

	max(list) {
		let number = null;
		list.forEach(val => {
			if (!isNaN(parseFloat(val))) {
				if (number === null || parseFloat(val) > number) {
					number = parseFloat(val);
				}
			}
		});

		return number;
	}

	min(list) {
		let number = null;
		list.forEach(val => {
			if (!isNaN(parseFloat(val))) {
				if (number === null || parseFloat(val) < number) {
					number = parseFloat(val);
				}
			}
		});

		return number;
	}
	average(list) {
		let number = 0;
		let counter = 0;
		list.forEach(val => {
			if (!isNaN(parseFloat(val))) {
				number += parseFloat(val);
				counter++;
			}
		});

		if (counter > 0) {
			number = number / (1.000 * counter);
		}
		return number;
	}

	make_array(list) {
		if (list instanceof Array) {
			return list;
		}

		if (typeof list == 'string') {
			list = list.trim();
			if (list[0] === '[') {
				list = JSON.parse(list);
			} else {
				list = list.split(',');
			}
		} else {
			list = [];
		}
		return list;
	}
}
