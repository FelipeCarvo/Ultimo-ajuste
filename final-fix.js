const fs = require('fs');
const path = 'src/app/page/ordem-servico-edicao/ordem-servico-edicao.page.ts';

let c = fs.readFileSync(path, 'utf8');

// 1. Aplica as 3 correções
c = c.replace(
  /motoristaEncontrado = this\.motoristasLista\.find\(m => String\(m\.descricao\)\.toUpperCase\(\)\.trim\(\) === String\(osApi\.colaboradorNome\)\.toUpperCase\(\)\.trim\(\)\)/g,
  'motoristaEncontrado = this.motoristasLista.find(m => String(m.descricao).toUpperCase().trim().includes(String(osApi.colaboradorNome).toUpperCase().trim()))'
);

c = c.replace(
  /const empId = String\(osApi\.emprdId \?\? osApi\.emprdintervencaoId \?\? ''\);/g,
  "const empId = String(osApi.emprdAberturaId ?? osApi.emprdAberturaCod ?? osApi.emprdId ?? '');"
);

c = c.replace(
  /this\.classificacao = classificacaoEncontrada \? String\(classificacaoEncontrada\.id\) : String\(classifId\);/g,
  "this.classificacao = classificacaoEncontrada ? String(classificacaoEncontrada.id) : '';"
);

// 2. Remove apenas linhas que começam com console.log (preservando espaçamento)
c = c.split('\n').filter(line => {
  const trimmed = line.trim();
  return !trimmed.startsWith('console.log');
}).join('\n');

// 3. Limpa linhas em branco excessivas
c = c.replace(/\n\n\n+/g, '\n\n');

fs.writeFileSync(path, c);
console.log('✅ 3 correções aplicadas + todos os console.log removidos!');
