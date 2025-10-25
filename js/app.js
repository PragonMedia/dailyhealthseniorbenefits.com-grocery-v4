// Load Ringba function - exactly as provided but as JavaScript function
const loadRingba = () => {
  var script = document.createElement("script");
  script.src = "//b-js.ringba.com/CAd4c016a37829477688c3482fb6fd01de";
  let timeoutId = setTimeout(addRingbaTags, 1000);
  script.onload = function () {
    clearTimeout(timeoutId);
    addRingbaTags();
  };
  document.head.appendChild(script);
};

// Function to add tags - with age parameter and gtg added
function addRingbaTags() {
  let qualifiedValue =
    new URL(window.location.href).searchParams.get("qualified") || "unknown";
  let ageValue =
    new URL(window.location.href).searchParams.get("age") || "unknown";

  // Get gtg value from localStorage (set by gtg analysis script)
  let gtgValue = localStorage.getItem("gtg");

  // Initialize rgba_tags array if it doesn't exist
  window._rgba_tags = window._rgba_tags || [];

  // Push individual tags as separate objects
  window._rgba_tags.push({ type: "RT" });
  window._rgba_tags.push({ track_attempted: "yes" });
  window._rgba_tags.push({ qualified: qualifiedValue });
  window._rgba_tags.push({ age: ageValue });

  // Only add gtg parameter if it exists (not null/undefined)
  if (gtgValue !== null && gtgValue !== undefined && gtgValue !== "null") {
    window._rgba_tags.push({ gtg: gtgValue });
  }

  console.log("Sending initial tags to Ringba:", {
    type: "RT",
    track_attempted: "yes",
    qualified: qualifiedValue,
    age: ageValue,
    gtg: gtgValue,
  });

  var intervalId = setInterval(() => {
    if (window.testData && window.testData.rtkcid !== undefined) {
      // Push click-related tags
      window._rgba_tags.push({ clickid: window.testData.rtkcid });
      window._rgba_tags.push({ qualified: qualifiedValue });
      window._rgba_tags.push({ age: ageValue });

      // Only add gtg parameter if it exists (not null/undefined)
      if (gtgValue !== null && gtgValue !== undefined && gtgValue !== "null") {
        window._rgba_tags.push({ gtg: gtgValue });
      }

      console.log("Sending click tags to Ringba:", {
        clickid: window.testData.rtkcid,
        qualified: qualifiedValue,
        age: ageValue,
        gtg: gtgValue,
      });
      clearInterval(intervalId);
    }
  }, 500);
}

function startCountdown() {
  var timeLeft = 30;
  var countdownElement = document.getElementById("countdown");

  // Check if countdown element exists
  if (!countdownElement) {
    console.log("Countdown element not found");
    return;
  }

  var countdownInterval = setInterval(function () {
    var minutes = Math.floor(timeLeft / 60);
    var seconds = timeLeft % 60;
    var formattedTime =
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (seconds < 10 ? "0" : "") +
      seconds;
    countdownElement.innerHTML = formattedTime;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
    }
    timeLeft--;
  }, 1000);
}

function loadImages() {
  let images = document.querySelectorAll(".lazyloading");
  images.forEach((image) => {
    if (image.dataset.src) {
      image.src = image.dataset.src;
    }
  });
}

let speed = 500;

function updateAgeGroup(ageGroup) {
  let url = new URL(window.location.href);
  url.searchParams.delete("u65consumer");
  url.searchParams.delete("o65consumer");
  if (ageGroup === "under65") {
    url.searchParams.set("u65consumer", "true");
  } else if (ageGroup === "over65") {
    url.searchParams.set("o65consumer", "true");
  }
  window.history.replaceState({}, "", url);
}

let is_below = false;
let is_between = false;
let is_71plus = false;

loadImages();

// Progress management
const progressMap = {
  age: 0,
  medicare: 33,
  insurance: 66,
  result: 100,
};

function setProgress(key) {
  const pct = progressMap[key] ?? 0;
  document.getElementById("flowMeter").value = pct;
  $("#progressLabel").text(pct + "% Complete");
  $("#bar")
    .css("width", pct + "%")
    .attr("aria-valuenow", String(pct));
}

function switchStage(id, key) {
  $(".ux-stage.is-visible").removeClass("is-visible");
  $("#" + id).addClass("is-visible");
  setProgress(key);
}

