var logger = {
	_dialog: null,
	_message_box: null,

	_build: function(){
		this._dialog = $('<div>')
			.addClass('ui-debug-console')
			.css({
				'width': 300,
				'height': 100,
				display: 'inline-block',
				position: 'absolute',
				bottom: 0,
				right: 20,
				'font-size': '0.75em',
				'z-index': 9999,
				background: '#FFFFFF',
				border: '1px solid #BFBFBF'
			})
			.appendTo('body')
			.show('blind')
			.resizable({handles: 'n, w, nw'});
			
		var header = $('<div>')
			.css({
				height: 24,
				top: 0,
				left: 0,
				'border-bottom': '1px solid #BFBFBF'
			})
			.append('<b>Messages</b>')
			.appendTo(this._dialog);
		
		var btn = $('<button>')
			.addClass('btn btn-flat btn-xs pull-right ')
			.text('close')
			.appendTo(header);
		
		btn.on('click', this, function(evt){
			evt.data._dialog.remove();
			evt.data._dialog = null;
		});
		btn = $('<button>')
			.addClass('btn btn-flat btn-xs pull-right ')
			.text('clear')
			.appendTo(header);
		
		btn.on('click', this, function(evt){
			evt.data._message_box.children().remove();
		});
		
		var search = $('<input>')
				.addClass('small pull-right')
				.appendTo(header)
				.on('input', this, function(evt){
					evt.stopPropagation();
					var $this = evt.data._dialog;
					var find = $(this).val().trim().toLowerCase();
					$this.find('.logger-message-content').show();
					if (find === '') return;
					$this.find('.logger-message-content').each(function(){
						var el = $(this);
						el.hide();
						if (el.text().toLowerCase().indexOf(find) !== -1) el.show();
					});
				});
				
		this._message_box = $('<div>')
			.addClass('message-content')
			.css({
				width: '100%',
				height: '90%',
				overflow: 'auto',
			})
			.appendTo(this._dialog);
	},
	
	get_stack_trace: function () {
		var callstack = [];
		var isCallstackPopulated = false;
		var e = new Error(),
			lines = null,
			line = null,
			line_number = null,
			column_number = null,
			i = null,
			parts = null,
			func = null,
			file = null;
		
		if (e.stack) { //Firefox
			lines = e.stack.split('\n');
			
			lines.shift();
			for (i=0; i < lines.length; i++) {
				//if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
				line = lines[i].trim().replace('at ', '').trim();
				parts = line.split(' ');
				func = parts[0].split(/\./);
				func = func[func.length - 1];
				if (parts.length === 1)
					func = '';
				
				file = null;
				if (parts.length === 1){
					file = parts[0];
				} else {
					file = parts[1];
				}
				
				parts = file.split(/\//);
				file = parts[parts.length - 1];
				parts = file.split(/\./);
				file = parts[0];
				if (parts.length > 1){
					parts = parts[1].split(/:/);
					if (parts[2] && parts[2].indexOf(')') !== -1) parts[2] = parts[2].replace(')', '');
					line_number = parts[1];
					column_number = parts[2];
				} else {
					
				}

				callstack.push({
						function_name: func,
						filename: file,
						line_number: line_number,
						column_number: column_number,
					});
			}
			//Remove call to current-function()
			callstack.shift();
			isCallstackPopulated = true;
		} else if (window.opera && e.message) { //Opera
			lines = e.message.split('\n');
			for (i=0; i < lines.length; i++) {
				if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
					var entry = lines[i];
					//Append next line also since it has the file info
					if (lines[i+1]) {
						entry += ' at ' + lines[i+1];
						i++;
					}
					callstack.push(entry);
				}
			}
			//Remove call to printStackTrace()
			callstack.shift();
			isCallstackPopulated = true;
		}
		
		if (!isCallstackPopulated) { //IE and Safari
			var currentFunction = arguments.callee.caller;
			while (currentFunction) {
				var fn = currentFunction.toString();
				var fname = fn.substring(fn.indexOf('function&') + 8, fn.indexOf('')) || 'anonymous';
				callstack.push(fname);
				currentFunction = currentFunction.caller;
			}
		}
		
		return (callstack);
	},

	log: function(control, message){
		try{
		if (null === this._dialog) this._build();
		var stack = this.get_stack_trace()[1];
		var title = stack.filename + '::' + stack.function_name + ' ['+ stack.line_number + ', '+ stack.column_number + ']';
		
		if (typeof message === 'undefined') message = control;
		
		if (control && typeof control.getForm !== 'function'){
			if (typeof control.title !== 'undefined'){
				title = control.type+ '::' + control.title + ' ['+ stack.line_number + ', '+ stack.column_number + ']';
			}
		} else if (control && typeof control.getForm === 'function'){
			title = control.getForm().label + '::' + control.label + ' ['+ stack.line_number + ', '+ stack.column_number + ']';
		}
		
		var text = message;
		if (message instanceof Array) text = message.toString();
		
		if (typeof message === 'object'){
			try{
				text = JSON.stringify(message);
			} catch(e){
				text = message;
			}
		}
		var log_entry = $('<div>')
					.addClass('logger-message-content')
					.appendTo(this._message_box)
					.css({
						display: 'inline-block',
						'max-height': 'inherit',
						width: 'inherit',
						'border-bottom': '1px solid #E5E5E5',
					});
		var log_title = 
				$('<div>' +
						'<b>' +
							title +
						'</b>' +
					'</div>'
				)
				.appendTo(log_entry);
		
		var log_message = $('<div>')
				.css({
					display: 'inline-block',
					overflow: 'auto',
				})
				.appendTo(log_entry);
		
		log_message.jsonView(text);
		}catch(e){
			console.log(message);
			console.log(e);
		}
		
	},
	
	clear: function(){
		if (null !== this._dialog) this._dialog.children().remove();
	},
};
