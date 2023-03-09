var control_card = {
	type				: "card",
	control_label		: "Card",
	control_category	: null, //"Containers",
	control_thumbnail	: "images/widgets/card.png",
	properties	: {
			label			: "card",
			label_show	: false,
			label_align	: "hide",
			value			: {
					image			: "./images/logo.png",
					title			: "I.'m a card",
					text			: "put some text in here to display in the card",
					links			: "link-1",
					size			: "card-small",
					buttons		: "Link,Save",
				}
		},
	
	sizes			: ["card-small", "card-normal", "card-medium", "card-wide"],

	_toObject : function(obj){
		delete obj.sizes;
		
		return obj;
	},
	

	_resize: function(){
			this._format();
		},
		
	get_settings	: function(){
			if (typeof this.value !== "object") this.value = {};
			
			var $this = this;
			
			//TITLE
			var title = $("<input type='text'>").val(this.value.title);
			
			title.on("keyup", function(evt){
				evt.stopPropagation();
				$this.value.title = $(this).val();
				$this._format();
			});
			
			//TEXT
			var text = $("<textarea>").val(this.value.text);
			
			text.on("keyup", function(evt){
				evt.stopPropagation();
				$this.value.text = $(this).val();
				$this._format();
			});
			
			//BUTTONS
			var buttons = $("<input type='text'>").val(this.value.buttons);
			
			buttons.on("blur", function(){
				$this.value.buttons = $(this).val();
				$this._format();
			});
			
			//IMAGE
			var image = $("<input type='text'>").val(this.value.image);
			
			image.on("keyup blur", function(evt){
				evt.stopPropagation();
				if (evt.type === "keyup" && evt.which !== 13) return;
				
				$this.value.image = $(this).val();
				$this._format();
			});
			
			//SIZES
			var input_size = $("<select>");
			
			for(var i = 0; i < this.sizes.length; i++){
				input_size.append("<option>"+ this.sizes[i] +"</option>");
				if (this.sizes[i] === this.value.size)
					input_size.find("option:last").attr("selected", "selected");
			}
			
			
			input_size.on("change", function(){
				$this.value.size = $(this).val();
				$this._format();
			});
			
			return [
				["size", input_size],
				["image", image],
				["title", title],
				["text", text],
				["action buttons", buttons]
			];
		},
	
	_format		: function(){
			if (typeof this.value !== "object") this.value = {};
			if (typeof this.value.text !== "string") this.value.text = "";
			if (typeof this.value.title !== "string") this.value.title = "";
			if (typeof this.value.size !== "string") this.value.size = "card-small";
			if (typeof this.value.buttons !== "string") this.value.buttons = "";
			if (typeof this.value.image !== "string") this.value.image = "";
			
			this.dom.container.removeClass(this.sizes.join(" "));
			this.dom.container.addClass(this.value.size + " card ui-shadow");

			this.ctrl.find(".card-title").removeClass("card-image-title");
			this.ctrl.find(".card-title").html(this.value.title);
			this.ctrl.find(".card-text").html(this.value.text);
			
			this.ctrl.find(".card-img-top").hide();
			
			var btn_group = $('<div class="btn-group">');
			var btn_list = this.value.buttons.split(/,|;/g);
			for(var b = 0; b < btn_list.length; b++){
				var btn_text = $.trim(btn_list[b]);
				if (btn_text.length === 0) continue;
				
				btn_group.append('<button type="button" class="btn btn-link btn-outline">'+ btn_text +'</button>');
			}
			
			this.ctrl.find(".card-actions").children().remove();
			this.ctrl.find(".card-actions").hide();
			if (btn_group.find("button").length > 0){
				this.ctrl.find(".card-actions").show();
				this.ctrl.find(".card-actions").append(btn_group);
			}
			
			this.ctrl.find("img").hide();
			if (this.value.image !== ""){
				var img = this.ctrl.find("img");
				
				this.ctrl.find(".card-title").addClass("card-image-title");
				
				if (this.value.image.indexOf("class:") === 0){
					var cls = this.value.image.split("class:");
					img.addClass(cls[1]);
				} else {
					img
						.attr("src", this.value.image)
						.show();
				}
			}
		},
	
	getControl	: function(owner){
		this.ctrl = $('<div class="-card-small">' +
							'<img class="card-with-image" data-src="holder.js/100%x180/" alt="Card image cap">' +
						'<div class="card-title"></div>' +
						'<div class="card-text"></div>' +
						'<div class="card-actions">' +
							'<a href="#" class="btn btn-primary btn-outline">Button</a>' +
						'</div>' +
					'</div>');
		
		return this.ctrl;
	}
};
