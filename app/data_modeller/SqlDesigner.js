import App from "../common/App.js";
import Dialog from "../common/Dialog.js";
import DataMenu from "./DataMenu.js";
import SqlBase from "./SqlBase.js";
import TableManager from "./TableManager.js";

export default class SqlDesigner extends SqlBase {
	object_type = 'DESIGNER';
	is_json = true;
	database_type = 'json';

	constructor(designer, container) {
		super();

		this.container = container || $('body');
		this.designer = designer;
		this.#build();
	}

	Show() {
		this.dom.workspace.show();
		this.TableManager.Sync();

		$('.design-toolbox-panel.sql-props').show();
	}

	Hide() {
		this.dom.workspace.hide();
		$('.design-toolbox-panel.sql-props').hide();
	}

	ClearTables() {
		for (let table in this.TableManager.tables) {
			this.TableManager.tables[table].destroy();
		}
	}

	showDataTable(table) {
		if (typeof table === 'object') {
			this.tables[table.uuid].database.entities = this.tables;
			return this.tables[table.uuid].showEditor();
		}

		for (let key in this.tables) {
			if (this.tables[key].selected === true) {
				this.tables[key].database.entities = this.tables;
				this.tables[key].showEditor();
				break;
			}
		}
	}

	toObject() {
		let obj = {
			entities: {},
		};

		for (let t in this.TableManager.tables) {
			let table = this.TableManager.tables[t];
			obj.entities[table.uuid] = table.toObject();
			if (!this.is_json) delete obj.entities[table.uuid].data;
		}

		obj.type = 'datamodel';
		return obj;
	}

	fromObject(node, clear_existing) {
		return new Promise((resolve, reject) => {
			let $this = this,
				table = null,
				field = null,
				t = null,
				f = null;
			if (typeof clear_existing === 'undefined') clear_existing = false;

			if (!node) return reject();

			if (clear_existing !== false) this.ClearTables();

			for (let uuid in node.entities) {
				table = this.TableManager.addTable(
					node.entities[uuid].title,
					0,
					0,
					uuid,
				);
				table.fromObject(node.entities[uuid]);

				this.#table_list_update(table);
			}

			if (!this.dom.workspace.is(':visible')) {
				this.Hide();
			}

			//RESTORE RELATIONSHIPS
			for (t in this.TableManager.tables) {
				table = this.TableManager.tables[t];
				for (f in table.fields) {
					field = table.fields[f];

					if (!field.foreign_key) continue;

					if (!(field.foreign_key.sql_table in this.TableManager.tables))
						continue;

					let t1 = this.TableManager.tables[field.foreign_key.sql_table];

					if (!t1) continue;

					if (!(field.foreign_key.key in t1.fields)) {
						for (let fx in t1.fields) {
							if (t1.fields[fx].name == field.foreign_key.key) {
								field.foreign_key.key = fx;
							} else if (t1.fields[fx].name == field.foreign_key.value) {
								field.foreign_key.value = fx;
							}
						}
					}

					let r1 = t1.fields[field.foreign_key.key];

					let t2 = this.TableManager.tables[table.uuid];

					if (!t2) continue;

					let r2 = t2.fields[field.uuid];

					if (!r2) continue;

					this.TableManager.AddRelation(r1, r2);
				}
			}

			//ADD DATA HEADERS
			// for (t in this.tables) {
			// 	table = this.tables[t];

			// 	if (typeof table.data_header !== 'undefined') continue;
			// 	table.data_header = {};

			// 	for (f in table.fields) {
			// 		table.data_header[f] = table.fields[f].name;
			// 	}
			// }

			resolve();
		});
	}

