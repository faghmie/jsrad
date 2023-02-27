//@ts-check

import WidgetConnector from "./WidgetConnector.js";
import ControlInterface from "./_base/ControlInterface.js"
import Form from './Form.js';

export default class ControlFactory {

	#set_control_defaults(ctrl, owner, type, left, top) {
		if (type.toLowerCase() == './form') {
			ctrl.designer = owner;
			ctrl.form = null;
		} else {
			ctrl.form = owner;
			ctrl.designer = null;
			ctrl.datamodel = owner.designer.DataModeller;
		}

		ctrl.selected = false;
		ctrl.top = top || 0;
		ctrl.left = left || 0;
		ctrl.type = type;
	}

	/**
	 *
	 *
	 * @param {Form} owner
	 * @param {ControlInfo} control_info
	 * @return {Promise<ControlInterface>} 
	 * @memberof ControlFactory
	 */
	async Get(owner, control_info) {
		let ctrl = await this.getControl(control_info.type);

		this.#set_control_defaults(ctrl, owner, control_info.type, control_info.left, control_info.top);

		ctrl.label = control_info.label;
		ctrl.description = control_info.description;

		// @ts-ignore
		ctrl.dom.container = $(`<div class="widget">
									<div class="widget-control">
									</div>
									<div class="widget-manager" ></div>
								</div>`)
			.data('control', ctrl);


		//CREATE A REFERENCE TO THE MAIN ROW OBJECT
		ctrl.dom.control = ctrl.dom.container.find('.widget-control');
		ctrl.dom.manager = ctrl.dom.container.find('.widget-manager');

		ctrl.dom.control.append(ctrl.ctrl);

		if (ctrl.form) {
			ctrl.form.append(ctrl);
		}

		// @ts-ignore
		if (window.widget_context_menu && ctrl.form) {
			// @ts-ignore
			new widget_context_menu(ctrl);
		}

		if (ctrl.getForm() === this) {
			ctrl.dom.container.removeClass('widget');
		}

		this.#enable_manager(ctrl);
		this.#enable_inline_editor(ctrl);
		this.#enable_line_connectors(ctrl);

		return ctrl;
	}

	#enable_manager(ctrl) {
		if (!ctrl.form) {
			ctrl.dom.manager.remove();
			return;
		}

		ctrl.dom.manager.show();

		ctrl.dom.container.on('mouseover', ctrl, function (evt) {
			evt.stopPropagation();
			evt.data.dom.manager.children().show();
		});

		ctrl.dom.container.on('mouseout', ctrl, function (evt) {
			evt.stopPropagation();
			evt.data.dom.manager.children().hide();
		});
	}

	#enable_inline_editor(ctrl) {
		ctrl.dom.manager.on('dblclick', ctrl, function (evt) {
			evt.stopPropagation();
			let $this = evt.data;
			$this.dom.manager.find('.widget-label-editor').remove();

			// @ts-ignore
			let editor = $('<textarea>').addClass('widget-label-editor').appendTo($this.dom.manager);
			let old_opacity = $this.dom.manager.css('opacity');

			editor.css({
				width: '100%',
				height: '100%',
				'min-width': '50px',
				'min-height': '40px',
				opacity: 1,
				display: 'table-cell',
				border: '1px solid red',
			});

			editor.val($this.label);
			$this.setLabel('');
			// editor[0].setSelectionRange(0, $this.label.length);
			$this.dom.manager.css('opacity', 1);
			// editor.focus();
			// editor.select();

			editor.on('keyup', function (evt) {
				evt.stopPropagation();

				if (evt.which === 27)
					editor.trigger('focusout');
			});

			editor.on('focusout', function (evt) {
				evt.stopPropagation();

				// @ts-ignore
				$this.setLabel(evt.target.value);
				editor.remove();
				$this.dom.manager.css('opacity', old_opacity);
			});
		});
	}

	#enable_line_connectors(ctrl) {
		if (ctrl.is_an_activity === true) {
			//Don't allow this for code-snippets
			//first need to figure out how to do it visually
			//for now activities can only be connected via their property window
			return;
		}
		// new WidgetConnector(ctrl, ctrl.dom.manager);

		// ctrl.dom.container.droppable({
		// 	greedy: true,
		// 	drop: function (event, ui) {
		// 		event.stopPropagation();
		// 		console.log('got here')
		// 		if (ui.draggable.is('.jsrad-line-connector') === false) return;
		// 		let src = ui.draggable.data('parent');

		// 		document.dispatchEvent(new CustomEvent('ui-control-add-connector', {
		// 			detail: {
		// 				form: src.getForm(),
		// 				from: src,
		// 				to: ctrl,
		// 			}
		// 		}));
		// 	}
		// });
	}

	async getControl(type) {
		let ctrl = await this.findControl(type);

		// @ts-ignore
		ctrl.form = this.form;

		ctrl.getControl();

		//COPY ALL THE DEFAULT PROPERTIES
		for (let key in ctrl.properties) {
			ctrl[key] = ctrl.properties[key];
		}

		ctrl.default_style = Object.assign({
			'font-style': 'normal',
			'font-size': '14'
		}, ctrl.style);

		if (ctrl) {
			ctrl.setUUID();
			ctrl.setName(type);
			if (typeof ctrl.label !== 'string')
				ctrl.label = type.replace(/_/g, ' ');
		}

		return ctrl;
	}

	findControl(type) {
		return new Promise((resolve, reject) => {
			import(`${type}.js`).then(module => {
				resolve(new module.default());
			}).catch(e => {
				reject(e);
				console.log(e);
			});
		});
	}
}

export class ControlInfo {
	type = "";
	label = "";
	category = "";
	description = "";
	thumbnail = "";
	left = 0;
	top = 0;
}