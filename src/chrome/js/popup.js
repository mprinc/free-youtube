$(document).ready(function(){

    chrome.tabs.query({active:true,currentWindow:true},function(tab){
      $("#video-feed").removeClass("type-active");
      $("#suggested-feed").removeClass("type-active");
      $("#home-feed").removeClass("type-active");

      if (String(tab[0].url).includes("youtube.com")) {
        if (String(tab[0].url).includes("/watch")) {
          $("#video-feed").addClass("type-active");
          $("#video-feed").find("img").attr("src", "../assets/popup/video-feed-active.svg");
          $("#suggested-feed").addClass("type-active");
          $("#suggested-feed").find("img").attr("src", "../assets/popup/suggested-feed-active.svg");
        } else {
          $("#home-feed").addClass("type-active");
          $("#home-feed").find("img").attr("src", "../assets/popup/home-feed-active.svg");
        }
      }
    });
    
});
