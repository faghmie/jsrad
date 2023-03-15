
function csv_to_array(text, separator, quote) {
	if (typeof text === 'undefined' || null === text || text.length === 0) {
		alert('No CSV text provided');
		return [];
	}

	if (typeof separator !== 'string') separator = ',';
	if (typeof quote !== 'string') quote = '"'; //'\'';

	//CRAWL THROUGH THE TEXT AND REPLACE LINE-BREAKS THAT IS IN QUOTES WITH \n 
	var quote_started = false,
		str_array = text.split(/|/),
		lines = [],
		row = [],
		col_start = 0,
		str = null,
		re = null;
	//console.log(text);
	for (var index = 0; index < str_array.length; index++) {
		if (str_array[index] === quote && quote_started === false) {
			quote_started = true;
			col_start = index;

		} else if (str_array[index] === quote && quote_started === true) {
			quote_started = false;
		}

		if ((str_array[index] === '\n' || str_array[index] === '\r') && quote_started === true) {
			str_array[index] = '\\n';

		} else if ((str_array[index] === separator) && quote_started === false) {
			str = text.substr(col_start, index - col_start);
			re = new RegExp(quote, 'g');
			str = str.replace(re, '');
			str = str.replace(new RegExp('&', 'g'), ' and ');
			str = str.replace(new RegExp('"', 'g'), '\'');
			row.push(str);
			col_start = index + 1;

			//WHEN THE LAST COLUMN IN THE LAST ROW IS BLANK
			//THIS PREVENTS LOOSING THE LINE
			if (col_start >= str_array.length)
				lines.push(row);

		} else if ((str_array[index] === '\n' || str_array[index] === '\r' || index >= str_array.length - 1)) { // && quote_started === false){
			str = text.substr(col_start, index - col_start);
			re = new RegExp(quote, 'g');

			str = str.replace(re, '');
			str = str.replace(new RegExp('&', 'g'), ' and ');
			str = str.replace(new RegExp('\'', 'g'), '\'');
			row.push(str);

			lines.push(row);
			row = [];

			if ((str_array[index + 1] === '\n' || str_array[index + 1] === '\r')) index++;

			col_start = index + 1;

		}
	}
	//console.log(lines);
	return lines;
}

function update_table_format(table) {
	table = $(table);

	var tbody = table.children('tbody');

	tbody.find('tr')
		.hover(
			function () {
				$(this).addClass('ui-state-hover');
				$(this).css('cursor', 'pointer');
			},
			function () {
				$(this).removeClass('ui-state-hover');

				$(this).css('cursor', 'default');
			}
		);
}

function set_date_field(field) {
	$(field).datepicker({
		dateFormat: 'dd MM yy'
	});
}

function set_datetime_field(field) {
	$(field).datetimepicker({
		dateFormat: 'dd MM yy'
	});
}

function in_array(obj, arr_list) {
	//DOES NOT DEAL WITH NESTED ARRAYS.....NOT OF INTEREST IN MY PROJECT.
	for (var index = 0; index < arr_list.length; index++) {
		var item = arr_list[index];

		if (typeof (obj) === typeof (item)) {
			var same = true; //ASSUME IT IS THE SAME

			for (var key in obj) {
				if (typeof (item[key]) === 'undefined') {
					same = false;
				} else if (typeof (item[key]) !== typeof (obj[key])) {
					same = false;
				} else if (typeof (item[key]) === 'object') {
					//TO BE IMPLEMENTED.
				} else if (item[key] !== obj[key]) {
					same = false;
				}
			}

			if (same === true) return true;
		}
	}

	return false;
}

String.prototype.toTitle = function () {
	return this.replace(/(^|\s)\S/g, function (t) {
		return t.toUpperCase();
	});
}

Date.createFromMySql = function (mysql_string, date_only) {
	if (typeof mysql_string === 'string' && mysql_string.length >= 10) {
		var t = mysql_string.split(/[- :]/);
		if (date_only && date_only === true)
			return new Date(t[0], t[1] - 1, t[2], 0, 0, 0);
		else
			return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
	}

	return null;
};

Date.createDatabaseField = function (mysql_string, date_only) {
	if (typeof mysql_string === 'string' && mysql_string.length >= 10) {
		var t = mysql_string.split(/[- :]/);
		if (date_only && date_only === true)
			return new Date(t[0], t[1] - 1, t[2], 0, 0, 0);
		else
			return new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
	}

	return null;
};

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