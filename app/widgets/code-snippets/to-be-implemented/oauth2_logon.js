const { default: Dialog } = require("../../../common/Dialog");

var control_oauth2_logon = {
	type				: 'oauth2_logon',
	control_label		: 'Authentication (OAuth2 Logon)',
	control_category	: 'Code Snippet',
	control_thumbnail	: 'images/widgets/code-snippet.png',
	
	open_mapper: function(){
		//ON THIS CHANGE WE LOAD THE TABLES
		var field = null,
			mapper = $('<div>');
		
		field = this.create_attribute('email', true).appendTo(mapper);
		field.find('input').before('<label>email</label>');
		
		field = this.create_attribute('display_name', true).appendTo(mapper);
		field.find('input').before('<label>display name</label>');
		
		field = this.create_attribute('thumbnail', true).appendTo(mapper);
		field.find('input').before('<label>thumbnail</label>');
		
		new Dialog(mapper,{
			title: 'Map results',
			width: '25vw',
		});
	},
	
    _get_settings	: function(){
		if (typeof this.value !== "object") this.value = {};
		if (!this.value) this.value = {'@network': 'google'};
		if (!this.message) this.message = {};
		var $this = this;
		var btn = $('<button type="button">map fields</button>')
						.addClass('btn btn-light btn-flat')
						.on('click', function(){
							$this.open_mapper();
						});
		
		//ATTRIBUTES
		var attr_name = $('<select>')
						.append('<option>google</option>')
						.append('<option>facebook</option>')
						.addClass('form-control')
						.val(this.value['@network']);
		
		attr_name
			.on('change', this, function(evt){
				evt.stopPropagation();
				evt.data.value['@network'] = $(this).val();
			});
		
		attr_name.find('option').each(function(){
			var opt = $(this);
			if (opt.val() == $this.value['@network'])
				opt.attr('selected', 'selected');
		});
		
		return [
			['network', attr_name],
			['map results to', btn],
		];
	},
	
	execute: function(){
		var network = this.value['@network'];
		var $this = this;
		var auth = hello.getAuthResponse(network);
		var attr = null;
		
		if ($this.has_attribute('email') === true){
			attr = $this.get_attribute('email');
			delete $this.message[attr];
		}
		
		if ($this.has_attribute('display_name') === true){
			attr = $this.get_attribute('display_name');
			delete $this.message[attr];
		}
		
		if ($this.has_attribute('thumbnail') === true){
			attr = $this.get_attribute('thumbnail');
			delete $this.message[attr];
		}
		
		var perform_authentication = function(auth){
			
			hello(auth.network).api('me').then(function (resp) {
				var attr = null;
				if ($this.has_attribute('email') === true){
					attr = $this.get_attribute('email');
					$this.message[attr] = resp.email;
				}
				
				if ($this.has_attribute('display_name') === true){
					attr = $this.get_attribute('display_name');
					$this.message[attr] = resp.displayName;
				}
				
				if ($this.has_attribute('thumbnail') === true){
					attr = $this.get_attribute('thumbnail');
					$this.message[attr] = resp.thumbnail;
				}
				
				//$this.message.email = resp.email;
				//$this.message.display_name = resp.displayName;
				//$this.message.thumbnail = resp.thumbnail;
				
				$this.next();
			}, function(err){
				console.log(err);
			});
		};
		
		
		//if (!auth){
			hello.login(network, {scope:["email"], force: false});
		//} else {
			//console.log(auth);
			//$this.message.token = auth.access_token;
			//$this.message.network = auth.network;
			//perform_authentication(auth);
		//}
		
		hello.off('auth.login').on('auth.login', function (auth) {
			// add a greeting and access the thumbnail and name from
			// the authorized response
			hello.getAuthResponse();
			$this.message.token = auth.authResponse.access_token;
			$this.message.network = auth.network;
			perform_authentication(auth);
		});
	},
	
	
	getControl	: function(owner){
		IControl.extend(this, base_activity);
		this.ctrl = $('<div>');
		
		return this.ctrl;
	}
};
