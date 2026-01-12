import fs from 'fs';
import path from 'path';

const projectsDir = './content/projects';
const templatePath = './templates/project-template.html';
const outputFolder = './proyectos';

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

async function build() {
    try {
        const template = fs.readFileSync(templatePath, 'utf-8');
        const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
        
        const allProjects = files.map(file => {
            const filePath = path.join(projectsDir, file);
            const rawContent = fs.readFileSync(filePath, 'utf-8').trim();
            
            // 1. Omitir si el archivo está vacío
            if (!rawContent) {
                console.warn(`⚠️ Saltando archivo vacío: ${file}`);
                return null;
            }

            try {
                const data = JSON.parse(rawContent);
                if (!data.slug) return null; // Ignorar si no tiene slug

                // 2. Generar HTML Individual
                let html = template
                    .replace(/{{title}}/g, data.title || '')
                    .replace(/{{description}}/g, data.description || '')
                    .replace(/{{year}}/g, data.year || '')
                    .replace(/{{client}}/g, data.client || '')
                    .replace(/{{location}}/g, data.location || '');

                const partnersHtml = (data.partners || []).map(p => `<p>${p.partner || p}</p>`).join('');
                html = html.replace('{{partners}}', partnersHtml);

                const galleryHtml = (data.images || []).map(img => {
                    const src = img.image || img;
                    return `<img class="project__img" src="../${src}" alt="${data.title}" />`;
                }).join('');
                html = html.replace('{{gallery}}', galleryHtml);

                fs.writeFileSync(path.join(outputFolder, `${data.slug}.html`), html);
                return data;

            } catch (parseError) {
                // 3. Informar qué archivo específico tiene el error
                console.error(`❌ Error de formato JSON en: ${file}`);
                return null;
            }
        }).filter(p => p !== null);

        // 4. Guardar índices finales
        fs.writeFileSync('./content/projects-index.json', JSON.stringify({ projects: allProjects }, null, 2));
        const featured = allProjects.filter(p => p.featured === true);
        fs.writeFileSync('./content/featured-projects.json', JSON.stringify({ projects: featured }, null, 2));

        console.log(`✅ Éxito: Se generaron ${allProjects.length} proyectos.`);
    } catch (e) {
        console.error("❌ Error crítico:", e);
        process.exit(1);
    }
}

build();