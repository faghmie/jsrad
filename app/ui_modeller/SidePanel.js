import DocsProperties from "./PropertyDocs.js";
import CommentsEditor from "./PropertyComments.js";
import FormatProperties from "./PropertyFormat.js";
import CustomProperties from "./PropertyCustom.js";
import StyleProperties from "./PropertyStyle.js";
import ProjectProperties from "./PropertyProject.js";
import Toolbox from "./Toolbox.js";
import AlignmentManager from "./PropertyAlignment.js";
import FormOverview from "./FormOverview.js";

export default class SidePanel {
    container = null;

    /** @type{FormManager | undefined} */
    Forms = null;

    /** @type{ProjectManager | undefined} */
    Project = null;

    /** @type{Toolbox | undefined} */
    Toolbox = null;

    /** @type{AlignmentManager | undefined} */
    AlignmentManager;

    panels_shown = {};
    panel_container = $('body');

    constructor(project, project_menu, form_manager) {
        this.Forms = form_manager;
        this.Project = project;
        this.Toolbox = new Toolbox();
        this.AlignmentManager = new AlignmentManager();

        this.container = this.#get_buttons();

        this.#set_button_events();

        this.#create_panels();

        this.#listen_for_events();

        this.container.find('.workspace-menu').append(project_menu.Build());
    }

    HideAll() {
        for (let key in this.panels_shown) {
            this.panel_container.find(key).hide();
        }
    }

    Show() {
        for (let key in this.panels_shown) {
            if (this.panels_shown[key]) {
                this.panel_container.find(key).show();
            }
        }
    }

