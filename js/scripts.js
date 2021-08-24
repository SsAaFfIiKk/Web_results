let count = 0
const video_url = "http://127.0.0.1:8000/get_video?path="
const data_url = "http://127.0.0.1:8000/get_data?id="
const len_url = "http://127.0.0.1:8000/get_len_data"
const kv_url = "http://127.0.0.1:8000/get_kv"
const temps_url = "http://127.0.0.1:8000/get_all_temps"
const speech_url = "http://127.0.0.1:8000/get_all_speechs"
const border_url = "http://127.0.0.1:8000/get_borders"

fetch(border_url)
    .then(res => res.json())
    .then(out => borders = out)

fetch(temps_url)
    .then(res => res.json())
    .then(out => temps = out)

fetch(speech_url)
    .then(res => res.json())
    .then(out => speech = out)

fetch(len_url)
	.then(res => res.json())
	.then(data => len_data = data)

fetch(kv_url)
	.then(res => res.json())
	.then(out => {kv=out; makeKVTable(kv)})
        
getData();


function getData() {
    fetch(data_url + count)
        .then(res => res.json())
        .then(out => {
            data = out;
            video.src = video_url + data[0];
            makeTeble()
        })
}


function makeKVTable(kv_val){
	let table = document.getElementById("kv")

	let labels = ["Средний темп интервью: ", "Нижняя граница темпа: ", "Верхняя граница темпа: ", "Длина отрезка для анализа в секундах: ", "Пороговое значение для определения смеха: ",
				"Минимальная длина дететируесого смеха: ", "Коэфицент для расчёта нижней границы: ", "Коэфицент для расчёта верхней границы: "]

	for (let i = 0; i < kv_val.length; i++) {
        let newTr = document.createElement('tr')
        let td1 = document.createElement('td')
        let td2 = document.createElement('td')
              
		td1.innerHTML = labels[i]
        td2.innerHTML = kv_val[i]

        newTr.appendChild(td1)
        newTr.appendChild(td2)
        table.appendChild(newTr)
	}
}

function makeTeble() {
    let table = document.getElementById("results")
    table.innerHTML = ""
	
    let caption = document.createElement("caption")
	caption.innerHTML = "Значения параметров"
	table.appendChild(caption)

    let labels = ["Номер вопроса: ", "Количество морганий: ", "Частота смены эмоций: ", "Частота улыбок: ", "Количество движений головой: ", "Движений носом: ", "Кашель: ", "Смех: ", 
                "Значения темпа", "Средний темп фрагмента: ", "Значительное снижение скорости речи: ", "Значительное повышение скорости речи: ", "Запинания: "]

    let arrays = []

    for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i])) {
            arrays.push(data[i])
        } 
        else {
            let newTr = document.createElement('tr')
            let td1 = document.createElement('td')
            let td2 = document.createElement('td')

            td1.innerHTML = labels[i]
            td2.innerHTML = data[i]

            newTr.appendChild(td1)
            newTr.appendChild(td2)
            table.appendChild(newTr)
        }
    }
    
    drawChart(prepareCords(arrays))
}

		
function prepareCords(arrays) {
    let coord = []
    for (i = 0; i < arrays[0].length; i++) {
        coord.push({
            label: arrays[0][i],
            y: arrays[1][i]
        })
    }

    return coord
}


function drawChart(coords) {
    var chart = new CanvasJS.Chart("chartContainer", {
        // animationEnabled: true,
        theme: "light2",
        title: {text: "Динамика темпа для текущего вопроса"},

		data: [
        {
            type: "spline",
            indexLabelFontSize: 12,
            dataPoints: coords
        }]
    });
    chart.render();
}


function onClick(clicked_id) {
    switch (clicked_id) {
        case "back": if (count > 0) count--; break;
        case "foward": if (count < len_data-1) count++; sendTimestamp(); break;
    }
    update();
}


function update() {
    getData();
    makeTeble();
}


function sendTimestamp() {
     let now = new Date().toLocaleTimeString();

    const url = "http://127.0.0.1:8000/timestamp";
    const formData = new FormData();

    formData.append("time", now);
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 5000);
    try {
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            body: formData,
            signal: ctrl.signal
        });
    } 
    catch (e) {
        console.log('Error:', e);
    }
}

function uploadArchive() {
    let fileInput = document.getElementById('file-input')
    let archive = fileInput.files[0];    
    let formData = new FormData();
          
    formData.append("file", archive);

    const ctrl = new AbortController()    
    setTimeout(() => ctrl.abort(), 5000);
    const fetch_url = 'http://127.0.0.1:8000/save_archive';

    try {
        fetch(fetch_url, 
            { method: "POST", mode: 'no-cors', body: formData, signal: ctrl.signal }); 
        console.log('HTTP response code:', r.status); 
    } catch(e) {
        console.log('Error:', e);
    }       
}

function preparePop(){
    // console.log(speech)
    // console.log(temps)
    // console.log(borders)
    let coords = prepareCords([speech, temps])
    // console.log(coords)
    let options = {
        animationEnabled: true,
        title: {text: "Изменение темпа в ходе интревью"},
        axisY:{
            stripLines: [{
                value: borders[0]
            },{
                value: borders[1]
            }]
        },
    
        data: [{
            type: "spline",
            dataPoints: coords
        }]
    };
    return options
}