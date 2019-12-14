$(document).ready(function(){
	// $('#playList').parent().removeClass('justify-content-md-between justify-content-sm-center');
	// $('#playList').parent().addClass('contenedorSongs').children().remove();

	// $('.contenedorSongs').append('<div class="containerPlayer col-12 d-flex row align-items-center p-0 justify-content-md-between justify-content-sm-center justify-content-center"><div id="listContainer" class="playlistContainer col-md-5 col-sm-12 col-12 p-0"><ul id="playListContainer" ></ul></div><div id="playerContainer" class="col-md-5 col-sm-12 col-12 p-0"><ul class="controls col-12 d-flex justify-content-center"><li><a href="#listContainer" class="left" data-attr="prevAudio"></a></li><li><a href="#listContainer" class="play" data-attr="playPauseAudio"></a></li><li><a href="#listContainer" class="right" data-attr="nextAudio"></a></li></ul><div class="audioDetails"><span class="songPlay"></span><span data-attr="timer" class="audioTime"></span></div><div class="progress"><div data-attr="seekableTrack" class="seekableTrack"></div><div class="updateProgress"></div></div><div class="volumeControl"><div class="volume volume1"></div><input class="bar" data-attr="rangeVolume" type="range" min="0" max="1" step="0.1" value="0.7" /></div></div></div>');
	$('.header').addClass('justify-content-center');
	$('.titulo').removeClass('col-md-3 col-sm-4').addClass('col-md-4 col-sm-5');
	// $('.contenedorSongs').append('<div class="containerPlayer col-12 d-flex row align-items-center p-0 justify-content-md-between justify-content-sm-center justify-content-center"><div id="listContainer" class="playlistContainer col-md-5 col-sm-12 col-12 p-0"><ul id="playListContainer" ></ul></div><div id="playerContainer" class="col-md-5 col-sm-12 col-12 p-0"><ul class="controls col-12 d-flex justify-content-center"><li><a href="#listContainer" class="left" data-attr="prevAudio"></a></li><li><a href="#listContainer" class="play" data-attr="playPauseAudio"></a></li><li><a href="#listContainer" class="right" data-attr="nextAudio"></a></li></ul><div class="audioDetails"><span class="songPlay"></span><span data-attr="timer" class="audioTime"></span></div><div class="progress"><div data-attr="seekableTrack" class="seekableTrack"></div><div class="updateProgress"></div></div><div class="volumeControl"><div class="volume volume1"></div><input class="bar" data-attr="rangeVolume" type="range" min="0" max="1" step="0.1" value="0.7" /></div></div></div>');
	$('.container').children().remove();
	$('.container').addClass(' row d-flex  m-0 p-0 align-content-between');

		contenido= '<div class="col-12 pt-5 mt-2 d-flex m-0 p-0 contList  justify-content-md-between justify-content-sm-between justify-content-center">'
		contenido+='	<div class="col-md-7 col-sm-6 col-12 py-5  col-6 d-md-flex d-sm-flex row d-none align-self-center justify-content-center align-items-center">'
		contenido+='		<img src="images/new_img/logos-01.svg" alt="" class="col-md-3 col-sm-5 col-5 mx-2 mb-md-0 mb-sm-4 mb-4 logo" />'
		contenido+='		<h1 class="songPlay flex-shrink-1 mx-2 text-md-left text-sm-center text-center"></h1>'
		contenido+='	</div>'

		contenido+='	<div class="col-md-4 col-sm-6 contPlayList col-10  m-0 p-0  col-6 overflow-scroll  pt-2 d-flex justify-content-md-end justify-content-sm-end justify-content-center align-items-center align-self-center">'
		// contenido+='		<div class="col-12 m-0 p-0 d-flex align-items-start">'
		contenido+='			<ul id="playListContainer" class="col-12  m-0 p-0 d-flex row align-self-center align-items-center"></ul>'
		// contenido+='		</div>'
		// contenido+='		<ul id="playListContainer" class="col-12  m-0 p-0 d-flex row align-self-center align-items-center"></ul>'
		contenido+='	</div>'
		contenido+='</div>'


		contPlayer='<div id="playerContainer" class="col-12 p-0 ">' 
		contPlayer+='	<div class="progress col-12 p-0 m-0 d-flex row justify-content-start">' 
		contPlayer+='		<div data-attr="seekableTrack" class="seekableTrack"></div>' 
		contPlayer+='		<div class="updateProgress"></div>' 
		contPlayer+='	</div>' 
		contPlayer+='	<div class="audioDetails col-12 d-flex my-1 justify-content-between nemeSong">' 
		contPlayer+='		<span class="songPlay">asdff</span>' 
		contPlayer+='		<span data-attr="timer" class="audioTime">3:00</span>' 
		contPlayer+='	</div>'

		contPlayer+='	<div class="col-12  d-flex justify-content-between align-items-center">'
		// contPlayer+='		<div class="controls  col-1 d-md-flex d-sm-flex d-none justify-content-center">' 
		// contPlayer+='			<img src="images/new_img/logos-02.svg" alt="" class="col-12 p-0 m-0" />' 
		// contPlayer+='		</div>' 
		contPlayer+='		<div class="col-md-7 col-sm-5 col-6 m-0 p-0 d-flex justify-content-center">' 
		contPlayer+='			<ul class="controls col-12 m-0 d-flex justify-content-between align-items-center mb-3">' 
		contPlayer+='				<li class="d-flex justify-content-center"><a href="#listContainer" class="left" data-attr="prevAudio"></a></li>' 
		contPlayer+='				<li class="d-flex justify-content-center"><a href="#listContainer" class="play" data-attr="playPauseAudio"></a></li>' 
		contPlayer+='				<li class="d-flex justify-content-center"><a href="#listContainer" class="right" data-attr="nextAudio"></a></li>' 
		contPlayer+='			</ul>' 
		contPlayer+='		</div>' 
		contPlayer+='		<div class="volumeControl col-md-3 col-sm-5 col-6 mx-md-4 mx-sm-3 mx-1 d-flex justify-content-center align-items-center">' 
		contPlayer+='			<div class="volume volume1 "></div>' 
		contPlayer+='			<input class="bar col-8" data-attr="rangeVolume" type="range" min="0" max="1" step="0.1" value="0.7" />' 
		contPlayer+='		</div>' 
		contPlayer+='	</div>'
		
		contPlayer+='</div>' 

	$('.container').append(contenido, contPlayer);



	getSongs();


})

