const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'content/projects');
const outputFile = path.join(__dirname, 'content/projects-index.json');

function generateIndex() {
  try {
    // Leer todos los archivos .json de la carpeta de proyectos
    const files = fs.readdirSync(projectsDir);
    const allProjects = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join(projectsDir, file), 'utf8');
        return JSON.parse(content);
      });

    // Ordenar por el campo 'order' definido en tu config.yml
    allProjects.sort((a, b) => (a.order || 99) - (b.order || 99));

    // Crear el objeto final
    const data = {
      projects: allProjects,
      // Generamos la lista de destacados filtrando por el booleano 'featured'
      featured: allProjects.filter(p => p.featured === true)
    };

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`✅ Índice actualizado: ${allProjects.length} proyectos (${data.featured.length} destacados).`);
  } catch (error) {
    console.error("❌ Error en el build:", error);
    process.exit(1);
  }
}

generateIndex();