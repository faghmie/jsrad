var jsrad_feedback = function(){
		var email = $('<div>').addClass('container');
		var input_row = $('<div>').addClass('row').css('padding-bottom','15px').appendTo(email);
		var comment_row = $('<div>').addClass('row').appendTo(email);
		
		var body = $('<select/>')
					.append('<option>Your feedback relates to?</option>')
					.append('<option>Cosmetic</option>')
					.append('<option>UI Designer</option>')
					.append('<option>Data Modeller</option>')
					.append('<option>Widget not working</option>')
					.append('<option>Missing functionality</option>')
					.addClass('form-control col-12')
					.appendTo(input_row)
					.remove();
		
		body = $('<textarea>')
					.attr('placeholder', 'write a short message...')
					.addClass('col-12 new-comment-text form-control')
					.css({
						height: '80px',
						resize: 'none',
					})
					.appendTo(input_row);
					
		var send = $('<a>')
					.addClass('btn btn-success btn btn-flat btn-outline col-2')
					.html('post <i class="la la-fw la-send"/>')
					.appendTo(input_row);
		
		var comments = $('<ul>')
							.addClass('comment-list list-group')
							.appendTo(comment_row);
		
		function append_comment_line(comment){
			var li = $('<li>').addClass('list-group-item').appendTo(comments);
			var img_div = $('<div>').addClass('comment-image').append('<img>').appendTo(li);
			var text = $('<div>').addClass('comment-text').appendTo(li);
			var author = $('<p>').addClass('sub-text author').appendTo(text);
			var comment_date = $('<p>').addClass('date sub-text').appendTo(text);
			var comment_text = $('<p>').addClass('comment-notes').appendTo(text);
			img_div.find('img').attr('src', comment.image_url).addClass('img-circle');
			
			comment_text.html(comment.text);
			author.html('<b>'+comment.sub_text+'</b>');
			comment_date.html('on ' +comment.submit_date);
			
			return li;
		}
		
		function refresh_comments(){
			var request = {
					ajax_type: 'GET'
				};
			App.ajax_call('api/v1/feedback', request, function(data){
				comments.children().remove();
				for(var k = 0; k < data.length; k++){
					append_comment_line(data[k]);
				}
			});
		}
		
		if (!App.AuthToken || (typeof App.AuthToken.email === 'undefined')){
			input_row.children().remove();
			input_row.append('<p class="text-danger">You need to log in to provide feedback</p>');
		}
		
		send.on('click', function(){
			var request = {
					ajax_type: 'POST',
					'type': 'email',
					auth_token: App.AuthToken,
					'relates_to': 'General',
					'body': input_row.find('textarea').val().trim(),
				};
			
			if (request.body.length === 0){
				return App.MessageError('No feedback message given.');
			}
			
			if (!request.auth_token || (typeof request.auth_token.email === 'undefined')){
				return App.MessageError('Please first log in before you can provide feedback.');
			}
			
			App.ajax_call('api/v1/feedback', request, function(data){
				App.MessageInfo('feedback has been sent');
				refresh_comments();
			});
		});
		
		refresh_comments();
		
		var email_card = open_card(email, {
				title: 'Send Feedback',
				'min-width': '300px',
				height: '80vh',
				'min-height': '80vh'
			});
};
