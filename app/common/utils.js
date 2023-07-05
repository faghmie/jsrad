String.prototype.toTitle = function () {
	return this.replace(/(^|\s)\S/g, function (t) {
		return t.toUpperCase();
	});
}

function csv_to_array(csv, separator, quote) {
	const rows = csv.trim().split('\n');

	if (typeof separator !== 'string') separator = ',';

	const data = rows.map(row => {
		if (typeof quote === 'undefined'){
			return row.split(separator);
		}

		const values = [];
		let insideQuotes = false;
		let currentValue = '';

		// Split the row
		row.forEach(char => {
			if (char === separator && !insideQuotes) {
				values.push(currentValue);
				currentValue = '';
			} else if (char === quote) {
				insideQuotes = !insideQuotes;
			} else {
				currentValue += char;
			}
		});

		values.push(currentValue);
		return values;
	});

	return data;
}

function generate_uuid() {
	/*
	 * source: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	 */
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}