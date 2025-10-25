# Media Alpha Click Wall Implementation Guide

## Overview

**This guide is for implementing Media Alpha click wall on YOUR domains (e.g., benefitsforall.com, insurancepros.com, etc.)**

This guide explains how to implement a Media Alpha click wall that loads after a multi-step form, using an iframe to hide the actual domain from Media Alpha.

## ⚠️ IMPORTANT: This Guide is for YOUR Domains

**This guide is NOT for policyfinds.com/sqc2026/ - that's already set up!**

**This guide is for implementing the click wall on YOUR domains like:**

- `benefitsforall.com/nn`
- `insurancepros.com/medicare`
- `healthplans.com/quote`
- Any other domain you want to add the click wall to

## How It Works

- User completes a 2-question form on your domain (e.g., `benefitsforall.com/nn`)
- After form completion, an iframe loads from `https://policyfinds.com/sqc2026/iframe.html`
- Media Alpha only sees `policyfinds.com/sqc2026/` as the source domain
- Your real domain is completely hidden from Media Alpha

## Important: Single Iframe for All Domains

**You only need ONE iframe file for ALL your domains!**

- ✅ **One iframe file**: `https://policyfinds.com/sqc2026/iframe.html`
- ✅ **All domains use the same iframe** - no need to create new ones
- ✅ **Media Alpha sees the same domain** for all traffic
- ✅ **Your real domains stay hidden** from Media Alpha

### Example for Multiple Domains:

```
benefitsforall.com/nn → iframe → policyfinds.com/sqc2026/iframe.html
insurancepros.com/medicare → iframe → policyfinds.com/sqc2026/iframe.html
healthplans.com/quote → iframe → policyfinds.com/sqc2026/iframe.html
... (all 100+ domains) → iframe → policyfinds.com/sqc2026/iframe.html
```

**Media Alpha sees the same domain for all**: `policyfinds.com/sqc2026/`

## Implementation Steps

### Step 1: Iframe File Already Exists - SKIP THIS STEP

**⚠️ IMPORTANT: The iframe file already exists at `https://policyfinds.com/sqc2026/iframe.html`**

**You do NOT need to create this file - it's already set up!**

**Skip to Step 2 below.**

---

## Reference: Iframe File Content (Already Exists)