    #listen_for_events() {
        document.addEventListener('ui-set-properties', function (evt) {
            this.set_properties(evt.detail);
        }.bind(this));
    }

    #get_buttons() {
        return $(`<div class="design-sidebar">
                    <div class="workspace-button btn-design-present">
                        <i class="la la-fw la-play"></i>
                    </div>

                    <div class="dropdown jsrad-project-menu workspace-menu design-controls no-panel">
                        <div class="workspace-button"  data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="la la-fw la-bars"></i>
                        </div>
                    </div>

                    <div class="workspace-button design-controls"
                        data-page=".design-area-project-settings" 
                        title="project settings"><i class="la la-fw la-gear"></i>
                    </div>

                    <div class="workspace-button design-controls btn-design-area-overview" 
                        data-page=".design-area-overview"
                        title="forms & processes"><i class="la la-fw la-tv"></i>
                    </div>

                    <div class="workspace-button design-controls" 
                        data-page=".design-area-widgets"
                        title="widgets"><i class="la la-fw la-cubes"></i>
                    </div>

                    <div class="workspace-button design-controls"
                        data-page=".design-area-text"
                        title="formating"><i class="la la-fw la-paint-brush"></i>
                    </div>

                    <div class="workspace-button design-controls"
                        data-page=".design-area-props" 
                        title="properties"><i class="la la-fw la-pencil-alt"></i>
                    </div>

                    <div class="workspace-button design-controls" 
                        data-page=".design-area-comments"
                        title="comments"><i class="la la-fw la-comments"></i>
                    </div>

                    <div class="workspace-button design-controls" 
                        data-page=".design-area-docs"
                        title="documentation"><i class="la la-fw la-file-text"></i>
                    </div>
                    </div>`);


        // <a class="workspace-button design-controls" 
        //     data-page=".design-area-database"
        //     title="database connection"><i class="la la-fw la-plug"></i>
        // </a>
    }

    #create_panels() {
        let $this = this;
        this.container.find('.workspace-button').each(function () {
            let btn = $(this);
            if (!btn.data('page')) return;

            let panel = btn.data('page').replace('.', '');
            btn.data('btn-class', '.btn-' + panel);

            if (true !== btn.hasClass('no-panel')) {
                $this.#add_panel(btn, panel);

                $this.panels_shown[btn.data('page')] = false;
            }

        });
    }

    #add_panel(btn, cls) {
        if (this.panel_container.find('.' + cls).length > 0) {
            return this.panel_container.find('.' + cls);
        }

        let panel = $(`<div class="design-toolbox-panel">
                    <div class="design-toolbox-title">
                        <span>${btn.attr('title')}</span>
                        <div class="panel-controls">
                            <i class="la la-chevron-down show-hide"></i>
                            <i class="la la-times close-panel"></i>
                        </div>
                    </div>
                    <div class="toolbox-body"></div>
                </div>`)
            .addClass(cls)
            .hide()
            .appendTo(this.panel_container);

        panel
            .resizable()
            .draggable({
                handle: '.design-toolbox-title'
            })
            .on('click', { className: `.${cls}` }, function (evt) {
                if (evt.target.className.includes('close-panel')) {
                    this.panel_container.find(evt.data.className).hide();
                    this.panels_shown[evt.data.className] = false;
                } else if (evt.target.className.includes('show-hide')) {
                    if (evt.target.className.includes('la-chevron-down')) {
                        evt.target.classList.remove('la-chevron-down');
                        evt.target.classList.add('la-chevron-up');
                        panel.attr('current-height', panel.css('height'));
                        panel.css('height', 40);
                        panel.resizable('destroy');

                    } else if (evt.target.className.includes('la-chevron-up')) {
                        evt.target.classList.remove('la-chevron-up');
                        evt.target.classList.add('la-chevron-down');
                        panel.css('height', panel.attr('current-height'));
                        panel.resizable();
                    }
                } else {
                    this.#show_panel(evt.data.className);
                }
            }.bind(this));

        return panel;
    }

    #set_button_events() {
        this.container.on('click', '.workspace-button', this, function (evt) {
            let btn = $(this);

            if (btn.hasClass('no-panel')) {
                return;
            }

            evt.data.#show_panel(btn.data('page'));

            evt.data.set_properties();
        });

        // this.container.find('.btn-design-area-overview').on('click', function () {
        // 	(new FormOverview(this.Forms)).show();
        // }.bind(this));

        this.container.find('.btn-design-present').off('click').on('click', function (evt) {
            evt.stopPropagation();
            this.#toggle_project_mode();
        }.bind(this));
    }

    #show_panel(panel_id) {
        let z = 2;
        let panel = this.panel_container.find(panel_id);
        this.panel_container.find('.design-toolbox-panel').each(function () {
            if (this.style.zIndex == 'auto' || this.style.zIndex == '') {
                z++;

            } else if (parseFloat(this.style.zIndex) > z) {
                z = parseFloat(this.style.zIndex);
                this.style.zIndex = z - 1;
            }
        });

        panel.css({ 'z-index': z });
        panel.show();
        this.panels_shown[panel_id] = true;
    }

    #toggle_project_mode() {
        let btn = this.container.find('.btn-design-present i');
        let in_run_mode = false;

        if (btn.hasClass('la-stop')) {
            btn.removeClass('la-stop');
            btn.addClass('la-play');
            this.container.find('.design-controls').show();
            in_run_mode = true;

            this.Show();

        } else {
            btn.addClass('la-stop');
            btn.removeClass('la-play');
            this.container.find('.design-controls').hide();

            this.HideAll();
        }

        document.dispatchEvent(new CustomEvent('ide-toggle-project-mode', {
            detail: {
                in_run_mode: in_run_mode
            }
        }));

        document.dispatchEvent(new CustomEvent('ui-form-show'));
    }

    set_properties(control, default_pane) {
        let docs = new DocsProperties(),
            // editor = new DatabaseProperties(),
            comments = new CommentsEditor(),
            fonts = new FormatProperties(),
            styler = new StyleProperties(),
            prj_props = new ProjectProperties(),
            widget_props = new CustomProperties(),
            form_overview = new FormOverview(this.Forms),
            form = this.Forms.getActiveForm(),
            ctrl = null;

        ctrl = form;

        if (!form) return;

        if (control) {
            ctrl = control;
        } else if (form) {
            for (let key in form.controls) {
                if (form.controls[key].selected === true) {
                    ctrl = form.controls[key];
                }
            }
        }

        this.panel_container.find('.design-area-overview .toolbox-body').children().remove();
        this.panel_container.find('.design-area-overview .toolbox-body').append(form_overview.get());

        this.panel_container.find('.design-area-text .toolbox-body').children().remove();
        this.panel_container.find('.design-area-text .toolbox-body').append(fonts.attach(ctrl).append(styler.attach(ctrl)).append(this.AlignmentManager.attach(ctrl)));

        // this.panel_container.find('.design-area-database .toolbox-body').children(':not(h4)').remove();
        // this.panel_container.find('.design-area-database .toolbox-body').append(editor.attach(ctrl));

        this.panel_container.find('.design-area-docs .toolbox-body').children().remove();
        this.panel_container.find('.design-area-docs .toolbox-body').append(docs.attach(ctrl));

        this.panel_container.find('.design-area-comments .toolbox-body').children().remove();
        this.panel_container.find('.design-area-comments .toolbox-body').append(comments.attach(form));

        this.panel_container.find('.design-area-widgets .toolbox-body').children().remove();
        this.panel_container.find('.design-area-widgets .toolbox-body').addClass('no-overflow');
        this.panel_container.find('.design-area-widgets .toolbox-body').append(this.Toolbox.Get());

        this.panel_container.find('.design-area-project-settings .toolbox-body').children().remove();
        this.panel_container.find('.design-area-project-settings .toolbox-body').append(prj_props.attach(this.Project, this.Forms));

        this.panel_container.find('.design-area-props .toolbox-body').children().remove();
        this.panel_container.find('.design-area-props .toolbox-body').append(widget_props.attach(ctrl));
    };

}