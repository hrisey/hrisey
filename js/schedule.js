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

let tableBody = null;

function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

function initClient() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		const date = new Date();
		listUpcomingEvents(date);
	}, function (error) {
		appendPre(JSON.stringify(error, null, 2));
	});
}

function appendPre(message) {
	var content = document.getElementById('content');
	var p = document.createElement("p");
	var textContent = document.createTextNode(message);
	p.appendChild(textContent);
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

function createTableRow(event)
{
	let tr = document.createElement('tr');

	//Title
	let title = event.summary.replace(/\(([^)]+)\)/, "")
	let titleCol = document.createElement('th');
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
	}

	let now = new Date();
	let endTime = new Date(event.end.dateTime);

	if (now.getTime() >= endTime.getTime()) {
		tr.classList.add('past');
	}
	tr.appendChild(time2Col);
	tableBody.appendChild(tr);
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
	const dateStart = new Date(date);
	dateStart.setHours(0,0);
	const dateEnd = new Date(date);
	dateEnd.setHours(23,59,59);

	const selectedDate = days[dateStart.getDay()]
		+ ', ' + dateStart.getDate()
		+ '. ' + months[dateStart.getMonth()]
		+ ' ' + dateStart.getFullYear();
	appendPre(selectedDate)

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
			events.forEach(function(event) {
				this.createTableRow(event);
			});
		}
		else {
			appendPre('Engin gögn fundust. Reynið aftur síðar.');
		}
	});
}
