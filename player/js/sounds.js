//////// SONIDOS
var sound1 = "CORRECT";
var sound2 = "WRONG";
var sound3 = "DRAG";
var sound4 = "DROP";
var sound5 = "HOVER";
var sound6 = "SELECT";

sond1=0;
sond2=0;
sond3=0;
sond4=0;
sond5=0;
sond6=0;

function loadSound () {
  console.log("notyet");
createjs.Sound.registerSound("sonidos/CORRECT.mp3", sound1);
createjs.Sound.registerSound("sonidos/WRONG.mp3", sound2);
createjs.Sound.registerSound("sonidos/DRAG.mp3", sound3);
createjs.Sound.registerSound("sonidos/DROP.mp3", sound4);
createjs.Sound.registerSound("sonidos/HOVER.mp3", sound5);
createjs.Sound.registerSound("sonidos/SELECT.mp3", sound6);
console.log("loaded");
}
function playSound () {
if (sond1==1) {
  volumen1 = createjs.Sound.play(sound1, ); 
};
if (sond2==1) {
  volumen2 = createjs.Sound.play(sound2, );
};
if (sond3==1) {
  volumen3 = createjs.Sound.play(sound3, );
};
if (sond4==1) {
  volumen4 = createjs.Sound.play(sound4, );
};
if (sond5==1) {
  volumen5 = createjs.Sound.play(sound5, );
};
if (sond6==1) {
  volumen6 = createjs.Sound.play(sound6, );
};


sond1=0;
sond2=0;
sond3=0;
sond4=0;
sond5=0;
sond6=0;
}

loadSound ();

// sound_hover();
// selec_ob_sound ();



// function sound_hover () {

//     $('.hover_sound').hover(
//       function() {
//         sond5=1; playSound ();
//       }, function() {

//       }
//     );
// }


// function selec_ob_sound () {
//   $('.select_sound').click(function(){
//     sond6=1;playSound ();
//   })
//   $('input').click(function(){
//     sond6=1;playSound ();
//   })
// }

function correct_sound () {
  sond1=1; playSound();
}
function wrong_sound () {
  sond2=1; playSound();
}

function selecting () {
  sound6=1; playSound();
}

function soundDrag(){
  createjs.Sound.registerSound("sonidos/DRAG.mp3", sound3);
  createjs.Sound.play(sound3);
}

function soundDrop(){
  createjs.Sound.registerSound("sonidos/DROP.mp3", sound4);
  createjs.Sound.play(sound4);
}