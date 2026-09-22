(function(){
  try{
    // Skip the auto-redirect entirely for search engine crawlers and other
    // bots — they have no real "device language", so this would otherwise
    // make every language mirror look like it permanently redirects away
    // to a bot with no stored preference, which stops search engines from
    // indexing each language version at its own URL. Real visitors still
    // get the convenience redirect below.
    if(/bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|preview/i.test(navigator.userAgent || '')) return;
    var path = location.pathname;
    var onLang = (path === '/en' || path.indexOf('/en/') === 0) ? 'EN'
      : (path === '/ru' || path.indexOf('/ru/') === 0) ? 'RU'
      : 'UK';
    var stored = localStorage.getItem('ak-lang');
    var wantLang;
    if(stored === 'UK' || stored === 'EN' || stored === 'RU'){ wantLang = stored; }
    else {
      var browserLang = ((navigator.language || (navigator.languages && navigator.languages[0]) || '') + '').toLowerCase();
      wantLang = browserLang.indexOf('ru') === 0 ? 'RU' : browserLang.indexOf('en') === 0 ? 'EN' : 'UK';
    }
    if(wantLang !== onLang){
      var rest = onLang === 'UK' ? path : (path.slice(3) || '/');
      var newPath = wantLang === 'UK' ? rest : '/' + wantLang.toLowerCase() + rest;
      if(newPath !== path){
        location.replace(newPath + location.search + location.hash);
      }
    }
  }catch(e){}
})();
