var product_tour = function(_designer) {
	var designer			= _designer;

	var overview = $('<div>')
						.addClass('product-overview')
						.appendTo('body')
						.hide();
	var on_done = function(){};
	
	var features = [
			{
				title: 'UI Builder',
				description: 'Enable the creation of rich user-interface experiences, which provides the end-user with a real feel of how the application should be performing.'
			},
			{
				title: 'Data Modeller',
				description: 'Data are easily modelled, and connected to the UI to provide a real feel of how data will be displayed and interact with the UI.'
			},
			{
				title: 'Rules Modeller',
				description: ' Build simple rules into your prototype, and provide the end-user a close to real experience of your prototype.'
			},
		];
	
	var tips = [
			{
				title: 'Private Use',
				description: 'To ensure your proof-of-concept model stays private, you need to log into the system with your Google credentials.'
			},
			{
				title: 'Documentation',
				description: 'Easily generate documentation for implementation by simply navigation to the "Document Generation" menu item. It will use the notes created against each widget to generate documentation for further implementation.'
			},
		];
	
	var tour_steps = [
				{
					element: '.jsrad-project-menu',
					title: 'Project Menu',
					content: 'Click here to perform project related tasks.'
				},
				
				{
					element: '.btn-design-present',
					title: 'Design / Present',
					content: 'Toggle between presenting your proof-of-concept and design mode.'
				},
				{
					element: '.user-profile-wrapper',
					title: 'Login / Save',
					content: 'Log in using your Google credentials to create a private space to store your models',
					placement: 'left'
				},
				{
					element: '.jsrad-feedback',
					title: 'Feedback',
					content: 'Tell us what you think of this product.',
					placement: 'left'
				},
				{
					element: '.data-modeller',
					title: 'Data Modeller',
					content: 'View existing data model, or create new data models.'
				},
				{
					element: '.btn-design-area-overview',
					title: 'Overview',
					content: 'Get a bird\'s eye view of all the screens you are working on.'
				},
				{
					element: '.btn-design-area-widgets',
					title: 'Widgets',
					content: 'Scroll through the list of widgets available to build your proof-of-concept'
				},
				{
					element: '.general-properties',
					title: 'Properties',
					content: 'Set the properties of the selected widget on your form.'
				},
				{
					element: '.btn-design-area-styler',
					title: 'Styler',
					content: 'Adjust some styling properties'
				},
				{
					element: '.btn-design-area-comments',
					title: 'Comments',
					content: 'Add comments to the proof-of-concept model you are busy with.'
				},
				{
					element: '.btn-design-area-docs',
					title: 'Documentation',
					content: 'Notes captured here will be used when you generate your documentation.'
				},
				{
					element: '.btn-design-area-database',
					title: 'Datasource',
					content: 'Connect a widget to a datasource.'
				},
				{
					element: '.project-settings',
					title: 'Settings',
					content: 'Set project wide settings for the current proof-of-concept model.'
				},
			];
	
	function base_carrousel(){
		return $('<div id="myCarousel" class="carousel slide" data-ride="carousel">'+
				  '<ul class="carousel-indicators">'+
					'<li data-target="#myCarousel" data-slide-to="0" class="active"></li>'+
					'<li data-target="#myCarousel" data-slide-to="1"></li>'+
					'<li data-target="#myCarousel" data-slide-to="2"></li>'+
					'<li data-target="#myCarousel" data-slide-to="3"></li>'+
				  '</ul>'+

				  '<div class="carousel-inner text-center">'+
					'<div class="carousel-item active panel-01"></div>'+
					'<div class="carousel-item panel-02"></div>'+
					'<div class="carousel-item panel-03"></div>'+
					'<div class="carousel-item panel-04"></div>'+
				  '</div>'+

					'<a class="carousel-control-prev" href="#demo" data-slide="prev">'+
						'<span class="carousel-control-prev-icon"></span>'+
					'</a>'+
					'<a class="carousel-control-next" href="#demo" data-slide="next">'+
						'<span class="carousel-control-next-icon"></span>'+
					'</a>'+
				'</div>');
	}
	
	function create_buttons(){
		var row = $('<div>').addClass('row').appendTo(overview);
		var btn_close = $("<a class='btn btn-light btn-lg btn-flat pull-right col-6' title='Close'>"+
							"<i class='la la-fw la-times'></i> Close Overview"+
						'</a>')
						.appendTo(row);
		
		btn_close.on('click', function(){
			overview.remove();
			on_done();
		});
		
		var btn_tour = $("<a class='btn btn-light btn-lg btn-flat pull-left col-6' title='Product Tour'>"+
							"<i class='la la-fw la-support'></i> Show Tour"+
						'</a>')
						.appendTo(row);
		
		btn_tour.on('click', function(){
			show_tour();
			on_done('tour');
		});
	}
	
	function create_middle_pane(){
		var pane = $('<div class="d-flex h-100 align-items-center justify-content-center">');
		var img = $('<img>')
						.attr('alt', 'Product Overview')
						.attr('src', 'images/product-overview.png')
						.css({
								width : '100%',
								height: 'auto',
								'max-height': '95vh',
							})
						.appendTo(pane);
		return pane;
	}
	
	function create_header(){
		var pane = $('<div class="align-items-center justify-content-center">');
		var h1 = $('<h1>')
						.html('Imagine It, Model It, Run It.')
						.appendTo(pane);
		var h2 = $('<h2>')
					.html('Cloud based prototype builder. Model your user-interface, data-model, and rules. No coding.')
					.appendTo(pane);
		
		return pane;
	}
	
	function create_left_pane(row){
		var pane = $('<div class="align-items-center justify-content-center">');
		pane.append('<h2>Key Features</h2><hr>');
		for(var i = 0; i < features.length; i++){
			pane.append('<h4>'+features[i].title+'</h4>');
			pane.append('<p>'+ features[i].description+'<p>');
			pane.append('<hr>');
		}
		pane.children().css('margin-left', '15px');
		return pane;
	}
	
	function create_right_pane(row){
		var pane = $('<div class="align-items-center justify-content-center">');
		pane.append('<h2>Tips</h2><hr>');
		for(var i = 0; i < tips.length; i++){
			pane.append('<h4>'+tips[i].title+'</h4>');
			pane.append('<p>'+ tips[i].description+'<p>');
			pane.append('<hr>');
		}
		pane.children().css('margin-right', '15px');
		return pane;
	}
	
	function show(_done_cb){
		if (typeof _done_cb === 'function') on_done = _done_cb;
		
		overview
			.css({
				position    : 'absolute',
				top         : 0,
				left        : 0,
				'z-index'	: 999999,
				width       : '100vw',
				height      : '100vh',
				color		: '#4D4D4D',
				background  : '#FAFAFA',
			})
			.show();
		var row = $('<div>'),//.addClass('row'),
			display = base_carrousel();
		
		create_buttons();
		
		//row.appendTo(overview);
		
		//row.append(display);
		display.appendTo(overview);
		display.find('.panel-01').append(create_middle_pane());
		display.find('.panel-02').append(create_header());
		display.find('.panel-03').append(create_left_pane());
		display.find('.panel-04').append(create_right_pane());
		display.find('.item').css({
			height: '100vh',
			'text-align': 'center',
			'background-position': 'center center',
  		});
		display.carousel({
		  interval: 5000
		});
	}
	
	function show_tour(){
		var tour = new Tour({
			storage: false,
			steps: tour_steps,
		});
		
		tour.init().start();
		overview.remove();
	}

	return {
		show: show,
		tour: show_tour
	};   
};
