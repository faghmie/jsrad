var user_menu = function (){
	
	function signin_with_credentials(){
		App.ajax_call('api/v1/user/login', App.AuthToken, function(data){
			App.AuthToken.password = null;
			var msg = 'All projects will now be saved to your private profile';
			App.MessageInfo(msg);
		}, false, function(e){
			App.AuthToken.password = null;
			logger.log('some went wrong registering/logging onto server');
		});
	}
	
	function capture_credentials(){
		var div = $('<div>')
			.addClass('jsrad-logon-form')
			.css({
				width: '20vw',
			});
		
		var user_group = $('<div>').addClass('form-group register').appendTo(div).hide();
		var first_name = $('<input>')
							.addClass('form-control')
							.attr('placeholder', 'Firstname')
							.appendTo(user_group);
		user_group = $('<div>').addClass('form-group register').appendTo(div).hide();
		var surname = $('<input>')
							.addClass('form-control')
							.attr('placeholder', 'Surname')
							.appendTo(user_group);
		user_group = $('<div>').addClass('form-group').appendTo(div);
		var email = $('<input>')
							.addClass('form-control')
							.attr('placeholder', 'email')
							.appendTo(user_group);
		var pwd_group = $('<div>').addClass('form-group').appendTo(div);
		var pwd = $('<input type="password">')
							.addClass('form-control')
							.attr('placeholder', 'password')
							.appendTo(pwd_group);
		
		var btn_group = $('<div>').addClass('form-group').appendTo(div);
		var signin = $('<button>')
							.text('sign in')
							.addClass('btn btn-sm btn-light btn-flat')
							.appendTo(btn_group);
		
		btn_group = $('<div>').addClass('form-group').appendTo(div);
		var reg_new = $('<button>')
							.text('register new user')
							.addClass('btn btn-xs btn-link btn-light btn-flat')
							.appendTo(btn_group);
		
		reg_new.on('click', function(evt){
			evt.stopPropagation();
			
			if (div.find('.register').is(':visible') === false){
				div.find('.register').show();
				signin.html('create registration');
				reg_new.html('back to login');
			} else {
				div.find('.register').hide();
				signin.html('sign in');
				reg_new.html('register new user');
			}
		});
		signin.on('click', div, function(evt){
			var div = evt.data;
			evt.stopPropagation();
			signin.find('i').remove();
			var action = 'login';
			if (div.find('.register').is(':visible') === true){
				action = 'register';
			}
			signin.append('  <i class="fa fa-refresh fa-spin"/>');
			App.AuthToken.first_name = first_name.val();
			App.AuthToken.surname = surname.val();
			App.AuthToken.password = pwd.val();
			App.AuthToken.email = email.val();
			App.AuthToken.thumbnail = '';
			App.AuthToken.token = 'App.Login';
			App.AuthToken.thumbnail = '';
			App.AuthToken.network = 'App.Login';
			
			App.post('api/v1/user/'+action, App.AuthToken, function(data){
				signin.find('i').remove();
				App.AuthToken.password = null;
				App.AuthToken.first_name = data.first_name;
				update_display();
				div.find('input').val('');
				var msg = 'All projects will now be saved to your private profile';
				App.MessageInfo(msg);
			}, function(e){
				console.log(e);
				signin.find('i').remove();
				App.AuthToken.password = null;
				logger.log('something went wrong registering/logging onto server');
			});
		});
		
		return div;
	}
	
	function get_menu(container){
        var menu = $('<ul class="dropdown-menu dropdown-menu-right ui-user-menu">'+
							'<li class="dropdown-item feedback_btn"><a><i class="fa fa-fw fa-smile-o"></i> Feedback...</a></li>'+
							'<li class="dropdown-item product-overview"><a><i class="fa fa-fw fa-question"></i> Overview...</a></li>'+
							'<li class="dropdown-divider jsrad-logon-form"><a></a></li>'+
							'<li class="dropdown-item disabled small jsrad-logon-form"><a>Login with credentials</a></li>'+
							'<li class="dropdown-item custom-credentials jsrad-logon-form"></li>'+
							'<li class="dropdown-divider"><a></a></li>'+
							'<li class="dropdown-item disabled small  "><a>or Sigin with</a></li>'+
							'<li class="dropdown-divider"><a></a></li>'+
							'<li class="dropdown-item tb_login"><a><i class="fa fa-fw fa-google"></i> Google Sign In</a></li>'+
						'</ul>');
		
		menu.find('.custom-credentials').append(capture_credentials());
		
		menu.find('.feedback_btn').on('click', function(evt){
			jsrad_feedback();
		});
		
		menu.find('.product-overview').on('click', function(evt){
			(new product_tour()).show();
		});
		
		menu.find('.tb_login').on('click', function(){
			App.AuthToken = {};
			hello.login('google', {scope:['email']});
			
			hello.on('auth.login', function (auth) {
				// add a greeting and access the thumbnail and name from
				// the authorized response
				hello.getAuthResponse();
				App.AuthToken.password = '';
				App.AuthToken.token = auth.authResponse.access_token;
				App.AuthToken.network = auth.network;
				hello(auth.network).api('me').then(function (resp) {
					App.AuthToken.email = resp.email;
					App.AuthToken.thumbnail = resp.thumbnail;
					App.AuthToken.first_name = '';
					App.AuthToken.display_name = resp.displayName;
					
					update_display();
					
					App.ajax_call('api/v1/user', App.AuthToken, function(data){
						var msg = 'All projects will now be saved to your private profile';
						App.MessageInfo(msg);
					}, function(e){
						console.log(e);
						logger.log('something went wrong registering/logging onto server');
					});
				});
			});
		});

        return menu;
	}
	
	function update_display(){
		var img = '<img class="img-circle" alt="" src="'+ App.AuthToken.thumbnail + '" />';
		
		var name = App.AuthToken.first_name.toString().trim();
		if (name.length === 0 && App.AuthToken.display_name)
			name = App.AuthToken.display_name.toString().trim();
		
		$('.jsrad-logon-form').hide();
		name = '';// '<span style="padding-left:5px;">'+ name + '</span>';
		$('.user-profile').html(img + name);
	}
	
	return {
			get_menu: get_menu
		};
};
