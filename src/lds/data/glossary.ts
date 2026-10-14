/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GlossaryTerm } from '../types';

export const INITIAL_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'affectio-societatis',
    term: 'Affectio Societatis',
    latinOrEnglish: 'Affectio Societatis',
    category: 'Societário Básico',
    definition: 'Vontade contínua e qualificada dos sócios de unirem esforços e patrimônio em comunhão para a consecução do escopo social lucrativo. É elemento essencial nas sociedades de pessoas (como a LTDA em regra), cuja quebra autoriza a dissolução parcial.',
    legalBasis: 'Código Civil, Art. 981 e Art. 1.034',
    lessonNumber: 2,
    practicalExample: 'A perda de confiança recíproca entre dois sócios administradores de uma sociedade limitada impede o prosseguimento da gestão, motivando a quebra da affectio societatis e o pedido de retirada com apuração de haveres.',
    tags: ['Sociedade de Pessoas', 'Dissolução Parcial', 'Limitada']
  },
  {
    id: 'acordo-acionistas',
    term: 'Acordo de Acionistas (Pacto Parassocietário)',
    latinOrEnglish: 'Shareholders Agreement',
    category: 'Governança & Fiduciário',
    definition: 'Contrato plurilateral celebrado entre sócios ou acionistas que disciplina matérias como compra e venda de ações, preferência, sindicato de voto e exercício do poder de controle. Quando arquivado na sede da companhia, goza de eficácia real interna e execução específica.',
    legalBasis: 'Lei 6.404/76, Art. 118',
    lessonNumber: 8,
    practicalExample: 'Dois fundos de investimento celebram acordo de voto prévio para eleger três membros do Conselho de Administração da companhia, sendo a mesa da assembleia obrigada a desconsiderar qualquer voto divergente proferido em plenário.',
    tags: ['Art. 118', 'Sindicato de Voto', 'Governança']
  },
  {
    id: 'acionista-controlador',
    term: 'Acionista Controlador',
    latinOrEnglish: 'Controlling Shareholder',
    category: 'Governança & Fiduciário',
    definition: 'Pessoa física, jurídica ou grupo sob controle comum que é titular de direitos societários que lhe asseguram a maioria dos votos nas deliberações assembleares e o poder efetivo de eleger a maioria dos administradores e ditar os rumos estratégicos da empresa.',
    legalBasis: 'Lei 6.404/76, Art. 116 e Art. 117',
    lessonNumber: 10,
    practicalExample: 'O controlador que desvia recursos da companhia para beneficiar outra sociedade de seu grupo econômico comete abuso de poder de controle, respondendo civilmente perante os acionistas minoritários prejudicados.',
    tags: ['Poder de Controle', 'Abuso de Poder', 'Fiduciário']
  },
  {
    id: 'agio-subscricao',
    term: 'Ágio na Emissão de Ações',
    latinOrEnglish: 'Share Premium',
    category: 'Mercado de Capitais',
    definition: 'Montante pago pelo subscritor de novas ações que excede o respectivo valor nominal ou a parcela destinada à formação da cifra estrita do capital social. O ágio é carreado diretamente para a conta de Reserva de Capital da companhia, sem transitar pelo resultado do exercício.',
    legalBasis: 'Lei 6.404/76, Art. 13, § 2º e Art. 182, § 1º',
    lessonNumber: 4,
    practicalExample: 'Em rodada de investimento Série A, a startup emite novas ações com valor de R$ 1,00 para o capital social e R$ 9,00 de ágio por ação, evitando a diluição do valor patrimonial prévio dos fundadores.',
    tags: ['Capital Social', 'Reserva de Capital', 'Funding']
  },
  {
    id: 'autonomia-patrimonial',
    term: 'Autonomia Patrimonial',
    latinOrEnglish: 'Corporate Entity Veil',
    category: 'Societário Básico',
    definition: 'Princípio cardeal que estabelece a separação inequívoca entre o patrimônio da pessoa jurídica e o patrimônio individual de seus sócios ou administradores. Os bens da sociedade não respondem, em regra, pelas dívidas particulares dos sócios, e vice-versa.',
    legalBasis: 'Código Civil, Art. 49-A e Art. 1.052',
    lessonNumber: 2,
    practicalExample: 'Dívidas bancárias contraídas pela sociedade empresária devem ser executadas primeiramente contra os ativos registrados no CNPJ da empresa, salvo se configurada fraude ou confusão patrimonial ensejadora da desconsideração da personalidade jurídica.',
    tags: ['Art. 49-A', 'Personalidade Jurídica', 'Responsabilidade']
  },
  {
    id: 'balanco-determinacao',
    term: 'Balanço de Determinação',
    category: 'Processual & Conflitos',
    definition: 'Demonstração contábil-avaliatória específica e extraordinária levantada na data da resolução ou exclusão societária para mensurar o patrimônio líquido da empresa a preços correntes de mercado (preço de saída), contemplando bens tangíveis e intangíveis (como carteira de clientes e aviamento).',
    legalBasis: 'Código de Processo Civil, Art. 606',
    lessonNumber: 16,
    practicalExample: 'Na dissolução parcial julgada pela 3ª Turma do STJ, o perito avalia a marca registrada e a carteira de contratos futuros a preço de saída, e não pelo custo contábil histórico do livro razão.',
    tags: ['Apuração de Haveres', 'Art. 606 CPC', 'Goodwill']
  },
  {
    id: 'bonus-subscricao',
    term: 'Bônus de Subscrição',
    latinOrEnglish: 'Warrant',
    category: 'Mercado de Capitais',
    definition: 'Título mobiliário negociável emitido pela companhia (dentro do limite do capital autorizado) que confere ao seu titular o direito de subscrever ações no futuro, mediante o pagamento de preço de exercício prefixado.',
    legalBasis: 'Lei 6.404/76, Arts. 75 a 79',
    lessonNumber: 9,
    practicalExample: 'A companhia emite debêntures acompanhadas de bônus de subscrição como atrativo econômico para investidores que desejam participar da valorização futura do equity.',
    tags: ['Valores Mobiliários', 'Derivativos', 'Funding']
  },
  {
    id: 'business-judgment-rule',
    term: 'Business Judgment Rule (Regra da Decisão Empresarial)',
    latinOrEnglish: 'Business Judgment Rule',
    category: 'Governança & Fiduciário',
    definition: 'Presunção jurídica consagrada na jurisprudência da CVM e no direito comparado de que os administradores da companhia agiram de forma informada, de boa-fé e no interesse da sociedade, impedindo que o juiz ou regulador anule o mérito comercial de negócios deficitários tomados sem conflito de interesses.',
    legalBasis: 'Lei 6.404/76, Art. 153 e Precedentes CVM',
    lessonNumber: 12,
    practicalExample: 'A diretoria investe em nova linha fabril que se mostra deficitária em razão de crise macroeconômica; tendo havido estudos prévios e inexistindo favorecimento pessoal, a conduta dos diretores é protegida pela Business Judgment Rule.',
    tags: ['Art. 153', 'Dever de Diligência', 'CVM']
  },
  {
    id: 'capital-autorizado',
    term: 'Capital Autorizado',
    latinOrEnglish: 'Authorized Capital',
    category: 'Mercado de Capitais',
    definition: 'Cláusula estatutária que faculta à companhia aumentar o capital social até determinado limite prefixado (em valor ou em número de ações) por simples deliberação do Conselho de Administração, dispensando a convocação morosa de Assembleia Geral Extraordinária.',
    legalBasis: 'Lei 6.404/76, Art. 168',
    lessonNumber: 15,
    practicalExample: 'Companhia aberta de tecnologia com previsão de capital autorizado de até R$ 500 milhões aprova em reunião matinal do Conselho de Administração a emissão de ações para captar R$ 80 milhões em private placement.',
    tags: ['Aumento de Capital', 'Conselho de Administração', 'Flexibilidade']
  },
  {
    id: 'cisao',
    term: 'Cisão (Total e Parcial)',
    latinOrEnglish: 'Spin-off / Split-off',
    category: 'M&A & Reorganizações',
    definition: 'Operação societária pela qual uma companhia transfere parcelas do seu patrimônio para uma ou mais sociedades já existentes ou constituídas para esse fim, extinguindo-se se a versão for de todo o patrimônio (total) ou reduzindo o capital se a versão for parcial.',
    legalBasis: 'Lei 6.404/76, Art. 229',
    lessonNumber: 14,
    practicalExample: 'Uma rede varejista cinde parcialmente sua divisão de galpões logísticos e imóveis para constituir uma nova empresa focada estritamente no segmento de Real Estate.',
    tags: ['Reorganização Societária', 'M&A', 'Art. 229']
  },
  {
    id: 'debentures',
    term: 'Debêntures (Simples e Conversíveis)',
    latinOrEnglish: 'Corporate Bonds',
    category: 'Mercado de Capitais',
    definition: 'Títulos de dívida de médio e longo prazo emitidos por sociedades por ações que conferem aos debenturistas um direito de crédito contra a emissora, com remuneração em juros e amortização, podendo prever a faculdade de conversão em ações da companhia.',
    legalBasis: 'Lei 6.404/76, Arts. 52 a 74',
    lessonNumber: 9,
    practicalExample: 'Uma concessionária de rodovias emite debêntures incentivadas de infraestrutura (Lei 12.431/11) com isenção de imposto de renda para financiar a duplicação de rodovias no Nordeste.',
    tags: ['Renda Fixa', 'Funding', 'Escritura de Emissão']
  },
  {
    id: 'dever-diligencia',
    term: 'Dever de Diligência',
    latinOrEnglish: 'Duty of Care',
    category: 'Governança & Fiduciário',
    definition: 'Obrigação legal imposta ao administrador de empregar, no exercício de suas funções, o cuidado, a técnica e a prudência que todo homem ativo e probo costuma empregar na gestão dos seus próprios negócios.',
    legalBasis: 'Lei 6.404/76, Art. 153',
    lessonNumber: 12,
    practicalExample: 'O diretor financeiro que contrata derivativos cambiais altamente alavancados sem analisar cenários de estresse e sem aprovação dos órgãos competentes viola o dever de diligência profissional.',
    tags: ['Art. 153', 'Fiduciário', 'Responsabilidade dos Administradores']
  },
  {
    id: 'dever-lealdade',
    term: 'Dever de Lealdade',
    latinOrEnglish: 'Duty of Loyalty',
    category: 'Governança & Fiduciário',
    definition: 'Princípio fiduciário que obriga o administrador e o controlador a agirem no exclusivo interesse da companhia, vedando a usurpação de oportunidades de negócios, o favorecimento de sociedades coligadas e a atuação sob conflito de interesses.',
    legalBasis: 'Lei 6.404/76, Art. 155 e Art. 156',
    lessonNumber: 12,
    practicalExample: 'Um administrador toma conhecimento de um terreno ideal para expansão de um shopping da companhia e o adquire em seu próprio CPF para posteriormente revendê-lo à sociedade com sobrepreço, configurando quebra grave de lealdade.',
    tags: ['Art. 155', 'Conflito de Interesses', 'Usurpação de Oportunidade']
  },
  {
    id: 'direito-recesso',
    term: 'Direito de Recesso (Withdrawal / Dissidência)',
    latinOrEnglish: 'Appraisal Rights',
    category: 'Societário Básico',
    definition: 'Prerrogativa concedida ao acionista dissidente em certas deliberações estruturais graves (como fusão, incorporação ou alteração radical do objeto social) de retirar-se da companhia recebendo o valor de reembolso de suas ações.',
    legalBasis: 'Lei 6.404/76, Art. 45 e Art. 137',
    lessonNumber: 5,
    practicalExample: 'A assembleia geral aprova por maioria a incorporação da companhia por outra empresa com ramo de atividade distinto; o acionista minoritário discordante notifica a sociedade no prazo de 30 dias exercendo seu direito de recesso.',
    tags: ['Direito Essencial', 'Reembolso', 'Art. 137']
  },
  {
    id: 'dividendo-obrigatorio',
    term: 'Dividendo Obrigatório',
    category: 'Mercado de Capitais',
    definition: 'Parcela compulsória do lucro líquido ajustado que deve ser distribuída aos acionistas em cada exercício financeiro, conforme fixado no estatuto ou, na omissão deste, correspondente a 50% do lucro líquido ajustado (ou 25% com previsão estatutária omissa regulada).',
    legalBasis: 'Lei 6.404/76, Art. 202',
    lessonNumber: 13,
    practicalExample: 'Mesmo que o acionista controlador deseje reter todo o fluxo de caixa do ano para reinvestimento, a Lei 6.404 assegura o pagamento do dividendo mínimo aos minoritários, salvo comprovada incompatibilidade financeira atestada pelo Conselho Fiscal.',
    tags: ['Art. 202', 'Lucros e Reservas', 'Direito Essencial']
  },
  {
    id: 'drag-along',
    term: 'Drag Along (Direito de Arraste)',
    latinOrEnglish: 'Drag Along Right',
    category: 'M&A & Reorganizações',
    definition: 'Cláusula comum em acordos de sócios que permite ao acionista majoritário ou bloco de controle, ao receber uma proposta de compra de 100% da companhia por terceiro, compelir os demais acionistas minoritários a venderem suas ações pelas mesmas condições e preço.',
    legalBasis: 'Lei 6.404/76, Art. 118',
    lessonNumber: 8,
    practicalExample: 'Um fundo adquirente exige o controle integral de uma fintech; o sócio fundador com 60% aciona a cláusula de drag along, obrigando os investidores anjo com 40% a entregarem suas participações no fechamento da transação.',
    tags: ['Acordo de Sócios', 'M&A', 'Saída de Investimento']
  },
  {
    id: 'tag-along',
    term: 'Tag Along (Direito de Venda Conjunta)',
    latinOrEnglish: 'Tag Along Right',
    category: 'Mercado de Capitais',
    definition: 'Mecanismo de proteção que confere aos acionistas não controladores o direito de vender suas ações caso haja alienação do controle da companhia, assegurando no mínimo 80% do preço pago por ação ordinária integrante do bloco de controle na companhia aberta.',
    legalBasis: 'Lei 6.404/76, Art. 254-A',
    lessonNumber: 10,
    practicalExample: 'O grupo controlador de uma companhia aberta listada no Novo Mercado aliena suas ações por R$ 30,00 cada; os acionistas minoritários ordinários têm o direito legal e regulamentar de receber 100% desse valor na OPA de tag along.',
    tags: ['Art. 254-A', 'Alienacao de Controle', 'Minoritários']
  },
  {
    id: 'fusao',
    term: 'Fusão de Sociedades',
    latinOrEnglish: 'Consolidation / Merger',
    category: 'M&A & Reorganizações',
    definition: 'Operação societária pela qual se unem duas ou mais sociedades pré-existentes para formar uma sociedade inteiramente nova, a qual lhes sucederá em todos os direitos e obrigações, extinguindo-se todas as sociedades fusionadas originárias.',
    legalBasis: 'Lei 6.404/76, Art. 228 e Código Civil, Art. 1.119',
    lessonNumber: 14,
    practicalExample: 'As empresas Alpha S.A. e Beta S.A. se fundem para criar a Gama S.A., que surge automaticamente titular de todos os contratos, imóveis e licenças regulatórias das empresas extintas.',
    tags: ['Reorganizações', 'Sucessão Universal', 'M&A']
  },
  {
    id: 'incorporacao',
    term: 'Incorporação de Sociedades',
    latinOrEnglish: 'Merger / Absorption',
    category: 'M&A & Reorganizações',
    definition: 'Operação societária pela qual uma ou mais sociedades são absorvidas por outra sociedade preexistente (incorporadora), que lhes sucede em todos os direitos e obrigações, extinguindo-se as sociedades incorporadas sem criar nova pessoa jurídica.',
    legalBasis: 'Lei 6.404/76, Art. 227',
    lessonNumber: 14,
    practicalExample: 'Um banco de grande porte incorpora uma corretora de valores adquirida meses antes, transferindo todos os clientes e ativos diretamente para seu balanço patrimonial.',
    tags: ['M&A', 'Art. 227', 'Sucessão Universal']
  },
  {
    id: 'insider-trading',
    term: 'Insider Trading (Uso de Informação Privilegiada)',
    latinOrEnglish: 'Insider Trading',
    category: 'Mercado de Capitais',
    definition: 'Uso indevido de informação relevante sobre a companhia que ainda não foi divulgada ao mercado e ao público investidor, com o fim de obter vantagem econômica própria ou para terceiros mediante a negociação de valores mobiliários.',
    legalBasis: 'Lei 6.385/76, Art. 27-D e Resolução CVM nº 44',
    lessonNumber: 9,
    practicalExample: 'No famoso caso Sadia/Perdigão (PAS CVM nº 19957 e STJ), diretores compraram recibos de ações (ADRs) em Nova York cientes de uma oferta hostil de compra sigilosa, resultando em sanção administrativa e condenação penal.',
    tags: ['Ilícito de Mercado', 'CVM', 'Art. 27-D']
  },
  {
    id: 'juros-capital-proprio',
    term: 'Juros sobre Capital Próprio (JCP)',
    latinOrEnglish: 'Interest on Equity',
    category: 'Mercado de Capitais',
    definition: 'Forma híbrida de remuneração aos acionistas baseada na aplicação da Taxa de Juros de Longo Prazo (TJLP) sobre as contas do Patrimônio Líquido. Diferente do dividendo clássico, o JCP é dedutível como despesa financeira na apuração do lucro real da empresa para fins de IRPJ e CSLL.',
    legalBasis: 'Lei 9.249/1995, Art. 9º',
    lessonNumber: 13,
    practicalExample: 'Uma companhia distribui R$ 100 milhões sob a forma de JCP para usufruir do benefício fiscal da dedutibilidade corporativa, creditando os recursos com desconto de 15% de IR retido na fonte do acionista.',
    tags: ['Tributário', 'Remuneração do Capital', 'TJLP']
  },
  {
    id: 'opa',
    term: 'Oferta Pública de Aquisição (OPA)',
    latinOrEnglish: 'Tender Offer (Takeover)',
    category: 'Mercado de Capitais',
    definition: 'Procedimento formal regulado pela CVM pelo qual um proponente faz uma oferta pública ao mercado para comprar um bloco expressivo ou a totalidade das ações em circulação de uma companhia aberta, para fins de cancelamento de registro (fechamento de capital) ou aquisição de controle.',
    legalBasis: 'Lei 6.404/76, Art. 4º e Resolução CVM nº 85',
    lessonNumber: 10,
    practicalExample: 'O acionista controlador promove OPA de fechamento de capital para recomprar as ações dos minoritários na B3 e deslistar a companhia, após demonstrar laudo de avaliação com preço justo.',
    tags: ['Fechamento de Capital', 'CVM 85', 'Mercado de Capitais']
  },
  {
    id: 'quotas-sociais',
    term: 'Quotas Sociais',
    category: 'Societário Básico',
    definition: 'Fração ideal representativa da participação do sócio no capital social de sociedades limitadas. Não consideradas valores mobiliários e sua cessão a terceiros pode ser condicionada ou vetada no contrato social caso haja oposição de mais de um quarto do capital.',
    legalBasis: 'Código Civil, Arts. 1.055 a 1.057',
    lessonNumber: 4,
    practicalExample: 'O sócio que detém 25% das quotas sociais de uma clínica médica decide alienar sua fração a terceiro; os demais sócios exercem o direito de preferência previsto na cláusula 8ª do contrato social.',
    tags: ['Sociedade Limitada', 'Capital Social', 'Cessão']
  },
  {
    id: 'reserva-legal',
    term: 'Reserva Legal',
    category: 'Mercado de Capitais',
    definition: 'Reserva de lucros imperativa que visa assegurar a integridade do capital social. A companhia deve destinar obrigatoriamente 5% do lucro líquido do exercício antes de qualquer distribuição para a sua formação, até atingir o teto de 20% do capital social.',
    legalBasis: 'Lei 6.404/76, Art. 193',
    lessonNumber: 13,
    practicalExample: 'Após apurar lucro líquido de R$ 10 milhões, a companhia retém R$ 500 mil na conta contábil de Reserva Legal, calculando os dividendos apenas sobre a base remanescente ajustada.',
    tags: ['Art. 193', 'Patrimônio Líquido', 'Garantia']
  },
  {
    id: 'shotgun-clausula',
    term: 'Shotgun / Russian Roulette (Cláusula Texana)',
    latinOrEnglish: 'Shotgun Clause / Buy-Sell',
    category: 'Processual & Conflitos',
    definition: 'Mecanismo de desempate contratual previsto em acordos de sócios para solucionar impasses insuperáveis (deadlock): um sócio formula uma oferta formal para comprar as quotas do outro por determinado valor; o sócio notificado é obrigado a vender suas quotas ou a comprar as do proponente pelo exato mesmo preço.',
    legalBasis: 'Liberdade Contratual e Art. 118 da Lei 6.404/76',
    lessonNumber: 8,
    practicalExample: 'Em sociedade com divisão 50/50 em litígio crônico, o sócio A oferece R$ 2 milhões pela metade do sócio B; B opta por não vender e, pela cláusula, compra a metade de A depositando os R$ 2 milhões.',
    tags: ['Deadlock', 'Acordo de Sócios', 'Resolução de Conflitos']
  },
  {
    id: 'voto-multiplo',
    term: 'Voto Múltiplo',
    latinOrEnglish: 'Cumulative Voting',
    category: 'Mercado de Capitais',
    definition: 'Processo especial de eleição de membros do Conselho de Administração que pode ser requerido por acionistas detentores de no mínimo 10% (ou percentual menor conforme escala CVM) das ações com direito a voto, multiplicando os votos pelo número de cargos a preencher e permitindo concentrá-los em um só candidato.',
    legalBasis: 'Lei 6.404/76, Art. 141 e Resolução CVM nº 70',
    lessonNumber: 10,
    practicalExample: 'Acionistas minoritários de uma siderúrgica com 12% do capital votante requerem o processo de voto múltiplo com 48 horas de antecedência e elegem um conselheiro independente de sua estrita confiança.',
    tags: ['Art. 141', 'Conselho de Administração', 'Tutela de Minoria']
  },
  {
    id: 'poison-pill',
    term: 'Poison Pill (Pílula de Veneno)',
    latinOrEnglish: 'Poison Pill / Shark Repellent',
    category: 'Mercado de Capitais',
    definition: 'Mecanismo de proteção estatutária contra aquisições hostis de controle corporativo em companhias de capital pulverizado. Impõe ao acionista adquirente que atingir determinado percentual relevante de ações (ex: 20% ou 25%) o dever cogente de lançar uma OPA por todas as ações remanescentes com prêmio expressivo sobre a cotação de mercado.',
    legalBasis: 'Estatutos Sociais e Regulação CVM (Novo Mercado)',
    lessonNumber: 10,
    practicalExample: 'Investidor adquire 19,9% de uma companhia listada na B3 sem controle definido; ao cogitar comprar mais 1%, depara-se com o gatilho da poison pill que o forçaria a gastar R$ 2 bilhões na compra compulsória de 100% dos minoritários.',
    tags: ['Governança', 'Takeover Hostil', 'OPA']
  },
  {
    id: 'golden-share',
    term: 'Golden Share (Ação de Classe Especial)',
    latinOrEnglish: 'Golden Share',
    category: 'Mercado de Capitais',
    definition: 'Ação preferencial de titularidade exclusiva do ente público desestatizante (União, Estado ou Município) que confere poderes especiais de veto sobre matérias estratégicas predeterminadas (como alteração do objeto social, venda de ativos de segurança nacional ou mudança de sede), independentemente da quantidade de capital detido.',
    legalBasis: 'Lei 6.404/76, Art. 17, § 7º e Leis de Desestatização',
    lessonNumber: 9,
    practicalExample: 'Na privatização da Eletrobras ou Embraer, a União retém uma golden share com poder de veto irrecusável caso terceiros tentem transferir o controle fabril militar para empresas estrangeiras.',
    tags: ['Privatização', 'Veto Estratégico', 'Art. 17']
  },
  {
    id: 'trespasse',
    term: 'Trespasse de Estabelecimento Empresarial',
    latinOrEnglish: 'Bulk Sale / Sale of Business as a Going Concern',
    category: 'Societário Básico',
    definition: 'Contrato pelo qual se opera a alienação do complexo de bens organizados para o exercício da empresa (estabelecimento). Diferente da cessão de quotas ou ações, no trespasse transfere-se o próprio acervo fático-jurídico operacional, respondendo adquirente e alienante solidariamente pelas dívidas anteriores contabilizadas por 1 ano.',
    legalBasis: 'Código Civil, Arts. 1.142 a 1.149',
    lessonNumber: 7,
    practicalExample: 'Uma rede de farmácias adquire 5 pontos comerciais com estoque e clientela de um concorrente em recuperação; para que a operação produza efeitos perante credores, é mister a publicação do trespasse na imprensa oficial e a quitação prévia das dívidas exigíveis.',
    tags: ['Art. 1.142 CC', 'Estabelecimento', 'Aviamento']
  },
  {
    id: 'scp',
    term: 'Sociedade em Conta de Participação (SCP)',
    latinOrEnglish: 'Undisclosed Partnership',
    category: 'Societário Básico',
    definition: 'Tipo societário desprovido de personalidade jurídica própria e de patrimônio autônomo, estruturado entre um sócio ostensivo (que pratica em nome próprio e com responsabilidade ilimitada todos os atos negociais) e sócios participantes ou ocultos (que vertem capital e participam apenas dos resultados financeiros perante o ostensivo).',
    legalBasis: 'Código Civil, Arts. 991 a 996',
    lessonNumber: 2,
    practicalExample: 'Uma construtora atua como sócia ostensiva para erguer um edifício residencial na zona sul do Recife, enquanto investidores pessoa física figuram como sócios participantes aportando capital para receber os lucros da venda das unidades ao término da obra.',
    tags: ['Art. 991 CC', 'Sócio Oculto', 'Empreendimentos']
  },
  {
    id: 'stock-options',
    term: 'Plano de Opção de Compra de Ações (Stock Options)',
    latinOrEnglish: 'Stock Option Plan (SOP)',
    category: 'Mercado de Capitais',
    definition: 'Programa de remuneração variável e retenção de talentos aprovado em assembleia geral de companhias que outorga a executivos ou colaboradores o direito (opção) de adquirir ações da sociedade no futuro por um preço predeterminado (strike price), após o cumprimento de prazo de carência (vesting period).',
    legalBasis: 'Lei 6.404/76, Art. 168, § 3º',
    lessonNumber: 15,
    practicalExample: 'Startup de inteligência artificial confere a seus diretores o direito de comprar ações por R$ 5,00 após 4 anos de permanência; com a valorização da companhia na B3 a R$ 35,00 por ação, os executivos exercem a opção auferindo expressivo ganho financeiro.',
    tags: ['Vesting', 'Incentivo', 'Remuneração de Administradores']
  },
  {
    id: 'desconsideracao-personalidade',
    term: 'Desconsideração da Personalidade Jurídica (Disregard Doctrine)',
    latinOrEnglish: 'Piercing the Corporate Veil',
    category: 'Processual & Conflitos',
    definition: 'Mecanismo judicial excepcional pelo qual o juiz afasta temporariamente a autonomia patrimonial da pessoa jurídica para atingir bens particulares dos sócios ou administradores, em hipóteses comprovadas de desvio de finalidade ou confusão patrimonial (Teoria Maior do Art. 50 do Código Civil).',
    legalBasis: 'Código Civil, Art. 50 e CPC, Arts. 133 a 137',
    lessonNumber: 2,
    practicalExample: 'O sócio administrador utiliza a conta bancária da pessoa jurídica para pagar despesas residenciais particulares e transfere os lucros para empresas laranjas na véspera de penhora judicial; o credor instaura o incidente (IDPJ) e obtém o bloqueio direto das contas da pessoa física.',
    tags: ['Art. 50 CC', 'Autonomia Patrimonial', 'IDPJ']
  }
];
