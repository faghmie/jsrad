var control_stickman = {
	type				: 'stickman',
	control_label		: 'Stickman',
	control_category	: 'Shape',
	control_thumbnail	: 'class:la la-odnoklassniki',
	
    create_shape: function(){
        var head = $('<div>').addClass('circle').appendTo(this.ctrl);
		head.css({
			'background': 'transparent',
			'width': parseFloat(this.height)*0.25,
			'height': parseFloat(this.height)*0.25,
			'opacity': parseFloat(this.opacity),
			'border-style': this.style['border-style'],
			'border-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			position : 'absolute',
			left: 0,
			top : 0
		});
		
		var body = $('<div>').appendTo(this.ctrl);
		body.css({
			background: 'transparent',
			'width': parseFloat(head.css('width'))*0.5 + parseFloat(this.style['border-width'])*0.5,
			border: 0,
			'height': parseFloat(this.height)*0.5,
			'opacity': parseFloat(this.opacity),
			'border-style': this.style['border-style'],
			'border-right-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			position : 'absolute',
			
			top : parseFloat(this.height)*0.24,
		});
		
        var arms = $('<div>').appendTo(this.ctrl);
		arms.css({
			background : 'transparent',
			width : parseFloat(body.css('width'))*2,
			height : 0,
			opacity: parseFloat(this.opacity),
			'border-width': 0,
			'border-style': this.style['border-style'],
			'border-top-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			position : 'absolute',
			left : 0,
			top : parseFloat(this.height)*0.35,
		});
		
        var legs = $('<div>').appendTo(this.ctrl);
		legs.css({
			background : 'transparent',
			width : parseFloat(head.css('width'))*0.75,
			height : parseFloat(head.css('width'))*0.75,
			opacity: parseFloat(this.opacity),
			'border-width': 0,
			'border-style': this.style['border-style'],
			'border-right-width': parseFloat(this.style['border-width']) + 'px',
			'border-top-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			'-ms-transform' : 'rotateZ(-45deg)',
			'-webkit-transform' : 'rotateZ(-45deg)',
			'-moz-transform' : 'rotateZ(-45deg)',
			'transform' : 'rotateZ(-45deg)',
			'-webkit-transform-origin' : 'right',
			position : 'absolute',
			left : 0,//parseFloat(head.css('width'))*0.75*0.125,
			top : parseFloat(this.height)*0.20 + body.height(),
		});
		
		
		this.aspect_ratio = this.width / this.height;
		if (this.dom.container.is('.ui-resizable'))
			this.dom.container.resizable('option', 'aspectRatio', this.aspect_ratio);
		
		this.caption_align = 'bottom';
    },

	getControl	: function(owner){
		IControl.extend(this, base_shape);
		this.ctrl = $('<div>');
		
		this.properties.width = 50;
		this.properties.height = 200;
		this.style['border-width'] = 5;
		return this.ctrl;
	}
};
