export default class ProjectMenu{

    owner = null;

    constructor(owner){
        this.owner = owner;
    }

    Build() {
        let $this = this;

        let menu = $(`<div class="dropdown-menu">
                            <a class="dropdown-item switch-diagram" title="open datasource" href="#"><i class="fa fa-exchange"></i> Switch to Data Modeller</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item open-diagram"><i class="fa fa-fw fa-folder-open"></i> Open New Project</a>
                            <a class="dropdown-item reuse_ui"><i class="fa fa-fw fa-puzzle-piece"></i> Re-use from existing...</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item tb_save_to_disk"><i class="fa fa-fw fa-save save-to-disk" title="save to local disk" ></i> Save to Disk</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item " id="tb_snapshot" title="generate documentation"><i class="fa fa-fw fa-newspaper-o"></i> Generate Documentation</a>
                            <a class="dropdown-item " id="tb_image" title="generate image"><i class="fa fa-fw fa-file-image-o"> </i> Export as Image</a>
                        </div>`);
    
        menu.find('.tb_save_to_disk').off('click').on('click', function () {
            document.dispatchEvent(new CustomEvent('project-save-to-disk'));
        });

        menu.find('.switch-diagram').on('click', function () {
			document.dispatchEvent(new CustomEvent('ide-switch-context', {
                detail: {
                    context: 'DATA-MODEL'
                }
            }));
		});

    
        menu.find('.open-diagram').off('click').on('click', () => this.owner.ProjectDialog.Show(true));
    
        menu.find('#tb_snapshot').off('click').on('click', () => this.owner.Project.GenerateDocument());
    
        menu.find('#tb_image').off('click').on('click', function(evt){
            let form = this.owner.Forms.getActiveForm();
            form.ctrl.removeClass('design-mode');
            form.deselect();
            html2canvas(form.ctrl, {
                onrendered: function (canvas) {
                    form.ctrl.addClass('design-mode');
                    let a = document.createElement('a');
                    // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                    a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                    a.download = form.title + '.png';
                    a.click();
                }
            }, {
                allowTaint: true,
                useCORS: true
            });
        }.bind(this));
    
        menu.find('.reuse_ui').off('click').on('click', function(evt){
            let ui = new ui_merge(this);
            ui.open();
        }.bind(this));
    
        return menu;
    }
}
