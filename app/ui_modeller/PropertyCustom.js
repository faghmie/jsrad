import PropertyBase from "./PropertyBase.js";

export default class CustomProperties {
	widget = null;

	/** @type{ControlInterface|undefined} */
	ctrl = null;

	constructor(_designer) {
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

		this.set_type(obj, widget);

		this.add_separator('widget specific', widget)

		this.edit_label(obj, widget);

		s.forEach(item => {
			if (!(item instanceof Array) || item.length < 2) {
				return;
			}

			this.#append_item(item[0], item[1], widget);
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

		widget.append(`<span> ${s.join('/').toTitle().trim()}</span>`);
	}

	on_click_event(obj, widget) {
		let prop = obj.get_link_form(false);

		this.#append_item('on-click', prop, widget);
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

		this.#append_item('allow inline editor', prop, widget);
	}

	edit_label(obj, widget) {
		let prop = $(`<input class="form-control">`)
			.val(obj.label)
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.ctrl) return;
				this.ctrl.setLabel(evt.target.value);
			}.bind(this));

		this.#append_item('label', prop, widget);
	}

	edit_name(obj, widget) {
		let prop = $(`<input class="form-control">`)
			.val(obj.name)
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.ctrl) return;
				this.ctrl.setName(evt.target.value);
			}.bind(this));

		this.#append_item('name', prop, widget);
	}

	edit_value(obj, widget) {
		let prop = $(`<textarea class="form-control">`)
			.val(JSON.stringify(obj.value))
			.on('input', function (evt) {
				evt.stopPropagation();
				if (!this.ctrl) return;
				this.ctrl.setValue(evt.target.value);
			}.bind(this));

		this.#append_item('value', prop, widget);
	}

	// Data aware properties
	data_awareness(widget) {
		if (!this.ctrl || !this.ctrl.datamodel || !this.ctrl.is_data_aware) {
			return;
		}


		this.ctrl.filter ||= {};

		this.add_separator('data model', widget);

		this.#append_item('entity', this.#make_table_selector(), widget);
		this.#append_item('filter', this.#make_filter_mapper_button(), widget);
		this.#append_item('values', this.#make_mapper_button(), widget);
		this.#append_item('fields', this.#make_field_mapper_button(), widget);

	}

	open_field_selector() {
		//ON THIS CHANGE WE LOAD THE TABLES
		let fields = [],
			mapper = $(`<div class="text-formater"></div>`);

		/** @type{SqlField|undefined} */
		let col = null;

		let table = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
		if (!table) return;

		this.ctrl.data_fields ||= [];

		for (col of table) {
			fields.push(col);
		}

		fields = fields.sort(function (a, b) {
			return (a.title || '').localeCompare(b.title);
		});

		fields.forEach(function (col) {
			let chk = $(`<input type="checkbox" value="${col.uuid}">`);

			if (this.ctrl.data_fields.indexOf(col.uuid) != -1) {
				chk[0].checked = true;
			}

			this.#append_item(col.title, chk, mapper, true);
		}.bind(this));

		mapper.find('input').on('click', function (evt) {
			console.log(evt.target);
			let ctrl = this.ctrl;

			if (this.ctrl.data_single_field_selector === true) {
				mapper.find('input').each(function () {
					console.log(this)
					if (this != evt.target) {
						this.checked = false;
					}
				});
			}

			//Reset list and only added selected items
			ctrl.data_fields = [];
			mapper.find('input').each(function () {
				console.log(this)
				if (this.checked) {
					ctrl.data_fields.push(this.value);
				}
			});

			console.log(ctrl.data_fields)
		}.bind(this));

		open_card(mapper, {
			title: 'Field Selector',
			'width': '30vw',
			'min-width': '30vw',
			'max-width': '30vw',
			'height': '60vh',
			'min-height': '60vh',
			'max-height': '60vh',
		});
	}

	open_mapper() {
		//ON THIS CHANGE WE LOAD THE TABLES
		let fields = [],
			mapper = $(`<div class="process-atrr-map"></div>`);

		/** @type{SqlField|undefined} */
		let col = null;

		let table = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
		if (!table) return;

		for (col of table) {
			fields.push(col);
		}

		fields = fields.sort(function (a, b) {
			return (a.title || '').localeCompare(b.title);
		});
		mapper.append(`
			<div class="header">Field</div>
			<div class="header">Value</div>
			<div class="header">Select Source</div>
		`);

		fields.forEach(function (col) {
			let field = this.ctrl.create_attribute(col.uuid);

			mapper.append(`<div class="first-col" value="${field.uuid}">${col.title}</div>`);

			let div = $(`<div></div>`).append(field[0][1]).appendTo(mapper);

			div = $(`<div></div>`).append(field[1][1]).appendTo(mapper);
		}.bind(this));

		open_card(mapper, {
			title: 'Map database fields',
			'width': '60vw',
			'min-width': '60vw',
			'max-width': '60vw',
			'height': '60vh',
			'min-height': '60vh',
			'max-height': '60vh',
		});
	}

	open_filter_mapper() {
		//ON THIS CHANGE WE LOAD THE TABLES
		let fields = [],
			mapper = $(`<div class="process-atrr-map"></div>`);

		/** @type{SqlField|undefined} */
		let col = null;

		let table = this.ctrl.datamodel.TableManager.tables[this.ctrl.entity];
		if (!table) return;

		for (col of table) {
			fields.push(col);
		}

		fields = fields.sort(function (a, b) {
			return (a.title || '').localeCompare(b.title);
		});
		mapper.append(`
			<div class="header">Field</div>
			<div class="header">Value</div>
			<div class="header">Select Source</div>
		`);

		fields.forEach(function (col) {
			this.#make_filter_row(mapper, col);
		}.bind(this));

		open_card(mapper, {
			title: 'Define Filter',
			'width': '60vw',
			'min-width': '60vw',
			'max-width': '60vw',
			'height': '60vh',
			'min-height': '60vh',
			'max-height': '60vh',
		});
	}

	#make_filter_row(mapper, field) {
		mapper.append(`<div>${field.title}</div>`);
		this.ctrl.filter[field.uuid] ||= {};

		let input = $(`<input class="form-control">`)
			.val(this.ctrl.filter[field.uuid].value)
			.on('input', function (evt) {
				this.ctrl.filter[field.uuid].value = evt.target.value;

				if (evt.target.value.length == 0) {
					this.ctrl.filter[field.uuid] = {};
				}
				//Fire off event to ensure change is stored
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			}.bind(this))

		let div = $(`<div></div>`).append(input).appendTo(mapper);

		let filter_types = ['equals', 'not equal', 'is empty', 'contains'];

		let select = $('<select class="form-control form-select">');

		filter_types.forEach(function (item) {
			select.append(`<option>${item}</option>`);
			if (item == this.ctrl.filter[field.uuid].type) {
				select.find('option:last-child').attr('selected', 'selected');
			}

			//Fire off event to ensure change is stored
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

		select.on('change', this, function (evt) {
			evt.stopPropagation();
			this.ctrl.filter[field.uuid].type = evt.target.value;

			//Fire off event to ensure change is stored
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

		div = $(`<div></div>`).append(select).appendTo(mapper);
	}

	#make_table_selector() {
		let tables = $('<select class="form-control form-select">');

		/** @type{SqlTable|undefined} */
		let tbl = null;

		tables.append('<option>');

		for (tbl of this.ctrl.datamodel.TableManager) {
			tables.append(`<option value="${tbl.uuid}">${tbl.title}</option>`);
			if (this.ctrl.entity === tbl.uuid) {
				tables.find('option:last-child').attr('selected', 'selected');
			}
		}

		tables.on('change', function (evt) {
			console.log(evt.target.value)
			this.ctrl.entity = evt.target.value;
			//Fire off event to ensure change is stored
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

		return tables;
	}

	#make_filter_mapper_button() {
		let btn = $(`<button>Filter</button>`);

		btn.on('click', function () {
			this.open_filter_mapper();
		}.bind(this));

		return btn;
	}

	#make_mapper_button() {
		let btn = $(`<button>Values</button>`);

		btn.on('click', function () {
			this.open_mapper();
		}.bind(this));

		return btn;
	}

	#make_field_mapper_button() {
		let btn = $(`<button>Fields</button>`);

		btn.on('click', function () {
			this.open_field_selector();
		}.bind(this));

		return btn;
	}

	#append_item(text, control, widget, skip_ignore = false) {
		if (!this.ctrl) {
			return;
		}

		if (skip_ignore !== true &&
			(this.ctrl.ignore_properties instanceof Array) &&
			(this.ctrl.ignore_properties.indexOf(text) !== -1)) {
			return;
		}

		control = $(control).addClass('form-control');
		let div = $(`<div class="control-with-label"><label>${text.trim()}</label></div>`)
			.append(control)
			.appendTo(widget);
	}
}
