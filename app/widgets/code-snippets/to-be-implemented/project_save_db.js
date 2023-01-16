var control_project_save_db = {
	type				: 'project_save_db',
	control_label		: 'Database Save',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
		
    _get_settings	: function(){
			//ATTRIBUTES
			var attribute = this.create_attribute('current_timestamp', true);
			
			return [
				['map value to', attribute],
			];
		},
	
	execute: function(){
		var db_list = [],
			$this = this;
		
		for(var db in App.datasources){
			if (App.datasources[db].is_dirty === true)
				db_list.push(db);
		}
		
		function save_erd(db){
			var erd = new SQL.Designer('<div>');
			
			erd.fromObject(App.datasources[db], false, function(){
				erd.project_save(function(){
					if (db_list.length > 0) 
						save_erd(db_list.shift());
					else {
						$this.next();
					}
				});
			});
		}
		
		if (db_list.length > 0) 
			save_erd(db_list.shift());
		else		
			$this.next();
	},
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