	#get_workspace() {
		return $(`<div class="data-designer">
						<div class="design-sidebar">
							<div class="toolbar"></div>
							<div class="search-bar"></div>
							<ul class="table-list"></ul>
						</div>
						<div class="design-mode"></div>
					</div>`);
	}

	#side_panel_toolbar(container) {
		let format_tb = $(`<div class="workspace-button add-table" title="add table">
							<i class="la la-plus"></i>
						</div>`);

		container
			.find('.toolbar')
			.append(format_tb);

		container.find('.search-bar').append(this.#get_search_box(container.find('.table-list')));

		format_tb.on('click', (evt) => this.TableManager.preAdd(evt));

		return format_tb;
	}

	#get_search_box(list) {
		let $this = this;
		let search_box = $(`<input type="text" class="table-search" placeholder="Search" >`);

		search_box
			.on('keydown', function (evt) {
				evt.stopPropagation();
			})
			.on('input', function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
				let find_me = evt.target.value.toLowerCase().trim();

				list.children().each(function () {
					let item = $(this);
					item.show();
					let text = item.text().toLowerCase();

					if (find_me.length !== 0 && text.indexOf(find_me) === -1) {
						item.hide();
					}
				});

				for (let tbl in $this.TableManager.tables) {
					let table = $this.TableManager.tables[tbl];

					table.show();
					let text = table.title.toLowerCase();
					if (find_me.length !== 0 && text.indexOf(find_me) === -1) {
						table.hide();
					}
				}
			});

		return search_box;
	}

	#build() {
		let $this = this;

		let workspace = this.#get_workspace().appendTo(this.container);

		this.dom.workspace = workspace;
		this.dom.container = workspace.find('.design-mode');
		this.dom.toolbox = workspace.find('.table-list');

		this.TableManager = new TableManager(this.dom.container, this);
		this.DataMenu = new DataMenu(this.designer, this.dom.workspace);

		workspace.find('.toolbar').append(this.DataMenu.GetMenu());
		this.#side_panel_toolbar(workspace);

		this.dom.container.on('click', (evt) => this.TableManager.click(evt));

		workspace
			.find('#tb_copy_control')
			.off('click')
			.on('click', function () {
				//NOW CHECK IF A CONTROL WAS SELECTED
				$this.clipboard = [];
				for (let t in $this.TableManager.tables) {
					if (true === $this.tables[t].selected)
						$this.clipboard.push($this.TableManager.tables[t].toObject());
				}

				if ($this.clipboard.length === 0) alert('Nothing to copy');
			});

		workspace
			.find('#tb_paste_control')
			.off('click')
			.on('click', function () {
				let found = true,
					t = null,
					ctrl = null,
					offset = 20;

				if (
					!($this.clipboard instanceof Array) ||
					$this.clipboard.length === 0
				) {
					return;
				}

				ctrl = $this.clipboard[0];

				//MAKE SURE THE TABLE NAME IS UNIQUE
				found = true;
				while (true === found) {
					found = false;
					for (t in $this.TableManager.tables) {
						if ($this.tables[t].name === ctrl.name) {
							found = true;
							ctrl.name = ctrl.name + ' (Copy)';
							ctrl.title = ctrl.name;
							break;
						}
					}
				}

				ctrl.left += offset;
				ctrl.top += offset;

				t = $this.TableManager.addTable(ctrl.name, ctrl.left, ctrl.top);
				t.fromObject(ctrl);

				ctrl.left -= offset;
				ctrl.top -= offset;
			});

		this.#listen_for_events();
	}

	#listen_for_events() {
		let $this = this;

		document.addEventListener('table-added', (evt) =>
			this.#table_list_update(evt.detail.table),
		);

		document.addEventListener('table-changed', function (evt) {
			let table = evt.detail.table;

			let found_table = $this.dom.toolbox.find('.' + table.uuid);

			found_table.find('.table-list-title').html(table.title);
		});

		document.addEventListener('table-removed', function (evt) {
			let table = evt.detail.table;

			$this.dom.toolbox.find('.' + table.uuid).remove();
		});
	}

	#import_csv() {
		let _load_local_file = function () {
			let files = $dlg.find('#fileInput')[0].files;
			if (files.length === 0) {
				return App.notifyError('No file selected.');
			}
			table_name = files[0].name;

			let reader = new FileReader();
			reader.onload = function () {
				let json = $.trim(reader.result);
				card.close(function () {
					_import_from_text(json);
				});
			};

			reader.readAsText(files[0]);
		};

		let _import_from_text = function (text) {
			let lines = csv_to_array(text);

			let headers = lines[0];
			for (let index = 0; index < headers.length; index++) {
				headers[index] = $.trim(headers[index]).replace(/ |\(|\)/g, '_');
			}
			let t = $this.addTable(table_name, 40, 40);
			let col_opts = {
				ai: false,
				show_on_editor: true,
				show_on_grid: true,
				show_on_import: true,
			};
			let captions = lines[0];
			for (index = 0; index < headers.length; index++) {
				let col = t.addRow(headers[index], col_opts);
				col.title = captions[index];
				col.reset_index();
				col.set_title();
			}

			t.data = [];
			for (index = 1; index < lines.length; index++) {
				t.data.push({});
				let line_data = lines[index];
				for (let key = 0; key < headers.length; key++) {
					let value = '';
					if (key < line_data.length) value = line_data[key];

					t.data[t.data.length - 1][headers[key]] = value;
				}
			}
		};

		let $dlg = $('<div>').attr('title', 'Convert CSV to a table');
		let table_name = null;

		if (window.File && window.FileReader && window.FileList && window.Blob) {
			$dlg.append("<input type='file' id='fileInput' style='width:100%;'>");

			$dlg.find('#fileInput').on('change', function () {
				_load_local_file();
			});
		}

		let $txt = $('<textarea>')
			.css({
				height: '100%',
				width: '300px',
			})
			.appendTo($dlg);

		let button = $('<a>Import Text</a>')
			.addClass('pull-right btn btn-light')
			.appendTo($dlg);
		button.on('click', function () {
			let json = $.trim($dlg.find('textarea').val());
			card.close(function () {
				_import_from_text(json);
			});
		});
		card = new Dialog($dlg, {
			title: 'Import CSV to Table',
		});
	}

	#import_json() {
		let _load_local_file = function () {
			let files = $dlg.find('#fileInput')[0].files;
			if (files.length === 0) {
				MessageError('No file selected.');
				return;
			}
			let reader = new FileReader();
			reader.onload = function () {
				let json = $.trim(reader.result);
				card.close(function () {
					_import_from_text(json);
				});
			};

			reader.readAsText(files[0]);
		};

		let _import_from_text = function (json) {
			if (typeof json === 'undefined' || null === json || json.length === 0) {
				alert('No JSON text provided');
				return;
			}

			let obj = '';
			let obj_name = '';
			let bracket_cnt = 0;
			let prev_char = '';
			let obj_start = false;
			let entities = [];
			for (let index = 0; index < json.length; index++) {
				switch (json[index]) {
					case '{':
						if (bracket_cnt === 0) {
							obj_start = true;
							obj = '';
						}
						bracket_cnt++;
						break;

					case '}':
						bracket_cnt--;
						break;

					case '=':
						//IF BRACKET COUNT IS STILL ZERO IT MEANS WE HAVE REACHED THE
						//OBJECT NAME
						if (bracket_cnt === 0) {
							obj_name = obj.replace('let ', '');
						}
						break;
				}

				obj += json[index];

				if ($.trim(json[index]) !== '') prev_char = json[index];

				if (index > 0 && bracket_cnt === 0 && obj_start === true) {
					//FOUND A OBJECT SO CONVERT IT.
					/*jshint evil:true */
					obj = eval('(' + obj + ')');
					if (obj.type !== 'datamodel') {
						let t = $this.addTable(obj_name, 40, 40);
						t.fromObject(obj);
						entities.push(obj);

						obj = '';
						bracket_cnt = 0;
						obj_start = false;
					} else {
						$this.fromObject(obj);
						entities = obj.entities;
					}
				}
			}

			//NOW TRY TO RE-CREATE THE RELATIONSHIPS
			$(entities).each(function () {
				let table = this;
				let fields = this.fields;

				for (let f in fields) {
					let field = fields[f];

					if (!field.foreign_key) continue;

					let t1 = $this.tables[field.foreign_key.sql_table];
					if (!t1) continue;

					let r1 = t1.fields[field.foreign_key.key];

					let t2 = $this.tables[table.uuid];
					if (!t2) continue;

					let r2 = t2.fields[field.uuid];
					if (!r2) continue;

					//r1.foreign_key.value = field.foreign_key.value;
					$this.addRelation(r1, r2);
				}
			});
		};

		let $dlg = $('<div>').attr('title', 'Convert JSON to a table');
		let card = null;

		if (window.File && window.FileReader && window.FileList && window.Blob) {
			$dlg.append(
				"<input type='file' id='fileInput' class='form-control' style='width:100%;'>",
			);

			$dlg
				.find('#fileInput')
				.off('change')
				.on('change', function () {
					_load_local_file();
				});
		}

		let $txt = $('<textarea>')
			.addClass('form-control')
			.css({
				width: '100%',
				height: '300px',
			})
			.appendTo($dlg);

		let button = $('<a>Import Text</a>')
			.addClass('pull-right btn btn-light')
			.appendTo($dlg);
		button.on('click', function () {
			let json = $.trim($dlg.find('textarea').val());
			card.close(function () {
				_import_from_text(json);
			});
		});
		card = new Dialog($dlg, {
			title: 'Import JSON',
		});
	}

	#table_list_update(table) {
		if (table.uuid.trim() === '') {
			return;
		}
		let icon_class = 'la-eye';
		if (table.visible !== true) {
			table.hide();
			icon_class = 'la-eye-slash text-danger';
		}
		let designer = this,
			table_list = this.dom.toolbox,
			found_table = null;

		found_table = table_list.find('.' + table.uuid);

		if (found_table.length === 0) {
			table_list.append(`<a class="list-group-item ${table.uuid}" data-table="${table.uuid}">
					<span class="small table-list-title">${table.title}</span>
					<span class="pull-right check-icon la la-fw ${icon_class}"></span>
				</a>`);
		} else {
			found_table = table_list.find('.' + table.uuid);

			found_table
				.find('.check-icon')
				.removeClass('la-eye text-danger la-eye-slash');

			if (table.visible === false) {
				found_table.find('.check-icon').addClass('text-danger la-eye-slash');
			} else {
				found_table.find('.check-icon').addClass('la-eye');
			}
		}

		table_list
			.find('a')
			.off('click')
			.on('click', function () {
				let $this = $(this);
				let table = designer.TableManager.tables[$this.data('table')];
				if ($this.find('.check-icon').hasClass('la-eye')) {
					table.hide();
					$this
						.find('.check-icon')
						.removeClass('la-eye')
						.addClass('text-danger la-eye-slash');
				} else {
					table.show();
					$this
						.find('.check-icon')
						.removeClass('text-danger la-eye-slash')
						.addClass('la-eye');
				}
			});
	}
}
