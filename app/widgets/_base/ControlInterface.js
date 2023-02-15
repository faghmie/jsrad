// import Form from "../form.js";
import { ControlActivityBase } from "./ControlActivityBase.js";
import ControlBase from "./ControlBase.js";
import { ControlDatasource } from "./ControlDatasource.js";
import { ControlJquery } from "./ControlJquery.js";

export default class ControlInterface extends ControlDatasource(ControlActivityBase(ControlJquery(ControlBase))) {
	name = '';
	value = null;
	required = false;
	description = '';
	default_value = '';
	behaviour = '';
	navigation = '';

	/** @type {Form | undefined} */
	form = null;

	left = 10;
	top = 10;
	width = 200;
	height = 200;
	height_fixed = false;
	style = {
		'text-align': '',
		'font-weight': 'normal',
		'font-style': '',
		'font-size': '',
		'border-style': '',
		'border-width': 0,
		'border-color': '#000000',
		'vertical-align': 'middle',
	};
	style_to_exclude = [];
	hover = false;
	tab_index = 0;
	position_index = 0;
	dom = {};
	disabled = false;
	is_dirty = false;
	is_a_card = false;
	aspect_ratio = false;
	is_locked = false;

	/** @type {ControlInterface | undefined} */
	controls = {};

	select(ctrl_key) {
		$('.ui-context-menu').remove();

		if (true === this.in_run_mode) return this;

		this.selected = true;

		if (this.form) {
			if (true === this.is_locked) {
				this.dom.manager.addClass('locked');
			} else {
				this.dom.manager.addClass('selected');
			}
		}

		if (this.resizable === undefined || this.resizable === true) {
			if (this.dom.container.is('.ui-resizable')) {
				this.dom.container.resizable('enable');
			} else {
				this.make_resizable();
			}
		}

		if (this.dom.container.is('.ui-resizable') && this.is_locked) {
			this.dom.container.resizable('disable');
		}

		if (!this.dom.container.is('.ui-draggable')) {
			this.make_draggable();
		}

		this.dom.manager.children().show();

		//Do this timeout to prevent UI from locking
		//It allows for the UI to be more responsive
		window.setTimeout(function () {
			document.dispatchEvent(new CustomEvent('ui-set-properties', {
				detail: this
			}));
		}.bind(this), 10);

		return this;
	}

	deselect() {
		$('.ui-context-menu').remove();
		$('.jsrad-rotator').remove();

		this.selected = false;

		if (this.dom.container.is('.ui-resizable'))
			this.dom.container.resizable('disable');

		this.dom.manager.removeClass('selected locked');
		this.dom.manager.children().hide();

		return this;
	}

	refresh() {
		if (this.busy_importing === true) return;
		return this;
	}

	get_settings() {
		//Controls must override this with their settings
	}

	get_documentation() {
		let html = '';

		//TITLE
		html += '<h2>Description</h2>';
		html += '<p>' + this.description + '</p>';

		//COLUMNS
		html += '<h2>Elements</h2>';

		for (let key in this.controls) {
			let ctrl = this.controls[key];
			html += '<h3>' + ctrl.label + '</h3>';
			html += '<table>';
			html += '<thead><tr>';
			html += '</tr></thead>';

			html += '<tbody>';

			html += '<tr>' +
				'<th style="width:80px;">Type</th>' +
				'<td>' + ctrl.type + '</td>' +
				'</tr>';

			html += '<tr>' +
				'<th>Required</th>' +
				'<td>' + (true === ctrl.required ? 'YES' : '') + '</td>' +
				'</tr>';

			html += '<tr>' +
				'<th>Default</th>' +
				'<td>' + ctrl.default_value + '</td>' +
				'</tr>';

			html += '<tr>' +
				'<th>Behaviour</th>' +
				'<td>' + ctrl.behaviour + '</td>' +
				'</tr>';

			html += '<tr>' +
				'<th>Description</th>' +
				'<td>' + ctrl.description + '</td>' +
				'</tr>';

			if (ctrl.datasource.name) {
				html += '<tr>' +
					'<th>Datasource</th>' +
					'<td>Yes</td>' +
					'</tr>';
			}
			html += '</tbody></table>';
		}



		return html;
	}

