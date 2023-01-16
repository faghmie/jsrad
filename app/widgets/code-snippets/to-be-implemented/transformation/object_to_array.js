var control_object_to_array = {
	type				: 'object_to_array',
	control_label		: 'Object To Array',
	control_category	: 'Transformation',
	control_thumbnail	: 'class:fa fa-exchange',
	description			: 'Convert either a single object, or an array'+
						' of objects into an array',
	
	_get_settings	: function(){
		if (typeof this.value !== "object") this.value = {};
		if (!this.value) this.value = {};
		
		var $this = this;
		
		//ATTRIBUTES
		var message = this.create_attribute('message');
					
		return [
			['object to convert', this.create_attribute('_object_')],
			['map response to', this.create_attribute('result', true)],
		];
	},
	
	execute: function(prev_node){
		var data = [],
			row = null,
			rows = this.get_attribute('_object_'),
			item = null,
			key = null,
			index = null;
		
		row = rows[0];
		data.push([]);
		for(key in row){
			data[0].push(key);
		}
		
		for(index = 0; index < rows.length; index++){
			row = rows[index];
			item = [];
			
			for(key in row){
				item.push(row[key]);
			}
			data.push(item);
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
