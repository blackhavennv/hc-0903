const HG2 = {
	init: function () {
		this.hg_owl();
	},

	hg_owl: () => {
		$('.owl-carousel:not(.not-owl)').each( function(){
			let self = $(this),
					opt = {
						loop: self.data('loop') || false,
						margin: self.data('margin') || 30,
						responsiveClass: true,
						dots: self.data('dot') || false,
						center: self.data('center') || false,
						nav: self.data('nav') || false,
						navText: ['<i class="fal fa-angle-left"></i>','<i class="fal fa-angle-right"></i>'],
						autoplay: self.data('autoplay') || false,
						autoHeight: false,
						autoplayHoverPause:true,
						lazyLoad: true,
						stagePadding: self.attr('data-stagePadding') || 0,
						responsive:{
							0:{
								items: self.data('xs-items') || 1,
								margin: self.data('marginmb') || 15,
								stagePadding: self.attr('data-stagePaddingMb') || 0,
							},
							600:{
								items: self.data('sm-items') || 3,
								margin: self.data('marginmb') || 15,
								stagePadding: self.attr('data-stagePaddingMb') || 0,
							},
							1000:{
								items: self.data('md-items') || 3,
							},
							1200:{
								items: self.data('lg-items') || 3,
							}
						},
					};
			self.owlCarousel(opt);
		});
		
	}
}

// Biến khởi tạo
var timeOut_modalCart;
var viewout = true;
var check_show_modal = true;
// Add a product and show modal cart
var add_item_show_modalCart = function(id,link_checkout) {
	if( check_show_modal ) {
		check_show_modal = false;
		timeOut_modalCart = setTimeout(function(){ 
			check_show_modal = true;
		}, 1000);
		if ($('.addtocart-modal').hasClass('clicked_buy') ) {
			var quantity = $('#quantity').val();
		} else {
			var quantity = 1;
		}
		var params = {
			type: 'POST',
			url: '/cart/add.js',
			async: false,
			data: 'quantity=' + quantity + '&id=' + id,
			dataType: 'json',
			success: function(line_item) {
				console.log(line_item)
				if(link_checkout != undefined){
					window.location = "/checkout";
				}
				else{			
					//getCartModal();	
					updateCartModal();
					//jQuery('#myCart').modal('show');				
					//jQuery('.modal-backdrop').css({'height':jQuery(document).height(),'z-index':'99'});
				}
				$('.addtocart-modal').removeClass('clicked_buy');
				miniCartSuggest(line_item.handle)
			},
			error: function(XMLHttpRequest, textStatus) {
				alert('Sản phẩm bạn vừa mua đã vượt quá tồn kho');
			}
		};
		jQuery.ajax(params);
	}
}
// Plus number quantiy product detail 
var plusQuantity = function() {
	if ( jQuery('input[name="quantity"]').val() != undefined ) {
		var currentVal = parseInt(jQuery('input[name="quantity"]').val());
		if (!isNaN(currentVal)) {
			jQuery('input[name="quantity"]').val(currentVal + 1);
		} else {
			jQuery('input[name="quantity"]').val(1);
		}
	}else {
		console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
	}
}
// Minus number quantiy product detail 
var minusQuantity = function() {
	if ( jQuery('input[name="quantity"]').val() != undefined ) {
		var currentVal = parseInt(jQuery('input[name="quantity"]').val());
		if (!isNaN(currentVal) && currentVal > 1) {
			jQuery('input[name="quantity"]').val(currentVal - 1);
		}
	}else {
		console.log('error: Not see elemnt ' + jQuery('input[name="quantity"]').val());
	}
}
// Modal Cart
function getCartModal(){
	var cart = null;
	jQuery('#cartform').hide();
	jQuery('#myCart #exampleModalLabel').text("Giỏ hàng");
	jQuery.getJSON('/cart.js', function(cart, textStatus) {
		if(cart) {
			$('[data-testid="minicartCount"]').html(cart.item_count);
			jQuery('#cartform').show();
			jQuery('.line-item:not(.original)').remove();
			jQuery.each(cart.items,function(i,item){
				var total_line = 0;
				var total_line = item.quantity * item.price;
				tr = jQuery('.original').clone().removeClass('original').appendTo('table#cart-table tbody');
				if(item.image != null)
					tr.find('.item-image').html("<img src=" + Haravan.resizeImage(item.image,'small') + ">");
				else
					tr.find('.item-image').html("<img src='//theme.hstatic.net/200000053174/1001115888/14/no_image.jpg?v=5399'>");
				vt = item.variant_options;
				if(vt.indexOf('Default Title') != -1)
					vt = '';
				tr.find('.item-title').children('a').html(item.product_title + '<br><span>' + vt + '</span>').attr('href', item.url);
				tr.find('.item-quantity').html("<input id='quantity1' name='updates[]' min='1' type='number' value=" + item.quantity + " class='' />");
				if ( typeof(formatMoney) != 'undefined' ){
					tr.find('.item-price').html(Haravan.formatMoney(total_line, formatMoney));
				}else {
					tr.find('.item-price').html(Haravan.formatMoney(total_line, ''));
				}
				tr.find('.item-delete').html("<a href='javascript:void(0);' cdp_data_sku="+ item.sku +"  onclick='deleteCart(" + (i+1) + ")' ><i class='fal fa-times'></i></a>");
			});
			jQuery('.item-total').html(Haravan.formatMoney(cart.total_price, formatMoney));
			jQuery('.modal-title').children('b').html(cart.item_count);
			jQuery('.count-holder .count').html(cart.item_count );
			if(cart.item_count == 0){				
				jQuery('#exampleModalLabel').html('Giỏ hàng của bạn đang trống. Mời bạn tiếp tục mua hàng.');
				jQuery('#cart-view').html('<div class="item-cart_empty">Không có sản phẩm nào trong giỏ hàng.</div>');
				jQuery('#cartform').hide();
			}
			else{			
				jQuery('#exampleModalLabel').html('Bạn có ' + cart.item_count + ' sản phẩm trong giỏ hàng.');
				jQuery('#cartform').removeClass('hidden');
				jQuery('#cart-view').html('');
			}
			if (jQuery('#cart-pos-product').length > 0 ) {
				jQuery('#cart-pos-product span').html(cart.item_count + ' sản phẩm');
			}
			// Get product for cart view
			jQuery.each(cart.items,function(i,item){
				clone_item(item,i);
			});
			jQuery('#total-view-cart').html(Haravan.formatMoney(cart.total_price, formatMoney));
		}
		else{
			jQuery('#exampleModalLabel').html('Giỏ hàng của bạn đang trống. Mời bạn tiếp tục mua hàng.');
			if ( jQuery('#cart-pos-product').length > 0 ) {
				jQuery('#cart-pos-product span').html(cart.item_count + ' sản phẩm');
			}
				jQuery('#cart-view').html('<div class="item-cart_empty">Không có sản phẩm nào trong giỏ hàng.</div>');
			jQuery('#cartform').hide();
		}
	});
	$('.site-cart .alert .icon').addClass('icon--order-success');
	$('.site-cart .alert').addClass('show');
}
//clone item cart
function clone_item(product,i){
	//console.log(product);
	var item_product = jQuery('#clone-item-cart').find('.item_2');
	item_product.attr('data-variant-id', product.variant_id);
	if ( product.image == null ) {
		item_product.find('img').attr('src','//theme.hstatic.net/200000053174/1001115888/14/no_image.jpg?v=5399').attr('alt', product.url);
	} else {
		item_product.find('img').attr('src',Haravan.resizeImage(product.image,'medium')).attr('alt', product.url);
	}
	console.log(product.vendor.includes('gift'))
	if (product.vendor.includes('gift') == false) {
		item_product.find('a:not(.remove-cart)').attr('href', product.url).attr('title', product.url);
	} else {
		item_product.find('.pro-quantity-view').addClass('disable');
	}
	item_product.find('.pro-title-view').html(product.title);
	item_product.find('.pro-quantity-view .qty-value').val(product.quantity).attr('name', 'updates['+product.variant_id+']');
	item_product.find('.pro-price-view').html(Haravan.formatMoney(product.price,formatMoney));
	item_product.find('.product__price-subtotal').html(Haravan.formatMoney((product.line_price),formatMoney));
	item_product.find('.remove-cart').html('<a href="javascript:void(0);" onclick="deleteCart(' + (i+1) + ',\''+ product.sku  +'\')" ><i class="fal fa-times"></i></a>');
	var title = '';
	if(product.variant_options.indexOf('Default Title') == -1){
		$.each(product.variant_options,function(i,v){
			title = title + v + ' / ';
		});
		title = title + '@@';
		title = title.replace(' / @@','')
		item_product.find('.variant').html(title);
	}else {
		item_product.find('.variant').html('');
	}
	item_product.clone().removeClass('hidden').prependTo('#cart-view');
}
/*update cart count*/
function updateCart(){
	$.ajax({
		type: 'GET',
		url: '/cart?view=count',
		async: true,
		success: function(data){
			$('.desktop-cart-wrapper a .hd-cart-count').html(parseInt(data));
			$('.desktop-cart-wrapper1 a .hd-cart-count').html(parseInt(data));
			$('.mobile-nav-item a .number').html(parseInt(data));
		}
	})
	$.ajax({
		type: 'GET',
		url: '/cart?view=desktopheader',
		async: true,
		success: function(data){
			$('.desktop-cart-wrapper .quickview-cart').html(data);
			$('.desktop-cart-wrapper1 .quickview-cart').html(data);
			initCartHeader();
		}
	})
}