var audio = document.getElementById('player');
var music;

function getSongs () {
	$.getJSON("js/audios.json",function(mjson){
		music = mjson;
		// console.log(music);
		genList(music);
		startSong ();
	});
}


function genList (music) {

	$.each(music.songs,function(i,song){
		$('#playListContainer').append('<li class="d-flex col-12 align-items-center justify-content-center align-self-end py-4" data-src="'+music.songs[i].song+'" id="'+i+'"> <a href="#listContainer">' +song.nombre+'</a></li>');
	})
	

	if ($('#playListContainer').children().length >=8) {
		$('#playListContainer').removeClass('align-self-center').addClass('align-self-start');
		$('#playListContainer').parent().removeClass('align-self-center align-items-center').addClass('align-self-start align-items-start');
	};
}




// //////////////////

function startSong () {
	$("#playListContainer").audioControls({
		autoPlay : false,
		timer: 'increment',
		shuffled: false,
		onAudioChange : function(response){
			$('.songPlay').text(response.title + ' ...'); //Song title information
		},
		onVolumeChange : function(vol){
			var obj = $('.volume');
			if(vol <= 0){
			 	obj.attr('class','volume mute');
			}else if(vol <= 50){
			 	obj.attr('class','volume volume1');
			}else if(vol > 50){
		 		obj.attr('class','volume volume2');
		 	}
		}
	});
}

