import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const program = new Command();

// Налаштування параметрів командного рядка
program
  .requiredOption('-i, --input <path>', 'Path to input JSON file')
  .option('-o, --output <path>', 'Path to output file')
  .option('-d, --display', 'Display result in console')
  .option('-v, --variety', 'Display flower variety')
  .option('-l, --length <value>', 'Display only records with petal length greater than specified', parseFloat);

program.parse(process.argv);
const options = program.opts();

// Перевірка обов'язкового параметра
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевірка існування файлу
if (!existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Читання файлу
let fileContent;
try {
  fileContent = readFileSync(options.input, 'utf8');
} catch (error) {
  console.error('Error reading file:', error.message);
  process.exit(1);
}

// Парсинг JSON (кожен рядок - окремий JSON об'єкт)
const lines = fileContent.trim().split('\n');
let data = [];

for (const line of lines) {
  try {
    const record = JSON.parse(line);
    data.push(record);
  } catch (error) {
    console.error('Error parsing JSON line:', error.message);
  }
}

// Фільтрація за довжиною пелюстки (якщо вказано параметр -l)
if (options.length !== undefined) {
  data = data.filter(record => record['petal.length'] > options.length);
}

// Формування виводу
let output = '';
for (const record of data) {
  const petalLength = record['petal.length'];
  const petalWidth = record['petal.width'];
  
  let line = `${petalLength} ${petalWidth}`;
  
  // Додавання variety якщо вказано параметр -v
  if (options.variety) {
    line += ` ${record.variety}`;
  }
  
  output += line + '\n';
}

// Вивід результатів
// Якщо не задано жодного з параметрів -o або -d - нічого не виводимо
if (!options.output && !options.display) {
  // Нічого не робимо
  process.exit(0);
}

// Вивід у консоль якщо задано -d
if (options.display) {
  console.log(output.trim());
}

// Запис у файл якщо задано -o
if (options.output) {
  try {
    writeFileSync(options.output, output.trim(), 'utf8');
  } catch (error) {
    console.error('Error writing to file:', error.message);
    process.exit(1);
  }
}