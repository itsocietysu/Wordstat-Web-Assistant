
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({
		url: "https://wordstat.yandex.ru"
	});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.action) {


		// Копировать
		case 'copy':
			var a = $('TEXTAREA');
			a.val(request.text);
			a.select();
			if (document.execCommand('copy', false, null)) {
				sendResponse({result: true});
			} else {
				sendResponse({result: false});
			}
			break;


	}
});