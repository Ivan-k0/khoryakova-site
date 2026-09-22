(function(){
  document.querySelectorAll('.lang-switch a').forEach(function(a){
    a.addEventListener('click', function(){
      try{ localStorage.setItem('ak-lang', a.textContent.trim().toUpperCase()); }catch(e){}
    });
  });

  var header = document.getElementById('site-header');
  if(header){
    window.addEventListener('scroll', function(){
      header.classList.toggle('scrolled', window.scrollY > 8);
    });
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  window.addEventListener('load', function(){
    requestAnimationFrame(function(){
      var shine = document.getElementById('photo-shine');
      if(!shine) return;
      shine.style.transition = 'transform 1.1s cubic-bezier(.16,1,.3,1)';
      shine.style.transform = 'translateX(120%)';
    });
  });
})();
