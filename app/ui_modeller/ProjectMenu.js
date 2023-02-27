export default class ProjectMenu {

    owner = null;

    constructor(owner) {
        this.owner = owner;
    }

    Build() {
        let menu = $(`<ul class="dropdown-menu">
                            <li class="dropdown-item switch-diagram" title="open datasource" href="#"><i class="la la-exchange"></i> Switch to Data Modeller</li>
                            <li class="dropdown-divider"></li>
                            <li class="dropdown-item open-diagram"><i class="la la-fw la-folder-open"></i> Open New Project</li>
                            <li class="dropdown-divider"></li>
                            <li class="dropdown-item tb_save_to_disk"><i class="la la-fw la-save save-to-disk" title="save to local disk" ></i> Save to Disk</li>
                            <li class="dropdown-divider"></li>
                            <li class="dropdown-item " id="tb_image" title="generate image"><i class="la la-fw la-file-image-o"> </i> Export as Image</li>
                            </ul>`);
                            // <li class="dropdown-item " id="tb_snapshot" title="generate documentation"><i class="la la-fw la-newspaper-o"></i> Generate Documentation</li>
        // <a class="dropdown-item reuse_ui"><i class="la la-fw la-puzzle-piece"></i> Re-use from existing...</a>

        menu.find('.tb_save_to_disk').off('click').on('click', function () {
            document.dispatchEvent(new CustomEvent('project-save-to-disk'));
        });

        menu.find('.switch-diagram').on('click', function () {
            document.dispatchEvent(new CustomEvent('ide-switch-context', {
                detail: {
                    context: 'DATA'
                }
            }));
        });


        menu.find('.open-diagram').off('click').on('click', () => this.owner.ProjectDialog.Show(true));

        // menu.find('#tb_snapshot').off('click').on('click', () => this.owner.Project.GenerateDocument());

        menu.find('#tb_image').off('click').on('click', () => this.ExportToPng());

        menu.find('.reuse_ui').off('click').on('click', function (evt) {
            let ui = new ui_merge(this);
            ui.open();
        }.bind(this));

        return menu;
    }

    ExportToPng() {
        let form = this.owner.Forms.getActiveForm();
        let options = {
            allowTaint: true,
            useCORS: true
        };

        form.ctrl.removeClass('design-mode');
        form.deselect();
        html2canvas(form.ctrl[0]).then((canvas) => {
            form.ctrl.addClass('design-mode');
            let a = document.createElement('a');
            // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
            a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            a.download = form.title + '.png';
            a.click();
        });
    }
}
