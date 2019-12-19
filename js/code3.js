(function(){

  var t = {
    playlist: [
      {
        file: "audios/WM1/A0_Prologo_Mision_bebe.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Prólogo",
        trackArtist: "Narrativas matemáticas 1",
        // trackAlbum: "Single",
      },
      {
        file: "audios/WM1/A1_E1_De_tres_pasamos_a_cuatro.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 1",
        trackArtist: "Episodio 1"
      },
      {
        file: "audios/WM1/A1_E2_Haciendo_galletas.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 1",
        trackArtist: "Episodio 2"
      },
      {
        file: "audios/WM1/A1_E3_El_juego_de_los_disfraces.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 1",
        trackArtist: "Episodio 3"
      },
      {
        file: "audios/WM1/A2_E1_Cuánto_mide_la_piscina.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 2",
        trackArtist: "Episodio 1"
      },
      {
        file: "audios/WM1/A2_E2_Entre_pelotas_zapatos_chihuahuas.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 2",
        trackArtist: "Episodio 2"
      },
      {
        file: "audios/WM1/A2_E3_A_lanzarnos_del_tobogan_de_la_piscina.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 2",
        trackArtist: "Episodio 3"
      },
      {
        file: "audios/WM1/A3_E1_Un_dia_en_familia.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 3",
        trackArtist: "Episodio 1"
      },
      {
        file: "audios/WM1/A3_E2_Cuantas_flores_ves.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 3",
        trackArtist: "Episodio 2"
      },
      {
        file: "audios/WM1/A3_E3_Otro_picnic_mas.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 3",
        trackArtist: "Episodio 3"
      },
      {
        file: "audios/WM1/A4_E1_Todos_a_contar.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 4",
        trackArtist: "Episodio 1"
      },
      {
        file: "audios/WM1/A4_E2_Un bebe_o_un_robot.mp3",
        thumb: "images/audio-icon.png",
        trackName: "Aventura 4",
        trackArtist: "Episodio 2"
      }
    ]
  }

  $(".jAudio").jAudio(t);

  $(document).on('click', ".audioPlayer", function(){
    $(".popUp").fadeIn().css("display","flex");
  });

  $(document).on('click', ".bclose", function(){
    $(".popUp").fadeOut();

    if ($("#togPlay").hasClass("jAudio--control-pause")) {  
      $("#togPlay").trigger( "click" );
    }
  });

  $(document).on('click', ".HAbooks", function(){
    $(".popUpHA").fadeIn().css("display","flex");
  });

  $(document).on('click', ".bcloseHA", function(){
    $(".popUpHA").fadeOut();
  });

})();
