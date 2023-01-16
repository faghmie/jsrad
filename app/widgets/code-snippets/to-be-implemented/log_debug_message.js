var control_log_debug_message = {
	type				: 'log_debug_message',
	control_label		: 'Log Debug Message',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	
	value:{
		message: 'got here',
	},
	
    _get_settings	: function(){
			if (typeof this.value !== "object") this.value = {};
			if (!this.value) this.value = {};
			
			var $this = this;
			
			//ATTRIBUTES
			var message = this.create_attribute('message');
						
			return [
				['message', message],
			];
		},
	
	execute: function(prev_node){
		console.log(this.get_attribute('message'));
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
