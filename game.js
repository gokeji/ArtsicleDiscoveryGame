comparison_id = 0;
image1_perm = 0;
image2_perm = 0;

handlers_registered = 0;

submit_lock = 0;

pre_loaded = false;
next_load = 0;

game_started = false;

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
        
        $('#comparison-box').css("opacity", "1");
        
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
                    submit_selection(comparison_id, image1_perm, image2_perm);
                }
            });
            $('#zoom2').click(function(e) {
				e.preventDefault();
                if (!submit_lock)
                {
                    submit_lock = 1;
                    submit_selection(comparison_id, image2_perm, image1_perm);
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
    var url = 'new-comparison.php';
    
    //$('#image1').fadeOut("fast");
    //$('#image2').fadeOut("fast");
    $('#comparison-box').css("opacity", "0.5");
    $.get(url, comp_back);
}

function submit_selection(comparison_id, winner, loser)
{
    new_comparison();
    var url = 'submit.php?comp_id=' + comparison_id + (winner ? '&winner='+winner : '');
    $.get(url, function(data) {
        try
        {
            var result = JSON.parse(data);
            if (result['warn'] == "email")
            {
                noty({"text":"Login with Facebook to save your choices!",
                      "theme":"noty_theme_mitgux","layout":"topRight","type":"information",
                      "animateOpen":{"height":"toggle"},"animateClose":{"height":"toggle"},
                      "speed":500,"timeout":5000,"closeButton":true,"closeOnSelfClick":true,
                      "closeOnSelfOver":false,"modal":false});
            }
            if (result['response'].match(/success/i))
            {
                //alert("Successful comparison!");
            }
        }
        catch (error)
        {
            //alert("Invalid response!\n"+data);
        }
    });
    
    //submit stats
    var url = 'stats.php?comp_id=' + comparison_id + (winner ? '&winner='+winner : '') + (loser ? '&loser='+loser : '');
    $.get(url, function(data) {
				try
	        {
	            var result = JSON.parse(data);
	            var obj = {
	                link: 'http://www.artsicle.com/art/' + result['permalink'],
	                picture: result['image'],
	                caption: '"' + result['name'] + '" by ' + result['artist']['full'],
	                winrate: result['winrate'],
	                battles: result['battles'],
	                size: result['size'],
	                medium: result['medium']
	            };
	            
	            noty({"text":"<img class='notif-image' src='"+obj['picture']+"'/>"+
                             "<div class='notif-message'>You voted for "+obj['caption']+".</br>"+
                             "<span class='notif-emp'>"+obj['winrate']+"%</span> of people agree with you, "+
                             "given <span class='notif-emp'>"+obj['battles']+"</span> battles.</div><div class='notif-dummy'></div>",
                      "theme":"noty_theme_mitgux", "layout":"bottomRight",
                      "type":"information","animateOpen":{"height":"toggle"},
                      "animateClose":{"height":"toggle"},"speed":500,"timeout":3000,
                      "closeButton":true,"closeOnSelfClick":false,
                      "closeOnSelfOver":false,"modal":false});
	        }
	        catch (error)
	        {
	            //alert("Invalid response!\n"+data);
	            //$('#choice').html(data);
	        }
    });
}

function start_game()
{
    if (!game_started)
    {
        game_started = true;
        $('#comparison-box').hide();
        $('#welcome-message').hide();
        $('#login-message').hide();
        $('#play-button').hide();
        $("#loading-animation").show();
        //$("#play-button").hide();
        //$("#login-message").hide();
        //$("#fblog").hide();
    }
    new_comparison();
}