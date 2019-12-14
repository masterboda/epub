// VARIABLES DE PANELES ACTIVOS
active = 0;
before=active - 1;
next=active + 1;


// EFECTOS EN PRESENTACION
fxInit = "fadeInUp";

fxExitL = "slideOutLeft";
fxEntranceL= "slideInRight";

fxExitR = "slideOutRight";
fxEntranceR = "slideInLeft";

//---------------------> ANIMATED.CSS
$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };
      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  },
});
//---------------------> ANIMATED.CSS

// FUNC INDEX DEL PANEL ACTIVO
function initPanels() {
  $panels = $(".panels");

   // ---- ANIMACION PANEL 0 
  $panels.eq(active).show();
  // $panels.eq(active).animateCss(fxInit, function() {});
  onPlay(active);
};

// FUNC INDEX DEL PANEL ACTIVO
function onActive() {
  active = $(".container-fluid > section.active").index();
  before = active - 1;
  next = active + 1;
};

// VALIDA QUE LA NAVEGACION NO HAGA LOOP
function varNavs(){
  $buttonL = $(".buttonL");
  $buttonR = $(".buttonR");

  onActive();
  
  if (active == $panels.length-1){
      $buttonR.hide();      
  }else{
    $buttonR.show();      
  }
  
  if (before == -1){
      $buttonL.hide();      
  }else{
    $buttonL.show();      
  }

  dinamicMenu();
  navProgress(active+1);

  bloqueo();

}

// NAVBAR PROGRESIVA SEGUN panels
function navProgress(args){

$progress=$(".Progress");

full=$panels.length;
porcent=100/full;

ancho=args*porcent + "%";

$progress.css("width", ancho );

};

// BLOQUEO DE PANELES CON ACTIVIDADES
function bloqueo(arg){

var attr = $(".active").attr('data-bloq');

// For some browsers, `attr` is undefined; for others,
// `attr` is false.  Check for both.
if (typeof attr !== typeof undefined && attr !== false) {
    $(".buttonR").addClass("bloq");
}else{
    $(".buttonR").removeClass("bloq");
}


};

// CREACION DE TODOS LOS PANELES CON ANIMACIÓN DE SALIDA
function onBye(numActive) {

  contBye=0;

  // if (numActive==0) {
  //     // console.log("vamos a bye "+ numActive);
  //     $("h1").eq(0).animateCss("bounceOutLeft", function() {
  //     });
  //     contBye=1;
  //     return true;
  // }

  // if (numActive==1) {
  //     // console.log("vamos a bye "+ numActive);
  //     $("h1").eq(1).animateCss("bounceOutLeft", function() {});
  //     contBye=1;
  //     return true;
  // }

  if (contBye==0) {
    return false;
  }

};

// CREACION DE TODOS LOS PANELES CON EFECTO DE ENTRADA
$(document).ready(function(){

})

function onPlay(numActive) {

  // console.log("vamos a play "+numActive);

  if (numActive==0) {

    // EQ SIGNIFICA EL INDEX DE LOS ELEMENTOS EN HTML, ES UN ARRAY QUE EMPIEZA DE 0
    // LIBRERIA ANIMATE CSS -> SU COMANDO ES .animateCss, visita la web para encontrar sus ejemplos https://daneden.github.io/animate.css/
    // .animate es una propiedad de Jquery que tiene también su callback
    // $(".title").eq(0).removeAttr("style");
    // $(".title").eq(0).animateCss("bounceIn");

  }

    if (numActive==1) {

    $(".anim2").eq(1).attr("src","./images/img_01.png");

  }

};




function createVars(arg, trys){

var stro="";
for (var i = 1; i <= trys; i++) {

  stro+= arg+i+' = 0;';

}

eval(stro);

};


