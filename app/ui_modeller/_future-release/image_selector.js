var image_selector = function (options_in){
    var options = $.extend(true, {
                on_selected: function(image){}
            }, options_in);
    
	function list_images(container){
		container.find('ul').remove();
		
		App.ajax_call('api/v1/images', {}, function(list){
			var ul = $("<ul class='list-inline' style='max-height:50vh;overflow:auto;'>").appendTo(container);
			ul.append("<li>");
			ul.find("li:last")
					.text("No Icon")
					.data("image", "");
			var images = list.images;
			
			for(var index = 0; index < images.length; index++){
				ul.append("<li>");
				var li = ul.find("li:last");
				li
					.append('<img src="' +images[index]+'">')
					.data("image", images[index]);
				
				li.find('img').css({
					margin: '0 auto',
					'width': '90px',
					'height': 'auto',
					'max-height': '90px'
				});
			}
			
			ul.find("li")
				.css({
					'vertical-align': 'top',
					margin: '5px',
					width: '100px',
					height: '100px',
				})
				.on("mouseover", function(){
					$(this).addClass("bg-primary") ;
				})
				.on("mouseleave", function(){
					$(this).removeClass("bg-primary");
				})
				.on("click", function(){
					options.on_selected(
							$(this).data("image")
						);
				});
		});
		
		return this;
	}

	function import_image(container){
		var $this = this,
			card = null,
			local_file = null;
		
		if (window.File && window.FileReader && window.FileList && window.Blob){
			local_file = $('<div class="btn btn-light btn-flat">'+
								'<label for="localAppFileInput" class="btn btn-flat btn-outline btn-light">'+
									'<i class="la la-cloud-upload"></i> Import file'+
									'<input type="file" id="localAppFileInput" class="load-local-file">'+
								'</label>'+
							'</div>').appendTo(container);
			
			local_file.find('input').on('click', function(){
				$(this).val(null);
			});
			
			local_file.find('input').on('change', function(){
				_load_local_file();
			});
			local_file.find('input').css({
					display: 'none'
				});
		}
		
		var _load_local_file = function(){
				var files = container.find('input.load-local-file')[0].files;
				if (files.length === 0) return;
				
				var formData = new FormData();
				formData.append('file', files[0]);
				//formData = {'file':'something'};
				//console.log(formData);
				
				$.ajax({
					type: 'POST',
					method: 'POST',
					url: 'api/v1/images',
					//dataType: 'json',
					//contentType: 'application/json; charset=UTF-8',
					data: formData, //encodeURI(JSON.stringify(formData)),
					
					contentType: false,
					cache: false,
					processData: false,
					success: function(response) {
						try{
							var result = response;
							
							if (typeof result.error.code !== 'undefined'){
								result.error.code = parseInt(result.error.code);
							}

							if (result.error.code !== 0){
								App.MessageError(result.error.message);
							} else {
								App.MessageInfo('Image uploaded, press reload property screen');
							}
						}
						catch(e){
							App.MessageError('Unexpected server result:\r\n'+e+'\r\nURL: '+url +'\r\n\r\n'+data);
						}
					},
					error: function(err) {
						console.log(err);
						console.log(err.responseText);
					},
				});
		};
		
		return this;
	}
		
	function show(){
        var list = [];
        for(var key in fa_icon_list){
			list.push({
                text: fa_icon_list[key],
                class: "fa "+ key
            });
		}
        
        list.sort(function(a, b){
            return a.text.localeCompare(b.text);
        });

        var div = $("<div>");
        var search = $("<input class='form-control input-sm' placeholder='type to search...' />").appendTo(div);
        search.on("keyup", function(){
            var find = $(this).val();
            
            ul.find("li").show();
            ul.find("li").each(function(){    
                var cls = $(this).data("class");
                if (cls.indexOf(find) === -1) $(this).hide();
            });
        });
        search.focus();
		list_images(div);
		import_image(div);
        open_card(div);
		
        return this;
	}

	return {
			open: show
		};
};
