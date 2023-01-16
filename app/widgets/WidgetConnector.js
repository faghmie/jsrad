
export default class WidgetConnector{
	
	constructor(ctrl, container){
		this.#right_handle(ctrl, container);
		this.#left_handle(ctrl, container);
		this.#top_handle(ctrl, container);
		this.#bottom_handle(ctrl, container);
	}

	#right_handle(ctrl, container){
		this.line = $('<div>')
					.addClass('jsrad-line-connector right')
					.appendTo(container);
		
		this.line.draggable({
			distance	: 10,
			tolerance	: 2,
			helper		: 'clone'
		});
		
		this.line.append('<i>').addClass('la la-caret-right');

		this.line.data('parent', ctrl);

	}

	#left_handle(ctrl, container){
		this.line = $('<div>')
					.addClass('jsrad-line-connector left')
					.appendTo(container);
		
		this.line.draggable({
			distance	: 10,
			tolerance	: 2,
			helper		: 'clone'
		});
		
		this.line.append('<i>').addClass('la la-caret-left');

		this.line.data('parent', ctrl);

	}

	#top_handle(ctrl, container){
		this.line = $('<div>')
					.addClass('jsrad-line-connector top')
					.appendTo(container);
		
		this.line.draggable({
			distance	: 10,
			tolerance	: 2,
			helper		: 'clone'
		});
		
		this.line.append('<i>').addClass('la la-caret-up');

		this.line.data('parent', ctrl);
	}

	#bottom_handle(ctrl, container){
		this.line = $('<div>')
					.addClass('jsrad-line-connector bottom')
					.appendTo(container);
		
		this.line.draggable({
			distance	: 10,
			tolerance	: 2,
			helper		: 'clone'
		});
		
		this.line.append('<i>').addClass('la la-caret-down');

		this.line.data('parent', ctrl);

	}
}
