export default class ProjectProperties {

	attached_object = null;
	project = null;

	attach(project_manager, forms) {
		let widget = $('<div class="text-formater">');
		let project = project_manager.project;

		this.#edit_project_name(widget, project_manager.project);
		this.#edit_version(widget, project_manager.project);
		this.#edit_startup(widget, project_manager.project, forms);
		this.#edit_notes(widget, project_manager.project);

		return widget;
	}

	#edit_project_name(widget, project) {
		let prop = $(`<input class="form-control">`)
			.val(project.name)
			.on('input', function (evt) {
				project.name = evt.target.value;
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			}.bind(this));

		return $(`<div class="control-with-label"><label>name</label></div>`)
			.append(prop)
			.appendTo(widget);
	}

	#edit_version(widget, project) {
		let prop = $(`<input class="form-control">`)
			.val(project.version)
			.on('input', function (evt) {
				project.version = evt.target.value;
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			}.bind(this));

		return $(`<div class="control-with-label"><label>version</label></div>`)
			.append(prop)
			.appendTo(widget);
	}

	#edit_notes(widget, project) {
		let prop = $(`<textarea class="form-control project-notes">`)
			.val(project.description)
			.on('input', function (evt) {
				project.description = evt.target.value;
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			}.bind(this));

		return $(`<div class="control-with-label"><label>notes</label></div>`)
			.append(prop)
			.appendTo(widget);
	}

	#edit_startup(widget, project, forms) {
		let prop = $(`<select class="form-control form-select">`)
			.on('change', function (evt) {
				project.startup = evt.target.value;
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			}.bind(this));

		prop.append('<option>');

		for (let form of forms) {
			prop.append(`<option value="${form.uuid}">${form.label}</option>`);
			if (form.uuid == project.startup) {
				prop.find('option:last-child').attr('selected', 'selected');
			}
		}

		return $(`<div class="control-with-label"><label>start-up form</label></div>`)
			.append(prop)
			.appendTo(widget);
	}
}
