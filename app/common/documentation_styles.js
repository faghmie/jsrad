var documentation_style = {
	get_header: function(title){
		var html = '<head>';
		
		html += '<meta http-equiv=Content-Type content="text/html;">';
		html += '<title>ERD Doc - '+ title +'</title>';
		html += '<style>';
		html += documentation_style.get_css();
		html += '</style>';
		html += '</head>';
		
		return html;
	},
	
	get_css: function(){
		var result = '';
		for(var key in documentation_style){
			if (typeof documentation_style[key] === 'function') continue;
			var css_class = documentation_style[key];
			
			result += key + '{';
			for(var c in css_class){
				result += c + ':' + css_class[c] + ';';
			}
			result += '}';
		}
		
		return result;
	},

	'.docs': {
				'color': '#4D4D4D'
			},
	'.docs img': {
					'margin-left'	: 'auto',
					'margin-right'	: 'auto',
					'display'		: 'block',
					'border'		: '1px solid #E5E5E5',
				},

	'.docs h1': {
					'font-size'			: '2em',
					'font-weight'		: 'bold',
					'font-family'		: 'Arial Black',
					'text-transform'	: 'uppercase',
					'text-align'		: 'center',
				},
				
	'.docs h2' : {
					//'background'		: '#FDE9D9',
					'border-bottom'		: '2px solid #1E90FF',
				},
	'.docs h3'	: {
					'padding-left'		: '30px',
					'margin-left'		: '1.5em',
					'font-weight'		: 'bold',
					'font-style'		: 'italic',
					'border-bottom'		: '1px solid #DDD9C3',
				},
	'.docs p' : {
			'padding-left'	: '30px',
		},
	'.docs table': {
					'width'				: '100%',
					'border'			: '1px solid #DDD9C3',
					//'border-collapse'	: 'collapse',
				},
	'.docs td, .docs th': {
					'margin'	: '0',
					'padding'	: '5px',
					'border'	: '1px solid #E5E5E5',
				},
	'.docs th' : {
					'font-weight'			: 'bold',
					'font-style'			: 'bold',
					'text-align'			: 'center',
					'background'			: '#E5E5E5',
				}
};