function clicker(name, logic, answer, next, namevar, trys, numtry) {


stra="";

var check="";
var check2="";
  

stra+= "$('#"+name+"').on('keyup', function(event){";   
stra+="clearTimeout(check);";
stra+="clearTimeout(check2);";

stra+="var value = $('#"+name+"').val();";

stra+="if (value != '') {";
stra+="if (value"+logic+"'"+answer+"') {";
          
stra+="clearTimeout(check2);";
stra+="check2 = setTimeout(function(){";
stra+="clearTimeout(check2);";
stra+="clearTimeout(check);";
            
stra+="$('#"+name+"').attr('data-state','correct').blur();";
if (next!="") {
stra+="$('#"+next+"').focus();";
};
stra+="$('#"+name+"').animateCss('bounce', function() {});";

stra+= namevar+numtry+"=1;"

stra+= "if (";

for (var i = 1; i <= trys; i++) {

  if (i == trys) {
    stra += namevar+i+ "==1";
  }else{
    stra += namevar+i+ "==1 && ";
  };

};

stra+= "){";
stra+= "$('.active').removeAttr('data-bloq');";
stra+= "};";

stra+="correct_sound();";

stra+="return false;";
stra+="}, 700);";
       
stra+=" }else{";
stra+=" clearTimeout(check);";
stra+=" check = setTimeout(function(){";
stra+=" clearTimeout(check);";
stra+=" clearTimeout(check2);";

stra+=" $('#"+name+"').attr('data-state','wrong');";
stra+=" $('#"+name+"').animateCss('shake', function() {});";

stra+= namevar+numtry+"=0;"

stra+= "if (";

for (var i = 1; i <= trys; i++) {

  if (i == trys) {
    stra += namevar+i+ "==0";
  }else{
    stra += namevar+i+ "==0 || ";
  };

};

stra+= "){";
stra+= "$('.active').attr('data-bloq','on');";
stra+= "};";

stra+=" wrong_sound();";
// stra+=" $('.active').attr('data-bloq','on');";
stra+=" return false;";
stra+=" }, 700);";
stra+=" };";

stra+="}else{";
stra+="clearTimeout(check);";
stra+="clearTimeout(check2);";
stra+="$('#"+name+"').attr('data-state','');";
stra+="};";

stra+="});";

eval(stra);

};


function action(act) {
  if (act=="GO") {
    // onActive();
    
    var bye = onBye(active);

    if (bye == true) {
        // $panels.eq(active).delay(1000).hide(0, function() {
        // $panels.eq(active).removeClass("active").removeAttr("style");
        // });

         $panels.eq(active).children().one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
        function(e) {
          
        $panels.eq(active).hide(0, function() {
            $panels.eq(active).removeClass("active").removeAttr("style");
            });

            $panels.eq(next).show(0, function() {
            $panels.eq(next).addClass("active");
            onPlay(next);
          });
        });


        

      }else{
      $panels.eq(active).hide(0, function() {
            $panels.eq(active).removeClass("active").removeAttr("style");
          });

          $panels.eq(next).show(0, function() {
            $panels.eq(next).addClass("active");
            onPlay(next);
          });
      };

      
      

  }else if (act=="RETURN") {

    var bye = onBye(active);

    if (bye == true) {

         $panels.eq(active).children().one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
        function(e) {
          
        $panels.eq(active).hide(0, function() {
            $panels.eq(active).removeClass("active").removeAttr("style");
            });

            $panels.eq(before).show(0, function() {
            $panels.eq(before).addClass("active");
            onPlay(before);
          });
        });


        

      }else{
      $panels.eq(active).hide(0, function() {
            $panels.eq(active).removeClass("active").removeAttr("style");
          });

          $panels.eq(before).show(0, function() {
            $panels.eq(before).addClass("active");
            onPlay(before);
          });
      };

  }else{

    
        // console.log("that");
      $panels.eq(active).hide(0, function() {
            $panels.eq(active).removeClass("active").removeAttr("style");
          });


      $panels.eq(act).show(0, function() {
            $panels.eq(act).addClass("active");
            onPlay(act);
          });
  };

};

