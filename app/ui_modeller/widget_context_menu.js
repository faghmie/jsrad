var widget_context_menu = function(widget){
	
	if (App.is_mobile){
		$('.mobile-widget-controls').find('ul').remove();
		
		var ul = $('<ul>').addClass('dropdown-menu').appendTo($('.mobile-widget-controls'));
		
		create_generic_items(ul);
		
		ul.find('li').removeClass('list-group-item');
		return;
	}
	
	widget.dom.container.off('contextmenu').on('contextmenu', function(evt){
		evt.stopPropagation();
		$('.ui-context-menu').remove(); //REMOVE ALL EXISTING OPEN MENUS
		if (true === widget.in_run_mode) return;
		var menu = $('<div>')
			.addClass('ui-context-menu')
			.css({
				'min-width': 200,
				'min-height': 220,
				//'max-height': 200,
				display: 'none',
				position: 'absolute',
				top: evt.pageY,
				left: evt.pageX,
				'z-index': 50,
			})
			.appendTo('body')
			.show('slide');
		
		var ul = $('<ul>').addClass('-dropdown-menu list-group').appendTo(menu);
		
		create_generic_items(ul);
		
		create_alignment_items(ul);
		
		ul
		.on('click', 'li', function(){
			$('.ui-context-menu').remove();
		})
		.on('mouseenter', 'li', function(){ $(this).addClass('active'); })
		.on('mouseleave', 'li', function(){ $(this).removeClass('active'); });
		
		ul.find('li').addClass('small').css({
				padding: 2,
				cursor: 'pointer',
			});
		return false;
	});
	
	function create_generic_items(container){
		var li = $('<li>').addClass('list-group-item').appendTo(container);
		
		li.append('<a>Remove Control</a>');
		
		li.on('click', widget, function(evt){
			widget.getForm().designer.removeControl(evt.data);
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		
		if (widget.is_locked === true)
			li.append('<a>unLock Control</a>');
		else
			li.append('<a>Lock Control</a>');
		
		li.on('click', widget, function(evt){
			var sel = [],
				f = null,
				index = 0,
				widget = evt.data,
				form = widget.getForm();
			
			var lock_state = !widget.is_locked;
			widget.setLock(lock_state);
			
			for(f in form.controls){
				if (form.controls[f].selected === true){
					form.controls[f].setLock(lock_state);
				}
			}
			
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		
		li.append('<a>Bring to Front</a>');
		
		li.on('click', widget, function(evt){
			var sel = [],
				f = null,
				index = 0,
				widget = evt.data,
				form = widget.getForm(),
				ctrl = null;
			
			widget.toFront();
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.toFront();
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		
		li.append('<a>Send Back</a>');
		
		li.on('click', widget, function(evt){
			var sel = [],
				f = null,
				index = 0,
				widget = evt.data,
				form = widget.getForm(),
				ctrl = null;
			
			widget.toBack();
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.toBack();
				}
			}
		});
	}
	
	function create_alignment_items(container){
		var li = $('<li>').addClass('list-group-item').appendTo(container);
		
		li.append('Align Left');
		
		li.on('click', function(evt){
			var f = null,
				form = widget.getForm(),
				ctrl = null;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.move(widget.left, ctrl.top);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		
		li.append('Align Right');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null,
				right = widget.left + widget.width;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.move(right - ctrl.width, ctrl.top);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		
		li.append('Align Top');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.move(ctrl.left, widget.top);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		li.append('Align Bottom');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null,
				bottom = widget.top + widget.height;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.move(ctrl.left, bottom - ctrl.height);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		li.append('Same width');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.resize(widget.width, ctrl.height);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		li.append('Same height');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.resize(ctrl.width, widget.height);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		li.append('Same width and height');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.resize(widget.width, widget.height);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		li.append('Same style');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null;
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					$.extend(ctrl.style, widget.style);
					ctrl.format();
					//ctrl.resize(widget.width, widget.height);
				}
			}
		});
		
		li = $('<li>').addClass('list-group-item').appendTo(container);
		li.append('Reset style');
		
		li.on('click', function(evt){
			var sel = [],
				f = null,
				index = 0,
				form = widget.getForm(),
				ctrl = null;
			
			widget.style = $.extend({}, widget.default_style);
			widget.format();
			
			for(f in form.controls){
				ctrl = form.controls[f];
				if (ctrl.selected === true){
					ctrl.style = $.extend({}, widget.default_style);
					ctrl.format();
				}
			}
		});
	}
};
