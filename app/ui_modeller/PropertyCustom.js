import Dialog from "../common/Dialog.js";
import PropertyDatasource from "./PropertyDatasource.js";
import Toolbox from "./Toolbox.js";

export default class CustomProperties extends PropertyDatasource {
	widget = null;

	/** @type{ControlInterface|undefined} */
	ctrl = null;

	constructor(_designer) {
		super();

		this._designer = _designer;
	}

	attach(obj) {
		let widget = $(`<div class="text-formater"></div>`);

		this.ctrl = obj;

		widget.append(this.make_custom(obj));

		return widget;
	}

	make_custom(obj) {
		let widget = $('<div>');
		let s = obj.get_settings();

		if (!(s instanceof Array)) s = [];

		// this.set_type(obj, widget);

		this.add_separator('widget specific', widget)

		this.edit_label(obj, widget);

		s.forEach(item => {
			if (!(item instanceof Array) || item.length < 2) {
				return;
			}

			this.append_item(item[0], item[1], widget);
		});

		this.remove_empty_group(widget);

		this.add_separator('generic / technical', widget);

		this.on_click_event(obj, widget);
		this.edit_name(obj, widget);
		this.edit_value(obj, widget);

		this.remove_empty_group(widget);

		this.data_awareness(widget);

		this.remove_empty_group(widget);

		return widget;
	}

	add_separator(title, widget) {
		widget.append(`<div class="title-line">${title}</div>`);
	}

	remove_empty_group(widget) {
		let last_child = widget.children().last();
		if (last_child.hasClass('title-line')) {
			last_child.remove();
		}
	}

	set_type(obj, widget) {
		let s = obj.type.replaceAll('./', '').split('/');
		let idx = 0;
		while (s.length > 2 && idx < 10) {
			s.shift();
			idx++;
		}

		let type = $(`<span> ${s.join('/').toTitle().trim()}</span>`);
		widget.append(type)
		
		this.show_remove(obj, type);
		this.show_description(obj, type);

	}

	show_description(obj, widget) {
		Toolbox.FetchWidgetInfo(obj.type).then(widget_info => {
			if (!widget_info.description) {
				return;
			}
			let info = $(`<button><i class="la la-info-circle"></i></button>`)
				.on('click', function () {
					new Dialog($(`<p>${widget_info.description.trim()}</p>`), {
						'width': '40vw',
						'min-width': '40vw',
						'max-width': '40vw'
					});
				});
			widget.after(info);
		});
	}

	show_remove(obj, widget) {
		if (obj.type.includes('Form')){
			return;
		}
		
		let btn = $(`<button><i class="la la-trash"></i></button>`)
			.on('click', function () {
				document.dispatchEvent(new CustomEvent('ide-control-remove'));
			});

		widget.after(btn);
	}

	on_click_event(obj, widget) {
		let prop = obj.get_link_form(false);

		this.append_item('on-click', prop, widget);
	}

	allow_inline_edit(obj, widget) {
		if (obj == obj.getForm()) {
			return;
		}

		let prop = $(`<input type="checkbox" class="form-control">`)
			.on('input', function (evt) {
				evt.stopPropagation();
				this.ctrl.make_inline(evt.target.checked);
			}.bind(this));


		if (obj.inline_editing === true)
			prop.attr('checked', 'checked');

		this.append_item('allow inline editor', prop, widget);
	}

	edit_label(obj, widget) {
		let prop = $(`<input class="form-control">`)
			.val(obj.label)
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.ctrl) return;
				this.ctrl.setLabel(evt.target.value);
			}.bind(this));

		this.append_item('label', prop, widget);
	}

	edit_name(obj, widget) {
		let prop = $(`<input class="form-control">`)
			.val(obj.name)
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.ctrl) return;
				this.ctrl.setName(evt.target.value);
			}.bind(this));

		this.append_item('name', prop, widget);
	}

	edit_value(obj, widget) {
		let prop = $(`<textarea class="form-control">`)
			.val(JSON.stringify(obj.value))
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.ctrl) return;
				this.ctrl.setValue(evt.target.value);
			}.bind(this));

		this.append_item('value', prop, widget);
	}

	append_item(text, control, widget, skip_ignore = false) {
		if (!this.ctrl) {
			return;
		}

		if (skip_ignore !== true &&
			(this.ctrl.ignore_properties instanceof Array) &&
			(this.ctrl.ignore_properties.indexOf(text) !== -1)) {
			return;
		}

		// control = $(control).addClass('form-control');
		let div = $(`<div class="control-with-label"><label>${text.trim()}</label></div>`)
			.append(control)
			.appendTo(widget);
	}
}
