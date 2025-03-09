/* eslint-disable */
!(async function (w, d) {
  // Trang hiện tại là trang chi tiết sản phẩm
  // Chỉ xử lý khi trang hiện tại là trang sản phẩm
  if (meta.page.pageType == "product") {
    // Lấy conversion id và conversion label
    var queryString = document.currentScript.src.substring(
      document.currentScript.src.indexOf("?"),
    );
    var urlParams = new URLSearchParams(queryString);
    var conversionId = urlParams.get("id");
    var conversionLabel = urlParams.get("label");

    function gtag_report_conversion_addtocart(value, currency) {
      if (window.gtag !== undefined) {
        window.gtag("event", "conversion", {
          send_to: conversionId + "/" + conversionLabel,
          value: value,
          currency: currency,
        });
      }

      return false;
    }
    window.gtag_report_conversion_addtocart = gtag_report_conversion_addtocart;

    var productData = await (
      await fetch(window.location.origin + window.location.pathname + ".json")
    ).json();
    var currency = "VND";
    if (
      HaravanAnalytics !== undefined &&
      HaravanAnalytics.meta !== undefined &&
      HaravanAnalytics.meta.currency !== undefined
    ) {
      currency = HaravanAnalytics.meta.currency;
    }
    var getVariantById = function (variantId) {
      if (
        productData.product.variants !== undefined &&
        productData.product.variants !== null
      ) {
        if (variantId > 0) {
          var variant = productData.product.variants.find(
            (e) => e.id == variantId,
          );
          if (variant !== undefined && variant !== null) {
            return variant;
          }
        }

        return productData.product.variants[0];
      }
      return null;
    };
    var sendAddToCartEvent = function () {
      var productSelected = document.getElementById("product-select");
      var quantityInput = document.getElementById("quantity");
      var variantId = 0;
      var quantity = 1;
      if (productSelected !== undefined && productSelected !== null) {
        variantId = parseInt(productSelected.value);
      }
      if (quantityInput !== undefined && quantityInput !== null) {
        quantity = parseInt(quantityInput.value);
      }
      var variant = getVariantById(variantId);
      if (variant !== undefined && variant !== null) {
        var conversionValue = parseFloat(variant.price) * quantity;
        gtag_report_conversion_addtocart(conversionValue, currency);
      }
    };

    var btnAddToCart = document.getElementById("add-to-cart");
    if (btnAddToCart !== null) {
      btnAddToCart.addEventListener("click", sendAddToCartEvent);
    } else {
      var btnAddToCarts = document.getElementsByClassName("btn_add_cart");
      if (btnAddToCarts.length > 0) {
        for (var elIndex in btnAddToCarts) {
          if (elIndex < btnAddToCarts.length) {
            btnAddToCarts[elIndex].addEventListener(
              "click",
              sendAddToCartEvent,
            );
          }
        }
      }
    }
  }
})(window, document);
