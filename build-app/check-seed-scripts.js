const fs = require('fs');
const path = require('path');

/**
 * Проверка seed скриптов
 */
async function checkSeedScripts() {
  try {
    console.log("🔍 Проверка seed скриптов...");
    
    // Проверяем директорию seeders
    const seedersDir = './app/seeders';
    
    if (fs.existsSync(seedersDir)) {
      console.log("✅ Директория seeders существует");
      
      const files = fs.readdirSync(seedersDir);
      console.log("📋 Файлы в директории seeders:");
      files.forEach(file => {
        console.log(`- ${file}`);
      });
      
      // Проверяем, есть ли материалы в seed файлах
      files.forEach(file => {
        if (file.includes('material')) {
          const filePath = path.join(seedersDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          console.log(`📋 Содержимое файла ${file}:`);
          
          // Ищем bulkCreate с материалами
          if (content.includes('bulkCreate') && content.includes('material')) {
            console.log("  ⚠️  Найден bulkCreate с материалами");
            
            // Ищем количество материалов
            const bulkCreateMatch = content.match(/bulkCreate\(\[[\s\S]*?\]\)/);
            if (bulkCreateMatch) {
              const materialsArray = bulkCreateMatch[0];
              const materialCount = (materialsArray.match(/\{/g) || []).length;
              console.log(`  📊 Количество материалов: ${materialCount}`);
            }
          }
          
          // Ищем старые названия материалов
          const oldMaterials = ['Пеноблок', 'Блок керамзитобетонный', 'Арматура стальная А500С'];
          oldMaterials.forEach(mat => {
            if (content.includes(mat)) {
              console.log(`  ⚠️  Найден старый материал: ${mat}`);
            }
          });
        }
      });
      
    } else {
      console.log("❌ Директория seeders не существует");
    }
    
    // Проверяем package.json на наличие seed скриптов
    const packageJsonPath = './package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      console.log("📋 Скрипты в package.json:");
      if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach(script => {
          console.log(`- ${script}: ${packageJson.scripts[script]}`);
        });
      }
    }
    
    // Проверяем app.js на наличие автоматического seed
    const appJsPath = './app.js';
    if (fs.existsSync(appJsPath)) {
      const appJsContent = fs.readFileSync(appJsPath, 'utf8');
      
      console.log("🔍 Проверка app.js на автоматический seed:");
      
      if (appJsContent.includes('seed') || appJsContent.includes('sync')) {
        console.log("  ⚠️  Найден автоматический seed или sync в app.js");
        
        // Ищем конкретные строки
        const lines = appJsContent.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('seed') || line.includes('sync')) {
            console.log(`  📋 Строка ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
    
    // Проверяем server.js на наличие автоматического seed
    const serverJsPath = './server.js';
    if (fs.existsSync(serverJsPath)) {
      const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
      
      console.log("🔍 Проверка server.js на автоматический seed:");
      
      if (serverJsContent.includes('seed') || serverJsContent.includes('sync')) {
        console.log("  ⚠️  Найден автоматический seed или sync в server.js");
        
        // Ищем конкретные строки
        const lines = serverJsContent.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('seed') || line.includes('sync')) {
            console.log(`  📋 Строка ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
    
    console.log("🎉 Проверка seed скриптов завершена!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Ошибка при проверке seed скриптов:", error);
    process.exit(1);
  }
}

checkSeedScripts();
