const MODULE = "free-youtube";

const DOM_SELECTOR_MOVIE_CONTAINER = "movie_player";
const DOM_SELECTOR_AD_INTERRUPTING = "ad-interrupting";
const DOM_SELECTOR_AD_SHOWING = "ad-showing";
const DOM_SELECTOR_AD_PREVIEW_TEXT = ".ytp-ad-preview-text";
const DOM_SELECTOR_AD_SURVEY = ".ytp-ad-survey";
const DOM_SELECTOR_AD_SKIP_BUTTON = ".ytp-ad-skip-button";
const DOM_SELECTOR_AD_SKIP_BUTTON_MODERN = ".ytp-ad-skip-button-modern";

/* interval time to check for ads in milliseconds */
const CHECK_TIME = 100;

const hideStaticAds = async () => {
		const staticAds = [".ytd-companion-slot-renderer", ".ytd-action-companion-ad-renderer", // in-feed video ads
		".ytd-watch-next-secondary-results-renderer.sparkles-light-cta", ".ytd-unlimited-offer-module-renderer", // similar components
		".ytp-ad-overlay-image", ".ytp-ad-text-overlay", // deprecated overlay ads (04-06-2023)
		"div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint", "div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer",
		".ytd-display-ad-renderer", ".ytd-statement-banner-renderer", ".ytd-in-feed-ad-layout-renderer", // homepage ads
		"div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy", // sponsors
		".ytd-banner-promo-renderer", ".ytd-video-masthead-ad-v3-renderer", ".ytd-primetime-promo-renderer" // subscribe for premium & youtube tv ads
	];

	staticAds.forEach((ad) => {
		document.hideElementsBySelector(ad);
	});
};

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

			hideStaticAds();

			resolve();
			// moved here to run every CHECK_TIME
			skipAdInYoutubeTab();
		};

		// RUN IT ONLY AFTER CHECK_TIME MILLISECONDS
		setTimeout(setTimeoutHandler, CHECK_TIME);
	});

	// this is wrong, running it constantly?!
	// moved inside the timer
	// skipAdInYoutubeTab();
};

const init = async () => {
	Document.prototype.hideElementsBySelector = (selector) =>
		[...document.querySelectorAll(selector)].forEach(
			(el) => (el.style.display = "none")
		);

	skipAdInYoutubeTab();
};

init();