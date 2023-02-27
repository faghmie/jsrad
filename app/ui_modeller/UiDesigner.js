import FormManager from "./FormManager.js";
import ProjectManager from "./ProjectManager.js";
import ProjectMenu from "./ProjectMenu.js";
import ProjectOpenDialog from "./ProjectOpenDialog.js";
import SidePanel from "./SidePanel.js";
import ControlFactory from "../widgets/ControlFactory.js";
import SqlDesigner from "../data_modeller/SqlDesigner.js";
import Form from "../widgets/Form.js";
import DocumentGenerator from "../common/DocumentGeneratorjs.js";

export default class UiDesigner {


	/**
	 * Set this property to `true` if you need to form changes to save to browser-db
	 *
	 * @memberof UiDesigner
	 */
	is_dirty = false;

	current_context = 'UI';

	constructor() {
		this.context = this;
		this.first_time_use = true;

		this.dom = {};
		this.type = 'designer';

		this.clipboard = [];
		this.undo_stack = [];
		this.datasources = {};
		this.save_timer = null;
		this.ProjectMenu = new ProjectMenu(this);
		this.Forms = new FormManager(this);
		this.Project = new ProjectManager(this, this.Forms);
		this.ProjectDialog = new ProjectOpenDialog(this, this.Project);
		this.DataModeller = new SqlDesigner(this, $('body'));

		$('.startup-loader').remove();
	}