var buttonValue;
var currentStep;

// Form step handling - adapted from chatbot to multi-step form
$("button[data-goto]").on("click", function () {
  currentStep = $(this).attr("data-form-step");
  buttonValue = $(this).attr("data-form-value");
  const nextStage = $(this).attr("data-goto");

  console.log("Button clicked:", { currentStep, buttonValue, nextStage });

  if (currentStep == 2) {
    // Age selection
    var newUrl = new URL(window.location.href);

    if (buttonValue == "below 65") {
      newUrl.searchParams.delete("age");
      newUrl.searchParams.set("age", "65");
      updateAgeGroup("under65");
      is_below = true;
    } else if (buttonValue == "65 - 70") {
      newUrl.searchParams.delete("age");
      newUrl.searchParams.set("age", "70");
      updateAgeGroup("over65");
      is_between = true;
    } else if (buttonValue == "71 - 75") {
      newUrl.searchParams.delete("age");
      newUrl.searchParams.set("age", "75");
      updateAgeGroup("over65");
      is_71plus = true;
    } else if (buttonValue == "76 and older") {
      newUrl.searchParams.delete("age");
      newUrl.searchParams.set("age", "80");
      updateAgeGroup("over65");
      is_71plus = true;
    }

    // Update the URL with the new age parameter
    window.history.replaceState({}, "", newUrl);

    // Go to Medicare question
    switchStage("stage-medicare", "medicare");
  }

  if (currentStep == 3) {
    // Medicare A&B question
    var newUrl = new URL(window.location.href);

    if (buttonValue == "Yes") {
      newUrl.searchParams.delete("qualified");
      newUrl.searchParams.set("qualified", "yes");
    } else if (buttonValue == "No") {
      newUrl.searchParams.delete("qualified");
      newUrl.searchParams.set("qualified", "no");
    }

    // Load Ringba and call addRingbaTags after qualification
    setTimeout(() => {
      loadRingba();
    }, 100);

    // Update the URL with the new qualified parameter
    window.history.replaceState({}, "", newUrl);

    // Store Medicare answer for click wall logic
    localStorage.setItem("medicareAnswer", buttonValue);

    // Go directly to results for all cases
    showResults();
  }
});

function showResults() {
  // Determine qualification based on the flow
  let isQualified = false;

  // Logic from original chatbot:
  // - If over 65 and has Medicare A&B: qualified
  // - If under 65, no Medicare A&B, but no other insurance: qualified
  // - If under 65, no Medicare A&B, but has other insurance: not qualified
  // - If under 65 and has Medicare A&B: qualified (shouldn't reach insurance question)

  if (is_between || is_71plus) {
    // Over 65 - check Medicare A&B answer
    const qualified = new URL(window.location.href).searchParams.get(
      "qualified"
    );
    isQualified = qualified === "yes";
  } else if (is_below) {
    // Under 65 - check both Medicare and insurance answers
    const qualified = new URL(window.location.href).searchParams.get(
      "qualified"
    );
    const hasInsurance = buttonValue === "Yes"; // from insurance question

    if (qualified === "yes") {
      isQualified = true; // Has Medicare A&B
    } else {
      isQualified = !hasInsurance; // No Medicare, qualified only if no other insurance
    }
  }

  if (isQualified) {
    $("#qualified-section").show();
    $("#disqualified-section").hide();
    startCountdown();
  } else {
    $("#qualified-section").hide();
    $("#disqualified-section").show();
  }

  switchStage("stage-result", "result");
}

function scrollToBottom() {
  var object = $("main");
  $("html, body").animate(
    {
      scrollTop:
        object.offset().top + object.outerHeight() - $(window).height(),
    },
    "fast"
  );
}

function typingEffect() {
  string =
    '<div class="temp-typing bg-gray-200 p-3 rounded-lg shadow-xs mt-2 inline-block">';
  string += '<div class="typing-animation">';
  string += '<div class="typing-dot"></div>';
  string += '<div class="typing-dot"></div>';
  string += '<div class="typing-dot"></div>';
  string += "</div>";
  string += "</div>";
  return string;
}

let userId = localStorage.getItem("user_id");
if (!userId) {
  userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem("user_id", userId);
}
