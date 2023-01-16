var icon_selector = function (options_in){
    var options = $.extend(true, {
                use_icon: true,
                on_selected: function(icon_class, use_icon){}
            }, options_in);
    
	function open(){
		var div = $('<div>');
		if ((typeof fa_icon_list === 'undefined') || (typeof fa_icon_list !== 'object')){
			App.MessageError('Font-awesome icon-list did not load, please check if the fa-icons.json file is in your app directory');
			return;
		}
		show();
	}
	
	function show(){
        var list = [];
        for(var key in fa_icon_list){
			list.push({
                text: fa_icon_list[key],
                class: 'fa '+ key
            });
		}
        
        list.sort(function(a, b){
            return a.text.localeCompare(b.text);
        });

        var div = $('<div>');
        var search = $("<input class='form-control input-sm' placeholder='type to search...' />").appendTo(div);
        search.on('keyup', function(){
            var find = $(this).val();
            
            ul.find('li').show();
            ul.find('li').each(function(){    
                var cls = $(this).data('class');
                if (cls.indexOf(find) === -1) $(this).hide();
            });
        });
        search.focus();
        var ul = $("<ul class='list-inline'>").appendTo(div);
         ul.append('<li>');
            ul.find('li:last')
                .text('No Icon')
                .data('class', '');
        for(var index = 0; index < list.length; index++){
            ul.append('<li>');
            ul.find('li:last')
                .append("<i class='fa fa-fw fa-2x "+list[index].class+"'>")
                .attr('title', $.trim(list[index].class.replace(/fa/g, '')))
                .addClass('list-inline-item')
                .data('class', list[index].class);
        }
        ul.find('li')
            .css({
                margin:'5px',
                padding: '5px'
            })
            .on('mouseover', function(){
                $(this).addClass('bg-primary') ;
            })
            .on('mouseleave', function(){
                $(this).removeClass('bg-primary');
            })
            .on('click', function(){
                options.on_selected(
                        $(this).data('class'),
                        $(this).data('class').length !== 0
                    );
            });
		ul.css({
			'max-height': '70vh',
			overflow: 'auto',
		});
        open_card(div,{
				title: 'Select Icon',
				width: '60vw',
				'min-width': '300px',
				height: '80vh',
			});
		
        return this;
	}

	return {
			open: open
		};
};
