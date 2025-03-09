$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ref = urlParams.get('ref');
    const cookieName = 'shop_ref';
    // const guCart = urlParams.get('gucart');
    if (ref) {
      function getCookie(cname) {
        let name = cname + '=';
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return '';
      }
  
      let domain = window.location.origin;
      const code = getCookie(cookieName);
      const host = 'https://api.growthup.vn/api/summary/click';
      if (domain && code) {
        domain = domain + '/';
        var xmlHttp = new XMLHttpRequest(); // new HttpRequest instance
        xmlHttp.open('POST', host);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(JSON.stringify({ domain, code }));
      }
      // if (domain && code && guCart) {
      //   window.location = domain + 'cart/' + guCart;
      // }
    } else {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      function deleteCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
      deleteCookie(cookieName);
    }
  });