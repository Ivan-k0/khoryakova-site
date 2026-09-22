(function(){
  try{
    // Skip the auto-redirect entirely for search engine crawlers and other
    // bots — they have no real "device language", so this would otherwise
    // make every language mirror look like it permanently redirects away
    // to a bot with no stored preference, which stops search engines from
    // indexing each language version at its own URL. Real visitors still
    // get the convenience redirect below.
    if(/bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|preview/i.test(navigator.userAgent || '')) return;

    // Derive the site's root path dynamically from this script's own
    // resolved URL instead of assuming it's served from the domain root.
    // That keeps this working unchanged both under a GitHub Pages project
    // subpath (e.g. /khoryakova-site/) during preview and later at the
    // real domain's root once a custom domain is attached.
    var scriptSrc = document.currentScript && document.currentScript.src;
    var rootPath = '/';
    if(scriptSrc){
      var m = scriptSrc.match(/^(https?:\/\/[^/]+)(\/.*?)assets\/js\/lang-redirect\.js/);
      if(m) rootPath = m[2];
    }

    var fullPath = location.pathname;
    var relPath = fullPath.indexOf(rootPath) === 0 ? fullPath.slice(rootPath.length) : fullPath.replace(/^\//, '');

    var onLang = /^en(\/|$)/.test(relPath) ? 'EN' : /^ru(\/|$)/.test(relPath) ? 'RU' : 'UK';
    var stored = localStorage.getItem('ak-lang');
    var wantLang;
    if(stored === 'UK' || stored === 'EN' || stored === 'RU'){ wantLang = stored; }
    else {
      var browserLang = ((navigator.language || (navigator.languages && navigator.languages[0]) || '') + '').toLowerCase();
      wantLang = browserLang.indexOf('ru') === 0 ? 'RU' : browserLang.indexOf('en') === 0 ? 'EN' : 'UK';
    }

    if(wantLang !== onLang){
      var bare = relPath.replace(/^(en|ru)\//, '').replace(/^(en|ru)$/, '');
      var newRelPath = wantLang === 'UK' ? bare : wantLang.toLowerCase() + '/' + bare;
      var newFullPath = rootPath + newRelPath;
      if(newFullPath !== fullPath){
        location.replace(newFullPath + location.search + location.hash);
      }
    }
  }catch(e){}
})();
