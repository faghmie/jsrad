var control_row_to_column = {
	type				: 'row_to_column',
	control_label		: 'Transform row to column',
	control_category	: 'Transformation',
	control_thumbnail	: 'class:la la-exchange',
	description			: 'Transform a row field into a column',
	
	_get_settings	: function(){
		if (typeof this.value !== "object") this.value = {};
		if (!this.value) this.value = {};
		
		var $this = this;
		
		return [
			['table data to transform', this.create_attribute('data')],
			['field for column', this.create_attribute('column')],
			['field for value', this.create_attribute('value')],
			['map response to', this.create_attribute('result', true)],
		];
	},
	
	execute: function(prev_node){
		var data = this.get_attribute('data'),
			column = this.get_attribute('column'),
			value = this.get_attribute('value'),
			item = null,
			key = null,
			index = null,
			row = null,
			col = null,
			fields = [],
			result = [],
			col_index = -1,
			val_index = -1,
			orig_len = null;
		
		
		data = data.splice(0);

		orig_len = data[0].length;
		
		for(index = 0; index < data[0].length; index++){
			if (data[0][index].toLowerCase() == column.toLowerCase()){
				key = index;
				break;
			}
		}
		col_index = key;
		
		if (null === key){
			return App.MessageError('Could not find ['+ column +'] in data-set');
		}
		
		for(index = 1; index < data.length; index++){
			if (fields.indexOf(data[index][key]) === -1)
				fields.push(data[index][key]);
		} 
		
		data[0] = data[0].concat(fields);
		
		key = null;
		for(index = 0; index < data[0].length; index++){
			if (data[0][index].toLowerCase() == value.toLowerCase()){
				key = index;
				break;
			}
		}
		
		if (null === key){
			return App.MessageError('Could not find ['+ value +'] in data-set');
		}
		val_index = key;
		var hdr = data.shift();

		//RELOOK THIS....NOT WORKING CORRECTLY
		for(index = 0; index < data.length; index++){
			row = data[index];
			for(col = 0; col < fields.length; col++){
				row.push(null);
			}
			
			for(col = 0; col < fields.length; col++){
				if (fields[col] == row[col_index])
					row[hdr.indexOf(fields[col])] = row[val_index];
			}
		}
		
		
		data = _.groupBy(data, function(item){
			var key = 'key';
			for(var i = 0; i < item.length; i++){
				if (i == col_index || i == val_index || i >= orig_len)
					continue;
				
				key += item[i];
			}
			
			return key;
		});

		data = _.map(data, function(items){
					var result = [],
						row = [];
					for(var i = 0; i < items.length; i++){
						row = items[i];
						for (var k = 0; k < row.length; k++){
							if (i === 0)
								result.push(row[k]);
							else {
								if (result[k] === null)
									result[k] = row[k];
							}
						}
						
					}
					
					return result;
				});
		
		data.unshift(hdr);
		
		this.message[this.get_attribute('result')] = data;
		
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
