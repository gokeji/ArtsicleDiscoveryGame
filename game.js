comparison_id = 0;
image1_perm = 0;
image2_perm = 0;

handlers_registered = 0;

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

function new_comparison()
{
	var email = $('#email').val();
	var url = email ? ('new-comparison.php?email='+encodeURIComponent(email)) : 'new-comparison.php';
	
    $('#image1').fadeOut("fast");
    $('#image2').fadeOut("fast");
    $.get(url, function(data) {
        //$('.result').html(data);
        //alert(data);        
        var result = JSON.parse(data);
        $('#comparison-box').fadeIn("fast");
        $('#better').fadeIn("fast");
        $('#image1').attr("src", result['art1']['image']).fadeIn("slow");
        $('#image2').attr("src", result['art2']['image']).fadeIn("slow");
        $('#game-box').css("display", "block");
		
        comparison_id = result['id'];
        image1_perm = result['art1']['permalink'];
        image2_perm = result['art2']['permalink'];
        
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
    });
}

function submit_selection(comparison_id, winner)
{
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
                new_comparison();
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