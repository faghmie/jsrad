export default class DataMenu{
    constructor(designer, container){
        this.container = container;
		this.designer = designer;
    }

    #get_menu(){
        return $(`<div class="dropdown">
                    <div class="workspace-button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="la la-fw la-bars"></i>
                    </div>
                    <ul class="dropdown-menu">
                        <li class="dropdown-item switch-diagram" title="open datasource" href="#"><i class="la la-exchange"></i> Switch to UI Modeller</li>
                        <li class="dropdown-divider"></li>
                        <li class="dropdown-item open-diagram" href="#"><i class="la la-fw la-folder-open"></i> Open New Project</li>
                        <li class="dropdown-divider"></li>
                        <li class="dropdown-item tb_save_to_disk" href="#"><i class="la la-fw la-save save-to-disk" title="save to local disk" ></i> Save to Disk</li>
                        <li class="dropdown-divider"></li>
                        <li class="dropdown-item btn_generate_doc" href="#"><i class="la la-newspaper-o"></i> Generate Documentation</li>
                        <li class="dropdown-item btn_csv_to_table" href="#"><i class="la la-file-text-o"></i> Import CSV</li>
                        <li class="dropdown-item btn_generate_sql" href="#"><i class="la la-database"></i> Export SQL</;>
					</ul>
				</div>`);
    }

    GetMenu() {
		var menu = this.#get_menu();

		menu.find('.tb_save_to_disk').off('click').on('click', function () {
			document.dispatchEvent(new CustomEvent('project-save-to-disk'));
		});

		menu.find('.switch-diagram').on('click', function () {
			document.dispatchEvent(new CustomEvent('ide-switch-context', {
                detail: {
                    context: 'UI'
                }
            }));
		});

		menu.find('.new-diagram').on('click', function () {
			var erd = new erd_merge($this);
			erd.open();
		});

		menu.find('.open-diagram').on('click', () => this.designer.ProjectDialog.Show(true));

		menu.find('.btn_csv_to_table').off('click').on('click', function () {
			import_csv();
		});

		menu.find('.btn_generate_sql').off('click').on('click', function () {
			var $dlg = $('<div>').attr('title', 'SQL Code');
			var $txt = $('<select>')
				.addClass('form-control')
				.append('<option>mysql</option>')
				.append('<option>mssql</option>')
				.appendTo($dlg);
			var btn = $('<a>')
				.addClass('btn btn-light')
				.text('Generate SQL')
				.appendTo($dlg);

			btn.on('click', function (evt) {
				_export_sql($dlg.find('select').val());
				card.close();
			});

			var _export_sql = function (db_type) {
				var translator = mysql_datatypes;
				switch (db_type) {
					case 'mssql':
						translator = mssql_datatypes;
						break;

					default:
						translator = mysql_datatypes;
				}


				DataInterface.select_multiple(null, $this, function () {
					var text = translator.getStructure($this.TableManager);
					text += translator.getData($this.TableManager);
					text += translator.getConstraints($this.TableManager);

					$txt.val(text);

					var blob = new Blob([text], {
						type: 'text/sql;charset=utf-8'
					});

					saveAs(blob, $this.project.name + '.sql');
				});
			};

			var card = open_card($dlg, {
				'max-width': 200,
				'min-width': 200,
				'height': '100px',
				'min-height': '100px',
				'max-height': '100px',

			});
		});

		menu.find('.btn_generate_doc').off('click').on('click', function () {
			//FIND THE HEIGHT AND WIDTH TO RESIZE TO A SENSIBLE SIZE.
			var width = 0,
				height = 0,
				w = 0,
				h = 0;
			for (var t in $this.tables) {
				var table = $this.tables[t].dom.container;

				w = parseFloat(table.css('left')) + parseFloat(table.css('width'));
				h = parseFloat(table.css('top')) + parseFloat(table.css('height'));

				if (width < w) width = w;
				if (height < h) height = h;
			}

			$this.dom.container.css({
				'height': height,
				'width': width
			});

			var obj = html2canvas($this.dom.container, {
				onrendered: function (canvas) {
					var div = $('<div>')
						.addClass('docs')
						.css({
							overflow: 'auto'
						});
					div.append('<h1>' + $this.project.name + '</h1>');
					div.append('<hr>');
					div.append('<p>' + $this.project.description + '</p>');
					var img = $('<img>')
						.css({
							border: '1px solid lightgrey'
						})
						.appendTo(div);
					img.attr('src', canvas.toDataURL());
					div.append($this.getDocumentation());
					div.append('<hr><br>');
					$dlg.append(div);
					$this.dom.container.css({
						'height': DB_DESIGN_AREA.height,
						'width': DB_DESIGN_AREA.width
					});
					var file_data = '<html>' + div.html() + '</html>';

					var blob = new Blob([file_data], {
						type: 'text/html;charset=utf-8'
					});

					saveAs(blob, 'documentation.html');
				}
			}, {
				allowTaint: true,
				useCORS: true
			});

			var $dlg = $('<div>').attr('title', 'Documentation');
			open_card($dlg, {
				title: 'Documentation'
			});

		});

		menu.find('.btn_generate_code').off('click').on('click', function () {
			var sel = [];
			var text = '';
			var tables = $this.tables;
			for (var i in tables) {
				var table = tables[i];
				if (table.selected === true)
					text += JSON.stringify(table.toObject(), null, '\t');
			}

			//IF NO TABLE IS SELECTED THEN EXPORT EVERYTHING
			if (text === '')
				text = $this.toJSON();

			var $dlg = $('<div>').attr('title', 'Javascript Code');

			var $txt = $('<textarea>')
				.css({
					width: '100%',
					height: '300px',
				})
				.appendTo($dlg);
			$txt.val(text);

			var blob = new Blob([text], {
				type: 'text/json;charset=utf-8'
			});

			saveAs(blob, $this.project.name + '.json');

			open_card($dlg, {
				title: 'JSON'
			});
		});

		return menu;
	}
}