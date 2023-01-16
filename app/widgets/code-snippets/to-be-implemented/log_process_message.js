var control_log_process_message = {
	type				: 'log_process_message',
	control_label		: 'Debug Process Message',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	
	value:{
		message: 'got here',
	},
	
	execute: function(){
		logger.log($.extend({}, this.message));
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
