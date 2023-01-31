
export default class AlignmentManager {
	width = null;
	height = null;
	style = null;

	attach(obj) {
		let widget = $(`<div class="text-formater">`);

		widget.append(`<div class="title-line">alignment</div>`);
		widget.append(this.get_alignment(obj));
		widget.append(this.get_order(obj));
		widget.append(this.get_sizer(obj));
		widget.append(this.get_styler(obj));

		return widget;
	};

	get_order(obj) {
		let prop = $(`
			<div>
				<button class="to-front">to front</button>
				<button class="send-back">send back</button>
            </div>`);

		prop.find('.to-front').on('click', obj, function (evt) {
			this.bringForward(evt.data);
		}.bind(this));

		prop.find('.send-back').on('click', obj, function (evt) {
			this.sendBack(evt.data);
		}.bind(this));

		return prop;
	}

	get_sizer(obj) {
		let prop = $(`
			<div>
				<button class="copy">copy size</button>
				<button class="paste">paste size</button>
            </div>`);

		prop.find('.copy').on('click', obj, function (evt) {
			this.width = evt.data.width;
			this.height = evt.data.height;
		}.bind(this));

		prop.find('.paste').on('click', obj, function (evt) {
			if (this.height == null || this.width == null) {
				return console.log('no resizing allowed');
			}

			let form = evt.data.getForm();
			
			for (let f in form.controls) {
				let ctrl = form.controls[f];
				if (ctrl.selected === true) {
					ctrl.resize(this.width, this.height);
				}
			}

		}.bind(this));

		return prop;
	}

	get_styler(obj) {
		let prop = $(`
			<div>
				<button class="copy">copy style</button>
				<button class="paste">paste style</button>
				<button class="default">default style</button>
            </div>`);

		prop.find('.copy').on('click', obj, function (evt) {
			this.style = Object.assign({}, evt.data.style);
		}.bind(this));

		prop.find('.paste').on('click', obj, function (evt) {
			if (this.style == null) {
				return console.log('no styling allowed');
			}

			let form = evt.data.getForm();
			
			for (let f in form.controls) {
				let ctrl = form.controls[f];
				if (ctrl.selected === true) {
					ctrl.style = Object.assign({}, this.style);
					ctrl.setControlStyle();
					ctrl.format();
				}
			}

		}.bind(this));

		prop.find('.default').on('click', obj, function (evt) {
			let form = evt.data.getForm();
			
			for (let f in form.controls) {
				let ctrl = form.controls[f];
				if (ctrl.selected === true && ctrl.default_style) {
					ctrl.style = Object.assign({}, ctrl.default_style);
					ctrl.setControlStyle();
					ctrl.format();
				}
			}

		}.bind(this));

		return prop;
	}

	get_alignment(obj) {
		let prop = $(`
					<div class="row">
						<button class=" la la-download la-rotate-90 left btn" title="align to left"></button>
						<button class="la la-download la-rotate-180 top btn" title="align top"></button>
						<button class="la la-download la-rotate-270 right btn" title="align to right"></button>
						<button class="la la-download bottom btn" title="align bottoms"></button>
					</div>`);

		prop.find('.left').on('click', obj, function (evt) {
			this.toLeft(evt.data);
		}.bind(this));

		prop.find('.top').on('click', obj, function (evt) {
			this.toTop(evt.data);
		}.bind(this));

		prop.find('.right').on('click', obj, function (evt) {
			this.toRight(evt.data);
		}.bind(this));

		prop.find('.bottom').on('click', obj, function (evt) {
			this.toBottom(evt.data);
		}.bind(this));

		return prop;
	}

	sendBack() {
		let form = ctrl.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (let c in form.controls) {
			if (true === form.controls[c].selected) {
				form.controls[c].toBack();
			}
		}
	}

	bringForward() {
		let form = ctrl.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (let c in form.controls) {
			if (true === form.controls[c].selected) {
				form.controls[c].toFront();
			}
		}
	}

	toTop() {
		let f = null,
			form = ctrl.getForm(),
			ctrl = null,
			top = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				if (top == null || ctrl.top < top) {
					top = ctrl.top;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(ctrl.left, top);
			}
		}
	}

	toLeft() {
		let f = null,
			form = ctrl.getForm(),
			ctrl = null,
			left = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				if (left == null || ctrl.left < left) {
					left = ctrl.left;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(left, ctrl.top);
			}
		}
	}

	toRight() {
		let f = null,
			form = ctrl.getForm(),
			ctrl = null,
			right = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				let c_r = ctrl.left + ctrl.width;

				if (right == null || c_r > right) {
					right = c_r;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(right - ctrl.width, ctrl.top);
			}
		}
	}

	toBottom() {
		let f = null,
			form = ctrl.getForm(),
			ctrl = null,
			bottom = null;

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				let c_b = ctrl.top + ctrl.height;

				if (bottom == null || c_b > bottom) {
					bottom = c_b;
				}
			}
		}

		for (f in form.controls) {
			ctrl = form.controls[f];
			if (ctrl.selected === true) {
				ctrl.move(ctrl.left, bottom - ctrl.height);
			}
		}
	}
}