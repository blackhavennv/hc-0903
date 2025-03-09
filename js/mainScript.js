const server = "https://haravan.anhnoi.com";
const s3Sources = {
  productReviews:
    "https://anhnoi-haravan.s3.ap-southeast-1.amazonaws.com/product-reviews/index.html",
  singleReview:
    "https://anhnoi-haravan.s3.ap-southeast-1.amazonaws.com/single-review/index.html",
  reviewForm:
    "https://anhnoi-haravan.s3.ap-southeast-1.amazonaws.com/review-form/index.html",
  main: "https://anhnoi-haravan.s3-ap-southeast-1.amazonaws.com",
};
//anSettings from metafields globle_html_head
const settings = anSettings;

const fontFamilyList = {
  0: "Roboto",
  1: "Open Sans",
  2: "Montserrat",
  3: "Source Sans Pro",
  4: "Roboto Condensed",
  5: "Oswald",
  6: "Roboto Mono",
  7: "Rale Way",
  8: "Noto Sans",
  9: "Roboto Slab",
};

const fontFamily = fontFamilyList[settings.appearance.font];
settings.appearance.fontFamily = fontFamily;
settings.appearance.fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily
  .split(" ")
  .join("+")}:wght@400;500;600&display=swap`;

const createIcon = (viewBox, pathD) => {
  const style = `width: 1.125em; display: inline-block; font-size: inherit; height: 1em; vertical-align: -0.125em; overflow: visible; color: inherit;`;
  return `<svg style="${style}" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ><path fill="currentColor" d="${pathD}" /></svg>`;
};

const icons = {
  Star: createIcon(
    "0 0 576 512",
    "M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
  ),
  StarHalf: createIcon(
    "0 0 576 512",
    "M508.55 171.51L362.18 150.2 296.77 17.81C290.89 5.98 279.42 0 267.95 0c-11.4 0-22.79 5.9-28.69 17.81l-65.43 132.38-146.38 21.29c-26.25 3.8-36.77 36.09-17.74 54.59l105.89 103-25.06 145.48C86.98 495.33 103.57 512 122.15 512c4.93 0 10-1.17 14.87-3.75l130.95-68.68 130.94 68.7c4.86 2.55 9.92 3.71 14.83 3.71 18.6 0 35.22-16.61 31.66-37.4l-25.03-145.49 105.91-102.98c19.04-18.5 8.52-50.8-17.73-54.6zm-121.74 123.2l-18.12 17.62 4.28 24.88 19.52 113.45-102.13-53.59-22.38-11.74.03-317.19 51.03 103.29 11.18 22.63 25.01 3.64 114.23 16.63-82.65 80.38z"
  ),
  StarOutlined: createIcon(
    "0 0 576 512",
    "M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"
  ),
};

function starsHtml(numberOfStars) {
  let html = "";
  for (var m = 1; m < 6; m++) {
    if (m <= numberOfStars) {
      html += icons.Star;
    } else if (m - numberOfStars === 0.5) {
      html += icons.StarHalf;
    } else {
      html += icons.StarOutlined;
    }
  }
  return html;
}

// For product rating summary
const anhnoiSummaryElements = document.getElementsByClassName(
  "anhnoi-rating-summary"
);

const anhnoiApplyStars = () => {
  for (var i = 0; i < anhnoiSummaryElements.length; i++) {
    const averageRating = anhnoiSummaryElements[i].getAttribute("data-rating");
    const numOfReviews =
      anhnoiSummaryElements[i].getAttribute("data-num-reviews");

    if (numOfReviews) {
      const starHalfRounded = Math.round(averageRating * 2) / 2;
      const starInnerHtml = starsHtml(starHalfRounded);

      anhnoiSummaryElements[
        i
      ].innerHTML = `<span style="color: ${settings.appearance.starColor}">${starInnerHtml}</span> (${numOfReviews})`;
    }
  }
}
anhnoiApplyStars();

const anhnoiOverlay = document.createElement("div");
anhnoiOverlay.style.cssText =
  "width: 100%; height: 100%; position: fixed; z-index: 1000; left: 0; top: 0; background-color: rgb(237, 237, 237, 0.9); overflow-y: scroll; ";

const setFrame = (frameId, framePath, isClosed) => {
  const body = document.getElementsByTagName("body")[0];
  if (framePath) {
    const frameElement = `<iframe id="${frameId}" style="width: 100%; height: 100%; border: none" src="${framePath}" ></iframe>`;
    anhnoiOverlay.innerHTML = frameElement;
    body.append(anhnoiOverlay);
  } else if (isClosed) {
    anhnoiOverlay.remove();
  }
};

const anhnoiReviews = document.getElementById("anhnoiReviews");

if (anhnoiReviews) {
  const shopifyProductId = anhnoiReviews.getAttribute("data-product-id");
  anhnoiReviews.innerHTML = `<iframe id="anReviewsFrame" title="Reviews" src="${s3Sources.productReviews}?shopId=${anShopId}&shopifyProductId=${shopifyProductId}&server=${server}" width="100%" frameborder="0" scrolling="no" margin="0" ></iframe>`;
  window.addEventListener("message", (e) => {
    if (e.data.hasOwnProperty("openModal")) {
      if (e.data.openModal === "reviewForm")
        setFrame(
          "anReviewFormFrame",
          `${s3Sources.reviewForm}?shopId=${anShopId}&shopifyProductId=${shopifyProductId}&server=${server}`
        );

      if (e.data.openModal === "singleReview")
        setFrame(
          "anSingleReviewFrame",
          `${s3Sources.singleReview}?shopId=${anShopId}&reviewId=${e.data.reviewId}&server=${server}&productRef=false`
        );
    }
    if (e.data.hasOwnProperty("frameHeight")) {
      document.getElementById(e.data.frameId).style.height = `${
        e.data.frameHeight + 30
      }px`;
    }
  });
}

window.addEventListener("message", (e) => {
  if (e.data.hasOwnProperty("getSettings")) {
    e.source.postMessage(
      {
        settings,
      },
      e.origin
    );
    if (e.data.frameId === "anReviewsFrame") {
      const anhnoiRatingSummary = document.getElementById(
        "anhnoiRatingSummary"
      );
      const averageRating = anhnoiRatingSummary.getAttribute("data-rating");
      const numberOfReviews =
        anhnoiRatingSummary.getAttribute("data-num-reviews");
      if (!!averageRating & !!numberOfReviews) {
        e.source.postMessage(
          {
            ratingSummary: { numberOfReviews, averageRating },
          },
          e.origin
        );
      }
    }
  }

  if (e.data.hasOwnProperty("closeModal")) setFrame(null, null, true);
});

function anPopupStopped() {
  const anCookie = "an-popup-stopped=true";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i];
    if (cookie.includes(anCookie)) {
      return true;
    }
  }
  return false;
}

if (settings.appearance.showPopup && !anhnoiReviews && !anPopupStopped()) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `${s3Sources.main}/static/js/popup.js`;
  document.head.appendChild(script);
}
