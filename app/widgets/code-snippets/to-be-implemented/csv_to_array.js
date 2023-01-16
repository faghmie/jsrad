var control_csv_to_table = {
	type				: 'csv_to_table',
	control_label		: 'Transform CSV To Table',
	control_category	: 'Transformation',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	description			: 'Converts CSV text data to a table/array',
		
    _get_settings	: function(){
		return [
			['CSV data', this.create_attribute('csv')],
			['map response to', this.create_attribute('result', true)],
		];
	},
	
	execute: function(){
		//console.log(this.get_attribute('csv'));
		this.message[this.get_attribute('result')] = csv_to_array(this.get_attribute('csv'));
		//console.log(this.message[this.get_attribute('result')]);
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
