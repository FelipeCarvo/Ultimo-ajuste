const fs = require('fs');
const path = 'src/app/page/ordem-servico-edicao/ordem-servico-edicao.page.ts';

let c = fs.readFileSync(path, 'utf8');

// Correção 1: Operador/Motorista - includes ao invés de ===
c = c.replace(
  /motoristaEncontrado = this\.motoristasLista\.find\(m => String\(m\.descricao\)\.toUpperCase\(\)\.trim\(\) === String\(osApi\.colaboradorNome\)\.toUpperCase\(\)\.trim\(\)\)/g,
  'motoristaEncontrado = this.motoristasLista.find(m => String(m.descricao).toUpperCase().trim().includes(String(osApi.colaboradorNome).toUpperCase().trim()))'
);

// Correção 2: Empreendimento - usar emprdAberturaId/emprdAberturaCod
c = c.replace(
  /const empId = String\(osApi\.emprdId \?\? osApi\.emprdintervencaoId \?\? ''\);/g,
  "const empId = String(osApi.emprdAberturaId ?? osApi.emprdAberturaCod ?? osApi.emprdId ?? '');"
);

// Correção 3: Classificação - não setar valor não encontrado
c = c.replace(
  /this\.classificacao = classificacaoEncontrada \? String\(classificacaoEncontrada\.id\) : String\(classifId\);/g,
  "this.classificacao = classificacaoEncontrada ? String(classificacaoEncontrada.id) : '';"
);

fs.writeFileSync(path, c);
console.log('✅ Todas as 3 correções aplicadas!');
