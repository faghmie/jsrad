var control_file = {
	type				: "file",
	control_label		: "File Browser",
	control_category	: "Forms",
	control_thumbnail	: "images/widgets/file-browser.png",
	description			: 'File browser can load text files from disk',
	properties	: {
			height		: 35,
			width		: 200,
			label		: "file",
			//value		: '',
		},
	
	ignore_properties: [
			'on-click',
			'display name',
			'allow inline editor',
		],
	
	_change_mode: function(){
		if (window.File && window.FileReader && window.FileList && window.Blob){
			this.ctrl.off('change').on('change', this, function(evt){
				evt.data.load_file_from_disk();
			});
		}
	},
	
	load_file_from_disk: function(){
		var files = this.ctrl[0].files,
			$this = this;

		if (files.length === 0){
			//return App.MessageError('No file selected.');
			this.file_content = '';
		}
		table_name = files[0].name;

		var reader = new FileReader();
		this.file_content = '';
		reader.onload = function(){
			$this.file_content += $.trim(reader.result);
		};

		reader.readAsText(files[0]);
	},
	
	val: function(){
		return this.file_content;
	},
	
	setValue: function(value){
		
	},
	
	getControl	: function(owner){
		this.ctrl = $("<input type='file' class='form-control' >");
		
		return this.ctrl;
	}
};
