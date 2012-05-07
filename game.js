comparison_id = 0;
image1_perm = 0;
image2_perm = 0;

handlers_registered = 0;

submit_lock = 0;

waiting_next = true;
next_comparison = 0;

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

function setup_comparison(comparison) 
{
    $("#loading-animation").hide();
        
    $('#comparison-box').fadeIn("fast");
    $('#better').fadeIn("fast");
    $('#image1').attr("src", comparison['art1']['image']);//.fadeIn("fast");
    $('#zoom1').attr("href", comparison['art1']['image']);// loads the image for magnification
    $('#image1').attr("permalink", comparison['art1']['permalink']);
    $('#like-image1').attr("src", like_url_template.replace("{{IMAGE-URL}}", comparison['art1']['image']));
    $('#image2').attr("src", comparison['art2']['image']);//.fadeIn("fast");
    $('#zoom2').attr("href", comparison['art2']['image']);// loads the image for magnification
    $('#image2').attr("permalink", comparison['art2']['permalink']);
    $('#like-image2').attr("src", like_url_template.replace("{{IMAGE-URL}}", comparison['art2']['image']));
    $('#game-box').css("display", "block");
    
    $('#comparison-box').css("opacity", "1");
    
    comparison_id = comparison['id'];
    image1_perm = comparison['art1']['permalink'];
    image2_perm = comparison['art2']['permalink'];
    
    // activate cloud-zoom
    $('.cloud-zoom').CloudZoom();
}

function comp_back(data) 
{
    //$('.result').html(data);
    //alert(data);        
    
    if (waiting_next)
    {
        waiting_next = false;
        try {
            comparison = JSON.parse(data);
          
        } catch (err) {
            //invalid response from server?
            waiting_next = true;
            setTimeout(new_comparison, 500);
        }
        setup_comparison(comparison);
        submit_lock = 0;
        
        if (!handlers_registered)
        {
            $('#zoom1').click(function(e) {
				e.preventDefault();
                if (!submit_lock)
                {
                    submit_selection(comparison_id, image1_perm, image2_perm);
                }
            });
            $('#zoom2').click(function(e) {
				e.preventDefault();
                if (!submit_lock)
                {
                    submit_selection(comparison_id, image2_perm, image1_perm);
                }
            });
            $('#neither-button').click(function() {
                if (!submit_lock)
                {
                    //new_comparison();
                    submit_selection(comparison_id, false, false);
                }
            });
            handlers_registered = 1;
        }
    }
    else
    {
        next_comparison = JSON.parse(data);
        preload_images(next_comparison['art1']['image'], next_comparison['art2']['image']);
    }
    $('#comparison-box').css("opacity", "1");
}

function new_comparison()
{
    var url = 'new-comparison.php';
    $.get(url, comp_back);
}

function submit_selection(comparison_id, winner, loser)
{
    if (next_comparison) 
    {
        setup_comparison(next_comparison);
        next_comparison = 0;
        waiting_next = false;
    }
    else
    {
        submit_lock = 1;
        waiting_next = true;
        $('#comparison-box').css("opacity", "0.5");
        new_comparison();
    }
    new_comparison();
    
    if (!winner) { 
        // "Neither" case. Nothing to submit.
        return;
    }
    
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
            if (result['saved-to'] == 'session' && $("#fb-welcome-message").html() != "") 
            {
                $("div.fb-login-button").show();
                $("#fb-welcome-message").html("");
                noty({"text":"Login with Facebook to save your choices!",
                      "theme":"noty_theme_mitgux","layout":"topRight","type":"information",
                      "animateOpen":{"height":"toggle"},"animateClose":{"height":"toggle"},
                      "speed":500,"timeout":5000,"closeButton":true,"closeOnSelfClick":true,
                      "closeOnSelfOver":false,"modal":false});
            } else if (!result['saved-to'] && $("#fb-welcome-message").html() == "")
            {
                $("div.fb-login-button").hide();
                $("#fb-welcome-message").html("Welcome <b class='welcome-name'>" + me.first_name + "</b>!");
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
                             "<div class='notif-message'>You voted for "+obj['caption']+". "+
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
        $('.welcome-message').hide();
        $('#login-message').hide();
        $('#play-button').hide();
        $('#gallerybox').hide();
        stop_time(); //stop loading the gallery
        $("#loading-animation").show();
        //$("#play-button").hide();
        //$("#login-message").hide();
        //$("#fblog").hide();
    }
    new_comparison();
    new_comparison();
}

/////////////////////////////CODE FOR THE GALLERY//////////////////////////////////

var images = new Array();
var altText = new Array();
var permalink = new Array();

/*
images[0] = 'images/gallery/1.jpg';
images[1] = 'images/gallery/2.jpg';
images[2] = 'images/gallery/3.jpg';
images[3] = 'images/gallery/4.jpg';
images[4] = 'images/gallery/5.jpg';
images[5] = 'images/gallery/6.jpg';

altText[0] = 'Image 1';
altText[1] = 'Image 2';
altText[2] = 'Image 3';
altText[3] = 'Image 4';
altText[4] = 'Image 5';
altText[5] = 'Image 6';*/

var timer_on = "true";
var t = 0;
var Y = 0;
var artsicle_url = 'http://www.artsicle.com/art/';

function change(X,Y){
  $(X).attr('src' , images[Y]);
  $(X).attr('alt' , altText[Y]);
  $(X).attr('onClick' , 'window.open("'+permalink[Y]+'")');
}

function replaceThings(X,Y){
  $(X).fadeOut(350, function() {change(X,Y);
  });
  $(X).fadeIn(350, function() {});
}

function repeat(){
  if (timer_on == "false")
    return;
    
  replaceThings("#0", Y); Y = (Y+1) % images.length;
  replaceThings("#1", Y); Y = (Y+1) % images.length;
  replaceThings("#2", Y); Y = (Y+1) % images.length;
  if(timer_on == "true"){
  	t = setTimeout("repeat()", 5000);
  }
}

function start_time(){
  if (timer_on == "false"){
    timer_on = "true";
    repeat();
  }
}

function stop_time(){
  if (!typeof t === 'undefined') {
    clearTimeout(t);
  }
  timer_on = "false";
}

function prepare(){
  //t = setTimeout("repeat()", 5000);
  $(".gallery").mouseenter(
  function () {
    stop_time();
  });
  $(".gallery").mouseleave(
  function () {
    t = setTimeout("start_time()", 5000);
  });
}

function loadImages(){
	var url = 'gallery.php';
    $.get(url, function(data) {
        try
        {
            var result = JSON.parse(data);
            console.log(result);
            for (i in result.popular){
            	images[i] = result.popular[i].image;
            	altText[i] = result.popular[i].name;
            	permalink[i] = artsicle_url + result.popular[i].permalink;
            }
            repeat();
        }
        catch (error)
        {
            //$('#choice').html(data);
        }
    });
}

$(document).ready(function () {
	loadImages();
  	prepare();
});
