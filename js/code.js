(function(){

  var t = {
    playlist: [
      {
        file: "audios/WM1/A0_Prologo_Mision_bebe.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Prólogo",
        trackArtist: "Narrativa 3",
        // trackAlbum: "Single",
      },
      {
        file: "audios/WM1/A1_E1_De_tres_pasamos_a_cuatro.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Capítulo 1",
        trackArtist: "Narrativa 3",
        // trackAlbum: "Single",
      }
    ]
  }

  $(".jAudio").jAudio(t);

  $(document).on('click', ".bclose", function(){
    $(".popUp").fadeOut();

  });

})();