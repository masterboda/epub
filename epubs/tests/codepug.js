const get = q => document.querySelector(q);

Node.prototype.addClass = function(...classes) {
	for(let cls of classes)
		this.classList.add(cls);
}

Node.prototype.fadeIn = function(ms = 400, display = "block"){
	let sec = ms / 1000;
	this.style.opacity = 0;
	this.style.display = display;

	(function fade() {
		var val = parseFloat(this.style.opacity);
		if (!((val += .1) > 1)) {
			this.style.opacity = val;
			requestAnimationFrame(fade);
		}
	})();
};

const audios = [
	{name: 'sound1', src: "./audios/WM1/A0_Prologo_Mision_bebe.mp3"},
	{name: 'sound2', src: "./audios/WM1/A1_E1_De_tres_pasamos_a_cuatro.mp3"},
	{name: 'sound3', src: "./audios/WM1/A1_E2_Haciendo_galletas.mp3"},
	{name: 'sound4', src: "./audios/WM1/A1_E3_El_juego_de_los_disfraces.mp3"},
	{name: 'sound5', src: "./audios/WM1/A2_E1_Cuanto_mide_la_piscina.mp3"},
	{name: 'sound6', src: "./audios/WM1/A2_E2_Entre_pelotas_zapatos_chihuahuas.mp3"},
	{name: 'sound7', src: "./audios/WM1/A2_E3_A_lanzarnos_del_tobogan_de_la_piscina.mp3"},
	{name: 'sound8', src: "./audios/WM1/A3_E1_Un_dia_en_familia.mp3"},
	{name: 'sound9', src: "./audios/WM1/A3_E2_Cuantas_flores_ves.mp3"},
	{name: 'sound10', src: "./audios/WM1/A3_E3_Otro_picnic_mas.mp3"},
	{name: 'sound11', src: "./audios/WM1/A4_E1_Todos_a_contar.mp3"},
	{name: 'sound12', src: "./audios/WM1/A4_E2_Un_bebe_o_un_robot.mp3"},
	{name: 'sound13', src: "./audios/WM1/A5_E1_Pulpos_estrellas_de_mar_y_mas.mp3"},
	{name: 'sound14', src: "./audios/WM1/A5_E2_De_10_en_10_contamos_otra_vez.mp3"},
	{name: 'sound15', src: "./audios/WM1/A5_E3_Animales_extranos_en_el_acuario.mp3"},
	{name: 'sound16', src: "./audios/WM1/A5_E4_Solo_unos_pinguinos_y_decimos_adios.mp3"},
	{name: 'sound17', src: "./audios/WM1/A5_E5_Cuantos_quedan.mp3"},
	{name: 'sound18', src: "./audios/WM1/A6_E1_La_cuna_y_mas_muebles.mp3"},
	{name: 'sound19', src: "./audios/WM1/A6_E2_Que_necesita_un_bebe.mp3"},
	{name: 'sound20', src: "./audios/WM1/A6_E3_Ya_falta_poco.mp3"},
	{name: 'sound21', src: "./audios/WM1/A7_E1_Cuanto_falta.mp3"},
	{name: 'sound22', src: "./audios/WM1/A7_E2_Ahora_somos_cuatro.mp3"},
	{name: 'sound23', src: "./audios/WM1/A8_E1_Que_cantidad_de_panales.mp3"},
	{name: 'sound24', src: "./audios/WM1/A8_E2_No_puedes_dormir.mp3"},
	{name: 'sound25', src: "./audios/WM1/A8_E3_Cuatro_es_mejor_que_tres.mp3"},
]

const epubs = [
	{name: 'goTo1', src: "WM1_A1_E3.epub"},
	{name: 'goTo2', src: "WM1_A2_E3.epub"},
	{name: 'goTo3', src: "WM1_A3_E3.epub"},
	{name: 'goTo4', src: "WM1_A4_E3.epub"},
	{name: 'goTo5', src: "WM1_A5_E3.epub"},
	{name: 'goTo6', src: "WM1_A6_E3.epub"},
	{name: 'goTo7', src: "WM1_A7_E3.epub"},
	{name: 'goTo8', src: "WM1_A8_E3.epub"},
]

// on document ready
document.addEventListener('DOMContentLoaded', function() {
	console.log('the DOM is ready');

	// Go throw all list of audio icons
	for(let audio of audios) {
		let btn = get(`.${audio.name}`);

		// Add Attribute only if img exists
		if(btn) btn.parentElement.setAttribute("data-source", audio.src);
	}

	// Go throw all list of epub links
	for(let epub of epubs) {
		let btn = get(`.${epub.name}`);

		// Add EventListener only if btn is founded
		if(btn)
			btn.addEventListener('click', (e) => {
				window.parent.location = '../reader.html#!epubs/' + epub.src;
				window.parent.location.assign('../reader.html#!epubs/' + epub.src);
				window.parent.location.reload();			
			});
	}
});


function include(filename, onload) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = filename;
	script.type = 'text/javascript';
	script.onload = script.onreadystatechange = function() {
		if (script.readyState)
			if (script.readyState === 'complete' || script.readyState === 'loaded') {
				script.onreadystatechange = null;
				onload();
			}
		else onload();
	};
	head.appendChild(script);
}