**The iframe file content is shown below for reference only - you don't need to create this:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Insurance Options</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: #f8f9fa;
      }
      .container {
        max-width: 100%;
        margin: 0 auto;
      }
      .loading {
        text-align: center;
        padding: 30px;
      }
      .spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .error {
        text-align: center;
        padding: 30px;
        color: #e74c3c;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div id="loading" class="loading">
        <div class="spinner"></div>
        <p style="margin-top: 15px; color: #666; font-size: 14px">
          Loading insurance options...
        </p>
      </div>

      <div id="mediaalpha_placeholder"></div>

      <div id="error" class="error" style="display: none">
        <p style="font-size: 16px; font-weight: bold">
          Unable to load insurance options
        </p>
        <p style="margin-top: 10px; font-size: 14px">
          Please refresh the page or contact support.
        </p>
      </div>
    </div>

    <script>
      (function () {
        // Media Alpha configuration
        window.MediaAlphaExchange = {
          type: "ad_unit",
          placement_id: "XbTZHsbK4wZc3gDsnlKVcpB1BB5BKQ",
          version: 17,
          sub_1: new URLSearchParams(window.location.search).get("mb") || "",
          cms_smids: ["ACME_MULTIPLAN_1_M", "ACME_MULTIPLAN_2_M"], // Hardcoded SMIDs for testing
          data: {
            zip:
              new URLSearchParams(window.location.search).get("zip") || "auto",
          },
          url: window.location.href, // This will be policyfinds.com/sqc2026/iframe.html
        };

        // Success callback
        MediaAlphaExchange.success = function (numAds) {
          document.getElementById("loading").style.display = "none";
        };

        // Error callback
        MediaAlphaExchange.onError = function () {
          document.getElementById("loading").style.display = "none";
          document.getElementById("error").style.display = "block";
        };

        // Load Media Alpha script
        function loadMediaAlpha() {
          // Try to load Media Alpha with error handling
          try {
            if (typeof MediaAlphaExchange__load === "undefined") {
              const script = document.createElement("script");
              script.src = "//insurance.mediaalpha.com/js/serve.js";
              script.async = true;
              script.onload = function () {
                setTimeout(() => {
                  if (typeof MediaAlphaExchange__load === "function") {
                    try {
                      MediaAlphaExchange__load("mediaalpha_placeholder");
                    } catch (e) {
                      MediaAlphaExchange.onError();
                    }
                  } else {
                    MediaAlphaExchange.onError();
                  }
                }, 1000);
              };
              script.onerror = function (err) {
                MediaAlphaExchange.onError();
              };
              document.head.appendChild(script);
            } else {
              try {
                MediaAlphaExchange__load("mediaalpha_placeholder");
              } catch (e) {
                MediaAlphaExchange.onError();
              }
            }
          } catch (e) {
            MediaAlphaExchange.onError();
          }
        }

        // Start loading when page loads
        window.addEventListener("load", function () {
          setTimeout(loadMediaAlpha, 500);
        });

        // Listen for messages from parent window
        window.addEventListener("message", function (event) {
          if (event.data.action === "loadAds") {
            loadMediaAlpha();
          }
        });
      })();
    </script>
  </body>
</html>
```

### Step 2: Add Click Wall Container to YOUR Domain

**Add this HTML structure to YOUR domain's main landing page, positioned after your form completion message:**

**⚠️ IMPORTANT: Add this to YOUR domain (e.g., benefitsforall.com/nn) - the iframe file is already set up!**

```html
<!-- MediaAlpha Click Wall - Position after form completion -->
<div id="click-wall-container" style="display: none; margin-top: 20px">
  <div class="bg-gray-200 p-3 rounded-lg shadow-xs mt-2">
    <h3 class="text-lg font-bold text-gray-800 mb-2">Compare Medicare Plans</h3>
    <p class="text-md text-gray-800 mb-3">
      Select a carrier below to compare plans and get your benefits:
    </p>
    <div id="loading-ads" style="text-align: center; padding: 30px">
      <div
        style="
        display: inline-block;
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "
      ></div>
      <p style="margin-top: 15px; color: #666; font-size: 14px">
        Loading insurance options...
      </p>
    </div>
    <!-- Iframe loads Media Alpha from policyfinds.com/sqc2026 -->
    <iframe
      id="mediaalpha-iframe"
      src=""
      style="width: 100%; height: 400px; border: none; display: none"
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
    >
    </iframe>
    <div
      id="error-message"
      style="
      display: none;
      text-align: center;
      padding: 30px;
      color: #e74c3c;
    "
    >
      <p style="font-size: 16px; font-weight: bold">
        Unable to load insurance options
      </p>
      <p style="margin-top: 10px; font-size: 14px">
        Please refresh the page or contact support.
      </p>
    </div>
  </div>
</div>
```

### Step 3: Add CSS Animation

**Add this CSS to YOUR domain's main page for the loading spinner:**

```css
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

### Step 4: Add JavaScript to Trigger Click Wall

**Add this JavaScript to YOUR domain's main page. Modify the trigger point based on your form completion logic:**

```javascript
// Function to show the click wall after form completion
function showClickWall() {
  const clickWallContainer = document.getElementById("click-wall-container");
  const iframe = document.getElementById("mediaalpha-iframe");
  const loadingAds = document.getElementById("loading-ads");

  if (clickWallContainer && iframe && loadingAds) {
    // Get ONLY mb parameter from current URL (ignore all other params)
    const urlParams = new URLSearchParams(window.location.search);
    const mbValue = urlParams.get("mb") || "";

    // Set iframe src with ONLY mb parameter
    iframe.src = `https://policyfinds.com/sqc2026/iframe.html${
      mbValue ? `?mb=${encodeURIComponent(mbValue)}` : ""
    }`;

    // Show the click wall container
    clickWallContainer.style.display = "block";
    // Hide loading spinner
    loadingAds.style.display = "none";
    // Show iframe
    iframe.style.display = "block";
  }
}

// Trigger this function after your form completion
// Example: After user answers the second question
// showClickWall();
```

## Configuration Options

### Media Alpha Settings

