(async function initHeroCarousel(){
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".heroSlide");
  if (slides.length < 2) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // base path del sitio (sirve para github pages /repo/ y para local)
  // ejemplo: /otraCiudadWeb/index.html -> /otraCiudadWeb/
  const basePath = window.location.pathname.replace(/\/[^\/]*$/, "/");

  // Carga lista desde JSON
  let data;
  try{
    const res = await fetch(basePath + "content/hero-images.json", { cache: "no-store" });
    if(!res.ok) throw new Error("No se pudo cargar hero-images.json");
    data = await res.json();
  }catch(err){
    console.error(err);
    return;
  }

  const imagesRaw = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  if (imagesRaw.length === 0) return;

  // normaliza rutas del json:
  // - quita slash inicial si viene con "/assets/..."
  // - y construye url correcta dentro del subpath del repo
  const images = imagesRaw
    .map(src => String(src).replace(/^\//, ""))
    .map(src => basePath + src);

  const intervalMs = Number(data.intervalMs) || 3500;

  // Preload (suave)
  images.slice(0, 4).forEach(src => { const im = new Image(); im.src = src; });

  // Estado
  let index = 0;
  let active = 0; // 0 o 1

  // Set primera
  slides[active].src = images[index];
  slides[active].classList.add("is-active");

  function nextIndex(){
    index = (index + 1) % images.length;
    return images[index];
  }

  function swap(){
    const nextSrc = nextIndex();
    const next = active === 0 ? 1 : 0;

    // Preload próximo
    const im = new Image();
    im.onload = () => {
      slides[next].src = nextSrc;

      // Fade
      slides[next].classList.add("is-active");
      slides[active].classList.remove("is-active");
      active = next;
    };
    im.onerror = () => {
      // si falla, intentamos saltar a la siguiente
      console.warn("No se pudo cargar:", nextSrc);
      swap();
    };
    im.src = nextSrc;
  }

  if (!prefersReduced){
    setInterval(swap, intervalMs);
  } else {
    // Sin animación: igual rota pero sin transición
    setInterval(() => {
      slides[active].classList.add("is-active");
      slides[active].src = nextIndex();
    }, intervalMs);
  }
})();
