var control_ws_post_simple_request = {
	type				: 'ws_post_simple_request',
	control_label		: 'Webservice Simple POST Request',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	description			: 'Make simplified web-service GET requests',
	
    _get_settings	: function(){

		return [
			['URL to service', this.create_attribute('ws-url')],
			['map response to', this.create_attribute('result', true)],
		];
	},
	
	execute: function(){
		var url = this.get_attribute('ws-url'),
			result = this.get_attribute('second'),
			$this = this;
		
		$.post(url, function(data){
			$this.message[$this.get_attribute('result')] = data;
			$this.next();
		})
		.fail(function(err){
			console.log(err);
			App.MessageError('Failed to call remote-service at: '+ url);
		})
		.always(function(){});
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