function updateCartModal(){
	$.ajax({
		type: 'GET',
		url: '/cart?view=addcomplete',
		async : false,
		success: function(data) {
			//do html vao day
			$('#modalAddComplete').html(data);
			$('#modalAddComplete').css('display','block');
			$('#modalAddComplete').addClass("active");
			setTimeout(function(){
				$('.modalAddComplete-content').addClass('show');
			}, 100)
		}
	})
}
// Delete variant in modalCart
function deleteCart(line, cdp_data_sku){
	
	// cdp tracking 
	try{
		
		if(typeof cdp_data_sku != undefined){
			  var props = {
					 items: [{item_type: "product", id: cdp_data_sku}]
				};
			  web_event.track('product', 'remove_cart', props);
		}		
	}
	catch(ex){console.log('cdp log: deleteCart');}
	
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data: 'quantity=0&line=' + line,
		dataType: 'json',
		success: function(cart) {
			getCartModal();
			$('.site-cart .alert').removeClass('show');
			
			$.each(cart.items,function(i,item){
				$('[data-variant-id="'+item.variant_id+'"] .product__price-subtotal').html(Haravan.formatMoney(item.line_price, ""));
				if (cart.total_price < 10000) {
					if (item.price < 10000) {
						$('[data-variant-id="'+item.variant_id+'"] .remove-cart > a').trigger('click');
					}
				}
			});
			$('#total-view-cart').html(Haravan.formatMoney(data.total_price, formatMoney));
			$('[data-testid="minicartCount"], .count-holder .count').html(data.item_count);
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}

$(document).on('click', '.pro-quantity-view .plud-btn', function(e){
	e.preventDefault();
	var input = $(this).closest('.pro-quantity-view').find('input');
	var currentVal = parseInt(input.val());
	if (!isNaN(currentVal)) {
		input.val(currentVal + 1);
	} else {
		input.val(1);
	}
	update_price_change();
});
$(document).on('click', ".pro-quantity-view .minus-btn", function(e){
	e.preventDefault();
	var input = $(this).closest('.pro-quantity-view').find('input');
	var currentVal = parseInt(input.val());
	if (!isNaN(currentVal) && currentVal > 1) {
		input.val(currentVal - 1);
	} else {
		input.val(1);
	}
	update_price_change();
});
function update_price_change(){
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data: $('.cart-view form').serialize(),
		async: false,
		dataType: 'json',
		success: function(data) {
			$.each(data.items,function(i,item){
				//clone_item(item,i);
				$('[data-variant-id="'+item.variant_id+'"] .product__price-subtotal').html(Haravan.formatMoney(item.line_price, ""));
				if (data.total_price < 10000) {
					if (item.price < 10000) {
						$('[data-variant-id="'+item.variant_id+'"] .remove-cart > a').trigger('click');
					}
				}
			});
			/*$.each(data.items,function(i,v){
						$('.microcart__summary form [data-variant-id="'+v.variant_id+'"] .product__price-subtotal').html(Haravan.formatMoney(v.line_price, ""));
					});*/
			$('#total-view-cart').html(Haravan.formatMoney(data.total_price, formatMoney));
			$('[data-testid="minicartCount"], .count-holder .count').html(data.item_count);
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}
// Buynow
var buy_now = function(id) {
	var quantity = 1;
	var params = {
		type: 'POST',
		url: '/cart/add.js',
		data: 'quantity=' + quantity + '&id=' + id,
		dataType: 'json',
		success: function(line_item) {
			window.location = '/checkout';
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}

var add_to_cart = function(id) {
	var quantity = 1;
	var params = {
		type: 'POST',
		url: '/cart/add.js',
		data: 'quantity=' + quantity + '&id=' + id,
		dataType: 'json',
		success: function(line_item) {
			getCartModal();
			initCart('open');
			//updateCartModal();
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
}

// Update product in modalCart
jQuery(document).on("click","#update-cart-modal",function(event){
	event.preventDefault();
	if (jQuery('#cartform').serialize().length <= 5) return;
	jQuery(this).html('Đang cập nhật');
	var params = {
		type: 'POST',
		url: '/cart/update.js',
		data: jQuery('#cartform').serialize(),
		dataType: 'json',
		success: function(cart) {
			if ((typeof callback) === 'function') {
				callback(cart);
			} else {
				getCartModal();
			}
			jQuery('#update-cart-modal').html('Cập nhật');
		},
		error: function(XMLHttpRequest, textStatus) {
			Haravan.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
});

function initNav(action) {
	switch(action) {
		case 'close':
			$('#menu-mobile').removeClass('show');
			$('.menu-mobile-overlay').removeClass('show');
			break;
		case 'open':
			$('#menu-mobile').addClass('show');
			$('.menu-mobile-overlay').addClass('show');
			break;
	}
}
function initSearch(action) {
	switch(action) {
		case 'close':
			$('.header-search').removeClass('show');
			break;
		case 'open':
			$('.header-search').addClass('show');
			break;
	}
}
function initCart(action) {
	switch(action) {
		case 'close':
			$('.header-action_dropdown').removeClass('show');
			$('.cart-overlay').removeClass('show');
			$('.site-cart .alert .icon').removeClass('icon--order-success');
			$('.site-cart .alert').removeClass('show');
			break;
		case 'open':
			$('.header-action_dropdown').addClass('show');
			$('.cart-overlay').addClass('show');
			break;
	}
}
function initFilter(action) {
	switch(action) {
		case 'close':
			$('.box_sidebar').removeClass('show');
			$('.filter-overlay').removeClass('show');
			break;
		case 'open':
			$('.box_sidebar').addClass('show');
			$('.filter-overlay').addClass('show');
			break;
	}
}

$('#nav ul li a i').on('click', function (e) {
	e.preventDefault();
	$(this).toggleClass('active').parent().next().slideToggle();
});

function smoothScroll(a, b){
	$('body,html').animate({
		scrollTop : a
	}, b);
}
function boxAccount(type){
	$('.site_account .js-link').removeClass('is-selected');
	$(`.site_account .js-link[aria-controls="${type}"]`).addClass('is-selected');
	$('.site_account .site_account_panel_list .site_account_panel ').addClass('d-none');
	$('.site_account .site_account_panel_list .site_account_panel ').removeClass('is-selected');
	$(`.site_account .site_account_panel_list .site_account_panel#${type}`).removeClass('d-none');
	$(`.site_account .site_account_panel_list .site_account_panel#${type}`).addClass('is-selected');
	var newheight = $(`.site_account .site_account_panel_list .site_account_panel#${type}`).addClass('is-selected').height();
	if($('.site_account_panel').hasClass('is-selected')){
		$('.site_account_panel_list').css("height", newheight);
	}
};
jQuery(document).ready(function(){
	// Get number item for cart header
	$.get('/cart.js').done(function(cart){
		$('.cart-menu .count').html(cart.item_count);
	});
	if (window.template.indexOf('index') > -1) {

		if ($('.list-slider-banner').length > 0) {		
			var checkBanner =	$('.list-slider-banner .home-banner-pd').length;			
			$('.list-slider-banner').owlCarousel({
				items: 1,
				loop: true,
				dots: false,
				nav: false,
				smartSpeed: 1000,				
				responsive: {
					0: {
						items: 1,
						stagePadding: 30,						
					},
					480: {
						items: 1,
						stagePadding: 50,					
					},
					768: {
						items: 2,
						stagePadding: 60,
						nav: true
					},
					992: {
						items: 3,	
						stagePadding: checkBanner > 3?90:0,
						loop: checkBanner > 3?true:false,
						nav:checkBanner > 3?true:false,
						mouseDrag:checkBanner > 3?true:false,
						touchDrag:checkBanner > 3?true:false
					},
					1200: {
						items: 3,
						stagePadding: checkBanner > 3?60:0,
						loop: checkBanner > 3?true:false,
						nav:checkBanner > 3?true:false,
						mouseDrag:checkBanner > 3?true:false,
						touchDrag:checkBanner > 3?true:false
					}
				}
			});
		}
	}
	/* backto - product */
	if($('#backto-page').length > 0){
		$(document).on("click", "#backto-page", function(){		
			window.history.back();
		});
	}
	$('a[data-spy=scroll]').click(function(){
		event.preventDefault() ;
		$('body').animate({scrollTop: ($($(this).attr('href')).offset().top - 20) + 'px'}, 500);
	})
	/* CLICK icon header */
	$('body').on('click', '.js-link', function(e){
		e.preventDefault();
		boxAccount($(this).attr('aria-controls'));
	});
	$('.site_account input').blur(function(){
		var tmpval = $(this).val();
		if(tmpval == '') {
			$(this).removeClass('is-filled');
		} else {
			$(this).addClass('is-filled');
		}
	});
	$('body').on('click', '#site-overlay', function(e){
		$('.header-action').removeClass('show-action');
	});

	$(document).on("click",".dropdown-filter", function(){
		if ( $(this).parent().attr('aria-expanded') == 'false' ) {
			$(this).parent().attr('aria-expanded','true');
		} else {
			$(this).parent().attr('aria-expanded','false');
		}
	});
	// Mainmenu sidebar
	$('.icon-subnav').on('click', function(){
		if ($(this).parent().hasClass('active')) {
			$(this).parent().removeClass('active');
			$(this).siblings('ul').slideUp();
		} else {
			if( $(this).parent().hasClass("level0") || $(this).parent().hasClass("level1")){
				$(this).parent().siblings().find("ul").slideUp();
				$(this).parent().siblings().removeClass("active");
			}
			$(this).parent().addClass('active');
			$(this).siblings('ul').slideDown();
		}
	});
	// Menu sidebar
	$('.tree-menu .icon-control').on('click', function(e) {
		e.preventDefault();
		$(this).parent().next().stop().slideToggle();
	});
	/* footer */
	if (jQuery(window).width() < 768) {
		$('.footer-title').on('click', function () {
			$(this).next().stop().slideToggle();
		});
		// icon Footer
		$('a.btn-fter').click(function(e){
			if ( $(this).attr('aria-expanded') == 'false' ) {
				e.preventDefault();
				$(this).attr('aria-expanded','true');
				$('.main-footer').addClass('bg-active');
			} else {
				$(this).attr('aria-expanded','false');
				$('.main-footer').removeClass('bg-active');
			}
		});
	}
});

/* Search ultimate destop -mobile*/
$('.ultimate-search').submit(function(e) {
	e.preventDefault();
	var q = $(this).find('input[name=q]').val();
	if(q.indexOf('script') > -1 || q.indexOf('>') > -1){
		alert('Từ khóa của bạn có chứa mã độc hại ! Vui lòng nhập lại key word khác');
		$(this).find('input[name=q]').val('');
	}else{
		var q_follow = 'product';
		var query = encodeURIComponent(q);
		if( !q ) {
			window.location = '/search?type='+ q_follow +'&q=';
			return;
		}	
		else {
			window.location = '/search?type=' + q_follow +'&q=' + query;
			return;
		}
	}
});
var $input = $('.ultimate-search input[type="text"]');
$input.bind('keyup change paste propertychange', function() {
	var key = $(this).val(),
			$parent = $(this).parents('.wpo-wrapper-search'),
			$results = $(this).parents('.wpo-wrapper-search').find('.smart-search-wrapper');
	if(key.indexOf('script') > -1 || key.indexOf('>') > -1){
		alert('Từ khóa của bạn có chứa mã độc hại ! Vui lòng nhập lại key word khác');
		$(this).val('');
		$('.ultimate-search input[type="text"]').val('');
	}
	else{
		if(key.length > 0 ){
			$('.ultimate-search input[type="text"]').val($(this).val());
			$(this).attr('data-history', key);
			var q_follow = 'product',
					str = '';
			str = `/search?q=filter=((collectionid:product>0)&&(title:product**${key})||(sku:product**${key}))&view=ultimate-product`;
			$.ajax({
				url: str,
				type: 'GET',
				async: true,
				success: function(data){
					$results.find('.resultsContent').html(data);
				}
			})
			$(".search-bar-mobile .ultimate-search").addClass("expanded");
			$results.fadeIn();
		}
		else{
			$('.ultimate-search input[type="text"]').val($(this).val());
			$(".search-bar-mobile .ultimate-search").removeClass("expanded");
			$results.fadeOut();
		}
	}
})
$('body').click(function(evt) {
	var target = evt.target;
	if (target.id !== 'ajaxSearchResults' && target.id !== 'inputSearchAuto') {
		$(".ajaxSearchResults").hide();
	}
	if (target.id !== 'ajaxSearchResults-3' && target.id !== 'inputSearchAuto-3') {
		$("#ajaxSearchResults-3").hide();
	}
	if (target.id !== 'ajaxSearchResults-mb' && target.id !== 'inputSearchAuto-mb') {
		$(".ajaxSearchResults").hide();
	}
});
$('body').on('click', '.ultimate-search input[type="text"]', function() {
	if ($(this).is(":focus")) {
		if ($(this).val() != '') {
			$(".ajaxSearchResults").show();
		}
	} else {

	}
})
$('body').on('click', '.ultimate-search .close-search', function(e){
	e.preventDefault();
	$(".ajaxSearchResults").hide();
	$(".ultimate-search").removeClass("expanded");
	$(".ultimate-search").find('input[name=q]').val('');
})
/*=======================================*/
jQuery(document).ready(function(){
	if ($('.addThis_listSharing').length > 0){
		$(window).scroll(function(){
			if(jQuery(window).scrollTop() > 100 ) {
				jQuery('.addThis_listSharing').addClass('is-show');
			} else {
				jQuery('.addThis_listSharing').removeClass('is-show');
			}
		});
		$('.content_popupform form.contact-form').submit(function(e){
			e.preventDefault();		
			$.ajax({
				type: 'POST',
				url:'/contact',
				data: $('.content_popupform form.contact-form').serialize(),
				success:function(data){		
					$('.modal-contactform.fade.in').modal('hide');
					setTimeout(function(){ 		
						$('.modal-succesform').modal('show');					
						setTimeout(function(){							
							$('.modal-succesform.fade.in').modal('hide');	
						}, 5000);
					},300);
				},

			})
		});
		$(".modal-succesform").on('hidden.bs.modal', function() {
			location.reload();
		});
	}
	if ($('.layoutProduct_scroll').length > 0 && jQuery(window).width() < 768) {
		var curScrollTop = 0;
		$(window).scroll(function(){	
			var scrollTop = $(window).scrollTop();
			if(scrollTop > curScrollTop  && scrollTop > 200 ) {
				$('.layoutProduct_scroll').removeClass('scroll-down').addClass('scroll-up');
			}
			else {
				if (scrollTop > 200 && scrollTop + $(window).height() + 150 < $(document).height()) {
					$('.layoutProduct_scroll').removeClass('scroll-up').addClass('scroll-down');	
				}
			}
			if(scrollTop < curScrollTop  && scrollTop < 200 ) {
				$('.layoutProduct_scroll').removeClass('scroll-up').removeClass('scroll-down');
			}
			curScrollTop = scrollTop;
		});
	}
});

document.addEventListener("DOMContentLoaded", function() {
	let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
	let active = false;

	const lazyLoad = function() {
		if (active === false) {
			active = true;

			setTimeout(function() {
				lazyImages.forEach(function(lazyImage) {
					if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
						lazyImage.src = lazyImage.dataset.src;
						lazyImage.srcset = lazyImage.dataset.srcset;
						lazyImage.classList.remove("lazy");

						lazyImages = lazyImages.filter(function(image) {
							return image !== lazyImage;
						});

						if (lazyImages.length === 0) {
							document.removeEventListener("scroll", lazyLoad);
							window.removeEventListener("resize", lazyLoad);
							window.removeEventListener("orientationchange", lazyLoad);
						}
					}
				});

				active = false;
			}, 200);
		}
	};

	document.addEventListener("scroll", lazyLoad);
	window.addEventListener("resize", lazyLoad);
	window.addEventListener("orientationchange", lazyLoad);
});


function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function checkCookie() {
	var user = getCookie("username");
	if (user != "") {
		alert("Welcome again " + user);
	} else {
		user = prompt("Please enter your name:", "");
		if (user != "" && user != null) {
			setCookie("username", user, 365);
		}
	}
}

/* variant click */

function convertToSlug(str) {

	str= str.toLowerCase();  
	str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
	str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
	str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
	str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
	str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
	str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");  
	str= str.replace(/đ/g,"d");  
	str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-"); 
	str= str.replace(/-+-/g,"-");
	str= str.replace(/^\-+|\-+$/g,"");  
	return str;  
} 

var swatch_size = 0;
$(document).ready(function(){

	$('#productQuickView').on('click','input.input-quickview', function(e) {  
		e.preventDefault();
		console.log('quickviewXXX');
		swatch_size = parseInt($('#productQuickView .select-swatch').children().length);
		var $this = $(this);
		var _available = '';
		$this.parent().siblings().find('label').removeClass('sd');
		$this.next().addClass('sd');
		var name = $this.attr('name');
		var value = $this.val();
		$('#productQuickView select[data-option='+name+']').val(value).trigger('change');
		if($(this).data('img-src')){
			var img_ = $(this).data('img-src');
			$('#productQuickView .product-single__thumbnail[href="'+img_+'"]').trigger('click');
		}
		if(swatch_size == 2){
				
			if(name.indexOf('1') != -1){
				$('#variant-swatch-1-quickview .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-2-quickview .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-1-quickview .swatch-element label').removeClass('sd');
				$('#variant-swatch-1-quickview .swatch-element').removeClass('soldout');
				$('#productQuickView .selector-wrapper .single-option-selector').eq(1).find('option').each(function(){
					var _tam = $(this).val();
					$(this).parent().val(_tam).trigger('change');
					if(check_variant_quickview){
						if(_available == '' ){
							_available = _tam;
						}
					}else{
						$('#variant-swatch-1-quickview .swatch-element[data-value="'+_tam+'"]').addClass('soldout');
						$('#variant-swatch-1-quickview .swatch-element[data-value="'+_tam+'"]').find('input').prop('disabled', true);
					}
				})
				$('#productQuickView .selector-wrapper .single-option-selector').eq(1).val(_available).trigger('change');
				$('#variant-swatch-1-quickview .swatch-element[data-value="'+_available+'"] label').addClass('sd');
			}
		}else if (swatch_size == 3){
			var _count_op2 = $('#variant-swatch-1-quickview .swatch-element').length;
			var _count_op3 = $('#variant-swatch-2-quickview .swatch-element').length;
			if(name.indexOf('1') != -1){
				$('#variant-swatch-1-quickview .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-2-quickview .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-1-quickview .swatch-element label').removeClass('sd');
				$('#variant-swatch-1-quickview .swatch-element').removeClass('soldout');
				$('#variant-swatch-2-quickview .swatch-element label').removeClass('sd');
				$('#variant-swatch-2-quickview .swatch-element').removeClass('soldout');
				var _avi_op1 = '';
				var _avi_op2 = '';
				$('#variant-swatch-1-quickview .swatch-element').each(function(ind,value){
					var _key = $(this).data('value');
					var _unavi = 0;
					$('#productQuickView .single-option-selector').eq(1).val(_key).change();
					$('#variant-swatch-2-quickview .swatch-element label').removeClass('sd');
					$('#variant-swatch-2-quickview .swatch-element').removeClass('soldout');
					$('#variant-swatch-2-quickview .swatch-element').find('input').prop('disabled', false);
					$('#variant-swatch-2-quickview .swatch-element').each(function(i,v){
						var _val = $(this).data('value');
						$('#productQuickView .single-option-selector').eq(2).val(_val).change();
						if(check_variant == true){
							if(_avi_op1 == ''){
								_avi_op1 = _key;
							}
							if(_avi_op2 == ''){
								_avi_op2 = _val;
							}
							//console.log(_avi_op1 + ' -- ' + _avi_op2)
						}else{
							_unavi += 1;
						}
					})
					if(_unavi == _count_op3){
						$('#variant-swatch-1-quickview .swatch-element[data-value = "'+_key+'"]').addClass('soldout');
						setTimeout(function(){
							$('#variant-swatch-1-quickview .swatch-element[data-value = "'+_key+'"] input').attr('disabled','disabled');
						})
					}
				})
				$('#variant-swatch-1-quickview .swatch-element[data-value="'+_avi_op1+'"] input').click();
			}
			else if(name.indexOf('2') != -1){
				$('#variant-swatch-2-quickview .swatch-element label').removeClass('sd');
				$('#variant-swatch-2-quickview .swatch-element').removeClass('soldout');
				$('#productQuickView .selector-wrapper .single-option-selector').eq(2).find('option').each(function(){
					var _tam = $(this).val();
					$(this).parent().val(_tam).trigger('change');
					if(check_variant_quickview){
						if(_available == '' ){
							_available = _tam;
						}
					}else{
						$('#variant-swatch-2-quickview .swatch-element[data-value="'+_tam+'"]').addClass('soldout');
						$('#variant-swatch-2-quickview .swatch-element[data-value="'+_tam+'"]').find('input').prop('disabled', true);				
					}
				})
				$('#productQuickView .selector-wrapper .single-option-selector').eq(2).val(_available).trigger('change');
				$('#variant-swatch-2-quickview .swatch-element[data-value="'+_available+'"] label').addClass('sd');
			}
		}else{


			
			if(name.indexOf('1') != -1){

				$('#variant-swatch-0-quickview .swatch-element').find('input').prop('disabled', false);

				$('#variant-swatch-0-quickview .swatch-element label').removeClass('sd');

				$('#variant-swatch-0-quickview .swatch-element').removeClass('soldout');

				$('#productQuickView .single-option-selector').eq(0).find('option').each(function(){

					var _tam = $(this).val();

					$(this).parent().val(_tam).trigger('change');

					if(check_variant_quickview){
						_available = _tam;
					} else{
						$('#variant-swatch-0-quickview .swatch-element[data-value="'+_tam+'"]').addClass('soldout');
						$('#variant-swatch-0-quickview .swatch-element[data-value="'+_tam+'"]').find('input').prop('disabled', true);
					}

				})

				$('#productQuickView .single-option-selector').eq(0).val(value).trigger('change');
				$('#variant-swatch-0-quickview .swatch-element[data-value="'+ value +'"] label').addClass('sd');

			}
		}
	})

	$('#PageContainer').on('click','.input-product', function(e) {  
		swatch_size = parseInt($('#product-select-watch').children().length);
		console.log('productX');
		var $this = $(this);
		var _available = '';
		$this.parent().siblings().find('label').removeClass('sd');
		$this.next().addClass('sd');
		var name = $this.attr('name');
		var value = $this.val();
		$('select[data-option='+name+']').val(value).trigger('change');
		if($(this).data('img-src')){
			var img_ = $(this).data('img-src');
			$('.product-single__thumbnail[href="'+img_+'"]').trigger('click');
		}
		if(swatch_size == 2){
			if(name.indexOf('1') != -1){
				$('#variant-swatch-1 .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-2 .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-1 .swatch-element label').removeClass('sd');
				$('#variant-swatch-1 .swatch-element').removeClass('soldout');
				$('.selector-wrapper .single-option-selector').eq(1).find('option').each(function(){
					var _tam = $(this).val();
					$(this).parent().val(_tam).trigger('change');
					if(check_variant){
						if(_available == '' ){
							_available = _tam;
						}
					}else{
						$('#variant-swatch-1 .swatch-element[data-value="'+_tam+'"]').addClass('soldout');
						$('#variant-swatch-1 .swatch-element[data-value="'+_tam+'"]').find('input').prop('disabled', true);
					}
				})
				$('.selector-wrapper .single-option-selector').eq(1).val(_available).trigger('change');
				$('#variant-swatch-1 .swatch-element[data-value="'+_available+'"] label').addClass('sd');
			}
		}else if (swatch_size == 3){
			var _count_op2 = $('#variant-swatch-1 .swatch-element').length;
			var _count_op3 = $('#variant-swatch-2 .swatch-element').length;
			if(name.indexOf('1') != -1){
				$('#variant-swatch-1 .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-2 .swatch-element').find('input').prop('disabled', false);
				$('#variant-swatch-1 .swatch-element label').removeClass('sd');
				$('#variant-swatch-1 .swatch-element').removeClass('soldout');
				$('#variant-swatch-2 .swatch-element label').removeClass('sd');
				$('#variant-swatch-2 .swatch-element').removeClass('soldout');
				var _avi_op1 = '';
				var _avi_op2 = '';
				$('#variant-swatch-1 .swatch-element').each(function(ind,value){
					var _key = $(this).data('value');
					var _unavi = 0;
					$('.single-option-selector').eq(1).val(_key).change();
					$('#variant-swatch-2 .swatch-element label').removeClass('sd');
					$('#variant-swatch-2 .swatch-element').removeClass('soldout');
					$('#variant-swatch-2 .swatch-element').find('input').prop('disabled', false);
					$('#variant-swatch-2 .swatch-element').each(function(i,v){
						var _val = $(this).data('value');
						$('.single-option-selector').eq(2).val(_val).change();
						if(check_variant == true){
							if(_avi_op1 == ''){
								_avi_op1 = _key;
							}
							if(_avi_op2 == ''){
								_avi_op2 = _val;
							}
							//console.log(_avi_op1 + ' -- ' + _avi_op2)
						}else{
							_unavi += 1;
						}
					})
					if(_unavi == _count_op3){
						$('#variant-swatch-1 .swatch-element[data-value = "'+_key+'"]').addClass('soldout');
						setTimeout(function(){
							$('#variant-swatch-1 .swatch-element[data-value = "'+_key+'"] input').attr('disabled','disabled');
						})
					}
				})
				$('#variant-swatch-1 .swatch-element[data-value="'+_avi_op1+'"] input').click();
			}
			else if(name.indexOf('2') != -1){
				$('#variant-swatch-2 .swatch-element label').removeClass('sd');
				$('#variant-swatch-2 .swatch-element').removeClass('soldout');
				$('.selector-wrapper .single-option-selector').eq(2).find('option').each(function(){
					var _tam = $(this).val();
					$(this).parent().val(_tam).trigger('change');
					if(check_variant){
						if(_available == '' ){
							_available = _tam;
						}
					}else{
						$('#variant-swatch-2 .swatch-element[data-value="'+_tam+'"]').addClass('soldout');
						$('#variant-swatch-2 .swatch-element[data-value="'+_tam+'"]').find('input').prop('disabled', true);				
					}
				})
				$('.selector-wrapper .single-option-selector').eq(2).val(_available).trigger('change');
				$('#variant-swatch-2 .swatch-element[data-value="'+_available+'"] label').addClass('sd');
			}
		}else{
			if(name.indexOf('1') != -1){

				$('#variant-swatch-0 .swatch-element').find('input').prop('disabled', false);

				$('#variant-swatch-0 .swatch-element label').removeClass('sd');

				$('#variant-swatch-0 .swatch-element').removeClass('soldout');

				$('.selector-wrapper .single-option-selector').eq(0).find('option').each(function(){

					var _tam = $(this).val();

					$(this).parent().val(_tam).trigger('change');

					if(check_variant){
						_available = _tam;
					} else{
						$('#variant-swatch-0 .swatch-element[data-value="'+_tam+'"]').addClass('soldout');
						$('#variant-swatch-0 .swatch-element[data-value="'+_tam+'"]').find('input').prop('disabled', true);
					}

				})

				$('.selector-wrapper .single-option-selector').eq(0).val(value).trigger('change');
				$('#variant-swatch-0 .swatch-element[data-value="'+ value +'"] label').addClass('sd');

			}
		}
	})
})

$(document).ready(function(){
	flagg = true;
	if(flagg){
		$('.header-action_menu a').click(function(e){
			e.preventDefault();
			$('#menu-mobile').removeClass('hidden');
			flagg = false;
		})
	}

	$('#back-to-top').click(function(event) {
		event.preventDefault();
		jQuery('html, body').animate({
			scrollTop: 0
		}, duration);
		return false;
	});

	$(window).scroll(function() {		
		/* scroll top */
		if ($('.back-to-top').length > 0 && $(window).scrollTop() > 500 ) {
			$('.back-to-top').addClass('show');
		} else {
			$('.back-to-top').removeClass('show');
		}
	});	

	$('.search-close').on('click', function () {
		$('.header-search').removeClass('show');
	});
});

function tab_custom(link, content) {
	$(link).on('click', function () {
		var id = $(this).data('id');
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		$(content + '[data-id='+id+']').siblings().removeClass('active');
		$(content + '[data-id='+id+']').addClass('active');
	});
}

if ($('.htp-tablink').length) {
	tab_custom('.htp-tablink', '.htp-tabcontent');
}

function accordion_custom(link, content) {
	$(link).on('click', function (e) {
		e.preventDefault();
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		$(this).siblings().find(content).slideUp();
		$(this).find(content).slideDown();
	});
}

if ($('.accordion-item').length) {
	accordion_custom('.accordion-item', '.accordion-content');
}

$('#menu-mobile ul li a .fa-angle-right').on('click', function (e) {
	e.preventDefault();
	$(this).toggleClass('active');
	$(this).parent().next().stop().slideToggle();
});

if ($('.btn-compare').length) {
	var Hogwarts = {
		init: function(){
			this.ComparePD.init();
		}
	}
	$(document).ready(function(){
		Hogwarts.init();


		/*$(".btn-compare").click(function(){
		var id = $(this).data('id'),
		url = $(this).data('url'),
		image = $(this).data('image'),
		title = $(this).data('title');
		$(".btn-compare").removeClass("checked");
		$(this).addClass("checked");
		$('#compareProduct').fadeIn(500);
		Hogwarts.ComparePD.checkAddCompareList(id,url,image,title);
	})*/

		var select_id_1 = "";
		var select_url_1 = "";
		var select_image_1 = "";
		var select_title_1 = "";
		var select_id_2 = "";
		var select_url_2 = "";
		var select_image_2 = "";
		var select_title_2 = "";
		$("#select_list_chonxe_1").on('change', function(){
			select_id_1 = $(this).find(':selected').data('id');
			select_url_1 = $(this).find(':selected').data('url');
			select_image_1 = $(this).find(':selected').data('image');
			select_title_1 = $(this).find(':selected').data('title');	


		})
		$("#select_list_chonxe_2").on('change', function(){
			select_id_2 = $(this).find(':selected').data('id');
			select_url_2 = $(this).find(':selected').data('url');
			select_image_2 = $(this).find(':selected').data('image');
			select_title_2 = $(this).find(':selected').data('title');	

		})

		$("#load_info_product").click(function(){
			$('#compareProduct .listCpPd .compareItem').each(function(){
				var remove = $(this).data("id");	
				Hogwarts.ComparePD.removeItemCompare(remove);	 
			})
			$('#compareProduct').fadeIn(500);
			Hogwarts.ComparePD.addItemCompare(select_id_1,select_url_1,select_image_1,select_title_1);
			Hogwarts.ComparePD.addItemCompare(select_id_2,select_url_2,select_image_2,select_title_2);
			setTimeout(function(){ 
				location.reload();
			}, 500);
		})
	})

	/* Compare Products js*/

	Hogwarts.ComparePD = {
		init: function(){
			$(document).on('click','.pdCompare a', this.toggleItemCompare);
			$(document).on('click','.btn-compare', this.toggleItemCompare);
			$(document).on('click','.mainCpPd .toggleButton a', this.toggleSlideCompare );
			$(document).on('click','.removeCPItem', function(){
				Hogwarts.ComparePD.removeItemCompare($(this).data('item'))
			});
			this.getDefaulItem();
		},
		toggleItemCompare: function(){
			$(this).toggleClass('checked');
			var id = $(this).data('id'),
					url = $(this).data('url'),
					image = $(this).data('image'),
					title = $(this).data('title');
			$('#compareProduct').fadeIn(500);
			Hogwarts.ComparePD.checkAddCompareList(id,url,image,title);
		},
		toggleSlideCompare: function(){
			$('#compareProduct .mainCpPd').toggleClass('toggleSlide');
		},
		checkAddCompareList: function(id,url,image,title){
			var sizeCheck = $('#compareProduct .listCpPd .compareItem[data-id="'+id+'"]').length;
			if( sizeCheck > 0 ){
				Hogwarts.ComparePD.removeItemCompare(id);
			}else{
				Hogwarts.ComparePD.addItemCompare(id,url,image,title);
				$('#compareProduct .mainCpPd').addClass('toggleSlide');
			}
		},
		removeItemCompare: function(id){
			$('#compareProduct .listCpPd .compareItem[data-id="'+id+'"]').remove();
			$('.pdCompare a[data-id="'+id+'"]').removeClass('checked');
			$('.btn-compare[data-id="'+id+'"]').removeClass('checked');
			$.removeCookie(id, { path: '/' });
			var $item = $('#compareProduct .listCpPd .compareItem');
			Hogwarts.ComparePD.checkShowCompareBox($item);
		},
		checkShowCompareBox: function($item){
			var number = $item.length;
			switch(number) {
				case 0:
					$('#compareProduct').hide();
					$('#compareProduct .mainCpPd .linkToCompare').hide();
					$('#compareProduct .mainCpPd').removeClass('toggleSlide');
					$('.compare-counter').text(number);
					break;
				case 1:
					$('#compareProduct').fadeIn(500);
					//$('#compareProduct .mainCpPd').addClass('toggleSlide');
					$('#compareProduct .mainCpPd .linkToCompare').fadeOut(500);
					$('.compare-counter').text(number);
					break;
				case 2:
					$('#compareProduct').fadeIn(500);
					//$('#compareProduct .mainCpPd').addClass('toggleSlide');
					$('#compareProduct .mainCpPd .linkToCompare').fadeIn(500);
					$('.compare-counter').text(number);
					break;
				default:

			}
		},
		addItemCompare: function(id,url,image,title){
			var $compare = $('#compareProduct'),
					$wrapcompare = $compare.find('.listCpPd'),
					itemCompare = '';
			itemCompare += '<div class="compareItem" data-id="'+id+'">';
			itemCompare += '<div class="siteItem clearfix">';

			itemCompare += '<div class="imageItem">';
			itemCompare += '<a href="'+url+'"><img src="'+image+'" /></a>';
			itemCompare += '</div>';
			itemCompare += '<div class="detailItem">';
			itemCompare += '<a href="'+url+'">'+title+'</a>';
			itemCompare += '<a class="removeCPItem" href="javascript:void(0)" data-item="'+id+'">Xóa sản phẩm</a>';
			itemCompare += '</div>';

			itemCompare += '</div>';
			itemCompare += '</div>';
			if($wrapcompare.children().length < 2 ){
				console.log("append");
				$wrapcompare.append(itemCompare);
			}else{
				var idRemove = $wrapcompare.find('.compareItem:eq(-1)').data('id');

				console.log("remove");
				Hogwarts.ComparePD.removeItemCompare(idRemove);
				$wrapcompare.append(itemCompare);
			}
			$.cookie(id, url , { expires: 1, path: '/' });
			var $item = $('#compareProduct .listCpPd .compareItem');
			Hogwarts.ComparePD.checkShowCompareBox($item);
		},
		getDefaulItem: function(){
			$.each($.cookie(), function(i, v) {
				//console.log($.cookie());

				var itemURL = v,
						itemID = '';
				if(itemURL.indexOf('product') > 0 ){
					itemID = i;
					$('.btn-compare[data-id="'+itemID+'"]').addClass('checked')
					$('.pdCompare a[data-id="'+itemID+'"]').addClass('checked')
					$.ajax({
						url: itemURL + '.js',
						async: false,
						success: function (product) {
							var id = product.id,
									url = product.url,
									image = product.featured_image,
									title = product.title;
							Hogwarts.ComparePD.addItemCompare(id,url,image,title);
						}
					})
				}
			});
		}
	};
}

var HG = {};
HG.Global = {
	init: function(){
		if(window.HG_vars.template == 'collection'){
			HG.Collections.init();
		}
	}
}

HG.Collections = {
	init: function(){
		this.sortBy();
		this.checkFilter();
		this.filter.init();
	},
	sortBy: function(){
		$('#sortBy').val(window.HG_vars.collection.data.sortBy);
	},
	checkFilter:function(){
		if($(window).width() < 768){
			$('.collectionMainContentLeft .collectionFilter').remove();
		}else{
			$('#sidebarAll .collectionFilter').remove();
		}
	},
	filter: {
		init: function(){
			this.trigger();
		},
		trigger: function(){
			var self = this;
			$('body').on('click', '.collectionFilterClose', function(e){
				e.preventDefault();
				$('.collectionFilter').removeClass('appeared');
			})

			$('body').on('click', '.filterIconOpen', function(e){
				e.preventDefault();
				$('.collectionFilter').addClass('appeared');
			})
			$('body').on('click', '.checkboxFilter', function(){
				self.pick();
				var q = self.query();
				var query = `/search?q=${q}&view=filter`;
				self.fetch(query);
			})
			$('body').on('click', '.collectionFilterMobileApply', function(e){
				e.preventDefault();
				var q = self.query();
				var query = `/search?q=${q}&view=filter`;
				self.fetch(query);
				$('.collectionFilter').removeClass('appeared');
			})
			$('body').on('click', '#pagination.filtered a:not(.current)', function(e){
				e.preventDefault();
				var query = $(this).attr('href');
				self.fetch(query);
			})
			$('body').on('click', '#loadColorFilter', function(e){
				e.preventDefault();
				$(this).parents('.collectionFilterBlock.color').find('li').show();
				$(this).hide();
			})
			$('body').on('click', '.loadNotColorFilter', function(e){
				e.preventDefault();
				$(this).parents('.collectionFilterBlock').find('li').css('display','flex');
				$(this).hide();
			})
			$('body').on('click', '.clearFilter', function(e){
				e.preventDefault();
				$('.collectionFilter input').prop('checked',false);
				$(this).hide();
				var query = `/search?q=filter=(collectionid:product>=0)&view=filter`;
				self.fetch(query);
			})
			$('body').on('change', '#sortBy', function(e){
				self.pick();
				var q = self.query();
				var query = `/search?q=${q}&view=filter`;
				self.fetch(query);
			})
			var min = parseInt(window.HG_vars.collection.filter.config.price.min);
			var max = parseInt(window.HG_vars.collection.filter.config.price.max);
			var step = parseInt(window.HG_vars.collection.filter.config.price.step);
			var timeOutFilter, slidePrice = true;
			var rangeSlider = document.getElementById('priceRange');
		},
		pick: function(){
			if($('.collectionFilter input:checked').length > 0){
				$('.clearFilter').show();
			}else{
				$('.clearFilter').hide();
			}
			window.HG_vars.collection.filter.data = {
				vendors: null,
				types: null,
				sortBy: $('#sortBy').val(),
				prices: window.HG_vars.collection.filter.data.prices,
				tags: null,
				variants: {
					option1:null,
					option2:null,
					option3:null,
				}
			}
			$('.checkboxFilter:checked').each(function(){
				var name = $(this).attr('name');
				var value = $(this).val();
				switch(name){
					case 'typeFilter':
						if(window.HG_vars.collection.filter.data.types){
							if($.inArray(value, window.HG_vars.collection.filter.data.types) === -1){
								window.HG_vars.collection.filter.data.types.push(value);
							}
						}else{
							window.HG_vars.collection.filter.data.types = [value];
						}
						break;
					case 'tagFilter':
						if(window.HG_vars.collection.filter.data.tags){
							if($.inArray(value, window.HG_vars.collection.filter.data.tags) === -1){
								window.HG_vars.collection.filter.data.tags.push(value);
							}
						}else{
							window.HG_vars.collection.filter.data.tags = [value];
						}
						break;
					case 'priceFilter':
						if(window.HG_vars.collection.filter.data.price){
							if($.inArray(value, window.HG_vars.collection.filter.data.price) === -1){
								window.HG_vars.collection.filter.data.price.push(value);
							}
						}else{
							window.HG_vars.collection.filter.data.price = [value];
						}
						break;
					case 'vendorFilter':
						if(window.HG_vars.collection.filter.data.vendors){
							if($.inArray(value, window.HG_vars.collection.filter.data.vendors) === -1){
								window.HG_vars.collection.filter.data.vendors.push(value);
							}
						}else{
							window.HG_vars.collection.filter.data.vendors = [value];
						}
						break;
					case 'colorFilter':
						if(window.HG_vars.collection.filter.data.variants.option1){
							if($.inArray(value, window.HG_vars.collection.filter.data.variants.option1) === -1){
								window.HG_vars.collection.filter.data.variants.option1.push(value);
							}
						}else{
							window.HG_vars.collection.filter.data.variants.option1 = [value];
						}
						break;
					case 'sizeFilter':
						if(window.HG_vars.collection.filter.data.variants.option2){
							if($.inArray(value, window.HG_vars.collection.filter.data.variants.option2) === -1){
								window.HG_vars.collection.filter.data.variants.option2.push(value);
							}
						}else{
							window.HG_vars.collection.filter.data.variants.option2 = [value];
						}
						break;
					default:
				}
			})
		},
		query: function(){
			var q = '';
			if(window.HG_vars.collection.data.id.length > 0){
				q += `((collectionid:product${(window.HG_vars.collection.data.id === "0")?'>':'='}${window.HG_vars.collection.data.id}))`;
			}

			/*if(window.HG_vars.collection.filter.data.prices){
				q += `&&((price:product>=${window.HG_vars.collection.filter.data.prices.min})&&(price:product<${window.HG_vars.collection.filter.data.prices.max}))`;
			}*/

			if(window.HG_vars.collection.filter.data.price){
				if(window.HG_vars.collection.filter.data.price.length > 1){
					q += `&&(`;
					$.each(window.HG_vars.collection.filter.data.price, function(i, v){
						if(parseInt(i) == (window.HG_vars.collection.filter.data.price.length - 1)){
							q+= `${window.HG_vars.collection.filter.data.price[i]}`
						}else{
							q+= `${window.HG_vars.collection.filter.data.price[i]}||`
						}
					})
					q += `)`;
				}else{
					q += `&&(${window.HG_vars.collection.filter.data.price})`;
				}
			}

			if(window.HG_vars.collection.filter.data.vendors){
				if(window.HG_vars.collection.filter.data.vendors.length > 1){
					q += `&&(`;
					$.each(window.HG_vars.collection.filter.data.vendors, function(i, v){
						if(parseInt(i) == (window.HG_vars.collection.filter.data.vendors.length - 1)){
							q+= `(vendor:product contains ${window.HG_vars.collection.filter.data.vendors[i]})`
						}else{
							q+= `(vendor:product contains ${window.HG_vars.collection.filter.data.vendors[i]})||`
						}
					})
					q += `)`;
				}else{
					q += `&&((vendor:product contains ${window.HG_vars.collection.filter.data.vendors}))`;
				}
			}

			if(window.HG_vars.collection.filter.data.types){
				if(window.HG_vars.collection.filter.data.types.length > 1){
					q += `&&(`;
					$.each(window.HG_vars.collection.filter.data.types, function(i, v){
						if(parseInt(i) == (window.HG_vars.collection.filter.data.types.length - 1)){
							q+= `(product_type:product contains ${window.HG_vars.collection.filter.data.types[i]})`
						}else{
							q+= `(product_type:product contains ${window.HG_vars.collection.filter.data.types[i]})||`
						}
					})
					q += `)`;
				}else{
					q += `&&((product_type:product contains ${window.HG_vars.collection.filter.data.types}))`;
				}
			}

			if(window.HG_vars.collection.filter.data.tags){
				if(window.HG_vars.collection.filter.data.tags.length > 1){
					q += `&&(`;
					$.each(window.HG_vars.collection.filter.data.tag, function(i, v){
						if(parseInt(i) == (window.HG_vars.collection.filter.data.tag.length - 1)){
							q+= `(tag:product contains ${window.HG_vars.collection.filter.data.tag[i]})`
						}else{
							q+= `(tag:product contains ${window.HG_vars.collection.filter.data.tag[i]})||`
						}
					})
					q += `)`;
				}else{
					q += `&&((tag:product contains ${window.HG_vars.collection.filter.data.tags}))`;
				}
			}

			if(!window.HG_vars.collection.filter.data.viewNotAvailable){
				q += `&&((available:product=true))`;
			}

			if(window.HG_vars.collection.filter.data.variants.option1){
				if(window.HG_vars.collection.filter.data.variants.option1.length > 1){
					q += `&&(`; 
					$.each(window.HG_vars.collection.filter.data.variants.option1, function(i, v){
						if(parseInt(i) == (window.HG_vars.collection.filter.data.variants.option1.length - 1)){
							q+= `(variant:product contains ${window.HG_vars.collection.filter.data.variants.option1[i]})`
						}else{
							q+= `(variant:product contains ${window.HG_vars.collection.filter.data.variants.option1[i]})||`
						}
					})
					q += `)`;
				}else{
					q += `&&((variant:product contains ${window.HG_vars.collection.filter.data.variants.option1}))`;
				}
			}

			if(window.HG_vars.collection.filter.data.variants.option2){
				if(window.HG_vars.collection.filter.data.variants.option2.length > 1){
					q += `&&(`;
					$.each(window.HG_vars.collection.filter.data.variants.option2, function(i, v){
						if(parseInt(i) == (window.HG_vars.collection.filter.data.variants.option2.length - 1)){
							q+= `(variant:product contains ${window.HG_vars.collection.filter.data.variants.option2[i]})`
						}else{
							q+= `(variant:product contains ${window.HG_vars.collection.filter.data.variants.option2[i]})||`
						}
					})
					q += `)`;
				}else{
					q += `&&((variant:product contains ${window.HG_vars.collection.filter.data.variants.option2}))`;
				}
			}
			var filter = `filter=${encodeURIComponent(q)}`;
			if(window.HG_vars.collection.filter.data.sortBy){
				switch(window.HG_vars.collection.filter.data.sortBy){
					case 'manual':
						break;
					case 'title-ascending':
						filter += '&sortby=(title:product=asc)';
						break;
					case 'title-descending':
						filter += '&sortby=(title:product=desc)';
						break;
					case 'price-descending':
						filter += '&sortby=(price:product=desc)';
						break;
					case 'price-ascending':
						filter += '&sortby=(price:product=asc)';
						break;
					case 'created-descending':
						filter += '&sortby=(updated_at:product=desc)';
						break;
					case 'created-ascending': 
						filter += '&sortby=(updated_at:product=asc)';
						break;
					case 'best-selling':
						filter += '&sortby=(sold_quantity:product=desc)';
						break;
					case 'quantity-descending':
						break;
					default:
				}
			}
			return filter;
		},
		fetch: function(query){
			$('.filter-here').html(`<div class="loading"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`);
			console.log(query)
			$.ajax({
				url: query,
				async: true,
				success:function(data){
					console.log(data.length);
					$('.filter-here').html(data);
					$('#pagination').addClass('filtered');
				}
			})
		}
	}
}
HG.Global.init();

$(window).on('load', () => {
	HG2.init();
})



function responsiveVideos() {
	var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"]');
	var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

	$iframeVideo.each(function () {
		// Add wrapper to make video responsive
		$(this).wrap('<div class="video-wrapper"></div>');
	});

	$iframeReset.each(function () {
		// Re-set the src attribute on each iframe after page load
		// for Chrome's "incorrect iFrame content on 'back'" bug.
		// https://code.google.com/p/chromium/issues/detail?id=395791
		// Need to specifically target video and admin bar
		this.src = this.src;
	});
};
$(window).on('load', function () {
	responsiveVideos();
});
var swiper = new Swiper(".home-category .mySwiper", {
	slidesPerView: 1.5,
	spaceBetween: 15,
	scrollbar: {
		el: ".home-category .swiper-scrollbar",
	},
	navigation: {
		nextEl: '.home-category .swiper-button-next',
		prevEl: '.home-category .swiper-button-prev',
	},
	breakpoints: {
		// when window width is >= 640px
		768: {
			slidesPerView: 3.5,
			spaceBetween: 30,
		}
	}
});
var swiper = new Swiper(".topbar .mySwiper", {
	spaceBetween: 0,
	effect: 'fade',
	fadeEffect: {
		crossFade: true
	},
	autoplay: {
		delay: 5000,
	},
	
});


let placeholderText =$('.auto-search').data('placeholder') ? $('.auto-search').data('placeholder').split(';').filter(Boolean) :[]
	placeholderText.length && $('.auto-search').placeholderTypewriter({text: placeholderText});

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}
// handle links with @href started with '#' only
$(document).on('click', 'a[href^="#"]', function(e) {
    // target element id
    var id = $(this).attr('href');

    // target element
    var $id = $(id);
    if ($id.length === 0) {
        return;
    }

    // prevent standard hash navigation (avoid blinking in IE)
    e.preventDefault();

    // top position relative to the document
    var pos = $id.offset().top - $('#header').height();

    // animated top scrolling
    $('body, html').animate({scrollTop: pos});
});

	$('.product-gallery__thumbs').owlCarousel({
		loop: false,
		margin:0,
		responsiveClass:true,
		dots:true,
		nav:true,
		navText: ['<i class="fal fa-angle-left"></i>','<i class="fal fa-angle-right"></i>'],
		autoplay:false,
		responsive:{
			0:{
				items:1
			},
			600:{
				items:1
			},
			1000:{
				items:1
			},
			1200:{
				items:1
			}
		},
	});

