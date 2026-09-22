(function(){
  document.querySelectorAll('.lang-switch a[data-lang]').forEach(function(a){
    a.addEventListener('click', function(){
      try{ localStorage.setItem('ak-lang', a.getAttribute('data-lang')); }catch(e){}
    });
  });

  var header = document.getElementById('site-header');
  if(header){
    window.addEventListener('scroll', function(){
      header.classList.toggle('scrolled', window.scrollY > 8);
    });
  }

  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if(navToggle && navLinks){
    var closeMenu = function(){
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', function(){
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeMenu);
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
