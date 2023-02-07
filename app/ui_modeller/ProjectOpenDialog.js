export default class ProjectOpenDialog {
    project;
    designer;
    card;

    constructor(designer, project) {
        this.project = project;
        this.designer = designer;
    }

    #build_ui() {
        return $(`<div class="jsrad-project-open">
					<div class="prj-btn-bar">
                        <div class="btn btn-file">
                            <label for="fileInput">
							    <i class="la la-regular la-folder-open"></i> Load From Disk
						    </label>
						  <input type="file" id="fileInput">
                        </div>
					</div>
                    <div class="title">Existing projects</div>
                    <div class="prj-list" ></div>
                </div>`);
    }

    #get_btn_new_project() {
        return $('<div>')
            .addClass('btn')
            .html('<i class="la la-plus"></i> New Project')
            .on('click', function () {
                this.project.CreateNew();
                this.card.close();
            }.bind(this));
    }

    #get_btn_close() {
        return $('<button>')
            .addClass('btn close-btn')
            .html('Close')
            .on('click', function () {
                this.card.close();
            }.bind(this));
    }

    #make_list(the_list) {
        this.project.List().then(data => {
            let map = {};

            if (!(data instanceof Array)) return;

            data.forEach((item) => {
                map[item.uuid] = item;
                the_list.append(`
                    <div class="list-item" value="${item.uuid}">
                        ${item.name}
                        <span class="remove la la-remove"></span>
                    </div>`);
            });

            the_list.find('.list-item').on('click', function (evt) {
                this.project.Open(map[evt.target.getAttribute('value')]);
                this.card.close();
            }.bind(this));

            the_list.find('.remove').on('click', function (evt) {
                evt.stopPropagation();
                this.#remove_project(evt.target.parentElement);
            }.bind(this));
        });
    }

    #remove_project(list_item) {
        let project_uuid = list_item.getAttribute('value');
        App.Confirm(
            'Are you sure you want to remove this project?<br>This operations cannot be reversed.',
            function () {
                this.project.Remove(project_uuid).then(function () {
                    list_item.remove();
                    if (this.project.project.uuid == project_uuid) {
                        this.card.container.find('.close-btn').remove();
                        this.project.Close();
                    }
                }.bind(this));
            }.bind(this));
    }

    #load_local_file(files) {
        return new Promise((resolve, reject) => {
            if (files.length === 0) {
                alert('No file selected.');
                return reject('No file selected');
            }
            let reader = new FileReader();
            reader.onload = function () {
                let json = reader.result.trim();
                resolve(JSON.parse(json));
            };

            reader.readAsText(files[0]);
        });
    }

    #enable_local_file_load(dlg) {
        let $this = this;

        dlg.find('input').css('display', 'none');

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            dlg.find('input').on('change', function (evt) {
                $this.#load_local_file(dlg.find('input')[0].files).then(data => {
                    $this.project.Open(data);
                    $this.card.close();
                });
            });
        }

    }

    Show(allow_close) {
        let $this = this;
        return new Promise((resolve, reject) => {
            let dlg = $this.#build_ui(),
                row_list = dlg.find('.prj-list');

            dlg.find('.prj-btn-bar').append(this.#get_btn_new_project());

            if (true === allow_close) {
                dlg.find('.prj-btn-bar').append(this.#get_btn_close());
            }

            // let my_list = $('<ul class="list-group">').appendTo(row_list);

            $this.#enable_local_file_load(dlg);

            $this.#make_list(row_list, resolve);

            $this.card = open_card(dlg, {
                no_header: true,
                title: 'Open Project',
            });

        });
    }
}