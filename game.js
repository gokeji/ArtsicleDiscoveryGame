comparison_id = 0;
image1_perm = 0;
image2_perm = 0;

handlers_registered = 0;

submit_lock = 0;

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
        
        $("#loading-animation").hide();
        
        $('#comparison-box').fadeIn("fast");
        $('#better').fadeIn("fast");
        $('#image1').attr("src", first_load['art1']['image']);//.fadeIn("fast");
		$('#zoom1').attr("href", first_load['art1']['image']);// loads the image for magnification
        $('#image1').attr("permalink", first_load['art1']['permalink']);
        $('#like-image1').attr("src", like_url_template.replace("{{IMAGE-URL}}", first_load['art1']['image']));
        $('#image2').attr("src", first_load['art2']['image']);//.fadeIn("fast");
		$('#zoom2').attr("href", first_load['art2']['image']);// loads the image for magnification
        $('#image2').attr("permalink", first_load['art2']['permalink']);
        $('#like-image2').attr("src", like_url_template.replace("{{IMAGE-URL}}", first_load['art2']['image']));
        $('#game-box').css("display", "block");
        
        comparison_id = first_load['id'];
        image1_perm = first_load['art1']['permalink'];
        image2_perm = first_load['art2']['permalink'];
        
        preload_images(next_load['art1']['image'], next_load['art2']['image']);
        
		// activate cloud-zoom
		$('.cloud-zoom').CloudZoom();
        if (!handlers_registered)
        {
            $('#zoom1').click(function(e) {
				e.preventDefault();
                if (!submit_lock)
                {
                    submit_lock = 1;
                    submit_selection(comparison_id, image1_perm);
                }
            });
            $('#zoom2').click(function(e) {
				e.preventDefault();
                if (!submit_lock)
                {
                    submit_lock = 1;
                    submit_selection(comparison_id, image2_perm);
                }
            });
            $('#neither-button').click(function() {
                if (!submit_lock)
                {
                    submit_lock = 1;
                    new_comparison();
                }
            });
            handlers_registered = 1;
        }
    }
    submit_lock = 0;
    $('#comparison-box').css("opacity", "1");
}

function new_comparison()
{
    var email = $('#email').val();
    var url = email ? ('new-comparison.php?email='+encodeURIComponent(email)) : 'new-comparison.php';
    
    //$('#image1').fadeOut("fast");
    //$('#image2').fadeOut("fast");
    $('#comparison-box').css("opacity", "0.5");
    $.get(url, comp_back);
}

function submit_selection(comparison_id, winner)
{
    new_comparison();
    var url = 'submit.php?comp_id=' + comparison_id + (winner ? '&winner='+winner : '');
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
                //submit_lock = 0;
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
    $('#comparison-box').hide();
    $("#loading-animation").show();
    new_comparison();
}