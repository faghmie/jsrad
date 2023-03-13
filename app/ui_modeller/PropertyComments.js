export default class CommentsEditor{

	#new_comment(msg){
		var comment =$(`<div class="comment-line">
                            <div class="comment-header">
                                <div class="comment-user"></div>
                                <div class="comment-date"></div>
                            </div>
						    <div class="comment-content"></div>
                        </div>`);
		if (typeof msg.timestamp === "string") msg.timestamp = new Date(msg.timestamp);
		
		comment.find(".comment-date")
						.append(msg.timestamp.getDate()+"-"+(msg.timestamp.getMonth()+1)+"-"+ (1900+msg.timestamp.getYear()));
		comment.find(".comment-user")
					.append(msg.username);
					
		comment.find(".comment-content").append(msg.message.replace(/(\r)|(\n)|(\r\n)/g,"<br>"));
		
		return comment;
	}
    
    attach(obj){
        if (!obj) return;
        if (typeof obj.__comments__ === "undefined" ||
            !(obj.__comments__ instanceof Array))
            obj.__comments__ = [];
        
		var container = $(`<div class="comments"></div>`);

        var author = $(`<input type="text" class="form-control author" placeholder="author">`).appendTo(container);
        var msg_box = $(`<textarea class="form-control comment" placeholder="type comments here (ctrl+enter for newline)" ></textarea>`)
            .appendTo(container);

        // if (!App.AuthToken || !App.AuthToken.email){
            author.val("Unknown");
        //     // return App.MessageError('Please signin before attempting to add comments');
        // } else{
            // author.val(App.AuthToken.email);
            // author.disabled();
        // }

        container.append("<div class='comment-list'>");
        
        var $this = this;
        $.each(obj.__comments__, function(){
              container.find(".comment-list").append($this.#new_comment(this)); 
        });
        
        container.show();
        
        msg_box.on("keyup", {author: author, comment: msg_box, control: obj}, function(evt){
            evt.stopPropagation();
            console.log(evt);
            if (evt.which !== 13 || (evt.which === 13 && evt.ctrlKey === true)){
                if (evt.ctrlKey === true){
                    $(this).val($(this).val() + "\r\n");
                }

                return;
            } 
            
            var author = null;
            
            var comment = {
                username: evt.data.author.val(),
                timestamp: (new Date()),
                message: $.trim($(this).val())
            };
            
            evt.data.control.__comments__.push(comment);
            container.find(".comment-list").append($this.#new_comment(comment));
            $(this).val("");
        });
        
        return container;
    }
}
