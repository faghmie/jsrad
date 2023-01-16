var control_radio = {
	type				: "radio",
	control_label		: "Radio",
	control_category	: "Common",
	control_thumbnail	: "images/widgets/radio.png",
	properties	: {
			height		: 120,
			width			: 80,
			value			: "Option-1,Option-2,Option-3"
		},
	
	ignore_properties: [
			'when the user click go to....',
			'display name',
			'allow inline editor',
		],
	
	val			: function(){
			return this.ctrl.find("input:radio:checked").val();
		},
	
	setValue		: function(value){
			this.value = typeof value !== "undefined" ? value : this.value;
			
			this.ctrl.children().remove();
			var parts = [];
			if (this.value instanceof Array){
				parts = this.value.splice(0);
			} else if (typeof this.value === "string") {
				parts = this.value.split(/\n|\r|,/);
			}
			
			for(var index = 0; index < parts.length; index++){
				var opt = null;
				if (parts[index] instanceof Array){
					opt = $('<div class="radio"><label><input type="radio" id="'+this.name+'-id-'+index+'" name="'+this.name+'-radio" value="'+parts[index][0]+'" >'+parts[index][1]+'</label></div>');
					
				} else if (typeof parts[index] === "string"){
					opt = $('<div class="radio"><label><input type="radio" id="'+this.name+'-id-'+index+'" name="="'+this.name+'-radio" value="'+parts[index]+'" >'+parts[index]+'</label></div>');
				}
				
				this.ctrl.append(opt);
			}

		},
		
	setSelected		: function(value){
			if (typeof value === "string") value = $.trim(value);
			this.ctrl.find("input").each(function(){
				var opt = $(this);
				opt.removeAttr("checked");
				if (opt.val() === value) opt.attr("checked", "checked");
			});
			
			this.ctrl.buttonset();
		},
		
	getControl	: function(owner){
		this.ctrl = $('<div>');
		return this.ctrl;
	}
};
