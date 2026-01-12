import fs from 'fs';
import path from 'path';

const projectsDir = './content/projects';
const templatePath = './templates/project-template.html';
const outputFolder = './proyectos'; // Donde se guardarán los .html generados

// Crear carpeta de salida si no existe
if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

async function build() {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
    
    const allProjects = files.map(file => {
        const data = JSON.parse(fs.readFileSync(path.join(projectsDir, file), 'utf-8'));
        
        // --- GENERACIÓN DE HTML INDIVIDUAL ---
        let html = template
            .replace(/{{title}}/g, data.title || '')
            .replace(/{{description}}/g, data.description || '')
            .replace(/{{year}}/g, data.year || '')
            .replace(/{{client}}/g, data.client || '')
            .replace(/{{location}}/g, data.location || '');

        // Generar HTML para Partners
        const partnersHtml = (data.partners || []).map(p => `<p>${p.partner || p}</p>`).join('');
        html = html.replace('{{partners}}', partnersHtml);

        // Generar HTML para Galería (usando rutas relativas correctas)
        const galleryHtml = (data.images || []).map(img => {
            const src = img.image || img;
            return `<img class="project__img" src="../${src}" alt="${data.title}" />`;
        }).join('');
        html = html.replace('{{gallery}}', galleryHtml);

        // Guardar el archivo HTML con el nombre del slug
        fs.writeFileSync(path.join(outputFolder, `${data.slug}.html`), html);
        
        return data;
    });

    // Guardar el índice JSON (para que projects.html siga funcionando)
    fs.writeFileSync('./content/projects-index.json', JSON.stringify({ projects: allProjects }, null, 2));
    console.log(`✅ ¡Éxito! Se generaron ${allProjects.length} páginas de proyecto.`);
}

build();