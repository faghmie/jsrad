
export default class AlignmentManager {
	width = null;
	height = null;
	style = null;

	attach(obj) {
		var widget = $('<div class="text-formater">');

		widget.append(`<div class="title-line">alignment</div>`);
		widget.append(this.get_alignment(obj));
		widget.append(this.get_order(obj));
		widget.append(this.get_sizer(obj));
		widget.append(this.get_styler(obj));

		return widget;
	};

	get_order(obj) {
		var prop = $(`<div class="text-formatter">
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
		var prop = $(`<div class="text-formatter">
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
		var prop = $(`<div class="text-formatter">
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
		var prop = $(`<div class="text-formatter">
						<button class=" la la-download la-rotate-90 left btn" title="align to left">
						</button>
						<button class="la la-download la-rotate-180 top btn" title="align top">
						</button>
						<button class="la la-download la-rotate-270 right btn" title="align to right">
						</button>
						<button class="la la-download bottom btn" title="align bottoms">
						</button>
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

	sendBack(ctrl) {
		console.log('back')
		var form = ctrl.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (var c in form.controls) {
			if (true == form.controls[c].selected) {
				console.log(form.controls[c].type)
				form.controls[c].toBack();
			}
		}
	}

	bringForward(ctrl) {
		console.log('front')
		var form = ctrl.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (var c in form.controls) {
			if (true == form.controls[c].selected) {
				console.log(form.controls[c].type)
				form.controls[c].toFront();
			}
		}
	}

	toTop(ctrl) {
		var f = null,
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

	toLeft(ctrl) {
		var f = null,
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

	toRight(ctrl) {
		var f = null,
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

	toBottom(ctrl) {
		var f = null,
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

var dimensions_property = function (_designer) {
	var widget = null,
		designer = _designer,
		$this = this;

	var property_list = [
		["", "<div class='btn-group'>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified lock-control'>Lock control</button>" +
			"</div>"
		],
		["", "<div class='btn-group'>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified send-back'>send back</button>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified bring-forward'>bring forward</button>" +
			"</div>"
		],
		["", "<div class='btn-group'>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified align-tops'>align tops</button>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified align-lefts'>align lefts</button>" +
			"</div>"
		],
		["", "<div class='btn-group'>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified width-biggest'>width biggest</button>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified width-smallest'>width smallest</button>" +
			"</div>"
		],
		["", "<div class='btn-group'>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified height-biggest'>height biggest</button>" +
			"<button class='btn btn-outline btn-sm btn-light btn-justified height-smallest'>height smallest</button>" +
			"</div>"
		],
		["left", "<input type='number' id='left' class=''>"],
		["top", "<input type='number' id='top' class=''>"],
		["width", "<input type='number' id='width' class=''>"],
		["height", "<input type='number' id='height' class=''>"],
	];

	function _append_item(text, control, is_custom, widget) {
		if (typeof is_custom === "undefined") is_custom = false;

		control = $(control);
		var opt = $("<a class='list-group-item small'>");
		opt.append("<label>" + text + "</label>");
		if (control.is("input[type='checkbox']")) {
			var chk = $("<div class='checkbox'>").appendTo(opt);
			var label = $("<label>").appendTo(chk);
			label.append(control);
		} else {

			opt.append(control);

			if (!control.hasClass("btn") && (
					control.is("input") ||
					control.is("select") ||
					control.is("textarea")
				))
				control.addClass("form-control input-sm");
		}
		opt.prop("custom", is_custom);

		widget.append(opt);
	}

	function _attach_events(obj) {
		widget.find("#left").off("keyup").on("input", obj, function (evt) {
			evt.stopPropagation();
			evt.data.move(parseFloat($(this).val()), evt.data.top);
		});

		widget.find("#top").off("keyup").on("input", obj, function (evt) {
			evt.stopPropagation();
			evt.data.move(evt.data.left, parseFloat($(this).val()));
		});

		widget.find("#width").off("keyup").on("input", obj, function (evt) {
			evt.stopPropagation();
			evt.data.resize(parseFloat($(this).val()), evt.data.height);
		});

		widget.find("#height").off("input").on("input", obj, function (evt) {
			evt.stopPropagation();
			evt.data.resize(evt.data.width, parseFloat($(this).val()));
		});

		widget.find(".align-tops").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.alignTops(evt.data);
		});

		widget.find(".align-lefts").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.alignLefts(evt.data);
		});

		widget.find(".width-biggest").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.widthToLargest(evt.data);
		});
		widget.find(".width-smallest").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.widthToSmallest(evt.data);
		});

		widget.find(".height-smallest").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.heightToSmallest(evt.data);
		});

		widget.find(".height-biggest").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.heightToLargest(evt.data);
		});

		widget.find(".send-back").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.sendBack(evt.data);
		});

		widget.find(".bring-forward").on("click", obj, function (evt) {
			evt.stopPropagation();
			$this.bringForward(evt.data);
		});

		widget.find(".lock-control").on("click", obj, function (evt) {
			evt.stopPropagation();
			var btn = $(this);

			if (btn.hasClass("is-locked")) {
				btn.html("Lock control")
					.removeClass("is-locked");
			} else {
				btn.html("unLock control")
					.addClass("is-locked");
			}
			evt.data.setLock(btn.hasClass("is-locked"));
		});
	}

	this.alignTops = function (ctrl) {
		var sel = [],
			top = 0,
			f = null,
			index = 0,
			form = ctrl.getForm();

		if (!form) return;

		for (f in form.controls) {
			if (form.controls[f].selected === true) {
				sel.push(form.controls[f]);
				top = Math.max(top, form.controls[f].top);
			}
		}

		if (sel.length <= 1) return;

		for (index = 0; index < sel.length; index++) {
			sel[index].move(sel[index].left, top);
		}
	};

	this.alignLefts = function (ctrl) {
		var sel = [],
			left = 0,
			f = null,
			index = 0,
			form = ctrl.getForm();

		if (!form) {
			return;
		}

		for (f in form.controls) {
			if (form.controls[f].selected === true) {
				sel.push(form.controls[f]);
				left = Math.max(left, form.controls[f].left);
			}
		}

		if (sel.length <= 1) return;

		for (index = 0; index < sel.length; index++) {
			sel[index].move(left, sel[index].top);
		}
	};

	this.widthToLargest = function (ctrl) {
		var sel = [],
			width = 0,
			f = null,
			index = 0,
			form = ctrl.getForm();
		if (!form) return;

		for (f in form.controls) {
			if (form.controls[f].selected === true) {
				sel.push(form.controls[f]);
				width = Math.max(width, form.controls[f].width);
			}
		}

		if (sel.length <= 1) return;

		for (index = 0; index < sel.length; index++) {
			sel[index].resize(width, sel[index].height);
		}
	};

	this.widthToSmallest = function (ctrl) {
		var sel = [],
			width = null,
			f = null,
			index = 0,
			form = ctrl.getForm();
		if (!form) return;

		for (f in form.controls) {
			if (form.controls[f].selected === true) {
				sel.push(form.controls[f]);
				if (width === null)
					width = form.controls[f].width;
				else
					width = Math.min(width, form.controls[f].width);
			}
		}

		if (sel.length <= 1) return;

		for (index = 0; index < sel.length; index++) {
			sel[index].resize(width, sel[index].height);
		}
	};

	this.heightToSmallest = function (ctrl) {
		var sel = [],
			height = null,
			f = null,
			index = 0,
			form = ctrl.getForm();
		if (!form) return;

		for (f in form.controls) {
			if (form.controls[f].selected === true) {
				sel.push(form.controls[f]);
				if (height === null)
					height = form.controls[f].height;
				else
					height = Math.min(height, form.controls[f].height);
			}
		}

		if (sel.length <= 1) return;

		for (index = 0; index < sel.length; index++) {
			sel[index].resize(sel[index].width, height);
		}
	};

	this.heightToLargest = function (ctrl) {
		var sel = [],
			height = 0,
			f = null,
			index = 0,
			form = ctrl.getForm();
		if (!form) return;

		for (f in form.controls) {
			if (form.controls[f].selected === true) {
				sel.push(form.controls[f]);
				height = Math.max(height, form.controls[f].height);
			}
		}

		if (sel.length <= 1) return;

		for (index = 0; index < sel.length; index++) {
			sel[index].resize(sel[index].width, height);
		}
	};

	this.sendBack = function (ctrl) {
		var form = ctrl.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (var c in form.controls) {
			if (true === form.controls[c].selected) {
				form.controls[c].toBack();
			}
		}
	};

	this.bringForward = function (ctrl) {
		var form = ctrl.getForm();

		//NOW CHECK IF A CONTROL WAS SELECTED
		for (var c in form.controls) {
			if (true === form.controls[c].selected) {
				form.controls[c].toFront();
			}
		}
	};

	this.attach = function (obj) {
		designer = obj.getForm().designer;

		widget = $("<ul class='custom-props list-group props-edit'>");

		for (var index = 0; index < property_list.length; index++) {
			_append_item(property_list[index][0], property_list[index][1], false, widget);
		}

		widget.find("#left").val(Math.floor(obj.left));
		widget.find("#top").val(Math.floor(obj.top));
		widget.find("#width").val(Math.floor(obj.width));
		widget.find("#height").val(Math.floor(obj.height));

		if (obj.is_locked === true) {
			widget.find('.lock-control').removeClass("is-locked");
		} else {
			widget.find('.lock-control').addClass("is-locked");
		}

		var form = obj.getForm();
		if (form === obj) {
			widget.find("#left").attr("disabled", "disabled");
			widget.find("#top").attr("disabled", "disabled");
		}

		_attach_events(obj);

		widget.find('.lock-control').trigger('click');

		return widget;
	};

};