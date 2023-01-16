var control_hr = {
	type				: 'hr',
	control_label		: 'Horizontal Line',
	control_category	: 'HTML',
	control_thumbnail	: 'images/widgets/hr.png',
	properties	: {
			height			: 30,
			width			: 200,
			height_fixed	: true
		},
		
	ignore_properties: [
			'when the user click go to....',
			'display name',
			'allow inline editor',
		],
	
	getControl	: function(owner){
		this.ctrl = $('<hr/>');
		
		return this.ctrl;
	}
};