	setDisabled(bool) {
		this.disabled = typeof bool !== 'undefined' ? bool : this.disabled;

		if (!this.ctrl) return;

		let ctrl = this.dom.control.find('input, textarea, select');
		ctrl.removeAttr('disabled');
		if (true === this.disabled)
			ctrl.attr('disabled', 'disabled');
	}

	setLock(bool) {

		if (typeof bool === 'undefined') bool = false;

		this.is_locked = bool;

		if (this.is_locked === true) {
			if (this.dom.container.is('.ui-draggable') === true) {
				this.dom.container.draggable('destroy');
			}
			this.dom.manager.addClass('locked');

		} else {
			if (this.dom.container.is('.ui-draggable') === false)
				this.make_draggable();

			this.dom.manager.removeClass('locked');

			if (!this.isForm())
				this.dom.manager.addClass('selected');
		}
	}

	toFront() {
		//GO THROUGH ALL VISUALS ON CENTER PANE AND
		let form = this.getForm();
		let z = 2;
		let z_ctrl = null;
		let index = 0;

		for (let ctrl in form.controls) {
			if (!form.controls[ctrl].dom) continue;
			let z_curr = parseFloat(form.controls[ctrl].dom.container.css('z-index'));

			if (z_curr >= z) {
				z = z_curr;
				form.controls[ctrl].order = z - 1;
				form.controls[ctrl].dom.container.css('z-index', form.controls[ctrl].order);
				if (null !== z_ctrl) z++;

				z_ctrl = ctrl;
			}
		}

		this.order = z;
		this.dom.container.css({
			'z-index': z
		});
	}

	toBack() {
		//GO THROUGH ALL VISUALS ON CENTER PANE AND
		let form = this.getForm();
		let z = 0;
		let z_ctrl = null;
		let index = 0;

		for (let ctrl in form.controls) {
			if (!form.controls[ctrl].dom) continue;

			let z_curr = parseFloat(form.controls[ctrl].dom.container.css('z-index'));

			// if (form.controls[ctrl].dom.container.css('z-index') === 'auto') {
			// 	form.controls[ctrl].order = 1;
			// 	form.controls[ctrl].dom.container.css('z-index', form.controls[ctrl].order);

			// }
			// if (parseFloat(form.controls[ctrl].dom.container.css('z-index')) < z) {
			if (z_curr < z) {
				// z = parseFloat(form.controls[ctrl].dom.container.css('z-index'));
				form.controls[ctrl].order = z_curr + 1;
				form.controls[ctrl].dom.container.css('z-index', form.controls[ctrl].order);
				if (null !== z_ctrl) z--;

				z_ctrl = ctrl;
			}
		}

		this.order = z;
		this.dom.container.css({
			'z-index': z
		});
	}

	setOrder(z_order) {
		if (typeof z_order !== 'undefined') this.order = parseFloat(z_order);
		if (!isNaN(this.order))
			this.dom.container.css('z-index', this.order);
	}

	destroy() {
		this.dom.container.remove();
	}

	getParent() {
		let form = this.getForm();
		if (this === form) {
			parent = this.dom.container.parent();
			return parent;
		}

		let parent = form;
		for (let ctrl in form.controls) {
			if (ctrl === this.uuid) continue;
			if (form.controls[ctrl].dom && form.controls[ctrl].dom.container.find('#' + this.uuid).length > 0) {
				parent = form.controls[ctrl];
			}
		}

		return parent;
	}

	isForm() {
		let form = this.form;
		if (!form) form = this;

		return form === this;
	}

