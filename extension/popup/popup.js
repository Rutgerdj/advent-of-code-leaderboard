let leaderboards = [];
const lbSelect = document.querySelector('#leaderboardSelect');

const showSucces = (message) => {
	const succes = document.querySelector('#succes');
	succes.innerHTML = message;
	succes.style.display = 'block';
	setTimeout(() => {
		succes.style.display = 'none';
	}, 3000);
};

document.querySelector('#saveBtn').addEventListener('click', (ev) => {
	chrome.runtime.sendMessage(
		{
			command: 'setConfig',
			config: {
				userName: document.querySelector('#userName').value,
			},
		},
		() => {}
	);
	showSucces('Saved!');
});

document.querySelector('#updateBtn').addEventListener('click', (ev) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length == 0 || !tabs[0].url) return;

		chrome.runtime.sendMessage(
			{
				command: 'forceUpdateProgress',
				url: tabs[0].url,
			},
			() => {}
		);
	});
	showSucces('Update forced!');
});

document.querySelectorAll('.leaderboardBtn').forEach((btn) => {
	btn.addEventListener('click', (ev) => {
		let selectedId = lbSelect.options[lbSelect.selectedIndex].value;
		if (selectedId) {
			chrome.runtime.sendMessage(
				{
					command: 'leaderboardAction',
					leaderboardId: selectedId,
					action: btn.getAttribute('data-action'),
					name: document.querySelector('#leaderboardName').value,
				},
				() => {}
			);
		}
		showSucces('Leaderboard!');
	});
});

chrome.runtime.sendMessage(
	{
		command: 'getConfig',
	},
	(res) => {
		if (res.config) {
			document.querySelector('#userName').value = res.config.userName;
		}
	}
);

chrome.runtime.sendMessage(
	{
		command: 'getLeaderboards',
	},
	(res) => {
		if (res.length > 0) {
			res.forEach((lb) => {
				let opt = document.createElement('option');
				opt.value = lb.id;
				opt.innerHTML = lb.name;
				document.querySelector('#leaderboardSelect').appendChild(opt);
			});
		}
	}
);