	#get_designer() {
		return $(`<div class="jsrad-ui-designer ui-designer">
				<div class="design-work-area">
					<div class="workspace">
						<div class="app-area"></div>
						<div class="design-area design-controls">
							<div class="design-tab-canvas" ></div>
						</div>
					</div>
				</div>
			</div>`).appendTo($('body'));
	}

	build() {

		this.dom.designer = this.#get_designer();
		this.dom.workspace = this.dom.designer.find('.workspace');
		this.dom.app_area = this.dom.workspace.find('.app-area');
		this.dom.design_area = this.dom.workspace.find('.design-area');
		this.dom.design_forms = this.dom.designer.find('.design-tab-canvas');

		this.dom.app_area.hide();

		this.SidePanel = new SidePanel(this.Project, this.ProjectMenu, this.Forms);

		this.Forms.addForm().then(function () {
			this.switch_context();
		}.bind(this));


		this.dom.workspace.before(this.SidePanel.container);

		this.setup_key_bindings();

		this.ProjectDialog.Show();

		this.#list_for_events();
	}

	#list_for_events(){
		document.addEventListener('ide-switch-context', function (evt) {
			this.switch_context(evt.detail.context);
		}.bind(this));

		document.addEventListener('ide-toggle-project-mode', function (evt) {
			this.project_change_mode(evt.detail.in_run_mode);
		}.bind(this));

		document.addEventListener('ide-control-add', function (evt) {
			this.addControl(evt.detail);
		}.bind(this));

		document.addEventListener('ide-is-dirty', function (evt) {
			this.is_dirty = true;
		}.bind(this));

		document.addEventListener('ide-generate-docs', function (evt) {
			let doc_gen = new DocumentGenerator(this);
            doc_gen.Show();
		}.bind(this));
	}

	Show() {
		this.DataModeller.Hide();
		this.dom.designer.show();
	}

	switch_context(context) {
		if (context == 'DATA') {
			this.dom.designer.hide();
			this.DataModeller.Show();
			this.SidePanel.HideAll();
		} else {
			this.dom.designer.show();
			this.dom.design_area.show();
			this.dom.design_forms.show();
			this.DataModeller.Hide();
			this.SidePanel.Show();

			if (this.current_form) {
				this.current_form.show();
			} else {
				let form = this.Forms.getActiveForm();
				if (form) {
					form.show();
				} else if (this.Forms.Count() > 0) {
					for (form of this.Forms) {
						form.show();
						break;
					}
				}
			}
		}
	}

	removeSelected() {
		let form = this.Forms.getActiveForm(),
			c = null;
		for (c in form.controls) {
			let ctrl = form.controls[c];
			if (ctrl.selected !== true) continue;

			this.Forms.RemoveFormControl(ctrl);
		}

		this.is_dirty = true;
	};

	setup_key_bindings() {
		$(document).on('keydown', 'input, textarea', function (evt) {
			evt.stopPropagation();
		});

		$(document).on('keydown', function (evt) {
			evt.stopPropagation();

			if (evt.ctrlKey === true && 83 === evt.which) {
				evt.preventDefault();
				document.dispatchEvent(new CustomEvent('project-save'));
				return;
			}

			if (evt.ctrlKey === true && 79 === evt.which) {
				evt.preventDefault();
				this.ProjectDialog.Show();
				return;
			}

			let form = this.Forms.getActiveForm(),
				c = null,
				ctrl = null;

			if (!form) return;

			for (c in form.controls) {
				ctrl = form.controls[c];
				if (ctrl.selected !== true) continue;

				switch (evt.which) {
					case 38: //up-arrow
						ctrl.top -= 1; //GRID_SIZE;
						ctrl.move();
						break;

					case 40: //down-arrow
						ctrl.top += 1; //GRID_SIZE;
						ctrl.move();
						break;

					case 37: //left-arrow
						ctrl.left -= 1; //GRID_SIZE;
						ctrl.move();
						break;

					case 39: //right-arrow
						ctrl.left += 1; //GRID_SIZE;
						ctrl.move();
						break;
				}
			}

			switch (evt.which) {
				case 113: //F2 - edit label
					for (ctrl in form.controls) {
						if (true === form.controls[ctrl].selected) {
							form.controls[ctrl].dom.manager.trigger('dblclick');
							break;
						}
					}
					break;

				case 46: //remove
					this.context.removeSelected();
					break;

				case 67: //'C' for copy
					if (evt.ctrlKey === true) {
						//NOW CHECK IF A CONTROL WAS SELECTED
						this.clipboard = [];
						for (ctrl in form.controls) {
							if (true === form.controls[ctrl].selected)
								this.clipboard.push(form.controls[ctrl].toObject());
						}
					}
					break;

				case 86: //'V' for paste
					if (evt.ctrlKey === true) {
						if (!(this.clipboard instanceof Array)) this.clipboard = [];

						//FIRST GET THE ACTIVE FORM
						// for (let i = 0; i < this.clipboard.length; i++) {
						this.clipboard.forEach(json => {
							json.top += json.height + 20;
							json.left += 20;

							this.#paste_control(json);

						});
					}
					break;
			}
		}.bind(this));
	}

	async #paste_control(json) {
		delete json.uuid;
		delete json.form;

		let props_to_copy = Object.assign({}, json);

		let ctrl = await this.addControl(json);

		await ctrl.fromObject(props_to_copy);

		ctrl.format();
	}

	undo_push(operation, control) {
		let json = null;
		if (typeof control.toObject === 'function')
			json = control.toObject();
		else
			json = control;

		this.undo_stack.push({
			operation: operation,
			control: json,
		});

	}

	async addControl(control_info) {
		if (!control_info.form) {
			control_info.form = this.Forms.getActiveForm();
		}

		let ctrl = await new ControlFactory().Get(control_info.form, control_info);

		if (ctrl.default_value) ctrl.value = ctrl.default_value;

		control_info.form.controls[ctrl.uuid] = ctrl;
		ctrl.type = control_info.type;
		ctrl.change_mode(this.in_run_mode);
		ctrl.setValue();
		ctrl.move(control_info.left, control_info.top);

		control_info.form.setProcessStatus();

		this.is_dirty = true;

		return ctrl;
	}

	project_change_mode(in_run_mode) {
		/** @type{Form | undefined} */
		let active_form = null;

		if (typeof this.in_run_mode !== 'boolean') this.in_run_mode = false;

		// GET THE ACTIVE FORM
		if (this.Forms.Exists(this.Project.project.startup)) {
			active_form = this.Forms.Get(this.Project.project.startup);
		} else {
			active_form = this.Forms.getActiveForm();
		}

		if (typeof in_run_mode === 'boolean') this.in_run_mode = in_run_mode;

		if (true === this.in_run_mode) {
			this.dom.app_area.hide();
			this.dom.design_area.show();
			active_form = this.dom.app_area.data('form');
		} else {
			this.dom.app_area.show();
			this.dom.design_area.hide();
		}

		this.in_run_mode = !this.in_run_mode;

		if (active_form) {
			this.dom.design_forms.children().hide();
			active_form.show();
		}
	};

	async fromObject(json, in_run_mode) {
		if (typeof in_run_mode === 'undefined') in_run_mode = false;

		if (!json.project || ['application', 'module'].indexOf(json.project.type) === -1) {
			return App.MessageError('This is not an application file');
		}

		await this.#restore_forms(json, in_run_mode);

		this.DataModeller.fromObject(json.datamodels, true);
		if (json.connections instanceof Array) {
			json.connections.forEach(function(conn){
				let frm = this.Forms.Get(conn.container);
				if (!frm) return;
				this.Forms.AddConnector(frm, frm.controls[conn.from], frm.controls[conn.to], conn.style);
			}.bind(this));
		}
	}

	async #restore_forms(json, in_run_mode){
		let frm_found = null,
			forms = json.forms || {},
			form = null;

		if (true !== in_run_mode) {
			for (form in forms) {
				if (this.Forms.Exists(form)) {
					frm_found = this.Forms.Get(form);
					App.MessageError('One of your forms conflicts has the same id/name as :' + frm_found.label);
					return false;
				}
			}

			for (form in forms) {
				await this.Forms.addForm(forms[form]);
			}

			let prj = json.project;
			if (prj) {
				if (typeof prj.type !== 'string') {
					prj.type = 'application';
				}
			}

			//Open the last form, that was worked on
			if (json.design_settings) {
				this.Forms.showForm(json.design_settings.last_open_form);
			}

		} else if (true === in_run_mode) {
			//CLEAR THE DESIGNER
			this.Forms.removeAllForms();

			for (form in forms) {
				await this.Forms.addForm(forms[form]);
			}
		}
	}

	async toObject() {
		let json = {
			project: {},
			forms: {},
			datamodels: {}
		};

		json.datamodels = this.DataModeller.toObject();

		for (let form of this.Forms) {
			const form_to_json = new Promise((resolve, reject) => {
				window.setTimeout(function () {
					if (form) {
						json.forms[form.uuid] = form.toObject();
					}
					resolve();
				}, 100)
			});

			await form_to_json;
		}

		let form = this.Forms.getActiveForm();
		if (form) {
			json.design_settings = {
				last_open_form: form.uuid
			}
		}

		json.project = Object.assign({}, this.Project.project);
		if (typeof json.project.type !== 'string') json.project.type = 'application';
		json.name = json.project.name;
		json.type = json.project.type;
		json.drive_id = this.drive_id;
		json.uuid = this.Project.project.uuid;
		json.connections = this.Forms.toObject();

		return json;
	}
};