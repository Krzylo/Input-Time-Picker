/*
* Copyright (c) 2017 Krzysztof Zamojski
* @name     Time Picker 
* @requires jQuery
*/
(function ( $ ) {
 
    $.fn.timepicker = function( options ) {
        
    var defaults = {
        disableMenu: true,
        showPicker: true,
        autoComplete: "off"
    };
 
    var settings = $.extend( {}, defaults, options );
    
    var hour = false, // select hour - true
        minute = false, // select minute - true
        counter = 0,
        lr = true,//left or right left - true ; right false
        handleInterval; 
       
    function createSelection(field, start, end) {
        if( field.createTextRange ) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if( field.setSelectionRange ) {
            field.setSelectionRange(start, end);
        } else if( field.selectionStart ) {
            field.selectionStart = start;
            field.selectionEnd = end;
        }
        field.focus();
    }
    
    function changeValue(field, keyCode){
        var str = field.value;
        if (lr){
            if (hour){
                //druga liczba godziny
                var res = str.slice(2);                
                if (counter == 2 && keyCode > 51){
                    keyCode = 51;
                }                                
                res = counter + String.fromCharCode(keyCode) + res;
                field.value = res;
                createSelection(field, 3, 5);
                hour = false;
                lr = false;                
            
            }else{
                //pierwsza liczba godziny
                //for buttons
                $(field).removeClass( "krz-set-minute" ).addClass("krz-set-hour");
                var res = str.slice(2);
                res = "0" + String.fromCharCode(keyCode) + res;
                field.value = res;
                // key > 3
                if (keyCode > 50){
                    createSelection(field, 3, 5);
                    hour = false;
                    lr = false;
                    counter = 0;   
                }else{
                    createSelection(field, 0, 2);
                    hour = true;                    
                }
                // counter - pierwsza liczba 
                counter = String.fromCharCode(keyCode);                                
            }            
        } else{
            // minute
            //for buttons
            $(field).removeClass( "krz-set-hour" ).addClass("krz-set-minute");
            if(minute){
                //druga liczba minuty
                var res = str.slice(0,3);
                res = res + counter + String.fromCharCode(keyCode);
                field.value = res;
                createSelection(field, 3, 5);
                minute = false;           
                
            }else{
                // pierwsza liczba minuty
                var res = str.slice(0,3);
                res = res + "0" + String.fromCharCode(keyCode);
                field.value = res;
                createSelection(field, 3, 5);
                minute = true;
                // counter - pierwsza liczba 
                counter = String.fromCharCode(keyCode);
            }
        } 
    }
    
    function resetSelection(field){
        var str = field.value;
        if (lr){
           var res = str.slice(2);
           res = "--" + res;
           field.value = res;
           createSelection(field, 0, 2); 
        }else{
           var res = str.slice(0,3);
           res = res + "--";
           field.value = res;
           createSelection(field, 3, 5);            
        }
    }
    
    function incHour(hour){
        hour++;
        if (hour > 23){
            hour = 0;}                           
        
        if (hour < 10){
            hour = "0" + hour;
        }
        return hour;        
    }
    
    function decHour(hour){
        hour--;
        if (hour < 0){
            hour = 23;}                           
        
        if (hour < 10){
            hour = "0" + hour;
        }
        return hour;        
    }
    
    function incMinute(minute){
        minute++;
        if (minute > 59){
            minute = 0;
        }
        if (minute < 10){
            minute = "0" + minute;
        }
        return minute;        
    }
    
    function decMinute(minute){
        minute--;
        if (minute < 0){
            minute = 59;
        }
        if (minute < 10){
            minute = "0" + minute;
        }
        return minute;                
    }
    
    function getMinute(time){
        var minute = parseInt(time.slice(3),0);
                
        if ( isNaN(minute) ){
            minute = 0;
        }
        return minute;
    }
    
    function getHour(time){
        var hour = parseInt(time.slice(0,2),0);
        
        if ( isNaN(hour) ){
            hour = 0;
        }
        return hour;        
    }
    
    Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
    } 
    
    function showPicker(field){
                
        $(field).wrap('<div><div class="krz-widget-content krz-spinner"></div></div>');
        $(field).after('<div class="krz-widget-content-reset"><a href="#" class="krz-spiner-button krz-spinner-button-reset"><span>x</span></a></div>'+
        '<div class="krz-widget-content-up"><a href="#" class="krz-spiner-button krz-spinner-button-up"><span>+</span></a></div>'+
        '<div class="krz-widget-content-down"><a href="#" class="krz-spiner-button krz-spinner-button-down"><span>-</span></a></div>');
     } //end showPicker
             
    return this.each(function() {
        
    if ( settings.autoComplete == "off" ){
        $(this).attr('autocomplete', 'off' );
    }    
    
    if (settings.showPicker){
        showPicker(this);
    }
    
    
    $(this).addClass("krz-set-hour");
    

    $(this).click(function() {
        var input = this,
            curPoss = input.selectionStart,
            start = 0,
            stop = 2;
        if ( curPoss > 3){            
            start = 3;
            lr = false;
            $(input).removeClass( "krz-set-hour" ).addClass("krz-set-minute");
        }else{
            lr = true;
            $(input).removeClass( "krz-set-minute" ).addClass("krz-set-hour");
        }
        stop = start + 2;

       createSelection(input, start, stop);
       return false;
    });
    
    $(this).keydown(function(e){
        if ((e.keyCode > 47 && e.keyCode < 58)||(e.keyCode > 95 && e.keyCode < 106)) {
            if(e.keyCode > 95 && e.keyCode < 106){
               e.keyCode = e.keyCode - 48;               
            }
        changeValue(this, e.keyCode) ;            
        }
        if ( e.keyCode == 46 || e.keyCode == 8 ) {
            //reset selection
            resetSelection(this);
        }
        
        return false;    
    });
    
    $(this).blur(function(){
        var str = this.value;
        var minute = parseInt(str.slice(3),10);
        var hour = parseInt(str.slice(0,2),10);
        
        if ( typeof minute == "number"){
            if (minute > 59){
                minute = 59;
            }            
        }else{
            minute = 0;
        }
        
        if ( typeof hour == "number"){
            if (hour > 23){
                hour = 23;}                           
        }else{
                hour = 0;
            }
        if (hour < 10){
            hour = "0" + hour;
        } 
        if (minute < 10){
            minute = "0" + minute;
        }
        this.value = hour + ":" + minute;             
        return false;
    });
    
    $(this).bind('contextmenu', function(e){
        return !settings.disableMenu;
    });

    $(this).siblings().find( "a.krz-spinner-button-reset" ).click(function() {
        
        $(this).parent().parent().find("input").val("--:--");            
    return false;
    });
    
    $(this).siblings().find( "a.krz-spinner-button-up" ).click(function() {
        var time = $(this).parent().parent().find("input").val();
        var minute = getMinute(time);
        var hour = getHour(time);
                
        if ($(this).parent().parent().find("input").hasClass("krz-set-hour") ){
            hour = incHour(hour); 
        }else{
            minute = incMinute(minute);
        }
        
        $(this).parent().parent().find("input").val(Number(hour).pad() + ":" + Number(minute).pad());
        return false;
    });    

    
    $(this).siblings().find( "a.krz-spinner-button-down").click( function() {
        var time = $(this).parent().parent().find("input").val();
        var minute = getMinute(time);
        var hour = getHour(time);
                
        if ($(this).parent().parent().find("input").hasClass("krz-set-hour") ){
            hour = decHour(hour); 
        }else{
            minute = decMinute(minute);
        }
               
        $(this).parent().parent().find("input").val(Number(hour).pad() + ":" + Number(minute).pad());
        return false;
    });    

   $(this).siblings().find( "a.krz-spinner-button-down").mousedown( function() {        
        handleInterval = setInterval(continueExecution, 250, this);          
           function continueExecution(element){
                var time = $(element).parent().parent().find("input").val();
                var minute = getMinute(time);
                var hour = getHour(time);
                      
              if ($(element).parent().parent().find("input").hasClass("krz-set-hour") ){
                  hour = decHour(hour);             
              }else{
                  minute = decMinute(minute);            
              }                     
             $(element).parent().parent().find("input").val(Number(hour).pad() + ":" + Number(minute).pad());
           }     
    });
      
    $(this).siblings().find( "a.krz-spinner-button-up").mousedown( function() {        
        handleInterval = setInterval(continueExecution, 250, this);          
           function continueExecution(element){
                var time = $(element).parent().parent().find("input").val();
                var minute = getMinute(time);
                var hour = getHour(time);
                      
              if ($(element).parent().parent().find("input").hasClass("krz-set-hour") ){
                  hour = incHour(hour);             
              }else{
                  minute = incMinute(minute);            
              }                     
             $(element).parent().parent().find("input").val(Number(hour).pad() + ":" + Number(minute).pad());
           }    
    });

    $(this).siblings().find( "a.krz-spinner-button-down, a.krz-spinner-button-up").mouseup( function() {
        clearInterval(handleInterval) ;
    });                           
        
    });
    };
 
}( jQuery ));