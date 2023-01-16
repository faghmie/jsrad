var control_message_logger = {
	type				: "message_logger",
	control_label		: "Message Logger (for debugging)",
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	
	execute: function(){
		logger.log(this, 'Message in process?');
		logger.log(this, this.message);
		logger.log(this, 'Message at form level?');
		logger.log(this, this.getForm().message);
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
