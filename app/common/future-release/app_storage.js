var AppStorage = {
	project_card: {close: function(){}},

    _build_ui: function(){
		return $('<div class="d-flex flex-column">'+
                    '<h4>Where do you want to work from</h4>'+
                    '<div class="btn btn-outline-dark btn-block btn-local">'+
                        '<i class="la la-lg la-save pull-left"></i>  Use app storage'+
                    '</div>'+
                    '<div class="btn btn-outline-dark btn-block btn-use-google">'+
                        '<i class="la la-lg la-google pull-left"></i>  Use Google Drive'+
                    '</div>'+
                '</div>'
			);
    },

	choose	: function(on_done){
		var $this = this,
			dlg = this._build_ui();
        
        // dlg.append(AppStorage._local_button());

        dlg.find('.btn-local').on('click', function(){
            // console.log('close the card');
            AppStorage.project_card.close();
            on_done();
        });
        dlg.find('.btn-use-google').on('click', function(){
            // console.log('close the card');
            googleDrive.handleAuthClick(function(){
                AppStorage.project_card.close();
                on_done();
            });
            // on_done();
        });

        // dlg.on('click', function(){
        //     console.log('clicked')
        // })

		if (typeof on_done !== 'function') on_done = function(){};
		AppStorage.project_card = open_card(dlg,{
                // title: 'Where do you want to work from',
                'min-width': '300px',
				on_done: function(){
                    on_done();
				}
			});
		}
};
