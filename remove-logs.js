const fs = require('fs');
const path = 'src/app/page/ordem-servico-edicao/ordem-servico-edicao.page.ts';

let c = fs.readFileSync(path, 'utf8');

// Remove TODAS as linhas que contêm console.log
c = c.split('\n').filter(line => !line.includes('console.log')).join('\n');

// Remove linhas em branco excessivas (3+ em sequência)
c = c.replace(/\n\n\n+/g, '\n\n');

fs.writeFileSync(path, c);
console.log('✅ Todos os console.log removidos!');
