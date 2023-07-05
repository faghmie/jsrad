import Dialog from "../common/Dialog.js";
import DataForm from "../widgets/_base/DataForm.js";
import SqlBase from "./SqlBase.js";
import SqlField from "./SqlField.js";
import TableProperties from "./TableProperties.js";

export default class SqlTable extends SqlBase {
	object_type = 'TABLE';

	fields = {};
	keys = {};
	selected = false;
	comment = '';
	is_a_view = false;
	data = [];
	left = 0;
	top = 0;
	moving = false;
	expanded = true;
	visible = true;

	//Used for multi-select
	posTopArray = [];
	posLeftArray = [];
	begin_top = 0;
	begin_left = 0;

	constructor(owner, name, left, top) {
		super();

		this.name = name;
		this.title = name;
		this.owner = owner;
		this.TableProperties = new TableProperties(this);

		this.#build(left||300, top||80);
	}

	[Symbol.iterator]() {
		let index = -1;
		let data = Object.keys(this.fields);
		let $this = this;

		return {
			next: () => ({
				value: $this.fields[data[++index]],
				done: !(index in data)
			})
		};
	}

	setName(string) {
		let result = false;

		if (typeof string === 'undefined') {
			return result;
		}

		let title = string.trim();
		let db_name = title.toLowerCase().replace(/( )/g, '_');

		this.title = title;
		this.name = db_name;

		this.dom.container.find('.header .title').text(title);
		let table = this;
		document.dispatchEvent(new CustomEvent('table-changed', {
			detail: {
				table: table
			}
		}));

		return true;
	};

	setComment(string) {
		let result = false;

		if (typeof string === 'undefined') {
			return result;
		}

		this.comment = string.trim();

		let hdr = this.dom.container.find('.header .title');
		hdr.find('.comment').remove();
		hdr.append(`<p class="comment">${this.comment}</p>`);

		return true;
	};

	hide() {
		this.visible = false;
		this.dom.container.hide();
		this.#trigger_redraw();
	};

	show() {
		this.visible = true;
		this.dom.container.show();
		this.#trigger_redraw();
	};

	#build(left, top) {
		this.dom.container = $(`<div class="sql-table">
					<div class="sql-table-title header">
						<div class="title" ></div>
						<div class="dropdown">
							<a data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<i class="la la-fw la-gear"></i>
							</a>
							<div class="dropdown-menu">
							<a class="dropdown-item edit-table"    href="#"><i class="la la-fw la-pencil"></i> Edit table</a>
							<a class="dropdown-item add-field"    href="#"><i class="la la-fw la-plus"></i> Add field</a>
							<a class="dropdown-item expander"    href="#"><i class="la la-eye"></i> Show/Hide fields</a>
							<a class="dropdown-item table-data"   href="#"><i class="la la-table"></i> Show table data</a>
							<a class="dropdown-item remove-table" href="#"><i class="la la-trash-o"></i> Remove table</a>
							</div>
						</div>
					</div>
					<div class="sql-table-content">
						<table style="width:100%" >
							<tbody ></tbody>
						</table>
					</div>
				</div>`).appendTo(this.owner.container);


		this.dom.title = this.dom.container.find('.sql-table-title .title');
		this.dom.expander = this.dom.container.find('.expander');

		this.dom.parent = this.owner.container;

		this.#make_droppable();

		this.make_panel_draggable(this.owner.container, this.dom.container);

		this.toFront();
		this.set_title(this.name, null);
		this.moveTo(left, top);

		this.dom.expander.on('click tap', this, evt => evt.data.ToggleFieldVisibility());

		this.dom.container.on('click tap', this, evt => evt.data.toFront());

		this.dom.container.find('.add-field').on('click', this, evt => evt.data.addRow());

		this.dom.container.find('.edit-table').on('click', this, evt => evt.data.TableProperties.Show());

		this.dom.container.find('.remove-table').on('click', this, function (evt) {
			document.dispatchEvent(new CustomEvent('table-remove', {
				detail: evt.data
			}));
		});

		this.dom.container.find('.table-data').on('click', this, this.show_data.bind(this));