	get_link_form(only_show_processes) {
		let form = this.getForm();
		let designer = form.designer;

		let div = $(`<div>`).addClass('input-group');
		let select = $(`<select>`).addClass('form-control').appendTo(div);

		let btn_addon = $(`<span>`).addClass('input-group-btn').appendTo(div);
		let btn = $(`<a>`)
			.addClass('btn btn-flat btn-outline btn-light')
			.html('<i class="la la-lg la-arrow-circle-right" ></i>')
			.appendTo(btn_addon);

		if (only_show_processes !== true) only_show_processes = false;

		select.append('<option type="click" value="{{none}}">');

		for (let frm of designer.Forms) {
			if (frm.uuid === form.uuid) continue;
			if (true === only_show_processes && frm.isProcess() !== true) continue;

			select.append('<option value="' + frm.uuid + '">' + frm.label + '</option>');

			if (this.linked_form === frm.uuid)
				select.find('option:last-child').attr('selected', 'selected');
		}

		select.on('change', function (evt) {
			evt.stopPropagation();
			this.ctrl.off('click');
			this.linked_form = evt.target.value;
		}.bind(this));

		btn.on('click', function (evt) {
			if (form.designer.Forms.Exists(this.linked_form)) {
				form.designer.Forms.showForm(this.linked_form);
			}
		}.bind(this));

		div = $('<div>').append(div);

		return div;
	}

