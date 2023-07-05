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

	/** @type{ResizeObserver|undefined} */
	resizeObserver = null;

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
	snap_to_width = false;

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
			this.make_resizable();
		}

		if (this.is_locked) {
			this.remove_resizable();
		}

		if (this.draggable !== false) {
			this.make_draggable();
		}

		this.dom.manager.children().show();

		//Do this timeout to prevent UI from locking
		//It allows for the UI to be more responsive
		window.setTimeout(function () {
			document.dispatchEvent(new CustomEvent('ui-show-properties', {
				detail: this
			}));
		}.bind(this), 10);

		return this;
	}

	deselect() {
		$('.ui-context-menu').remove();
		$('.jsrad-rotator').remove();

		this.selected = false;

		this.remove_resizable();

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
			this.remove_draggable();
			this.dom.manager.addClass('locked');
		} else {
			if (this.draggable !== false){
				this.make_draggable();
			}

			this.dom.manager.removeClass('locked');

			if (!this.isForm()){
				this.dom.manager.addClass('selected');
			}
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
		if (true === this.snap_to_width){
			let form = this.getForm();
			if (form != this){
				width = form.width;
				height ||= this.height;
				this.move(0, this.top);
			}
		}

		if (width !== undefined && height !== undefined) {
			this.width = width;
			if (false === this.height_fixed){
				this.height = height;
			}
		}

		if (!isNaN(parseFloat(this.min_height))) {
			if (this.height < this.min_height){
				this.height = this.min_height;
			} 
		}

		if (this.height <= 0) this.height = 26;

		this.dom.control.css({
			width: this.width,
			height: this.height
		});

		if (width > 0 && height > 0) {
			this.dom.container.css({
				width: this.width,
				height: this.height
			});
		}

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
			this.remove_draggable();
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

	setControlStyle() {
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

	remove_resizable() {
		this.dom.container.css({
			'resize': 'none',
			'overflow': 'visible'
		});

		if (this.resizeObserver && this.resizeObserver.unobserve) {
			this.resizeObserver.unobserve(this.dom.container[0]);
		}
	}

	make_resizable() {
		if (true === this.is_locked) return;

		this.dom.container.css({
			'resize': 'both',
			'overflow': 'hidden'
		});

		this.resizeObserver = new ResizeObserver(function (entries) {
			for (const entry of entries) {
				let width = this.width,
					height = this.height;

				if (entry.contentRect.width <= 0 || entry.contentRect.height <= 0){
					return; //Ignore rezising to zero, to prevent unwanted UI behaviour
				}

				if (this.width === entry.contentRect.width && this.height == entry.contentRect.height) {
					break;
				}

				if (this.width !== entry.contentRect.width) {
					width = entry.contentRect.width;
				}

				if (false === this.height_fixed && this.height !== entry.contentRect.height) {
					height = entry.contentRect.height;
				}

				this.resize(width, height);
			}
		}.bind(this));

		this.resizeObserver.observe(this.dom.container[0]);

		return this;
	}

	remove_draggable(){
		this.dom.container.attr('draggable', 'false');
	}

	make_draggable() {
		if (this.isForm() === true || true === this.is_locked) return this;

		this.dom.container.attr('draggable', 'true');

		this.dom.container[0].addEventListener('dragstart', function (evt) {
			let style = window.getComputedStyle(evt.target, null);

			evt.dataTransfer.setData("text/plain", JSON.stringify({
				left: (parseInt(style.getPropertyValue("left"), 10) - evt.clientX),
				top: (parseInt(style.getPropertyValue("top"), 10) - evt.clientY),
				uuid: this.uuid
			}));
		}.bind(this));

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
		if (!ctrl){
			return;
		}

		ctrl.on('dragover', function (evt) {
			evt.preventDefault(); // stops the browser from redirecting.
			return false;
		}.bind(this));

		ctrl[0].addEventListener('drop', function (evt) {
			let info = JSON.parse(evt.dataTransfer.getData("text/plain"));
			if (info.uuid) {
				let ctrl = this.getForm().controls[info.uuid];
				let left = (evt.clientX + parseInt(info.left, 10));
				let top = (evt.clientY + parseInt(info.top, 10));

				ctrl.move(left, top);
				document.dispatchEvent(new CustomEvent('ui-control-redraw-connector', {
					detail: ctrl
				}));

			} else if (info.widget) {
				let widget = JSON.parse(info.widget);
				widget.left = evt.offsetX;
				widget.top = evt.offsetY;
				document.dispatchEvent(new CustomEvent('ide-control-add', {
					detail: widget
				}));
			}
			
			evt.stopPropagation(); // stops the browser from redirecting.

			return false;
		}.bind(this));

		return this;
	}
}