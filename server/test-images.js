const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
console.log('Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Uploads directory does not exist');
  process.exit(1);
}

const files = fs.readdirSync(uploadDir);
console.log('Files in uploads directory:', files);

files.forEach(file => {
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
  console.log(file, 'isImage:', isImage);
  
  if (isImage) {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    console.log(file, 'size:', stats.size, 'bytes');
  }
});