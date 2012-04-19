comparison_id = 0;
image1_perm = 0;
image2_perm = 0;

handlers_registered = 0;

pre_loaded = false;
next_load = 0;

like_url_template = "//www.facebook.com/plugins/like.php?"+
                    "appId=411664055513252&"+
                    "href={{IMAGE-URL}}&"+
                    "send=false&"+
                    "layout=button_count&"+
                    "width=90&"+
                    "height=21&"+
                    "show_faces=false&"+
                    "action=like&"+
                    "colorscheme=light&"+
                    "font=lucida+grande";

function preload_images(src1, src2)
{
    $("#pre-image1").attr("src", src1);
    //alert("src1= " + src1);
    $("#pre-image2").attr("src", src2);
    //alert("src2= " + src2);
}

function register_handlers()
{
	$("#play-button").click(function(){
		//alert("Clicked!");
		start_game();
	});
    $("#noreg-play-button").click(function(){
		//alert("Clicked!");
		start_game();
	});
}

function comp_back(data) {
    //$('.result').html(data);
    //alert(data);        
    
    if (pre_loaded == false)
    {
        next_load = JSON.parse(data);
        //preload_images(next_load['art1']['image'], next_load['art2']['image']);
        pre_loaded = true;
        new_comparison();
    }
    else
    {
        var first_load = next_load;
        next_load = JSON.parse(data);
        
        $('#comparison-box').fadeIn("fast");
        $('#better').fadeIn("fast");
        $('#image1').attr("src", first_load['art1']['image']);//.fadeIn("fast");
        $('#image1').attr("permalink", first_load['art1']['permalink']);
        $('#like-image1').attr("src", like_url_template.replace("{{IMAGE-URL}}", first_load['art1']['image']));
        $('#image2').attr("src", first_load['art2']['image']);//.fadeIn("fast");
        $('#image2').attr("permalink", first_load['art2']['permalink']);
        $('#like-image2').attr("src", like_url_template.replace("{{IMAGE-URL}}", first_load['art2']['image']));
        $('#game-box').css("display", "block");
        
        comparison_id = first_load['id'];
        image1_perm = first_load['art1']['permalink'];
        image2_perm = first_load['art2']['permalink'];
        
        preload_images(next_load['art1']['image'], next_load['art2']['image']);
        
        if (!handlers_registered)
        {
            $('#image1').click(function() {
                submit_selection(comparison_id, image1_perm);
            });
            $('#image2').click(function() {
                submit_selection(comparison_id, image2_perm);
            });
            handlers_registered = 1;
        }
    }
}

function new_comparison()
{
	var email = $('#email').val();
	var url = email ? ('new-comparison.php?email='+encodeURIComponent(email)) : 'new-comparison.php';
	
    //$('#image1').fadeOut("fast");
    //$('#image2').fadeOut("fast");
    $.get(url, comp_back);
}

function submit_selection(comparison_id, winner)
{
    new_comparison();
    var url = 'submit.php?comp_id='+comparison_id+'&winner='+winner;
    $.get(url, function(data) {
        try
        {
            var result = JSON.parse(data);
            if (result['warn'] == "email")
            {
                if (confirm("Would you like to register with your email?\n"+
                        "It will take only a second and we will be able to save your results!"))
                {
                    $("#email").focus();
                }
            }
            if (result['response'].match(/success/i))
            {
                //alert("Successful comparison!");
            }
        }
        catch (error)
        {
            alert("Invalid response!\n"+data);
        }
    });
}

function start_game()
{
    new_comparison();
}