var control_extract_columns = {
	type				: 'extract_columns',
	control_label		: 'Transform Extract Columns From Array',
	control_category	: 'Transformation',
	control_thumbnail	: 'class:la la-exchange',
	description			: 'Transform an array by extract some columns '+
							'and return the extracted columns as a new '+
							'array',
	
	field_list			: [],
	
	_get_settings	: function(){
		if (typeof this.value !== "object") this.value = {};
		if (!this.value) this.value = {};
		
		var $this = this;
		
		var fields = $('<textarea>').val($this.field_list.join('\r\n'));
		
		fields.on('input', function(evt){
			evt.stopPropagation();
			$this.field_list = $(this).val().split(/\r\n|\n|\r|,|;/);
		});
		
		return [
			['table data to transform', this.create_attribute('data')],
			['fields to extract', fields],
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
		fields = this.field_list.join('~^~').toLowerCase().split('~^~');
		console.log(keys);
		console.log(fields);
		
		for(index = 0; index < fields.length; index++){
			fields[index] = $.trim(fields[index]);
			item = fields[index];
			for(col = 0; col < keys.length; col++){
				if (keys[col] == item){
					hdr.push(data[0][col]);
					break;
				}
			}
		}
		
		result = [];
		for(index = 1; index < data.length; index++){
			result.push(_.object(keys, data[index]));
		}
		
		data = [hdr];
		
		for(index = 0; index < result.length; index++){
			row = [];
			
			for(col = 0; col < fields.length; col++){
				if (fields[col] in result[index])
					row.push(result[index][fields[col]]);
			}
			data.push(row);
		}
		
		console.log(data);
		
		this.message[this.get_attribute('result')] = data;
		
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