- **placement_id**: `"XbTZHsbK4wZc3gDsnlKVcpB1BB5BKQ"` (your placement ID)
- **sub_1**: `mb` URL parameter from main domain (e.g., `benefitsforall.com/nn?mb=somevalue`)
- **cms_smids**: `["ACME_MULTIPLAN_1_M", "ACME_MULTIPLAN_2_M"]` (hardcoded for testing)
- **version**: `17` (Media Alpha API version)

### Iframe Settings

- **src**: `"https://policyfinds.com/sqc2026/iframe.html"` (your iframe domain)
- **sandbox**: Allows scripts, forms, popups, and navigation
- **height**: `400px` (adjust as needed)

## Integration Examples

### Example 1: After Form Submission

```javascript
// After form submission
document.getElementById("submit-button").addEventListener("click", function () {
  // Your existing form submission logic
  submitForm();

  // Show click wall after a delay
  setTimeout(showClickWall, 1500);
});
```

### Example 2: After Multi-Step Form

```javascript
// After second question completion
function onSecondQuestionComplete() {
  // Hide form
  document.getElementById("form-container").style.display = "none";

  // Show success message
  document.getElementById("success-message").style.display = "block";

  // Show click wall
  setTimeout(showClickWall, 1000);
}
```

### Example 3: With Custom Styling

```javascript
// Customize the click wall appearance
function showClickWall() {
  const clickWallContainer = document.getElementById("click-wall-container");
  const iframe = document.getElementById("mediaalpha-iframe");
  const loadingAds = document.getElementById("loading-ads");

  if (clickWallContainer && iframe && loadingAds) {
    // Add custom styling
    clickWallContainer.style.background = "#f8f9fa";
    clickWallContainer.style.border = "1px solid #dee2e6";
    clickWallContainer.style.borderRadius = "8px";
    clickWallContainer.style.padding = "20px";

    // Show elements
    clickWallContainer.style.display = "block";
    loadingAds.style.display = "none";
    iframe.style.display = "block";
  }
}
```

## Testing

### 1. Test Iframe Directly

Visit `https://policyfinds.com/sqc2026/iframe.html` to ensure Media Alpha loads correctly.

### 2. Test Integration

Complete your form and verify the click wall appears.

### 3. Check Console

Look for any JavaScript errors or CORS issues.

## Troubleshooting

### Common Issues:

1. **Click wall not showing**: Check if `click-wall-container` has `display: none` initially
2. **Media Alpha not loading**: Verify iframe URL is correct and accessible
3. **CORS errors**: Ensure iframe is hosted on the correct domain
4. **JavaScript errors**: Check for conflicts with existing scripts

### Debug Steps:

1. Check browser console for errors
2. Verify iframe loads when accessed directly
3. Test with different browsers
4. Check network tab for failed requests

## Production Considerations

### For Multiple Domains:

- All domains will use the same iframe URL
- Media Alpha will see the same source domain for all traffic
- No need to modify iframe for different domains

### For High Traffic:

- Consider CDN for iframe hosting
- Monitor Media Alpha performance
- Implement fallback for ad loading failures

### Security:

- Iframe is sandboxed for security
- No access to parent window data
- Media Alpha only sees iframe domain

## File Structure

```
# For EACH domain (benefitsforall.com, insurancepros.com, etc.):
your-domain.com/
├── index.html (main landing page)
├── assets/
│   └── script.js (form logic + click wall trigger)
└── ...

# ONE TIME ONLY - shared by all domains:
policyfinds.com/sqc2026/
└── iframe.html (Media Alpha integration - SAME FILE FOR ALL DOMAINS)
```

## Summary for YOUR Domain

### ✅ What's Already Done (Don't Touch):

- **Iframe file exists** at `https://policyfinds.com/sqc2026/iframe.html` ✅
- **Media Alpha configuration** is already set up ✅
- **Domain hiding** is already working ✅

### ✅ What YOU Need to Do on YOUR Domain:

- **Add HTML structure** (click wall container) to your domain
- **Add CSS animation** (spinner) to your domain
- **Add JavaScript trigger** (showClickWall function) to your domain

### 🎯 The Result:

- **All domains use the same iframe** → `policyfinds.com/sqc2026/iframe.html`
- **Media Alpha sees the same domain** for all traffic → `policyfinds.com/sqc2026/`
- **Your real domains stay completely hidden** from Media Alpha

This implementation ensures Media Alpha only sees `policyfinds.com/sqc2026/` as the source domain, completely hiding your real traffic sources.
