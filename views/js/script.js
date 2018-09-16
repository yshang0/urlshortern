 $(document).ready(function () {
    $('#logintab').on('click',function(e){
          e.preventDefault();
        $('.loginmodal-container').show();
        $('.signupmodal-container').hide();
    });
    $('#signuptab').on('click',function(e){
        e.preventDefault();
        $('.loginmodal-container').hide();
        $('.signupmodal-container').show();
    });
     $('#register_tab').on('click',function(e){
        e.preventDefault();
        $('.loginmodal-container').hide();
        $('.signupmodal-container').show();
    });

         
    $('#login_subtab').on('click',function(e){
        e.preventDefault();
        $('.loginmodal-container').show();
        $('.signupmodal-container').hide();
    });

    $('#customize_button').on('click',function(e){
        $('#inputbox').hide();
        $('#customized_inputbox').show();
        $('#customize_button').hide();
        $('#back_button').show();
    });

    $('#back_button').on('click',function(e){
        $('#inputbox').show();
        $('#customized_inputbox').hide();
        $('#customize_button').show();
        $('#back_button').hide();
    });
     
    $('#longUrlForm').submit(function(e){
        
        var url = '/longurl';
        var data = {};
        data["longURL"] = $('#search').val();
        console.log(data);
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(data),
            success: function(response){
                console.log(response);
                if('err' in response){
                    $('#popupInfowindow').modal('show');
                    $("#result").text(response['err']);
                    console.log(response['err']);
                }
                else{
                    $('#search').val(response.ShortURL);
                }
            },
            failure: function(errMsg) {
                console.log(errMsg);
            },
            error: function(e){
                console.log("error Message!");
                console.log(e);
            }
        });      
        e.preventDefault();   
    });

    $("#customizeUrlForm").submit(function (e) {
        var url = '/custom';
        var data = {};
        data['customizedshorturl'] = $('#customize').val();
        data['longURL'] = $('#searchCustomize').val();
        data['userId'] = 0;
        console.log(data);
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(data),
            success: function(response){
                console.log(response);
                if('err' in response){
                    $('#popupInfowindow').modal('show');
                    $("#result").text(response['err']);
                    console.log(response['err']);
                }
                else{
                    $('#searchCustomize').val(response.ShortURL);
                }
            },
            failure: function(errMsg) {
                console.log(errMsg);
            },
            error: function(e){
                console.log("error Message!");
                console.log(e);
            }
        });      
        e.preventDefault(); 
    });
});