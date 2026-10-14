/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentItem } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Lei 6.404/1976 - Capítulo I e II: Da Natureza e do Objeto Social',
    type: 'Norma',
    lessonNumber: 2,
    source: 'Presidência da República / Casa Civil',
    summary: 'Dispositivos centrais que fixam a natureza mercantil da companhia independentemente de seu objeto, a responsabilidade limitada dos acionistas e o conceito de capital social.',
    content: `LEI Nº 6.404, DE 15 DE DEZEMBRO DE 1976
Dispõe sobre as Sociedades por Ações.

CAPÍTULO I - Da Caracterização da Sociedade
Art. 1º A companhia ou sociedade anônima terá o capital dividido em ações, e a responsabilidade dos sócios ou acionistas será limitada ao preço de emissão das ações subscritas ou adquiridas.

Art. 2º Pode ser objeto da companhia qualquer empresa de fim lucrativo, não contrário à lei, à ordem pública e aos bons costumes.
§ 1º Qualquer que seja o objeto, a companhia é mercantil e se rege pelas leis e usos do comércio.
§ 2º O estatuto social definirá o objeto de modo preciso e completo.
§ 3º A companhia pode ter por objeto participar de outras sociedades; ainda que não prevista no estatuto, a participação é facultada como meio de realizar o objeto social, ou para beneficiar-se de incentivos fiscais.

Art. 3º A sociedade será designada por denominação acompanhada das expressões "companhia" ou "sociedade anônima", expressas por extenso ou abreviadamente mas vedada a utilização da primeira ao final.`,
    dateAdded: '2026-08-15',
    tags: ['Lei das S/A', 'Natureza Jurídica', 'Capital Social']
  },
  {
    id: 'doc-2',
    title: 'Código Civil (Lei 10.406/2002) - Da Sociedade Limitada (Arts. 1.052 a 1.059)',
    type: 'Norma',
    lessonNumber: 2,
    source: 'Presidência da República / Casa Civil',
    summary: 'Regime jurídico da Sociedade Limitada, responsabilidade solidária pela integralização do capital social e aplicação supletiva.',
    content: `SUBTÍTULO II - Das Sociedades Personificadas
CAPÍTULO IV - Da Sociedade Limitada
Seção I - Disposições Preliminares

Art. 1.052. Na sociedade limitada, a responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social.
§ 1º A sociedade limitada pode ser constituída por 1 (uma) ou mais pessoas.
§ 2º Se for unipessoal, aplicar-se-ão ao documento de constituição do sócio único, no que couber, as disposições sobre o contrato social.

Art. 1.053. A sociedade limitada rege-se, nas omissões deste Capítulo, pelas normas da sociedade simples.
Parágrafo único. O contrato social poderá prever a regência supletiva da sociedade limitada pelas normas da sociedade anônima.

Art. 1.055. O capital social divide-se em quotas, iguais ou desiguais, cabendo uma ou diversas a cada sócio.
§ 1º Pela exata estimação de bens conferidos ao capital social respondem solidariamente todos os sócios, até o prazo de cinco anos da data do registro da sociedade.
§ 2º É vedada contribuição que consista em prestação de serviços.`,
    dateAdded: '2026-08-16',
    tags: ['Código Civil', 'Limitada', 'Quotas']
  },
  {
    id: 'doc-3',
    title: 'Doutrina: A Função de Garantia e a Cifra do Capital Social',
    type: 'Doutrina',
    lessonNumber: 4,
    source: 'CARVALHOSA, Modesto. Comentários à Lei das Sociedades Anônimas, Saraiva',
    summary: 'Estudo clássico sobre a separação dogmática entre capital social e patrimônio líquido, demonstrando que o capital é cifra contábil inflexível de proteção aos credores.',
    content: `Excertos da obra:
"O capital social é uma cifra matemática de retenção patrimonial. Ele não representa um montante físico de moeda guardado nos cofres da companhia, mas sim um índice de referência jurídica que fixa o patamar abaixo do qual os credores não podem ver diminuído o patrimônio da sociedade por atos voluntários de distribuição de lucros aos acionistas.

Desta distinção capital/patrimônio decorrem três regras axiológicas fundamentais:
1. O princípio da determinação (ou fixidez): o capital social deve estar explicitado em cifra monetária clara no estatuto;
2. O princípio da intangibilidade: os acionistas não podem retirar bens da sociedade a título de partilha de lucro se o patrimônio líquido for inferior ao capital social;
3. O princípio da realidade: os bens que ingressam na formação do capital devem ser avaliados com rigoroso critério econômico por peritos independentes, de modo a evitar a subscrição com ativos sobreavaliados que configurem 'capital aguado'."`,
    dateAdded: '2026-08-28',
    tags: ['Doutrina', 'Capital Social', 'Modesto Carvalhosa']
  },
  {
    id: 'doc-4',
    title: 'Precedente CVM: Dever de Diligência e a Business Judgment Rule (PAS CVM nº 19957.004128)',
    type: 'Parecer CVM',
    lessonNumber: 12,
    source: 'Comissão de Valores Mobiliários (CVM) - Colegiado',
    summary: 'Julgamento histórico do Colegiado da CVM sobre o standard do Art. 153 da Lei 6.404/76 e os requisitos cumulativos para invocação da Business Judgment Rule.',
    content: `COMISSÃO DE VALORES MOBILIÁRIOS - PROCESSO ADMINISTRATIVO SANCIONADOR
Relator: Diretor Otavio Yazbek
EMENTA:
1. O dever de diligência (art. 153 da Lei 6.404/1976) consagra obrigação de meio e não de resultado. O administrador de companhia aberta deve atuar com o zelo, cuidado e técnica que todo homem ativo e probo empregaria no trato de seus próprios interesses.
2. A análise a posteriori de decisões negociais não pode incorrer em viés de resultado (hindsight bias). Para a aplicação da Business Judgment Rule pelo regulador brasileiro, exigem-se cumulativamente:
   a) Inexistência de conflito de interesses ou quebra de lealdade;
   b) Decisão devidamente informada, precedida de estudos técnicos e pareceres adequados;
   c) Decisão tomada dentro dos poderes conferidos pelo estatuto social e de boa-fé no exclusivo interesse da companhia.
3. Havendo o preenchimento de tais balizas, o mérito comercial do negócio não é passível de sanção administrativa pela CVM, preservando-se a discricionariedade empresarial legítima.`,
    dateAdded: '2026-09-02',
    tags: ['CVM', 'Dever de Diligência', 'Business Judgment Rule', 'Art. 153']
  },
  {
    id: 'doc-5',
    title: 'STJ - Terceira Turma: Validade e Execução Específica do Acordo de Acionistas (REsp 1.734.280/SP)',
    type: 'Jurisprudência',
    lessonNumber: 8,
    source: 'Superior Tribunal de Justiça (STJ) - Rel. Min. Ricardo Villas Bôas Cueva',
    summary: 'Eficácia plena do acordo de acionistas arquivado na sede da companhia e a imperatividade da regra do Art. 118, § 8º da Lei 6.404/76.',
    content: `SUPERIOR TRIBUNAL DE JUSTIÇA - RECURSO ESPECIAL Nº 1.734.280 - SP
Relator: Ministro Ricardo Villas Bôas Cueva
RECURSO ESPECIAL. DIREITO SOCIETÁRIO. SOCIEDADE ANÔNIMA. ACORDO DE ACIONISTAS ARQUIVADO NA SEDE SOCIAL. CLÁUSULA DE SINDICATO DE VOTO. VOTO PROFERIDO EM DESCONFORMIDADE COM A DELIBERAÇÃO PRÉVIA DO BLOCO. DEVER DO PRESIDENTE DA ASSEMBLEIA DE NÃO COMPUTAR O VOTO INFRATOR. EXECUÇÃO ESPECÍFICA IN RE IPSA.

1. O art. 118 da Lei nº 6.404/1976 institui a mais expressiva forma de tutela específica das obrigações de votar no ordenamento jurídico brasileiro.
2. Estando o acordo parassocietário arquivado na sede da companhia, adquire ele eficácia vinculante não apenas entre os pactuantes, mas também perante a própria sociedade empresária e a mesa diretora da assembleia geral.
3. Diante de voto manifestado com infringência ao comando do pacto prévio de bloco, o Presidente da Assembleia não possui faculdade, mas o dever legal cogente de não computar a manifestação recalcitrante, declarando eleito o voto acordado previamente.
4. Recurso Especial provido.`,
    dateAdded: '2026-09-10',
    tags: ['STJ', 'Acordo de Acionistas', 'Art. 118', 'Execução Específica']
  },
  {
    id: 'doc-6',
    title: 'Parecer de Orientação CVM nº 35: Reorganizações Societárias entre Partes Relacionadas',
    type: 'Parecer CVM',
    lessonNumber: 14,
    source: 'Comissão de Valores Mobiliários (CVM)',
    summary: 'Diretrizes da CVM para assegurar a comutatividade e equidade na relação de substituição de ações em incorporações e fusões de sociedades sob controle comum.',
    content: `PARECER DE ORIENTAÇÃO CVM Nº 35, DE 1º DE SETEMBRO DE 2008
Assunto: Operações de fusão, incorporação e incorporação de ações envolvendo sociedade controladora e suas controladas ou sociedades sob controle comum.

1. A realização de operações societárias entre partes relacionadas traz ínsito o potencial conflito de interesses entre o acionista controlador e os acionistas minoritários, mormente na fixação da relação de troca de ações (exchange ratio).
2. A CVM recomenda enfaticamente a constituição de Comitê Especial Independente, composto majoritariamente por membros sem vínculo com os acionistas controladores, para negociar os termos da transação societária.
3. Recomenda-se a confecção de laudos de avaliação patrimonial com metodologia uniforme (ex: fluxo de caixa descontado) para ambas as entidades envolvidas, assegurando transparência irrestrita aos acionistas que votarão na assembleia geral extraordinária.`,
    dateAdded: '2026-09-18',
    tags: ['Parecer CVM 35', 'Reorganizações', 'M&A', 'Partes Relacionadas']
  },
  {
    id: 'doc-7',
    title: 'STJ - Segunda Seção: Apuração de Haveres em Dissolução Parcial (REsp 1.877.339/PR)',
    type: 'Jurisprudência',
    lessonNumber: 16,
    source: 'Superior Tribunal de Justiça (STJ) - Rel. Min. Marco Aurélio Bellizze',
    summary: 'Critério legal inderrogável do balanço de determinação a valor de saída para apuração de haveres na dissolução parcial de sociedade limitada.',
    content: `SUPERIOR TRIBUNAL DE JUSTIÇA - RECURSO ESPECIAL Nº 1.877.339 - PR
Relator: Ministro Marco Aurélio Bellizze
EMENTA: DIREITO EMPRESARIAL E PROCESSUAL CIVIL. DISSOLUÇÃO PARCIAL DE SOCIEDADE LIMITADA. APURAÇÃO DE HAVERES. OMISSÃO CONTRATUAL. BALANÇO DE DETERMINAÇÃO. ART. 606 DO CPC/2015.

1. Na ausência de critério contratual válido e expresso, a liquidação da quota do sócio retirante deve refletir o valor real e de mercado da empresa caso ela fosse integralmente alienada na data-base da resolução.
2. O balanço de determinação deve mensurar todos os ativos tangíveis e intangíveis (inclusive o aviamento/goodwill gerado pela atividade) a preço de saída, além do passivo contingente.
3. Impossibilidade de adoção de balanço patrimonial histórico ou valor nominal de livro, sob pena de enriquecimento sem causa dos sócios remanescentes em detrimento do sócio retirante.`,
    dateAdded: '2026-09-22',
    tags: ['STJ', 'Dissolução Parcial', 'Apuração de Haveres', 'CPC Art. 606']
  }
];
