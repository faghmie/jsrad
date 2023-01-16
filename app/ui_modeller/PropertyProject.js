import PropertyBase from "./PropertyBase.js";

export default class ProjectProperties extends PropertyBase {

	attached_object		= null;
	project = null;
	
	attach(project_manager, forms){
		let widget = $('<div class="text-formater">');
		let project = project_manager.project;

		let s = [
				['project name', '<input class="project-name"/>'],
				['version', '<input class="project-version"/>'],
				['notes', '<textarea class="project-notes"/>'],
				['startup form', '<select class="project-startup"/>'],
			];
		
		s.forEach(function(item){
			this._append_item(item[0], item[1], null, widget);
		}.bind(this))
		
		widget.find('.project-name').val(project.name);
		widget.find('.project-version').val(project.version);
		widget.find('.project-notes').val(project.description);
		
		let select = widget.find('.project-startup');
		select.append('<option>');

		for(let form of forms){
			select.append(`<option value="${form.uuid}">${form.label}</option>`);
			if (form.uuid == project.startup){
				select.find('option:last-child').attr('selected', 'selected');
			}
		}
		
		widget.on('change', '.project-startup', function(evt){
			project.startup = evt.target.value;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));
		
		widget.on('input', '.project-name', function(evt){
			project.name = evt.target.value;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));
		
		widget.on('input', '.project-version', function(evt){
			project.version = evt.target.value;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));
		
		widget.on('input', '.project-notes', function(evt){
			project.description = evt.target.value;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));
		
		return widget;
	}
}
