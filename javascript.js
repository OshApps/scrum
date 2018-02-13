
$(function(){  

var scrum={
    htmlDeleteDialog:undefined,
    htmlStoryDialog:undefined,
    
    init:function(){
        
        this.setColumns();

        this.setHtmlDeleteDialog();
        this.setHtmlStoryDialog();

        this.loadScrum();
        },
    
    setColumns:function(){
        var self=this;

        $(".story_list").tooltip({
                            position: { my: "center top+5", at: "center bottom" },
                            content:function(){
                                var storyData=$(this).data("storyData");

                                if(storyData)
                                    {
                                    return storyData.description;   
                                    }
                                }
                            })
                        .sortable({
                            connectWith: ".story_list",
                            update: function( event, ui ) {
                                self.saveScrum();
                                }
                            });

        $(".add_story_button").click(function(){
            self.openAddStoryDailog($(this).closest(".column").find(".story_list"));
            });
        },

    setHtmlDeleteDialog:function(){
        this.htmlDeleteDialog=$("#delete_dialog").dialog({
            autoOpen: false,
            title:"Delete Story"
            });
        },

    setHtmlStoryDialog:function(){
        var self=this;

        this.htmlStoryDialog=$("#story_dialog").dialog({
            autoOpen: false,
            width: 500,
            height:500,
            close:function(){
                self.resetStoryDailog();
                }
            });
        
        $("#tabs").tabs();

        $("#description_input").froalaEditor({
            toolbarButtons: ['bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'color',  'align', 'html'],
            placeholderText: 'Story description',
            pluginsEnabled:["align","colors","fontFamily","fontSize","codeView"],
            });

        var htmlPriority=$("#priority");

        $("#priority_slider").slider({
            min:1,
            max:5,
            create: function() {
                htmlPriority.text( $(this).slider( "value" ) );
                },
            slide: function( event, ui ) {
                htmlPriority.text( ui.value );
                }
            });

        $("#due_date_input").datepicker({
            dateFormat: "dd/mm/yy"
            });

        $("#add_comment_button").click(function(){
            self.addComment();
            });
        
        $("#comments").sortable();
        },
        
    resetStoryDailog:function(){
        this.htmlStoryDialog.find(".ui-state-error").removeClass("ui-state-error");
        this.htmlStoryDialog.find(".required").removeClass("required");

        $("input").val("");

        $("#description_input").froalaEditor('html.set', "");

        $("#priority_slider").slider("option", "value", 1);

        $("#priority").text("1");

        $("#comments").text("No comments");

        $("#tabs").tabs("option", "active", 0);
        }, 
      
    addComment:function(){
        var htmlCommentInput=$("#comment_input");

        htmlCommentInput.removeClass("ui-state-error");

        if(htmlCommentInput.val().length > 0)
            {
            var htmlComments=$("#comments");

            if(htmlComments.find(".comment").length == 0)
                {
                htmlComments.text("")
                }    
            
            htmlComments.append(this.createComment(htmlCommentInput.val()));  

            htmlCommentInput.val("");
            }else
                {
                htmlCommentInput.addClass("ui-state-error");
                }
        },
    
    createComment:function(msg){
        var htmlComment= $("<div>").addClass("comment");

        $("<span>").addClass("comment_msg")
                    .text(msg)
                    .appendTo(htmlComment);

        htmlComment.append(this.createCommentDeleteButton());
        
        return htmlComment;
        },
    
    createCommentDeleteButton:function(msg){
        var htmlDeleteButtonWrapper= $("<div>").addClass("delete_button_wrapper");

        $("<i>",{"aria-hidden":"true"})
            .addClass("fa fa-trash button")
            .click(function(){
                $(this).closest(".comment").remove();

                var htmlComments=$("#comments");

                if(htmlComments.find(".comment").length == 0)
                    {
                    htmlComments.text("No comments");
                    }
                })
            .appendTo(htmlDeleteButtonWrapper);

        return htmlDeleteButtonWrapper;
        },    
    
    openAddStoryDailog:function(htmlStoryList){
        
       $("#tabs").tabs("disable", "#tab_comments");

        var self=this;

        this.openStoryDailog("Add",function(storyData) {
            self.addStory(htmlStoryList,storyData);  
            });
        
        },
    
    openUpdateStoryDailog:function(htmlStory){

        $("#tabs").tabs("enable", "#tab_comments");

        this.setStoryDailogData(htmlStory.data("storyData"));

        var self=this;

        this.openStoryDailog("Update",function(storyData) {
            self.updateStory(htmlStory,storyData);     
            });
        },

    setStoryDailogData:function(storyData){

        $("#title_input").val(storyData.title);

        $("#description_input").froalaEditor('html.set', storyData.description);
        
        $("#due_date_input").val(storyData.dueDate);

        $("#priority_slider").slider("option", "value", storyData.priority);

        $("#priority").text(storyData.priority);

        this.addComments(storyData.comments);
        },
    
    openStoryDailog:function(actionName,action){
        var self=this;

        var buttons ={};

        buttons[actionName]=function(){
            var storyData=self.getStoryDataFromStoryDialog();
            
            if(storyData)
                {
                action(storyData);    
                self.closeStoryDailog();
                self.saveScrum();  
                }
            };   

        buttons["Cancel"]=function() {
            self.closeStoryDailog();
            }
                
        this.htmlStoryDialog.dialog("option", "buttons", buttons);

        this.htmlStoryDialog.dialog("option", "title", actionName+" Story");
        this.htmlStoryDialog.dialog("open");
        },
    
    openDeleteDailog:function(action){
              
        this.htmlDeleteDialog.dialog("option", "buttons", {
                Cancel:function(){
                    $(this).dialog("close");
                    },
                
                Delete:function(){
                    action();
                    $(this).dialog("close");
                    }
            });

        this.htmlDeleteDialog.dialog("open");
        },
    
    closeStoryDailog:function(){
        this.htmlStoryDialog.dialog("close");
        },
    
    addComments:function(comments){
        var htmlComments=$("#comments");

        if(comments.length > 0)
            {
            htmlComments.text("");

            for(var i=0; i < comments.length; i++) 
                {
                htmlComments.append(this.createComment(comments[i]));   
                }
            }
        },

    updateStory:function(htmlStory,storyData){
        htmlStory.attr('title', storyData.description).data("storyData",storyData);

        htmlStory.find(".story_title").text(storyData.title);
        htmlStory.find(".story_due_date").text(storyData.dueDate);
        htmlStory.find(".story_priority").text(storyData.priority);
        },
    
    addStory:function(htmlStoryList,storyData){
        var htmlStory=this.createStory(storyData);

        htmlStoryList.append(htmlStory);
        },

    getStoryDataFromStoryDialog:function(){
        var isValid=true;
        var title,description,dueDate;

        this.htmlStoryDialog.find(".ui-state-error").removeClass("ui-state-error");
        this.htmlStoryDialog.find("required").removeClass("required");

        title=$("#title_input").val();
        
        if(title.length === 0)
            {
            $("#title_input").addClass("ui-state-error");
            isValid=false;    
            }
        
        description=$("#description_input").froalaEditor('html.get', true);
        
        if(description.length === 0)
            {
            $("#description_input").addClass("required");
            isValid=false;    
            }
        
        dueDate=$("#due_date_input").val();
        
        if(dueDate.length === 0)
            {
            $("#due_date_input").addClass("ui-state-error");
            isValid=false;    
            }
        
        var storyData=undefined;

        if(isValid)
            {
            var priority=$("#priority_slider").slider( "value" );  
            var comments=this.getCommentsFormStoryDialog();

            storyData=this.createStoryData(title,description,priority,dueDate,comments);   
            }
        
        return storyData;
    },

    getCommentsFormStoryDialog:function(){
        var comments=[];

        this.htmlStoryDialog.find("#comments .comment_msg").each(function(){
            comments.push($(this).text());
            });

        return comments; 
        },
    
    createStoryData:function(title,description,priority,dueDate,comments){    
        var storyData={
            title:title,
            description:description,
            priority:priority,
            dueDate:dueDate,
            comments:comments
            };
        
        return storyData;
        },
    
    createStory:function(storyData){
        var htmlStory = $("<div>",{title:storyData.description}).addClass("story").data("storyData",storyData);

        htmlStory.append(this.createStoryDetails(storyData));
        htmlStory.append(this.createStoryButtons());

        return htmlStory
        },

    createStoryDetails:function(storyData){
        var htmlStoryDetails =$("<div>").addClass("story_details");
                                    
        $("<span>").addClass("story_title")
                   .text(storyData.title)
                   .appendTo(htmlStoryDetails);

        var htmlStoryDetailsFooter=$("<div>").addClass("story_details_footer")
                                             .appendTo(htmlStoryDetails);
        
        $("<span>").addClass("story_due_date")
                   .text(storyData.dueDate)
                   .appendTo(htmlStoryDetailsFooter);

        $("<span>").addClass("story_priority priority")
                   .text(storyData.priority)
                   .appendTo(htmlStoryDetailsFooter);
        
        return  htmlStoryDetails;                    
        },

    createStoryButtons:function(){
        var htmlStoryButtons =$("<div>").addClass("story_buttons");
       
        var self=this;

        $("<i>",{"aria-hidden":"true"})
                .addClass("fa fa-pencil button")
                .click(function(){
                    self.openUpdateStoryDailog($(this).closest(".story"));
                    })
                .appendTo(htmlStoryButtons);

        $("<i>",{"aria-hidden":"true"})
                .addClass("fa fa-trash button")
                .click(function(){
                    var htmlStory=$(this).closest(".story");

                    self.openDeleteDailog(function(){
                        htmlStory.remove();
                        self.saveScrum();
                        });
                    
                    })
                .appendTo(htmlStoryButtons);

        return  htmlStoryButtons;                    
        },
    
    loadScrum:function(){
        var jsonScrumData=localStorage.getItem("scrumData");

        if(jsonScrumData)
            {
            this.loadStories(JSON.parse(jsonScrumData));   
            }
        },

    loadStories:function(scrumData){
        var indexColumn=0;
        var self=this;

        $(".column").each(function(){
            var columnData=scrumData[indexColumn];
            var htmlStoryList=$(this).find(".story_list");

            for (var i = 0; i < columnData.length; i++) 
                {
                htmlStoryList.append(self.createStory(columnData[i]));
                }
            
            indexColumn++;
            });
        },
    
    saveScrum:function(){
        var scrumData=this.getScrumData();
        localStorage.setItem("scrumData", JSON.stringify(scrumData));
        },

    getScrumData:function(){
        var scrumData=[];
        var self=this;

        $(".column").each(function(){
            scrumData.push( self.getColumnData( $(this) ) );
            });

        return scrumData;
        },

    getColumnData:function(htmlColumn){
        var columnData=[];

        htmlColumn.find(".story").each(function(){
            columnData.push($(this).data("storyData"));
            });

        return columnData;
        }

};


scrum.init();
});