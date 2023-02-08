import PropertyBase from "./PropertyBase.js";

export default class CustomProperties extends PropertyBase {
	widget = null;

	attached_object = null;

	constructor(_designer) {
		super();
		this._designer = _designer;
	}

	attach(obj) {
		var widget = $(`<div class="text-formater"></div>`);

		this.attached_object = obj;

		widget.append(this.make_custom(obj));

		return widget;
	}

	make_custom(obj) {
		var widget = $('<div>');
		var s = obj.get_settings();

		if (!(s instanceof Array)) s = [];

		
		// if (s.length > 0){
			this.add_separator('widget specific', widget)
		// }
		
		this.edit_label(obj, widget);
		
		s.forEach(item => {
			if (!(item instanceof Array) || item.length < 2) {
				return;
			}
			
			this._append_item(item[0], item[1], null, widget);
		});

		this.add_separator('generic / technical', widget);
		this.set_type(obj, widget);

		this.on_click_event(obj, widget);
		this.edit_name(obj, widget);
		this.edit_value(obj, widget);

		return widget;
	}

	add_separator(title, widget) {
		widget.append(`<div class="title-line">${title}</div>`);
	}

	set_type(obj, widget) {
		this._append_item('Control Type', `<span>${obj.type.replaceAll('./', '').toTitle().trim()}</span>`, null, widget);
	}

	on_click_event(obj, widget) {
		let prop = obj.get_link_form(false);

		this._append_item('when the user click go to....', prop, null, widget);
	}

	allow_inline_edit(obj, widget) {
		if (obj == obj.getForm()) {
			return;
		}

		let prop = $(`<input type="checkbox" class="form-control">`)
			.on('input', function (evt) {
				evt.stopPropagation();
				this.attached_object.make_inline(evt.target.checked);
			}.bind(this));


		if (obj.inline_editing === true)
			prop.attr('checked', 'checked');

		this._append_item('allow inline editor', prop, null, widget);
	}

	edit_label(obj, widget) {
		let prop = $(`<input class="form-control">`)
			.val(obj.label)
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.attached_object) return;
				this.attached_object.setLabel(evt.target.value);
			}.bind(this));

		this._append_item('label', prop, null, widget);
	}

	edit_name(obj, widget) {
		let prop = $(`<input class="form-control">`)
			.val(obj.name)
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.attached_object) return;
				this.attached_object.setName(evt.target.value);
			}.bind(this));

		this._append_item('name', prop, null, widget);
	}

	edit_value(obj, widget) {
		let prop = $(`<textarea class="form-control">`)
			.val(JSON.stringify(obj.value))
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.attached_object) return;
				this.attached_object.setValue(evt.target.value);
			}.bind(this));

		this._append_item('value', prop, null, widget);
	}

	detach() {
		this.attached_object = null;
	}
}