function createMenu() {

  var lengis =$("[data-name]").length -1;

  for (var i = 0; i <= lengis; i++) {
    name = $("[data-name]").eq(i).data().name;
    $(".navCircle").append('<div class="circle "><div class="squareInfo"><p>'+name+'</p></div></div>')
  }
  
  // attr = $panels.eq(active).attr("data-name");
  // attrs = $('[data-name]');

  // if (attrs) {}

  // attr = $(".container > section [data-name]").index();

  // if (typeof attr !== typeof undefined && attr !== false) { 
  //  console.log("yeah!");
  // }else{
  //   console.log("noOne!");
  // }

  // $('[data-name*=""]').on('click', function(e) {
  //     $(this).removeAttr("data-state");
  // });

  // console.log($(this).index());
  // $links = $(".link");
  // send = $(".container > section.active").index();

};

function dinamicMenu(){

  // var lengis =$("[data-name]").length -1;
  $circle = $(".circle");
  var lengis = $(".panels").length -1;
  var lengDatas = $("[data-name]").length-1;
  conter=0;

  for (var i = 0; i <= lengis; i++) {
    // console.log(i);

    if (conter > lengDatas) {
      // console.log("conter stop"+conter);
    }else{
      if ( $(".active").index() >= $("[data-name]").eq(conter).index()) {
        // console.log("SEND NAME");
        $circle.removeClass("activeC");
        $circle.eq(i).addClass("activeC");
      }
    }
    conter=conter+1;
  }

};


// $( document ).ready()
$(function() {
  
  initPanels();
  createMenu();

  // action(4);
    //action(6);
  // validar ultimo y primer panel
  navsValidate = setInterval(varNavs, 100);

});


/*----BUTTONS NAV----*/
$(document).on('click', ".buttonR", function(){
  action("GO");
});

$(document).on('click', ".buttonL", function(){
  action("RETURN");
});

// ------BUTTONS MENUS THUMBS---------
$(document).on('click', ".openMenu", function(){
  $popMenu = $(".popMenu");
  $popMenu.slideDown();
});

$(document).on('click', ".closeMenu", function(){
  $popMenu.slideUp(); 
});

$(document).on('click', ".link", function(){
  action($(this).index()-1);
  $popMenu.slideUp();
});
// ------BUTTONS MENUS CIRCLES---------
$(document).on('click', ".circle", function(){
  numb1=$(".circle").index(this);
  numb2=$("[data-name]").eq(numb1).index();
  action(numb2);
});


$('body').keyup(function (event) {
  
        if (event.keyCode == 37) {
            // console.log("left going");
            if (active!=0) {
              action("RETURN");
            }
            
        } 
        if (event.keyCode == 39) {
             // console.log("right going");
             if (active != $panels.length-1 && $(".buttonR").hasClass("bloq")==false) {
              action("GO");
            }
        }
        // if (event.keyCode == 38 ) { console.log ("up 38")};
        // if (event.keyCode == 40 ) { console.log ("down 40")};
        // if (event.keyCode == 32) { console.log ("barra 32");}
    });


// ------BUTTONS MENUS CIRCLES---------
$(document).on('click', ".menuCloseButton", function(){
  alert("cerrar");
});



$(document).on('click', ".bc-p1", function(){
  $(".tooltipM").slideUp();
  $(this).children(".tooltipM").slideDown();
  $(".signal").slideUp();
  $(".lethig").removeClass("high1");
});

$(document).on('click', ".bc-p2", function(){
  $(".tooltipM").slideUp();
  $(this).children(".tooltipM").slideDown();
  $(".signal").slideUp();
  $(".lethig").removeClass("high1");
});

$(document).on('click', ".bc-p3", function(){
  $(".tooltipM").slideUp();
  $(this).children(".tooltipM").slideDown();
  $(".signal").slideDown();
  $(".lethig").removeClass("high1");
});

$(document).on('click', ".bc-p4", function(){
  $(".tooltipM").slideUp();
  $(this).children(".tooltipM").slideDown();
  $(".signal").slideUp();
  $(".lethig").addClass("high1");

});
