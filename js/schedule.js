const CLIENT_ID = '576102823095-jkndirid4ktj8anpr761plagj3h6n38n.apps.googleusercontent.com';
const API_KEY = 'AIzaSyByEghYhZYQRCvewgMiV-gtz1VhESUZRaI';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const CALENDAR_ID = '56gip1uek5lc3di2qqsrp3vi04@group.calendar.google.com';
const months = [
	'janúar',
	'febrúar',
	'mars',
	'apríl',
	'maí',
	'júní',
	'júlí',
	'ágúst',
	'september',
	'október',
	'nóvember',
	'desember'
];

const days = [
	'Sunnudagur',
	'Mánudagur',
	'Þriðjudagur',
	'Miðvikudagur',
	'Fimmtudagur',
	'Föstudagur',
	'Laugardagur'
];

const datePickerMaxDate = '2025-05-31';

const urlParams = new URLSearchParams(window.location.search);
const showDatepicker = urlParams.get('datepicker') !== 'false';
const size = urlParams.get('size');
const center = urlParams.get('center');

let tableBody = null;
let isCallUp = false;

function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

function initClient() {
	createHeading();
	initParams();
	initAutoRefresh();
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		const date = new Date();
		listUpcomingEvents(date);
		addDatePicker(date);
	}, function (error) {
		appendPre(JSON.stringify(error, null, 2));
	});
}

function createHeading() {
	const h1 = document.createElement('h1');
	h1.textContent = 'Hríseyjarferjan Sævar - áætlun dagsins';
	document.querySelector('header').append(h1);
}

function initParams() {
	if (size === 'large') {
		document.body.classList.add('large');
	}
	if (center === 'true') {
		document.body.classList.add('center');
	}
}

function checkTimeAndRefresh() {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();

	// Auto refresh if the following conditions are met:
	// at 00:00
	// hour is odd number and minutes = 0 or minutes = 50
	if ((hours === 0 && minutes === 0) || hours % 2 === 1 && (minutes === 0 || minutes === 50)) {
		location.reload();
	}
}

function initAutoRefresh() {
	// Check the time every minute (60000 milliseconds)
	setInterval(checkTimeAndRefresh, 60000);
}

function appendPre(message, className = '') {
	var content = document.getElementById('content');
	var p = document.createElement("p");
	if (className) {
		p.classList.add(className);
	}
	p.innerHTML = message;
	content.appendChild(p);
}

function createTable()
{
	let content = document.getElementById('content');
	let tbl = document.createElement('table');
	tbl.appendChild(createTableHead());

	let tbody = document.createElement('tbody');
	tbl.appendChild(tbody);
	content.appendChild(tbl);
	tableBody = tbody;
}

function createTableHead()
{
	let thead = document.createElement('thead');
	let tr = document.createElement('tr');
	let titleCol = document.createElement('th');
	titleCol.appendChild(document.createTextNode('Ferð'));
	tr.appendChild(titleCol);

	let time1Col = document.createElement('th');
	time1Col.appendChild(document.createTextNode('Frá Hrísey'));
	tr.appendChild(time1Col);

	let time2Col = document.createElement('th');
	time2Col.appendChild(document.createTextNode('Frá Árskógssandi'));
	tr.appendChild(time2Col);

	thead.appendChild(tr);
	return thead;
}

function createTableRow(event, index)
{
	let tr = document.createElement('tr');
	let isOdd = index % 2 === 0;
	if (isOdd) {
		tr.classList.add('odd');
	}

	//Title
	let title = event.summary.replace(/\(([^)]+)\)/, "")
	let titleCol = document.createElement('th');

	if (title.includes('Upphringi')) {
		title = title + '*';
	}
	if (title.includes('---')) {
		tr.classList.add('strikethrough');
		title = title.replace('---', '');
	}
	titleCol.appendChild(document.createTextNode(title));
	tr.appendChild(titleCol)

	//From Hrisey
	let time1 = getTime(event.start.dateTime);
	let time1Col = document.createElement('td');
	time1Col.appendChild(document.createTextNode(time1));
	tr.appendChild(time1Col);

	//From Arskogssandur
	let time2 = getTime(event.end.dateTime);
	let time2Col = document.createElement('td');
	time2Col.appendChild(document.createTextNode(time2));

	if (title.includes('Upphringi')) {
		tr.classList.add('red');
		isCallUp = true;
	}

	let now = new Date();
	let startTime = new Date(event.start.dateTime);
	let endTime = new Date(event.end.dateTime);
	endTime.setMinutes(50);

	if (now >= endTime) {
		tr.classList.add('past');
	}
	if (now >= startTime && now <= endTime) {
		tr.classList.add('current');
	}
	if (time2.includes(':20')) {
		tr.classList.add('leaves20');
	}

	tr.appendChild(time2Col);
	tableBody.appendChild(tr);

	if (event.description) {
		let trDesc = document.createElement('tr');
		trDesc.classList.add('description');
		if (isOdd) {
			trDesc.classList.add('odd');
		}
		let tdDesc = document.createElement('td');
		tdDesc.setAttribute('colspan', '3');
		tdDesc.appendChild(document.createTextNode(event.description));
		trDesc.appendChild(tdDesc);
		tableBody.appendChild(trDesc);
	}
}

function pad(num) {
	return ("0"+num).slice(-2)
}

function getTime(time)
{
	time = new Date(time);
	return pad(time.getHours()) + ':' + pad(time.getMinutes());
}

function listUpcomingEvents(date) {
	let content = document.getElementById('content');
	content.innerHTML = '';
	isCallUp = false;
	const dateStart = new Date(date);
	dateStart.setHours(0,0);
	const dateEnd = new Date(date);
	dateEnd.setHours(23,59,59);

	const selectedDate = days[dateStart.getDay()]
		+ ', ' + dateStart.getDate()
		+ '. ' + months[dateStart.getMonth()]
		+ ' ' + dateStart.getFullYear();
	appendPre(selectedDate, 'selectedDate')

	gapi.client.calendar.events.list({
		calendarId: CALENDAR_ID,
		timeMin: dateStart.toISOString(),
		timeMax: dateEnd.toISOString(),
		showDeleted: false,
		singleEvents: true,
		orderBy: 'startTime'
	}).then(function(response) {
		const events = response.result.items;
		if (events.length > 0) {
			createTable();
			let i = 0;
			events.forEach(function(event) {
				this.createTableRow(event, i);
				i++;
			});
			addCallUpWarning();
		}
		else {
			appendPre('Engin gögn fundust. Reynið aftur síðar.');
		}
	});
}

function addDatePicker(date) {
	flatpickr('.flatpickr', {
		minDate: 'today',
		maxDate: datePickerMaxDate,
		locale: 'is',
		dateFormat: "d.m.Y",
		onChange: function(selectedDates, dateStr, instance) {
			if (selectedDates[0]) {
				listUpcomingEvents(selectedDates[0]);
			}
		},
	});

	if (showDatepicker && date <= new Date(datePickerMaxDate)) {
		document.querySelector('div.date').classList.add('show');
	}

}

function addCallUpWarning()
{
	if (isCallUp) {
		appendPre('Upphringiferðir þarf að panta fyrirfram á <br>áætlunartíma ferjunnar, milli kl. 9:00 og 21:30', 'red');
	}
}
