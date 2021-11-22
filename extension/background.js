chrome.storage.local.get({uuid: null}, (result) => {
  if (result.uuid){
    aocUU.uuid = result.uuid;
  } else {
    aocUU.registerExt((uuid) => {
      chrome.storage.local.set({uuid: uuid});
    });
  }
})


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);

  switch (message.command) {
      
    case "setConfig":
      aocUU.setConfig(message.config);
      break;


    case "getConfig":
      chrome.storage.local.get({config: null}, (result) => {
        sendResponse(result);
      });
      break;

    case "forceUpdateProgress":
      aocUU.forceUpdateProgress(message.url);
      break;


    case "onChallengePage":
      aocUU.Challenges.onChallengePage(message.year, message.day, message.progress);
      break;
  }
  return true;
});
