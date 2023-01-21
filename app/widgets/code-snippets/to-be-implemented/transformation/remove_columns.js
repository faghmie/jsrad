var control_remove_columns = {
	type				: 'remove_columns',
	control_label		: 'Transform Remove Columns From Array',
	control_category	: 'Transformation',
	control_thumbnail	: 'class:la la-exchange',
	description			: 'Transform an array by removing some columns '+
							'and return a new array without the columns ',
	
	field_list			: [],
	
	_get_settings	: function(){
		if (typeof this.value !== "object") this.value = {};
		if (!this.value) this.value = {};
		
		var $this = this;
		
		var fields = $('<textarea>').val($this.field_list.join('\r\n'));
		
		fields.on('input', function(evt){
			evt.stopPropagation();
			$this.field_list = $(this).val().split(/\r\n|\n|\r/);
		});
		
		return [
			['table data to transform', this.create_attribute('data')],
			['fields to remove', fields],
			['map response to', this.create_attribute('result', true)],
		];
	},
	
	execute: function(prev_node){
		var data = this.get_attribute('data'),
			item = null,
			keys = [],
			index = null,
			row = null,
			col = null,
			fields = [],
			result = [],
			hdr = [];
		
		keys = data[0].join('~^~').toLowerCase().split('~^~');
		result = this.field_list.join('~^~').toLowerCase().split('~^~');
		
		for(index = 0; index < keys.length; index++){
			if (result.indexOf(keys[index]) === -1) 
				fields.push(keys[index]);
		}
		
		for(index = 0; index < fields.length; index++){
			item = fields[index];
			for(col = 0; col < keys.length; col++){
				if (keys[col] == item){
					hdr.push(data[0][col]);
					break;
				}
			}
		}
		
		logger.log(data);
		logger.log(fields);
		logger.log(keys);
		result = [];
		for(index = 1; index < data.length; index++){
			result.push(_.object(keys, data[index]));
		}
		logger.log(result);
		
		data = [hdr];
		
		for(index = 0; index < result.length; index++){
			row = [];
			
			for(col = 0; col < fields.length; col++){
				row.push(result[index][fields[col]]);
			}
			data.push(row);
		}
		
		this.message[this.get_attribute('result')] = data;
		
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
