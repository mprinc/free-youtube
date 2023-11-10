const MODULE = "free-youtube";

const DOM_SELECTOR_MOVIE_CONTAINER = "movie_player";
const DOM_SELECTOR_AD_INTERRUPTING = "ad-interrupting";
const DOM_SELECTOR_AD_SHOWING = "ad-showing";
const DOM_SELECTOR_AD_PREVIEW_TEXT = ".ytp-ad-preview-text";
const DOM_SELECTOR_AD_SURVEY = ".ytp-ad-survey";
const DOM_SELECTOR_AD_SKIP_BUTTON = ".ytp-ad-skip-button";
const DOM_SELECTOR_AD_SKIP_BUTTON_MODERN = ".ytp-ad-skip-button-modern";

// RELOAD ALL YOUTUBE TABS WHEN THE EXTENSION IS FIRST INSTALLED, DO NOTHING ON UPDATED
chrome.runtime.onInstalled.addListener((details) => {
	switch (details.reason) {
		case "install":
			console.info(`[${MODULE}] EXTENSION INSTALLED`);
			// reload youtube tabs to trigger extension's content script
			chrome.tabs.query({}, (tabs) => {
				tabs
					.filter((tab) => tab.url.startsWith("https://www.youtube.com/"))
					.forEach(({ id }) => {
						chrome.tabs.reload(id);
					});
			});
			break;
		case "update":
			console.info(`[${MODULE}] EXTENSION UPDATED`);
			break;
		case "chrome_update":
		case "shared_module_update":
		default:
			console.info(`[${MODULE}] BROWSER UPDATED`);
			break;
	}
});

const skipAdInYoutubeTab = async () => {
	await new Promise((resolve, _reject) => {
		const videoContainer = document.getElementById(DOM_SELECTOR_MOVIE_CONTAINER);

		const setTimeoutHandler = () => {
			// is there add playing?
			const isAd = videoContainer?.classList.contains(DOM_SELECTOR_AD_INTERRUPTING) || videoContainer?.classList.contains(DOM_SELECTOR_AD_SHOWING);
			// get skip lock
			const skipLock = document.querySelector(DOM_SELECTOR_AD_PREVIEW_TEXT)?.innerText;
			// and survey lock
			const surveyLock = document.querySelector(DOM_SELECTOR_AD_SURVEY)?.length > 0;

			// if there is an ad and skip lock is present then skip the ad
			// by muting its video, playing it only for the last fraction of a second
			// and clicking on the skip ad button
			if (isAd && skipLock) {
				const videoPlayer = document.getElementsByClassName("video-stream")[0];
				videoPlayer.muted = true; // videoPlayer.volume = 0;
				videoPlayer.currentTime = videoPlayer.duration - 0.1;
				videoPlayer.paused && videoPlayer.play()
				// CLICK ON THE SKIP AD BTN
				document.querySelector(DOM_SELECTOR_AD_SKIP_BUTTON)?.click();
				document.querySelector(DOM_SELECTOR_AD_SKIP_BUTTON_MODERN)?.click();
			// if there is an ad and survey lock is present then skip the ad
			} else if (isAd && surveyLock) {
				// CLICK ON THE SKIP SURVEY BTN
				document.querySelector(DOM_SELECTOR_AD_SKIP_BUTTON)?.click();
				document.querySelector(DOM_SELECTOR_AD_SKIP_BUTTON_MODERN)?.click();
			}

			resolve();
			// moved here to run every CHECK_TIME
			skipAdInYoutubeTab();
		};

		// RUN IT ONLY AFTER 100 MILLISECONDS
		setTimeout(setTimeoutHandler, 100);
	});

	// this is wrong, running it constantly?!
	// moved inside the timer
	// skipAdInYoutubeTab();
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// for each completely loaded youtube tab, execute the content script `skipAdInYoutubeTab`
	if (
		changeInfo.status === "complete" &&
		String(tab.url).includes("https://www.youtube.com/watch")
	) {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			function: skipAdInYoutubeTab,
		});
	}
});
