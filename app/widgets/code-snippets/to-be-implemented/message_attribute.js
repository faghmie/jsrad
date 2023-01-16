var control_message_attribute = {
	type				: 'message_attribute',
	control_label		: 'Add A Message Atttribute',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
		
    _get_settings	: function(){
			if (typeof this.value !== "object") this.value = {};
			if (!this.value) this.value = {};
			if (!this.message) this.message = {};
			var $this = this;
			
			//ATTRIBUTES
			var attr_name = $("<input type='text'>")
							.addClass('form-control')
							.val(this.value['@attribute-name']);
			
			var attr_value = this.create_attribute('@attribute-value', true);
			
			attr_name
				.on('focusin', this, function(evt){
					var $this = evt.data;
					var form = $this.getForm();
					evt.stopPropagation();
					delete $this.message[$this.value['@attribute-name']];
					delete form.message[$this.value['@attribute-name']];
				})
				.on('keydown', function(evt){
						evt.stopPropagation();
					})
				.on('input', this, function(evt){
					evt.stopPropagation();
					evt.data.value['@attribute-name'] = $(this).val();
				})
				.on('focusout', this, function(evt){
					
					evt.stopPropagation();
					evt.data.message[$this.value['@attribute-name']] = null;
				});
			
			return [
				['attribute name', attr_name],
				['attribute value', attr_value],
			];
		},
	
	execute: function(){
		//console.log(this.value);
		this.message[this.value['@attribute-name']] = this.get_attribute('@attribute-value');
		this.getForm().message[this.value['@attribute-name']] = this.get_attribute('@attribute-value');
		
		//console.log('moving from ? '+this.label);
		this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
