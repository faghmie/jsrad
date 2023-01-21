var control_array_count_if = {
	type				: 'array_count_if',
	control_label		: 'Transform Count If Array',
	control_category	: 'Transformation',
	control_thumbnail	: 'class:la la-exchange',
	description			: 'Count rows in a table if the specified colums '+
						' passes the IF condition.',
	
	compare_types 		: {
						'is blank': function(val){ return val.toString().trim().length === 0;},
						'is NOT blank': function(val){ return val.toString().trim().length !== 0;},
						'is TRUE': function(val){ return val === true || val === 1 || val.toString().trim().toLowerCase() === 'true';},
						'is FALSE': function(val){ return val === false || val === 0 || val.toString().trim().toLowerCase() === 'false';}, 
						'less than zero': function(val){ return isNaN(parseInt(val)) ? false : (parseInt(val) < 0 ? true : false);},
						 'greater than zero': function(val){ return isNaN(parseInt(val)) ? false : (parseInt(val) > 0 ? true : false);},
						//'less than', 
						//'greater than',
						//'starts with', 
						//'ends with',
						//'contains'
					},
					
    _get_settings	: function(){
			if (typeof this.value !== "object") this.value = {};
			if (!this.value) this.value = {};
			
			var $this = this,
				index = 0;
			
			//ALTERNATE STEP STEP
			var comparison = $('<select>')
						.addClass('form-control input-sm');
			
			for(var key in this.compare_types){
				comparison.append('<option>'+key+'</option>');
				if (key == $this.value.comparison)
					comparison.find('option:last-child').attr('selected', 'selected');
			}
			
			comparison
				.on('change', this, function(evt){
					evt.data.value.comparison = $(this).val();
				});
			
			comparison.trigger('change');
			
			return [
				['table data to transform', this.create_attribute('_array_')],
				['affected field', this.create_attribute('field', true)],
				['condition', comparison],
				['map response to', this.create_attribute('result', true)],
			];
		},
	
	execute: function(){
		var list = this.get_attribute('_array_'),
			field = this.get_attribute('field'),
			compare = this.value.comparison,
			index = null,
			number = 0;
		
		compare = this.compare_types[compare];
		console.log(list);
		for(var key = 0; key < list[0].length; key++){
			if (list[0][key].toLowerCase() == field){
				index = key;
				break;
			}
		}
		
		number = 0;
		for(key = 1; key < list.length; key++){
			console.log(list[key][index]);
			if (compare(list[key][index]) === true){
				number++;
			}
		}

		this.message[this.get_attribute('result')] = number;
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
