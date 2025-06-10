#!/usr/bin/env node

const { execSync } = require('child_process');
const { join } = require('path');
const fs = require('fs');

// Ensure bench/fixtures directory exists
const fixturesDir = join(__dirname, 'fixtures');
fs.mkdirSync(fixturesDir, { recursive: true });

// Generate fixture files if they don't exist
const sizes = [1, 5, 25]; // MB sizes
for (const size of sizes) {
  const filePath = join(fixturesDir, `${size}mb.js`);
  if (!fs.existsSync(filePath)) {
    console.log(`Generating ${size}MB fixture...`);
    const generator = join(__dirname, 'fixtures', '1mb.js');
    const content = fs.readFileSync(generator, 'utf8')
      .replace('1024 * 1024', `${size} * 1024 * 1024`);
    fs.writeFileSync(filePath, content);
    execSync(`node ${filePath} > ${filePath}.tmp`);
    fs.renameSync(`${filePath}.tmp`, filePath);
  }
}

// Run benchmarks
console.log('\nRunning benchmarks...\n');
const cli = join(__dirname, '..', 'dist', 'cli.js');

for (const size of sizes) {
  const file = join(fixturesDir, `${size}mb.js`);
  console.log(`Testing ${size}MB file:`);
  
  // Warm up
  execSync(`node ${cli} ${file} > /dev/null`);
  
  // Benchmark different scenarios
  console.time('  No markers');
  execSync(`node ${cli} ${file} > /dev/null`);
  console.timeEnd('  No markers');
  
  console.time('  With ! marker');
  execSync(`node ${cli} ${file} -k "!" > /dev/null`);
  console.timeEnd('  With ! marker');
  
  console.time('  With multiple markers');
  execSync(`node ${cli} ${file} -k "!#*" > /dev/null`);
  console.timeEnd('  With multiple markers');
  
  console.log('');
}

console.log('Benchmark complete!'); 