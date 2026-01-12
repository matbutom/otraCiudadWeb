import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const PROJECTS_DIR = './content/projects';
const INDEX_FILE = './content/projects-index.json';

async function buildProjectsIndex() {
  try {
    console.log('🔨 Generando projects-index.json...');

    // Leer todos los archivos en content/projects/
    const files = await readdir(PROJECTS_DIR);
    
    // Filtrar solo archivos .json
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`📄 Encontrados ${jsonFiles.length} proyectos`);

    const projects = [];

    // Leer cada archivo JSON
    for (const file of jsonFiles) {
      const filePath = join(PROJECTS_DIR, file);
      const content = await readFile(filePath, 'utf8');
      
      try {
        const project = JSON.parse(content);
        
        // Extraer solo los campos necesarios para el índice
        projects.push({
          slug: project.slug || file.replace('.json', ''),
          title: project.title || 'Sin título',
          location: project.location || '',
          year: project.year || '',
          coverImage: project.coverImage || '',
          featured: project.featured || false,
          description: project.description || '',
          order: project.order || 999
        });
        
        console.log(`  ✓ ${project.title || file}`);
      } catch (err) {
        console.error(`  ✗ Error parseando ${file}:`, err.message);
      }
    }

    // Ordenar por 'order'
    projects.sort((a, b) => a.order - b.order);

    // Crear el objeto del índice
    const indexData = {
      projects: projects
    };

    // Escribir el archivo
    await writeFile(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf8');
    
    console.log(`✅ Index generado con ${projects.length} proyectos en ${INDEX_FILE}`);
    
  } catch (error) {
    console.error('❌ Error generando index:', error);
    process.exit(1);
  }
}

buildProjectsIndex();