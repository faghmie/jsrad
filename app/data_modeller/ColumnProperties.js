import SqlField from "./SqlField.js";
import TableManager from "./TableManager.js";

export default class ColumnProperties {

	/** @type{SqlField|undefined} */
	ctrl = null;

	/** @type{TableManager|undefined} */
	TableManager = null;

	constructor(column, tableManager) {
		this.ctrl = column;
		this.TableManager = tableManager;
	}

	#move_column() {
		var prop = $(`<div class="btn-group" role="group">
						<a type="button" class="btn btn-light btn-flat col-up" title="move column up"><i class="la la-arrow-up"></i></a>
						<a type="button" class="btn btn-light btn-flat col-down" title="move column down"><i class="la la-arrow-down"></i></a>
					</div>`);

		prop.find('.col-up').on('click', this.ctrl, evt => evt.data.up());

		prop.find('.col-down').on('click', this.ctrl, evt => evt.data.down());

		return prop;
	}

	#set_name() {
		var prop = $(`<input type="text" class="form-control" placeholder="title">`)
			.val(this.ctrl.title)
			.on('input', this.ctrl, evt => {
				evt.data.setName(evt.target.value);
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		return prop;
	}

	#set_comment() {
		var prop = $(`<textarea class="form-control" placeholder="comment></textarea>`)
			.val(this.ctrl.comment)
			.on('input', this.ctrl, evt => {
				evt.data.setComment(evt.target.value);
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		return prop;
	}

	#set_datatype() {
		var data_type = [
			'text', 'number', 'decimal', 'date', 'datetime', 'time', 'notes'
			, 'editor', 'boolean', 'password', 'email', 'color'
		];

		var prop = $(`<select class="form-control" placeholder="data type></select>`)
			.val(this.ctrl.comment)
			.on('change', this.ctrl, evt => {
				evt.data.data_type = evt.target.value;
				evt.data.redraw();
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		data_type.forEach(item => {
			prop.append(`<option>${item}</option>`);

			if (item === this.ctrl.data_type) {
				prop.find('option:last').attr('selected', 'selected');
			}
		});

		return prop;
	}

	#set_viewtype() {
		var types = ['', 'count', 'sum', 'avg', 'max', 'min'];

		var prop = $(`<select class="form-control" placeholder="aggregate></select>`)
			.val(this.ctrl.comment)
			.on('input', this.ctrl, evt => {
				evt.data.aggregate_type = evt.target.value;
				evt.data.setComment('');
				if (evt.data.aggregate_type.length > 0) {
					evt.data.setComment(evt.data.aggregate_type.toUpperCase() + ' of');
				}
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		types.forEach(item => {
			prop.append(`<option>${item}</option>`);

			if (item === this.ctrl.data_type) {
				prop.find('option:last').attr('selected', 'selected');
			}
		});

		return prop;
	}

	#set_auto_increment() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Auto Increment</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.auto_increment === true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.auto_increment = this.checked;
			evt.data.primary_key = this.checked;

			if (true === evt.data.auto_increment) {
				evt.data.nullable = false;
			}

			evt.data.redraw();
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#set_nullable() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Nullable</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.nullable === true && this.ctrl.auto_increment !== true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.nullable = this.checked;
			evt.data.redraw();
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#set_required() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Required</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.required == true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.required = this.checked;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#show_on_grid() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Show on grid</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.show_on_grid == true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.show_on_grid = this.checked;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#show_on_editor() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Show on Editor</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.show_on_editor == true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.show_on_editor = this.checked;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#show_on_import() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Show on Import</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.show_on_import == true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.show_on_import = this.checked;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#hide_connector() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Hide Connector</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.hide_connector == true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.hide_connector = this.checked;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#set_readonly() {
		var prop = $(`<div class="checkbox">
						<label><input type="checkbox" value="" >Read Only</label>
					</div>`);

		var chk = prop.find('input');

		if (this.ctrl.readonly == true) {
			chk.attr('checked', 'checked');
		}

		chk.on('click', this.ctrl, function (evt) {
			evt.data.readonly = this.checked;
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		});

		return prop;
	}

	#set_data_len() {
		var prop = $(`<input type="number" min=0 class="form-control" placeholder="data length">`)
			.val(this.ctrl.title)
			.on('input', this.ctrl, evt => {
				evt.data.sql_size = evt.target.value;
				evt.data.redraw();
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		return prop;
	}

	#set_default() {
		var prop = $(`<input type="number" class="form-control" placeholder="default value">`)
			.val(this.ctrl.title)
			.on('input', this.ctrl, evt => {
				evt.data.sql_default = evt.target.value;
				evt.data.redraw();
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		return prop;
	}

	#set_foreign_key(widget) {
		var $this = this;
		var table_select = $(`<select class="form-control" placeholder="foreign table" ></select>`),
			field_select = $(`<select class="form-control" id="fk_field" placeholder="link on" ></select>`),
			display_select = $(`<select class="form-control" id="fk_display_field" placeholder="display" ></select>`);

		widget.append(table_select);
		widget.append(field_select);
		widget.append(display_select);

		var _fk_table_changed = function () {
			var opt = null,
				field = null,
				f = null;

			field_select.children().remove();
			display_select.children().remove();

			opt = table_select.find('option:selected');
			var sql_table = opt.prop('sql_table');

			//REMOVE THE EXISTING RELATION IF ONE EXISTS
			if (!sql_table) {
				// var table = $this.ownerfield;
				for (var k in $this.TableManager.relations) {
					var rel = $this.TableManager.relations[k];

					if (rel.node_from !== $this.ctrl && rel.node_to !== $this.ctrl) continue;

					document.dispatchEvent(new CustomEvent('foreign-key-remove', {
						detail: {
							foreign_key: rel
						}
					}));

					break;
				}
				return;
			}

			for (f in sql_table.fields) {
				field = sql_table.fields[f];
				opt = $('<option>');
				opt.prop('field', field);
				opt.val(field.name).html(field.title);
				if ($this.ctrl.foreign_key && $this.ctrl.foreign_key.key === field.uuid) {
					opt.attr('selected', 'selected');
				}

				field_select.append(opt);
			}

			for (f in sql_table.fields) {
				field = sql_table.fields[f];
				opt = $('<option>');
				opt.prop('field', field);
				opt.val(field.name).html(field.title);
				if ($this.ctrl.foreign_key && $this.ctrl.foreign_key.value === field.uuid) {
					opt.attr('selected', 'selected');
				}

				display_select.append(opt);
			}

			field_select.trigger('change');
		};

		table_select.append('<option>');
		for (var t in this.TableManager.tables) {
			let table = this.TableManager.tables[t];
			let opt = $('<option>').val(table.name).html(table.title);
			opt.prop('sql_table', table);
			table_select.append(opt);

			if (this.ctrl.foreign_key && this.ctrl.foreign_key.sql_table === table.uuid) {
				opt.attr('selected', 'selected');
				_fk_table_changed();
			}
		}

		table_select.trigger('change');

		table_select.on('change', _fk_table_changed);

		field_select.on('change', function () {
			var opt = table_select.find('option:selected');
			var sql_table = opt.prop('sql_table');

			var field = $(this).find('option:selected').prop('field');

			document.dispatchEvent(new CustomEvent('foreign-key-add', {
				detail: {
					table: sql_table,
					node_from: field,
					node_to: $this.ctrl
				}
			}));
		});

		display_select.on('change', function () {
			var field = field_select.find('option:selected').prop('field');
			var fk = $(this).find('option:selected').prop('field');
			$this.ctrl.foreign_key.value = fk.uuid;
		});
	}

	Show() {
		var widget = $(`<div class="text-formater">`);

		widget.append(this.#move_column());
		widget.append(`<div class="title-line">general</div>`);
		widget.append(this.#set_name());
		widget.append(this.#set_datatype());
		widget.append(this.#set_comment());
		widget.append(`<div class="title-line">data editor</div>`);
		widget.append(this.#set_viewtype());
		widget.append(this.#set_readonly());
		widget.append(this.#set_required());
		widget.append(this.#show_on_grid());
		widget.append(this.#show_on_editor());
		widget.append(this.#show_on_import());
		widget.append(`<div class="title-line">database</div>`);
		widget.append(this.#set_auto_increment());
		widget.append(this.#set_nullable());
		widget.append(this.#set_data_len());
		widget.append(this.#set_default());
		widget.append(`<div class="title-line">foreign key</div>`);
		widget.append(this.#hide_connector());
		this.#set_foreign_key(widget);

		this.ctrl.add_panel('Field Properties', widget);

		return widget;
	}
}
