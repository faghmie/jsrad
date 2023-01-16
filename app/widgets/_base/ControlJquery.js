export const ControlJquery = (superclass) => class extends superclass {
	data() {
		var form = this.getForm();
		var result = {};

		for (var ctrl in form.controls) {
			result[form.controls[ctrl].name] = form.controls[ctrl].val();
		}

		return result;
	}

	show() {
		this.dom.container.show();
		return this;
	}

	hide() {
		this.dom.container.hide();
		return this;
	}

	append(ctrl) {
		if (this === ctrl) return;

		if (!ctrl || !ctrl.dom || !this.ctrl) return;

		this.ctrl.append(ctrl.dom.container);
		return this;
	}

	off(event_name) {
		if (this.dom.container.find('input:first').length !== 0) {
			this.dom.container.find('input:first').off(event_name);
		} else if (this.dom.container.find('select:first').length !== 0) {
			this.dom.container.find('select:first').off(event_name);
		} else if (this.dom.container.find('.control').length !== 0) {
			this.dom.container.find('.control').off(event_name);
		} else
			this.ctrl.off(event_name);

		return this;
	}

	on(event_name, data, callback) {
		if (this.dom.container.find('input:first').length !== 0) {
			this.dom.container.find('input:first').on(event_name, data, callback);
		} else if (this.dom.container.find('select:first').length !== 0) {
			this.dom.container.find('select:first').on(event_name, data, callback);
		} else if (this.dom.container.find('.control').length !== 0) {
			this.dom.container.find('.control').on(event_name, data, callback);
		} else
			this.ctrl.on(event_name, data, callback);

		return this;
	}

	focus(event_name, data, callback) {
		if (this.dom.container.find('input:first').length !== 0) {
			this.dom.container.find('input:first').focus();
		} else if (this.dom.container.find('select:first').length !== 0) {
			this.dom.container.find('select:first').focus();
		} else if (this.dom.container.find('.control').length !== 0) {
			this.dom.container.find('.control').focus();
		} else
			this.ctrl.focus();

		return this;
	}

	trigger(event_name) {
		if (!this.ctrl) return this;
		this.ctrl.trigger(event_name);

		return this;
	}

	find(selector) {
		return this.dom.container.find(selector);
	}

	val(string) {
		if (true === this.busy_importing) return;
		if (!this.ctrl) return this;
		if (typeof string === 'undefined') {
			return this.ctrl.val();
		} else {
			this.ctrl.val(string);
		}

		return this;
	}

	css(string) {
		if (typeof string !== 'undefined')
			return this.dom.container.css(string);

		return this;
	}

	offset() {
		return {
			top: 0,
			left: 0
		};
	}

	prop(key, value) {
		if (key === undefined && value === undefined) return null;

		if (value === undefined)
			return this.ctrl.prop(key);
		else
			this.ctrl.prop(key, value);

		return this;
	}

	attr(string) {
		return this.ctrl.attr(string);
	}

	html(string) {
		if (typeof string === 'undefined')
			return this.ctrl.html();
		else
			this.ctrl.html(string);

		return this;
	}

	text(string) {
		if (true === this.busy_importing) return;
		if (typeof string === 'undefined') {
			var result = this.ctrl.val();
			if (this.dom.container.find('select:first').length !== 0)
				result = this.dom.container.find('select:first').text();

			return result;
		} else {
			this.setLabel(string);
		}

		return this;
	}

	addClass(string) {
		this.ctrl.addClass(string);
		return this;
	}

	removeClass(string) {
		this.ctrl.removeClass(string);
		return this;
	}

}