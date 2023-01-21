var control_column_to_row = {
	type				: 'column_to_row',
	control_label		: 'Transform column to row',
	control_category	: 'Transformation',
	control_thumbnail	: 'class:la la-exchange',
	description			: 'Transform a column to a row.',
	
	_get_settings	: function(){
		if (typeof this.value !== "object") this.value = {};
		if (!this.value) this.value = {};
		
		var $this = this;
		
		return [
			['table data to transform', this.create_attribute('data')],
			['group data by', this.create_attribute('group_by', true)],
			['column to transform', this.create_attribute('column', true)],
			['field for column-name', this.create_attribute('header', true)],
			['field for column-value', this.create_attribute('value', true)],
			['map response to', this.create_attribute('result', true)],
		];
	},
	
	_extract_column: function(data, key_str){
		var group_by = this.get_attribute('group_by'),
			header = this.get_attribute('header'),
			value = this.get_attribute('value'),
			header_key = null,
			value_key = null,
			already_exist = true,
			header_value = null,
			keys = null,
			key = null,
			index = null,
			row_len = null,
			data_len = null,
			result = [],
			hdr = [];
		
		data = data.slice(0);
		keys = data[0].join('~^~').toLowerCase().split('~^~');
		header_key = keys.indexOf(header.toLowerCase());
		value_key = keys.indexOf(value.toLowerCase());
		key = keys.indexOf(key_str.toLowerCase());
		group_by = group_by.toLowerCase().split(/\r|\n|\r\n|,|;/);
		
		for(index = 0; index < group_by.length; index++){
			group_by[index] = keys.indexOf(group_by[index]);
		}
		
		if (header_key === -1){
			data[0].push(header);
			already_exist = false;
			header_key = data[0].length - 1;
		}
		
		if (value_key === -1){
			data[0].push(value);
			already_exist = false;
			value_key = data[0].length - 1;
		}
		
		if (key === -1){
			return App.MessageError('Could not find ['+ column +'] in data-set');
		}
		
			//console.log('\t>>'+key);
			header_value = data[0][key];
			data[0].splice(key, 1);
			
			if (false === already_exist){
				//console.log('data length: ' + data.length);
				for(index = 1; index < data.length; index++){
					data[index][header_key] = header_value;
					data[index][value_key] = data[index][key];
					data[index].splice(key, 1);
				}
			} else {
				hdr = data.shift();
				//FIRST GROUP BY THE KEYS
				data = _.groupBy(data, function(item){
					var key = 'key';
					for(var j = 0; j < group_by.length; j++){
						key += item[group_by[j]];
					}
					
					return key;
				});
				//console.log(data);
				result[0] = hdr;
				for(var k in data){
					var items = data[k],
						len = null;
					
					items.push(items[0].slice(0));
					len = items.length - 1;
					
					items[len][header_key] = header_value;
					items[len][value_key] = items[len][key];
					
					for(len = 0; len < items.length; len++){
						items[len].splice(key, 1);
						result.push(items[len]);
					}
				}
				
				data = result.slice(0);
			}
		//console.log(data);
		return data;
	},
	
	execute: function(prev_node){
		var data = this.get_attribute('data'),
			column = this.get_attribute('column'),
			col_key = null;
		
		if (!(data instanceof Array)){
			return App.MessageError(this.label+': Data is not an array');
		}
		
		column = column.toLowerCase().split(/,|;/);
		//console.log(data);
		for(col_key = 0; col_key < column.length; col_key++){
			data = this._extract_column(data, column[col_key]);
		}
		//console.log(data);
		this.message[this.get_attribute('result')] = data;
		
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