	format() {
		if (isNaN(parseFloat(this.opacity))) this.opacity = 1;
		if (isNaN(parseFloat(this.rotation))) this.rotation = 0;

		if (this.busy_importing === true) return;

		this.ctrl.css({
			opacity: parseFloat(this.opacity)
		});

		this.dom.control.css({
			overflow: 'visible',
			border: '0',
			'-ms-transform': 'rotate(' + this.rotation + 'deg)',
			'-webkit-transform': 'rotate(' + this.rotation + 'deg)',
			'transform': 'rotate(' + this.rotation + 'deg)'
		});

		this.move();
		this.resize();
		this.setOrder();
		this.setControlStyle();
		this.setToolTip();
		this.setTabIndex();
		this.setHover();
		this.setAsCard();
		this.setDisabled();

		this.ctrl.show();

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));
	}

	resize(width, height) {
		if (typeof width !== 'undefined' && typeof height !== 'undefined') {
			this.width = width;
			if (false === this.height_fixed)
				this.height = height;
		}

		if (!isNaN(parseFloat(this.min_height))) {
			if (this.height < this.min_height) this.height = this.min_height;
		}

		if (this.height <= 0) this.height = 26;

		this.dom.control.css({
			width: this.width,
			height: this.height
		});

		this.dom.container.css({
			width: (parseFloat(this.dom.control.css('width')) + 4),
			height: (parseFloat(this.dom.control.css('height')) + 4)
		});

		if (!this.ctrl) return;

		this.ctrl.css({
			width: (parseFloat(this.dom.control.css('width'))),
			height: (parseFloat(this.dom.control.css('height')))
		});

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));
	}

	sync() {
		if (this.busy_importing === true) return;

		this.setLabel();
		this.setValue();
		this.format();
	}

	change_mode(in_run_mode) {
		if (!this.ctrl) return;
		let $this = this;
		this.in_run_mode = typeof in_run_mode !== 'undefined' ? in_run_mode : this.in_run_mode;

		this.format();

		let form = this.getForm();

		if (false === this.in_run_mode) {
			if (this.form) {
				this.dom.manager.show();
				this.dom.manager.off('click').on('click', function (evt) {
					evt.stopPropagation();

					if (false === evt.ctrlKey) {
						let form = this.getForm();
						for (let c in form.controls) {
							form.controls[c].deselect();
						}
					}

					this.select(evt.ctrlKey);
				}.bind(this));

				this.make_draggable();
			}
		} else {
			this.deselect();
			this.dom.manager.hide();
			if (this.linked_form) {
				let next_form = form.designer.Forms.Get(this.linked_form);
				if (next_form) {
					this
						.off('click')
						.on('click', $this, function (evt) {
							evt.stopPropagation();

							let $this = evt.data;
							let form = $this.getForm();
							let next_form = form.designer.Forms.Get($this.linked_form);
							form.pre_close();
							next_form.show(null, form.message);
						});
					this.ctrl
						.off('mouseover')
						.on('mouseover', $this, function (evt) {
							$(this).css('cursor', 'pointer');
						});
				}
			} else if (this.data_model_action && (typeof this.dm_is_data_aware === 'function')) {
				//logger.log('setting up the data-model action');
				this.dm_execute();
			}

			//LINK PARENT-CHILD CONTROLS TOGETHER
			this.create_parent_child_link();
		}

		if (this !== this.getForm())
			this.make_inline();

		for (let key in this.controls) {
			this.controls[key].change_mode(in_run_mode);
		}

		return this;
	}

	create_parent_child_link() {
		let form = this.getForm();
		let obj = this;
		let ctrl = form.controls[this.parent_control];
		if (!ctrl) return;

		if (ctrl && !ctrl.ctrl) return;

		let evt_type = 'input';
		let filter_type = 'contains';
		let evt_ctrl = ctrl.ctrl;

		switch (ctrl.type) {
			case 'text':
			case 'number':
				evt_ctrl = ctrl.ctrl.find('input');
				break;

			case 'textarea':
			case 'auto_complete':
				evt_type = 'input';
				break;

			case 'ol':
				evt_type = 'click';
				break;

			default:
				evt_type = 'change';
				filter_type = 'exact';

		}

		evt_ctrl.on(evt_type, {
			child: obj,
			parent: ctrl,
			filter_type: filter_type
		}, function (evt) {
			let link = evt.data;
			let obj = link.child;
			let form = obj.getForm();
			let uuid = $(this).val();
			let filter_on = link.parent.name;
			let filter_value = link.parent.val();

			if (typeof obj.parent_control_field === 'string')
				filter_on = obj.parent_control_field;

			if (filter_value == '{null}' || filter_value.length === 0) {
				obj.datasource.filter = null;
			} else {
				obj.datasource.filter = {};
				obj.datasource.filter[filter_on] = filter_value;
				obj.datasource.filter_type = link.filter_type;
			}
			console.log(obj.datasource.filter);
			obj.setValue();
		});
	}

	setHover(bool) {
		if (!this.ctrl) return this;

		this.hover = typeof bool !== 'undefined' ? bool : this.hover;

		this.ctrl.off('mouseover').off('mouseleave');

		if (false === this.hover) return this;

		if (false === this.in_run_mode) return this;

		this.ctrl
			.on('mouseover', function () {
				$(this).addClass('ui-state-highlight').css('cursor', 'pointer');
			})
			.on('mouseleave', function () {
				$(this).removeClass('ui-state-highlight').css('cursor', 'default');
			});

		return this;
	}

	setTabIndex(number) {
		if (!this.ctrl) return;

		this.tab_index = typeof number !== 'undefined' ? parseFloat(number) : this.tab_index;
		this.tab_index = this.tab_index < 1 ? 1 : this.tab_index;

		this.ctrl.attr('tabindex', this.tab_index);

		return this;
	}

	setLabel(string) {
		this.label = typeof string !== 'undefined' ? $.trim(string) : this.label;

		this.format();

		return this;
	}

	setToolTip(string) {
		this.tooltip = typeof string !== 'undefined' ? $.trim(string) : this.tooltip;
		this.ctrl.attr('title', this.tooltip);

		return this;
	}

	getMessageValue() {
		let message = this.getForm().message;
		if (message)
			return message[this.name];
		else
			return null;
	}

	setValue(value) {
		if (!this.ctrl) return;

		this.value = typeof value !== 'undefined' ? value : this.value;

		this.ctrl.val(this.value);

		return this;
	}

	setDefault(value) { //OVER-RIDE THIS IN INDIVIDUAL WIDGETS FOR SETTING DEFAULT VALUE
		//this.default_value = typeof value === 'string' ? value : this.default_value;
		this.setValue(value);
		return this;
	}

	setName(string) {
		this.name = typeof string !== 'undefined' ? $.trim(string) : this.name;

		return this;
	}

	setControlStyle(css) {
		let key = null;
		if (!this.ctrl) return;

		for (key in this.style) {
			if (this.style_to_exclude.indexOf(key) !== -1) continue;
			this.ctrl.css(key, this.style[key]);
		}

		return this;
	}

	getControlStyle() {
		return this.style;
	}

	move(left, top) {
		if (this.is_locked === true && this.busy_importing === false) return;
		left = typeof left !== 'undefined' ? left : this.left;
		top = typeof top !== 'undefined' ? top : this.top;

		this.left = left;
		this.top = top;
		if (parseFloat(this.left) <= 0) this.left = 0;
		if (parseFloat(this.top) <= 0) this.top = 0;
		this.dom.container.css({
			'position': (this.isForm() ? 'relative' : 'absolute'),
			'left': this.left,
			'top': this.top,
		});

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));

		return this;
	}

	setRequired(bool) {
		this.required = typeof bool !== 'undefined' ? bool : this.required;

		if (!this.dom.control) {
			return;
		}

		if (true === this.required)
			this.dom.control.addClass('required');
		else
			this.dom.control.removeClass('required');

		return this;
	}

	setAsCard(bool) {
		this.is_a_card = typeof bool !== 'undefined' ? bool : this.is_a_card;
		let ctrl = this.dom.control.children(':first');

		if (!ctrl) {
			return;
		}

		if (true === this.is_a_card)
			ctrl.addClass('card ui-shadow');
		else
			ctrl.removeClass('card ui-shadow');

		return this;
	}

	make_resizable() {
		let $this = this,
			form = this.getForm();
		if (true === this.is_locked) return;

		if (this.dom.container.is('.ui-resizable')) return;
		let handlers = 'all',
			contain_to = form.dom.container;

		handlers = {
			'nw': '.nwgrip',
			'ne': '.negrip',
			'sw': '.swgrip',
			'se': '.segrip',
			'n': '.ngrip',
			'e': '.egrip',
			's': '.sgrip',
			'w': '.wgrip'
		};
		if (!this.form) {
			handlers = 'e, s, se';
			contain_to = null;
		} else {
			this.create_resize_handles();
		}

		this.dom.container.resizable({
			handles: handlers,
			aspectRatio: this.aspect_ratio,
			// containment: contain_to,
			resize: function (evt, ui) {
				if ($this.width !== ui.size.width)
					$this.width = ui.size.width;

				if (false === $this.height_fixed && $this.height !== ui.size.height)
					$this.height = ui.size.height;
				$this.resize();
			}
		});
		return this;
	}

	create_resize_handles() {
		let container = this.dom.container;

		let handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-nw nwgrip jsrad-resize-handles')
			.appendTo(container);

		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-ne negrip jsrad-resize-handles')
			.appendTo(container);
		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-sw swgrip jsrad-resize-handles')
			.appendTo(container);
		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-se segrip jsrad-resize-handles')
			.appendTo(container);

		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-n ngrip jsrad-resize-handles')
			.appendTo(container);

		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-s sgrip jsrad-resize-handles')
			.appendTo(container);

		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-e egrip jsrad-resize-handles')
			.appendTo(container);
		handle = $('<div>')
			.addClass('ui-resizable-handle ui-resizable-w wgrip jsrad-resize-handles')
			.appendTo(container);

	}

	make_draggable() {
		if (App.is_mobile) return this.make_draggable_mobile();

		if (this.isForm() === true || true === this.is_locked) return this;

		this.dom.container.on('mousedown touchstart', this, function (evt) {
			let $this = evt.data,
				form = $this.getForm(),
				startpoint = {},
				offset = {};
			evt.stopPropagation();
			if (true === $this.busy_resizing) return;

			$this.select();
			$this.dom.container.draggable({
				handle: '.widget-manager',
				cursor: 'move',
				distance: 10,
				//snap           : true,
				//smartguides    : '.widget',
				tolerance: 2,
				margin_top: parseFloat(form.dom.container.offset().top),
				margin_left: parseFloat(form.dom.container.offset().left),
				helper: evt.ctrlKey ? 'clone' : 'original',
				containment: [
					0, 45,
					parseFloat(form.width) + parseFloat(form.dom.container.offset().left) - parseFloat($this.width),
					parseFloat(form.height) + parseFloat(form.dom.container.offset().top) - parseFloat($this.height),
				],

				start: function (event, ui) {
					startpoint = ui.position;
				},

				drag: function (event, ui) {
					let id = ui.helper.find('.main-control').attr('id');
					if (!(id in form.controls)) {
						return;
					}
					let obj = form.controls[id];
					if (obj.is_locked === true) {
						return false;
					}

					let offset = Object.assign({}, ui.position);

					if (event.ctrlKey === true) return true;

					offset.top -= startpoint.top;
					offset.left -= startpoint.left;
					for (let key in form.controls) {
						let ctrl = form.controls[key];
						if (ctrl.selected !== true) continue;
						ctrl.move(ctrl.left + offset.left, ctrl.top + offset.top);
					}
					startpoint = Object.assign({}, ui.position);
				},

				stop: function (event, ui) {
					let form = $this.getForm(),
						f = null,
						ctrl = null,
						pos = null,
						id = 0,
						json = null;

					if (event.ctrlKey === true) {
						//COPY THE ORIGINAL ITEM
						id = ui.helper.find('.main-control').attr('id');

						if (!(id in form.controls)) {
							App.MessageError('Some went wrong with copying the control. Could not find the ID');
							return;
						}
						json = form.controls[id].toObject();
						ctrl = new FD.Control(form, json.type, ui.position.left, ui.position.top);
						ctrl.setUUID();
						ctrl.setValue();
						json.top = ui.position.top;
						json.left = ui.position.left;
						json.uuid = ctrl.uuid;
						form.controls[ctrl.uuid] = ctrl.fromObject(json, form);
						form.controls[ctrl.uuid].change_mode(false);
					} else {
						pos = $this.dom.container.position();
						$this.move(pos.left, pos.top);
						document.dispatchEvent(new CustomEvent('ui-control-redraw-connector', {
							detail: {
								form: form
							}
						}));
					}
				}
			});
		});

		return this;
	}

	make_draggable_mobile() {
		if (this.isForm() === true || true === this.is_locked) return this;
		let $this = this,
			form = this.getForm(),
			startpoint = {},
			offset = {};
		$this.dom.container.draggable({
			handle: '.widget-manager',
			cursor: 'move',
			distance: 10,
			tolerance: 2,

			stop: function (event, ui) {
				pos = $this.dom.container.position();
				$this.move(pos.left, pos.top);
			}
		});

		return this;
	}

	make_inline(inline) {
		if (typeof inline === 'undefined')
			inline = this.inline_editing || false;
		else
			this.inline_editing = inline;

		this.dom.container.find('.control-text').remove();

		if (false === this.in_run_mode || false === inline) {
			this.ctrl.show();
			return this;
		}

		let text = $('<div>')
			.css({
				width: this.width,
				height: this.height,
				padding: '5px',
			})
			.addClass('control-text')
			.appendTo(this.dom.container);
		let indicator = $('<i>')
			.addClass('la la-fw la-pencil')
			.appendTo(text)
			.css({
				position: 'absolute',
				top: 0,
				right: 30,
			})
			.hide();
		this.ctrl.hide();
		for (let key in this.style) {
			text.css(key, this.style[key]);
		}
		text.html(this.text());
		this.off('blur').on('blur', this, function (evt) {
			let $this = evt.data;
			text.html($this.text());
			$this.ctrl.hide();
			text.show();

			//DO THE AJAX STUFF HERE FOR UPDATE
			let data = Object.assign({}, $this.datasource.filter);
			for (key in data) {
				if (data[key][0] === '{') {
					let message = Object.assign({}, $this.message);
					//THIS MUST BE AN ATTRIBUTE OF THE MESSAGE OF THE FORM
					let form = $this.getForm();
					if (form.isProcess() === false)
						message = Object.assign($this.message, form.message);

					data[key] = data[key].replace(/(\})|(\{)/g, '');

					if (message && (data[key] in message))
						data[key] = message[data[key]];
				}
			}
			let table = App.datasources[$this.datasource.name].entities[$this.datasource.entity];
			for (let key = 0; key < $this.datasource.value.length; key++) {
				let field = table.fields[$this.datasource.value[key]];
				data[field.name] = $this.val();
			}

			table.update(null, data, function () {
				//logger.log('update complete');
			});
		});

		this.off('input').on('input', this, function (evt) {
			text.html(evt.data.text());
		});

		text
			.on('click', this, function (evt) {
				text.hide();
				evt.data.ctrl.show();
				evt.data.focus();
			})
			.on('mouseover', function (evt) {
				text.addClass('text-outline');
				indicator.show();
			})
			.on('mouseleave', function (evt) {
				text.removeClass('text-outline');
				indicator.hide();
			});

		return this;
	}

	make_rotator() {
		let $this = this,
			form = this.getForm();


		$('.srad-rotator').remove();

		let handle = $('<div>')
			.addClass('jsrad-rotator')
			.css({
				position: 'absolute',
				right: -20,
				top: -20,
			})
			.appendTo(this.dom.container);
		handle.append('<i class="la la-rotate-right"></i>');

		let dragging = false,
			startpoint = null,
			endpoint = null,
			midpoint = handle.position();

		midpoint = {
			x: midpoint.left - 2,
			y: midpoint.top - 2
		};
		handle.draggable({
			containment: [
				parseFloat($this.dom.container.offset().left) - 20,
				parseFloat($this.dom.container.offset().top) - 20,
				parseFloat($this.dom.container.offset().left) + parseFloat($this.width) + 20,
				parseFloat($this.dom.container.offset().top) + parseFloat($this.height) + 20,

			],

			start: function (e) {
				dragging = true;
				startpoint = {
					x: e.offsetX,
					y: e.offsetY
				};
			},

			stop: function (e) {
				dragging = false;

			},

			drag: function (e) {
				let angle = 0,
					sp = startpoint,
					mp = midpoint;
				let p = {
					x: e.offsetX,
					y: e.offsetY
				};
				let sAngle = Math.atan2((sp.y - mp.y), (sp.x - mp.x));
				let pAngle = Math.atan2((p.y - mp.y), (p.x - mp.x));

				angle = (pAngle - sAngle) * 180 / Math.PI;

				if (angle >= 0 && angle > 90) {
					$this.rotation += 45;
				} else if (angle < 0 && Math.abs(angle) > 90) {
					$this.rotation -= 45;
				}

				$this.format();

				startpoint = {
					x: p.x,
					y: p.y
				};
			}
		});
	}

	hasDropZone(dom_area) {
		if (!this.ctrl) return false;
		let can_drop = false;

		return can_drop;
	}

	make_droppable(ctrl) {
		let $this = this;
		let form = this.getForm() || ctrl;
		if (!ctrl) return;

		ctrl.droppable({
			greedy: true,
			drop: function (event, ui) {
				if (ui.draggable.is('.widget-template') === false) return;
				let item = ui.draggable;

				let offset = $(this).offset(),
					left = ui.position.left - offset.left,
					top = ui.position.top - offset.top;

				let control_info = JSON.parse(item.attr('widget'));
				control_info.left = left;
				control_info.top = top;

				if (!form.designer) return;

				//fire off an event
				document.dispatchEvent(new CustomEvent('ide-control-add', {
					detail: control_info
				}));
			}
		});

		return this;
	}
}