		this.ListenToFieldEvents();
	}

	show_data() {
		let ctrl = $(`
					<div class="table-container">
						<div class="caption"></div>
						<div class="body">
							<table></table>
						</div>
					</div>`);

		let fields_to_ignore = ['__system_id__'];

		let table = ctrl.find('table');

		let thead = $(`<thead>`);
		let tr = $(`<tr>`).appendTo(thead);
		for(let uuid in this.fields){
			let col = this.fields[uuid];
			if (fields_to_ignore.indexOf(uuid) !== -1) {
				continue;
			}
			tr.append(`<th>${col.title}</th>`);
		}


		let tbody = $('<tbody>');
		this.data.forEach(row => {
			tr = $(`<tr>`).appendTo(tbody);
			tr.attr('datamodel-system-id', row.__system_id__);

			for(let uuid in this.fields){
				if (fields_to_ignore.indexOf(uuid) !== -1) {
					continue;
				}
				tr.append(`<td>${row[uuid]||''}</td>`);
			}
		});

		table.append(thead).append(tbody);

		new Dialog(ctrl,{
			width: '80vw',
			'min-width': '80vw',
			'max-width': '80vw',
			height: '80vh',
			'min-height': '80vh',
			'max-height': '80vh',
		});
	}

	#make_droppable() {
		let $this = this;
		this.dom.title.droppable({
			drop: function (evt, ui) {
				let src = ui.draggable.prop('row');
				if (typeof src !== 'undefined') {
					let col_opts = { type: src.sql_type, auto_increment: false, nullable: true, show_on_editor: true, show_on_grid: true, show_on_import: true };
					let dest = $this.addRow(`FK_${src.table.name}_${src.name}`, col_opts);

					document.dispatchEvent(new CustomEvent('foreign-key-add', {
						detail: {
							table: $this,
							node_from: src,
							node_to: dest
						}
					}));

					// dest.redraw();
				}
			}
		});
	}

	ListenToFieldEvents() {
		let $this = this;
		document.addEventListener('table-row-removed', function (evt) {
			let table = evt.detail.table,
				field = evt.detail.field;

			if (table.uuid != $this.uuid) {
				return;
			}

			delete table.fields[field.uuid];

			table.redraw();
		});

	}

	ToggleFieldVisibility() {
		let body = this.dom.container.find('table');

		this.toFront();

		if (this.expanded == false) {
			body.show();
			this.expanded = true;
		} else {
			this.expanded = false;
			body.hide();
		}

		document.dispatchEvent(new CustomEvent('table-redraw', {
			detail: {
				table: this
			}
		}));
	}

	#trigger_redraw() {
		document.dispatchEvent(new CustomEvent('table-redraw', {
			detail: {
				table: this
			}
		}));
	}

	deselect() {
		for (let field in this.fields) {
			if (typeof this.fields[field].deselect === 'function')
				this.fields[field].deselect();
		}

		this.selected = false;
		this.dom.container.removeClass('selected');
	}

	addRow(title, data, uuid) {
		let r = new SqlField(this, title || 'new field', data, this.owner);
		if (uuid) r.uuid = uuid;

		this.fields[r.uuid] = r;

		this.dom.container.find('table tbody').append(r.dom.container);
		this.redraw();

		return r;
	}

	removeRow(r, redraw) {
		if (typeof redraw === 'undefined') redraw = true;
		if (r.uuid in this.fields) {
			if (typeof r.destroy === 'function')
				r.destroy();

			delete this.fields[r.uuid];
		}

		if (true === redraw) this.redraw();
	}

	moveTo(left, top) {
		this.left = left - left % 10;
		this.top = top - top % 10;
		if (this.left < 0) this.left = 0;
		if (this.top < 0) this.top = 0;

		let parent = $(this.dom.parent);

		$(this.dom.container).css({
			'left': (parent.scrollLeft() + this.left) + 'px',
			'top': (parent.scrollTop() + this.top) + 'px',
			'position': 'absolute'
		});
	}

	toObject() {
		let obj = super.toObject();
		let key = null;

		delete obj.relationships;
		delete obj.fields;
		delete obj.keys;
		delete obj.TableProperties;
		delete obj.posLeftArray;
		delete obj.posTopArray;
		delete obj.begin_left;
		delete obj.begin_top;

		for (key in obj) {
			if (typeof obj[key] === 'function') delete obj[key];
		}

		// for (key in DataEditor) { if (key !== 'data') delete obj[key]; }
		// for (key in DataInterface) { if (key !== 'data') delete obj[key]; }
		// for (key in DataImporter) { if (key !== 'data') delete obj[key]; }

		obj.fields = {};
		for (key in this.fields) {
			obj.fields[key] = this.fields[key].toObject();
		}
		return obj;
	}

	fromObject(node) {
		let node_copy = $.extend({}, node);
		delete node_copy.database;

		this.prototype = $.extend(true, this, node_copy);

		let $this = this,
			fields = {},
			field_array = [],
			field = null,
			t = null,
			index = 0;


		for (field in node.fields) {
			field_array.push(node.fields[field]);
		}

		field_array = field_array.sort(function (a, b) {
			if (a.index < b.index)
				return -1;

			if (a.index > b.index)
				return 1;

			return 0;
		});

		for (index = 0; index < field_array.length; index++) {
			field = field_array[index];
			if (!field.uuid) field.uuid = generate_uuid();
			t = $this.addRow(field.name, null, field.uuid);

			t.fromObject(field);
			fields[t.uuid] = t;
		}

		this.fields = fields;
		this.data = node.data;

		this.moveTo(node.left, node.top);
		this.set_title();

		if (false === this.expanded) {
			$this.dom.container.find('table').hide();
			let icon = $this.dom.expander;
			icon.addClass('la-chevron-right');
			icon.removeClass('la-chevron-down');
		}
	}

	toString() {
		let html = '',
			$this = this,
			f = null,
			field = null;

		//TITLE
		html += '<h2>' + this.title + '</h2>';
		html += '<p>' + this.comment + '</p>';

		//USES
		html += '<h3>Uses</h3>';
		html += '<ol>';
		$(this.owner.relations).each(function () {
			if (this.row2 && this.row2.owner === $this)
				html += '<li>' + this.row1.owner.title + '</li>';
		});
		html += '</ol>';

		//USED BY
		html += '<h3>Used By</h3>';
		html += '<ol>';
		$(this.owner.relations).each(function () {
			if (this.row1 && this.row1.owner === $this)
				html += '<li>' + this.row2.owner.title + '</li>';
		});
		html += '</ol>';

		//COLUMNS
		html += '<h3>Columns</h3>';
		html += '<table>';
		html += '<thead><tr>';
		html += '<th>Name</th>';
		html += '<th>Description</th>';
		html += '<th>Can Be Empty?</th>';
		html += '<th>Required?</th>';
		html += '</tr></thead>';

		html += '<tbody>';

		for (f in this.fields) {
			field = this.fields[f];
			if (this.owner.project.implementation_fields.indexOf(field.name.toLowerCase()) !== -1) continue;

			html += '<tr>';
			html += '<td>' + field.title + '</td>';
			html += '<td>' + field.comment + '</td>';
			html += '<td>' + (field.nullable === true ? 'Yes' : 'No') + '</td>';
			html += '<td>' + (field.required === true ? 'Yes' : 'No') + '</td>';
			html += '</tr>';
		}

		html += '</tbody></table>';

		//DATA
		html += '<h3>Data</h3>';
		html += '<table>';
		html += '<thead><tr>';

		for (f in this.fields) {
			field = this.fields[f];
			if (this.owner.project.implementation_fields.indexOf(field.name.toLowerCase()) !== -1) continue;

			html += '<th>' + field.title + '</th>';
		}

		html += '</tr></thead>';

		html += '<tbody>';
		let fields = this.fields;
		$(this.data).each(function () {
			let data = this;
			html += '<tr>';
			for (f in this.fields) {
				field = this.fields[f];
				if (this.owner.project.implementation_fields.indexOf(field.name) !== -1) continue;
				html += '<td>' + $this.translate_field_value(field, data[field.name]) + '</td>';
			}

			html += '</tr>';
		});

		html += '</tbody></table>';

		return html;
	}

	destroy() {
		for (let field in this.fields) {
			this.removeRow(this.fields[field], false);
		}

		let table = this;
		document.dispatchEvent(new CustomEvent('table-removed', {
			detail: {
				table: table
			}
		}));

		this.dom.container.remove();
	}
}
