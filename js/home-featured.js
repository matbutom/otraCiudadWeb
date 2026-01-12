(function () {
  const mount = document.getElementById("homeFeatured");
  if (!mount) return;

  const basePath = window.location.pathname.includes("/otraCiudadWeb/")
    ? "/otraCiudadWeb"
    : "";

  fetch(`${basePath}/content/projects-index.json`)
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar projects-index.json");
      return r.json();
    })
    .then((data) => {
      const projects = (data.projects || data || []).filter(Boolean);

      const featured = projects
        .filter((p) => p.featured)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .slice(0, 4);

      // fallback si nadie marcó featured
      const list = featured.length ? featured : projects.slice(0, 4);

      mount.innerHTML = list
        .map(
          (p) => `
          <div class="homeRow">
            <article class="projItem">
              <p class="projItem__desc">${p.description || ""}</p>
              <div class="projItem__row">
                <h2 class="projItem__title">${String(p.title || "").replace(" ", "<br/>")}</h2>
                <p class="projItem__place">${p.location || ""}</p>
              </div>
            </article>
            <div class="imgMask">
              <img class="stackImg" src="${basePath}/${p.coverImage}" alt="${p.title || ""}" />
            </div>
          </div>
        `
        )
        .join("");
    })
    .catch((e) => {
      console.error(e);
    });
})();
