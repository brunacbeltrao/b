/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, FacultyMember } from '../types';

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'marcos-gomes',
    name: 'Marcos Gomes',
    role: 'Presidente',
    affiliation: 'Faculdade de Direito do Recife (FDR/UFPE)',
    category: 'diretoria',
    bio: 'Presidente da Liga de Direito Societário e Mercado de Capitais (LDS FDR).'
  },
  {
    id: 'romero-rego',
    name: 'Romero Rêgo',
    role: 'Vice-Presidente',
    affiliation: 'Faculdade de Direito do Recife (FDR/UFPE)',
    category: 'diretoria',
    bio: 'Vice-Presidente da LDS FDR.'
  },
  {
    id: 'thiago-lavor',
    name: 'Thiago Lavor',
    role: 'Diretor Acadêmico',
    affiliation: 'Faculdade de Direito do Recife (FDR/UFPE)',
    category: 'diretoria',
    bio: 'Diretor Acadêmico da LDS FDR.'
  },
  {
    id: 'lucas-pedrosa',
    name: 'Lucas Pedrosa',
    role: 'Diretor Jurídico',
    affiliation: 'Faculdade de Direito do Recife (FDR/UFPE)',
    category: 'diretoria',
    bio: 'Diretor Jurídico da LDS FDR.'
  },
  {
    id: 'eric-castro',
    name: 'Prof. Eric de Castro e Silva',
    role: 'Professor Orientador',
    affiliation: 'Professor de Direito Tributário na FDR/UFPE',
    category: 'orientador',
    bio: 'Professor responsável perante a UFPE.'
  }
];

export const LESSONS_DATABASE: Lesson[] = [
  {
    id: 1,
    lessonNumber: 1,
    dateStr: '12/08',
    fullDate: '12 de agosto de 2026',
    title: 'Apresentação do Semestre e Metodologia da LDS',
    subtitle: 'Diretrizes acadêmicas, constituição do grupo e método do caso corporativo',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Apresentação dos objetivos pedagógicos e metodológicos do Ciclo 2026.2',
      'Estrutura do método do caso aplicado ao Direito Societário',
      'Critérios de assiduidade, liderança de discussões e participação ativa'
    ],
    legislation: [
      {
        lawTag: 'ESTATUTO LDS',
        article: 'Art. 1º',
        text: 'A Liga tem por escopo o aprofundamento dogmático e prático no Direito Empresarial.',
        sourceName: 'Regimento Interno LDS FDR'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'Abertura do semestre letivo com definição dos grupos de estudo e distribuição de lideranças.',
    recommendedBibliography: [
      'COELHO, Fábio Ulhoa. Curso de Direito Comercial. Vol. 2: Sociedades.',
      'CARVALHOSA, Modesto. Comentários à Lei das Sociedades Anônimas.'
    ]
  },
  {
    id: 2,
    lessonNumber: 2,
    dateStr: '19/08',
    fullDate: '19 de agosto de 2026',
    title: 'Sociedades Limitadas e Anônimas: Conceito, Natureza Jurídica e Classes',
    subtitle: 'Personalidade jurídica própria, autonomia patrimonial e tipologia societária',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Distinção estrutural entre sociedades de pessoas (affectio societatis) e de capitais (intuitu pecuniae)',
      'Regime de responsabilidade limitada e a blindagem patrimonial legítima (Art. 49-A e 1.052 do CC)',
      'Abertura e fechamento de capital sob a égide da Lei 6.404/76 e regulação da CVM'
    ],
    legislation: [
      {
        lawTag: 'CÓDIGO CIVIL',
        article: 'Art. 1.052',
        text: 'Na sociedade limitada, a responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social.',
        sourceName: 'Lei nº 10.406/2002',
        commentary: 'A solidariedade cessa integralmente com a total integralização do capital subscrito.'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 1º',
        text: 'A companhia ou sociedade anônima terá o capital dividido em ações, e a responsabilidade dos sócios ou acionistas será limitada ao preço de emissão das ações subscritas ou adquiridas.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'A limitação da responsabilidade não é privilégio concedido ao empresário, mas técnica jurídica imprescindível para a canalização de poupanças privadas rumo a empreendimentos produtivos de alto risco.',
        author: 'Fábio Ulhoa Coelho',
        work: 'Curso de Direito Comercial, Saraiva',
        year: '2023'
      }
    ],
    comparisonTable: {
      title: 'LTDA vs SOCIEDADE ANÔNIMA',
      leftHeader: 'SOCIEDADE LIMITADA (CC)',
      rightHeader: 'SOCIEDADE ANÔNIMA (LSA)',
      rows: [
        {
          criterion: 'Natureza Prevalente',
          left: 'Sociedade de pessoas (regra geral com affectio societatis).',
          right: 'Sociedade de capital rígida (livre circulação de ações).'
        },
        {
          criterion: 'Fração do Capital',
          left: 'Quotas sociais (registradas em contrato social perante a Junta).',
          right: 'Ações (valores mobiliários escriturais ou nominativos).'
        },
        {
          criterion: 'Governança e Órgãos',
          left: 'Administrador(es) designado(s) em contrato; conselho facultativo.',
          right: 'Conselho de Administração (obrigatório em Cia Aberta) + Diretoria.'
        }
      ]
    },
    overviewText: 'Exame dogmático sobre a gênese e evolução dos dois principais tipos societários empresariais brasileiros.',
    recommendedBibliography: [
      'REQUIÃO, Rubens. Curso de Direito Comercial. Vol. 2.',
      'EIZIRIK, Nelson. A Lei das S/A Comentada. Quartier Latin.'
    ]
  },
  {
    id: 3,
    lessonNumber: 3,
    dateStr: '26/08',
    fullDate: '26 de agosto de 2026',
    title: 'Lançamento de Livro de Artigos & Pesquisa Societária',
    subtitle: 'Apresentação dos trabalhos acadêmicos da FDR e diretrizes metodológicas',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Metodologia de pesquisa científica em Direito Societário e regulação de mercado',
      'Análise de fontes empíricas: editais de OPA, laudos de avaliação e processos sancionadores da CVM',
      'Estruturação de artigos para periódicos qualificados e congressos'
    ],
    legislation: [],
    doctrineQuotes: [],
    overviewText: 'Sessão temática voltada à produção doutrinária e editorial da LDS FDR.',
    recommendedBibliography: [
      'COMPARATO, Fábio Konder. O Poder de Controle na Sociedade Anônima.',
      'BULGARELLI, Waldirio. Sociedades Comerciais.'
    ]
  },
  {
    id: 4,
    lessonNumber: 4,
    dateStr: '02/09',
    fullDate: '02 de setembro de 2026',
    title: 'Capital Social e Quotas/Ações como Participação Societária',
    subtitle: 'Cifra formal de garantia, princípios de intangibilidade e modos de integralização',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Distinção essencial entre Capital Social (cifra contábil/jurídica) e Patrimônio Líquido',
      'Princípios fundamentais: fixidez, intangibilidade e efetividade do capital',
      'Formação do capital com bens: necessidade de laudo pericial (Art. 8º da LSA) e responsabilidade por sobreavaliação',
      'Ágio na subscrição e sua contabilização como Reserva de Capital (não transitando pelo resultado)'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 8º',
        text: 'A avaliação dos bens será feita por 3 (três) peritos ou por empresa especializada, nomeados em assembléia geral dos subscritores.',
        sourceName: 'Lei das Sociedades por Ações',
        commentary: 'Os avaliadores e o subscritor respondem civil e penalmente pelos danos decorrentes de sobreavaliação.'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 182, § 1º',
        text: 'Serão classificadas como reservas de capital as contas que registrarem o ágio na emissão de ações e o produto da alienação de partes beneficiárias e bônus de subscrição.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'O capital social representa a barreira de contenção patrimonial instituída pela lei como contrapartida à limitação da responsabilidade dos acionistas. É a cifra que fixa o patamar abaixo do qual nenhum dividendo pode ser distribuído.',
        author: 'Modesto Carvalhosa',
        work: 'Comentários à Lei das Sociedades Anônimas, Saraiva',
        year: '2021'
      }
    ],
    overviewText: 'Estudo aprofundado dos princípios ordenadores do capital social e da tutela dos credores societários.',
    recommendedBibliography: [
      'CARVALHOSA, Modesto. Comentários à Lei das Sociedades Anônimas. Vol. 1.',
      'GONÇALVES NETO, Alfredo de Assis. Lições de Direito Societário.'
    ]
  },
  {
    id: 5,
    lessonNumber: 5,
    dateStr: '09/09',
    fullDate: '09 de setembro de 2026',
    title: 'Obrigações e Direitos dos Sócios e Acionistas',
    subtitle: 'Direitos essenciais indeferíveis, dever de integralização e lealdade societária',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Direitos essenciais dos acionistas protegidos pelo Art. 109 da Lei 6.404/76 (inderrogáveis pelo estatuto)',
      'Participação nos lucros sociais e na partilha do acervo em caso de liquidação',
      'Fiscalização da gestão social e direito de preferência para subscrição de novos títulos',
      'Direito de recesso (dissidência) e as hipóteses restritas de reembolso (Art. 137)'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 109',
        text: 'Nem o estatuto social nem a assembléia-geral poderão privar o acionista dos direitos de: I - participar dos lucros sociais; II - participar do acervo da companhia; III - fiscalizar a gestão; IV - preferência na subscrição; V - retirar-se da sociedade.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'Os direitos essenciais consagram o núcleo duro da cidadania societária. Deliberação que tente mitigar o Art. 109 padece de nulidade absoluta de pleno direito.',
        author: 'Nelson Eizirik',
        work: 'A Lei das S/A Comentada',
        year: '2022'
      }
    ],
    overviewText: 'Análise do estatuto jurídico dos sócios e acionistas, demarcando as garantias inderrogáveis.',
    recommendedBibliography: [
      'EIZIRIK, Nelson. A Lei das S/A Comentada. Vol. 2.',
      'FRAN MARTINS. Curso de Direito Comercial.'
    ]
  },
  {
    id: 6,
    lessonNumber: 6,
    dateStr: '10/09',
    fullDate: '10 de setembro de 2026',
    title: 'Estruturas Societárias e Planejamento Tributário',
    subtitle: 'Holdings patrimoniais, neutralidade fiscal nas reorganizações e ágio societário',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Tipologia das Holdings: pura, mista, patrimonial e operacional',
      'Incorporação de ações e transferência de participações sem incidência de ITBI (Art. 156, § 2º da CF)',
      'Aproveitamento de ágio por rentabilidade futura (goodwill) e precedentes do CARF'
    ],
    legislation: [
      {
        lawTag: 'CONSTITUIÇÃO FEDERAL',
        article: 'Art. 156, § 2º, I',
        text: 'O imposto previsto no inciso II (ITBI) não incide sobre a transmissão de bens ou direitos incorporados ao patrimônio de pessoa jurídica em realização de capital.',
        sourceName: 'Constituição da República Federativa do Brasil'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'Intersecção prática entre Direito Societário e Direito Tributário nas reorganizações.',
    recommendedBibliography: [
      'GRECO, Marco Aurélio. Planejamento Tributário. Dialética.',
      'SCHOUERI, Luís Eduardo. Direito Tributário.'
    ]
  },
  {
    id: 7,
    lessonNumber: 7,
    dateStr: '16/09',
    fullDate: '16 de setembro de 2026',
    title: 'Atos Constitutivos: Contrato Social, Estatuto e Livros da Companhia',
    subtitle: 'Formalização negocial, cláusulas obrigatórias e publicidade perante a Junta Comercial',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Elementos essenciais do contrato social na LTDA (Art. 997 do CC) vs Estatuto Social na S/A (Art. 88 da LSA)',
      'O papel constitutivo do arquivamento perante a Junta Comercial e eficácia perante terceiros',
      'Livros obrigatórios da S/A: Registro de Ações, Transferência de Ações, Atas de Assembleias e Presença'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 100',
        text: 'A companhia deve ter, além dos livros comuns aos comerciantes, os seguintes, revestidos das mesmas formalidades legais: I - Registro de Ações Nominativas; II - Transferência de Ações Nominativas...',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'Formalização registral dos atos constitutivos e governança documental da companhia.',
    recommendedBibliography: [
      'BULGARELLI, Waldirio. Manual das Sociedades Anônimas.',
      'CAMPINHO, Sérgio. O Direito de Empresa à Luz do Novo Código Civil.'
    ]
  },
  {
    id: 8,
    lessonNumber: 8,
    dateStr: '23/09',
    fullDate: '23 de setembro de 2026',
    title: 'Acordo de Sócios e Acionistas',
    subtitle: 'Pactos parassocietários, sindicato de voto, bloqueio de ações e execução específica',
    duration: '60 minutos',
    phase: 'Direito Societário Básico',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Natureza jurídica e objeto do acordo: compra e venda de ações, preferência, sindicato de voto e controle',
      'Requisitos para eficácia real e oponibilidade à companhia e mesa diretora: arquivamento na sede (Art. 118)',
      'Execução específica da obrigação de votar: o dever do Presidente da Assembleia de desconsiderar voto dissidente (Art. 118, § 8º e 9º)',
      'Cláusulas usuais de liquidez e saída: Tag Along, Drag Along, Shotgun (Russian Roulette) e Direito de Preferência'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 118',
        text: 'Os acordos de acionistas, sobre a compra e venda de suas ações, preferência para adquiri-las, exercício do direito a voto, ou do poder de controle, serão observados pela companhia quando arquivados na sua sede.',
        sourceName: 'Lei das Sociedades por Ações'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 118, § 8º',
        text: 'O presidente da assembléia ou do órgão colegiado de deliberação da companhia não computará o voto proferido com infração de acordo de acionistas devidamente arquivado.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'A execução específica in re ipsa do art. 118 consagra a supremacia do pacto parassocietário sobre a vontade volúvel do acionista individual no momento assemblear, tutelando a estabilidade da governança corporativa.',
        author: 'Erasmo Valladão Azevedo e Novaes França',
        work: 'Acordo de Acionistas, Malheiros',
        year: '2020'
      }
    ],
    overviewText: 'Pactos parassocietários e a blindagem das deliberações em bloco no Direito Societário.',
    recommendedBibliography: [
      'FRANÇA, Erasmo Valladão. Acordo de Acionistas. Malheiros.',
      'CARVALHOSA, Modesto. Acordo de Acionistas. Saraiva.'
    ]
  },
  {
    id: 9,
    lessonNumber: 9,
    dateStr: '30/09',
    fullDate: '30 de setembro de 2026',
    title: 'Valores Mobiliários: Ações, Debêntures, Partes Beneficiárias e Bônus',
    subtitle: 'Tipologia das ações, debêntures simples e conversíveis e captação de recursos',
    duration: '60 minutos',
    phase: 'Mercado de Capitais',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'completed',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Conceito de valor mobiliário sob o Art. 2º da Lei 6.385/76 e o teste de Howey brasileiro',
      'Classificação das ações: ordinárias (voto), preferenciais (vantagens econômicas) e fruição',
      'Debêntures: título de dívida corporativa de médio/longo prazo, garantias e debêntures conversíveis',
      'Bônus de subscrição e Partes Beneficiárias (títulos de participação exclusiva em S/A fechada)'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.385/76',
        article: 'Art. 2º',
        text: 'São valores mobiliários sujeitos ao regime desta Lei: I - as ações, debêntures e bônus de subscrição; II - os cupons, direitos, recibos de subscrição e certificados de desdobramento relativos aos valores mobiliários...',
        sourceName: 'Lei do Mercado de Capitais'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 52',
        text: 'A companhia poderá emitir debêntures que conferirão aos seus titulares direitos de crédito contra ela, nas condições constantes da escritura de emissão e, se houver, do certificado.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'A diversificação dos valores mobiliários confere flexibilidade ímpar à companhia aberta, permitindo-lhe calibrar a captação entre equity (risco puro) e debt (crédito com prioridade).',
        author: 'Nelson Eizirik',
        work: 'Mercado de Capitais: Regime Jurídico',
        year: '2021'
      }
    ],
    overviewText: 'Instrumentos de financiamento corporativo e títulos emitidos pelas sociedades por ações.',
    recommendedBibliography: [
      'EIZIRIK, Nelson. Mercado de Capitais: Regime Jurídico.',
      'YAZBEK, Otavio. Regulação do Mercado Financeiro e de Capitais.'
    ]
  },
  {
    id: 10,
    lessonNumber: 10,
    dateStr: '07/10',
    fullDate: '07 de outubro de 2026',
    title: 'Estrutura da Companhia, Princípio Majoritário e Acionista Controlador',
    subtitle: 'Poder de controle societário, deveres do controlador e tutela dos minoritários',
    duration: '60 minutos',
    phase: 'Mercado de Capitais',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'current',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Conceituação positiva do acionista controlador: titularidade da maioria e exercício efetivo do poder (Art. 116)',
      'O princípio da função social do poder de controle e deveres de lealdade perante a companhia e comunidade',
      'Abuso do poder de controle (Art. 117): desvio de finalidade, operações lesivas em benefício de terceiros e responsabilidade civil',
      'Tutela dos minoritários: direito de tag along na alienação de controle (Art. 254-A) e processo de voto múltiplo (Art. 141)'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 116',
        text: 'Entende-se por acionista controlador a pessoa, natural ou jurídica, ou o grupo de pessoas vinculadas por acordo de voto, ou sob controle comum, que: a) é titular de direitos de sócio que lhe assegurem, de modo permanente, a maioria dos votos... e b) usa efetivamente o seu poder para dirigir as atividades sociais.',
        sourceName: 'Lei das Sociedades por Ações'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 117',
        text: 'O acionista controlador responde pelos danos causados por atos praticados com abuso de poder, cabendo a qualquer acionista promover a ação correspondente.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'No direito societário contemporâneo, o controle não é mera propriedade, mas poder-função. Ele confere prerrogativas exclusivas subordinadas ao dever inafastável de direcionar a empresa rumo ao seu objeto social com probidade.',
        author: 'Fábio Konder Comparato',
        work: 'O Poder de Controle na Sociedade Anônima',
        year: '2019'
      }
    ],
    overviewText: 'O exercício do poder diretivo nas companhias abertas e fechadas, limites e controle do abuso.',
    recommendedBibliography: [
      'COMPARATO, Fábio Konder; SALOMÃO FILHO, Calixto. O Poder de Controle na Sociedade Anônima. Forense.',
      'SZTAJN, Rachel. Teoria Jurídica da Empresa.'
    ]
  },
  {
    id: 11,
    lessonNumber: 11,
    dateStr: '14/10',
    fullDate: '14 de outubro de 2026',
    title: 'Órgãos Sociais: Reunião de Sócios e Assembleias Gerais',
    subtitle: 'Competência exclusiva, convocação, quóruns de instalação e deliberação',
    duration: '60 minutos',
    phase: 'Mercado de Capitais',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'A Assembleia Geral como órgão soberano: Assembleia Geral Ordinária (AGO) vs Extraordinária (AGE)',
      'Formalidades editalícias de convocação e antecedência mínima na companhia aberta e fechada (Art. 124)',
      'Quóruns legais: instalação em 1ª convocação (1/4 do capital votante) e deliberação qualificada de metade do capital (Art. 136)'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 121',
        text: 'A assembléia-geral, convocada e instalada de acordo com a lei e o estatuto, tem poderes para decidir todos os negócios relativos ao objeto da companhia e tomar as resoluções que julgar convenientes à sua defesa e desenvolvimento.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'A soberania assemblear e as regras procedimentais de votação e quóruns no regime da LSA.',
    recommendedBibliography: [
      'EIZIRIK, Nelson. A Lei das S/A Comentada. Vol. 2.',
      'CARVALHOSA, Modesto. Comentários à Lei das Sociedades Anônimas. Vol. 2.'
    ]
  },
  {
    id: 12,
    lessonNumber: 12,
    dateStr: '21/10',
    fullDate: '21 de outubro de 2026',
    title: 'Administração da Companhia: Deveres e Responsabilidades',
    subtitle: 'Conselho de Administração e Diretoria, dever de diligência, lealdade e Business Judgment Rule',
    duration: '60 minutos',
    phase: 'Mercado de Capitais',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Estrutura dual da administração na S/A: Conselho de Administração (deliberação estratégica) e Diretoria (execução)',
      'Dever de diligência (Art. 153): o standard do bonus pater familias no meio mercantil corporativo',
      'Dever de lealdade e vedação ao conflito de interesses (Art. 155 e 156): usurpation of corporate opportunity',
      'Aplicação da Business Judgment Rule (BJR) pelo Judiciário brasileiro e precedentes do Colegiado da CVM'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 153',
        text: 'O administrador da companhia deve empregar, no exercício de suas funções, o cuidado e diligência que todo homem ativo e probo costuma empregar na administração dos seus próprios negócios.',
        sourceName: 'Lei das Sociedades por Ações'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 158',
        text: 'O administrador não é pessoalmente responsável pelas obrigações que contrair em nome da sociedade e em virtude de ato regular de gestão; responde, porém, civilmente, pelos prejuízos que causar, quando proceder com culpa ou dolo, ou violação da lei ou do estatuto.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'A Business Judgment Rule cria uma presunção de que o administrador agiu de boa-fé, com base em informações razoáveis e no melhor interesse da companhia, impedindo que o juiz substitua a decisão negocial com a vantagem cognitiva do tempo passado.',
        author: 'Waldirio Bulgarelli',
        work: 'Regime Jurídico da Administração das S/A',
        year: '2021'
      }
    ],
    overviewText: 'Responsabilidade civil dos administradores de sociedades anônimas e limites de responsabilização.',
    recommendedBibliography: [
      'EIZIRIK, Nelson. Deveres Fiduciários dos Administradores.',
      'YAZBEK, Otavio. Precedentes da CVM em Processos Administrativos Sancionadores.'
    ]
  },
  {
    id: 13,
    lessonNumber: 13,
    dateStr: '28/10',
    fullDate: '28 de outubro de 2026',
    title: 'Lucros, Reservas e Dividendos',
    subtitle: 'Demonstrações financeiras, reservas legais e estatutárias e o dividendo obrigatório',
    duration: '60 minutos',
    phase: 'Mercado de Capitais',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Apuração contábil do lucro líquido e deduções legais sucessivas',
      'Reserva Legal imperativa (5% do lucro líquido até 20% do capital - Art. 193)',
      'O Dividendo Obrigatório (Art. 202): direito indisponível do minoritário de percepção de retorno financeiro',
      'Juros sobre Capital Próprio (JCP - Lei 9.249/95): dedutibilidade fiscal corporativa e tributação exclusiva na fonte'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 202',
        text: 'Os acionistas têm direito de receber como dividendo obrigatório, em cada exercício, a parcela dos lucros estabelecida no estatuto ou, se este for omisso, a metade do lucro líquido do exercício diminuído ou acrescido das quantias destinadas a reservas.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'Regime jurídico da distribuição de resultados, tutela dos minoritários e constituição de reservas.',
    recommendedBibliography: [
      'CARVALHOSA, Modesto. Comentários à Lei das Sociedades Anônimas. Vol. 3.',
      'IUDÍCIBUS, Sérgio de. Manual de Contabilidade Societária.'
    ]
  },
  {
    id: 14,
    lessonNumber: 14,
    dateStr: '04/11',
    fullDate: '04 de novembro de 2026',
    title: 'Reorganizações Societárias: Conceito e Espécies',
    subtitle: 'Transformação, Incorporação, Fusão, Cisão e Incorporação de Ações',
    duration: '60 minutos',
    phase: 'Reorganizações & Prática',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Transformação societária: mudança de tipo societário sem dissolução ou liquidação (Art. 220)',
      'Incorporação (Art. 227) e Fusão (Art. 228): sucessão universal de direitos, dívidas e contratos',
      'Cisão total e parcial (Art. 229): partição patrimonial e responsabilidade solidária de credores',
      'Incorporação de Ações (Art. 252): mecanismo de criação de subsidiária integral e troca de ações sem extinção da incorporada'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 227',
        text: 'A incorporação é a operação pela qual uma ou mais sociedades são absorvidas por outra, que lhes sucede em todos os direitos e obrigações.',
        sourceName: 'Lei das Sociedades por Ações'
      },
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 252',
        text: 'A incorporação de ações para constituir subsidiária integral será submetida à deliberação da assembléia-geral das duas companhias mediante aprovação do laudo de avaliação.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'As reorganizações societárias são os institutos nucleares do M&A moderno. Permitem a reconfiguração de grupos empresariais inteiros mediante sucessão a título universal sem necessidade de encerramento da atividade econômica.',
        author: 'Francisco Petros',
        work: 'Fusões e Aquisições no Brasil',
        year: '2022'
      }
    ],
    overviewText: 'Operações estruturadas de M&A e a dinâmica contratual das reorganizações societárias.',
    recommendedBibliography: [
      'PETROS, Francisco. Fusões e Aquisições no Brasil.',
      'SADDI, Jairo. Fusões e Aquisições: Aspectos Jurídicos.'
    ]
  },
  {
    id: 15,
    lessonNumber: 15,
    dateStr: '11/11',
    fullDate: '11 de novembro de 2026',
    title: 'Financiamento da Companhia e Alterações de Capital Social',
    subtitle: 'Aumento e redução de capital, direito de preferência e capital autorizado',
    duration: '60 minutos',
    phase: 'Reorganizações & Prática',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Aumento de capital social: novas emissões de ações com exercício de direito de preferência (Art. 171)',
      'O mecanismo de Capital Autorizado (Art. 168): deliberação célere pelo Conselho de Administração',
      'Redução de capital social por perdas acumuladas ou por ser excessivo ao objeto (Art. 173 e 174)'
    ],
    legislation: [
      {
        lawTag: 'LEI 6.404/76',
        article: 'Art. 171',
        text: 'Os acionistas terão preferência para a subscrição das novas ações ou valores mobiliários conversíveis em ações, na proporção do número de ações que possuírem.',
        sourceName: 'Lei das Sociedades por Ações'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'Estruturação de financiamento e alterações na cifra formal do capital social.',
    recommendedBibliography: [
      'CARVALHOSA, Modesto. Comentários à Lei das Sociedades Anônimas. Vol. 3.',
      'EIZIRIK, Nelson. A Lei das S/A Comentada. Vol. 3.'
    ]
  },
  {
    id: 16,
    lessonNumber: 16,
    dateStr: '16/11',
    fullDate: '16 de novembro de 2026',
    title: 'Dissolução, Liquidação e Extinção',
    subtitle: 'Fim da affectio societatis, apuração de haveres e liquidação concursal',
    duration: '60 minutos',
    phase: 'Reorganizações & Prática',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Fases do encerramento da pessoa jurídica: dissolução (causa resolutiva), liquidação (ativo/passivo) e extinção registral',
      'Dissolução parcial na sociedade limitada (Art. 1.028 a 1.035 do CC) e sua aplicação excepcional a S/A fechada',
      'Apuração de haveres pelo Balanço de Determinação a preço de saída (Art. 606 do CPC/2015)'
    ],
    legislation: [
      {
        lawTag: 'CÓDIGO DE PROCESSO CIVIL',
        article: 'Art. 606',
        text: 'Em caso de omissão do contrato social, o juiz definirá, como critério de apuração de haveres, o valor patrimonial apurado em balanço de determinação, tomando-se por referência o valor de mercado dos bens e direitos do ativo.',
        sourceName: 'Lei nº 13.105/2015'
      }
    ],
    doctrineQuotes: [
      {
        quote: 'A apuração de haveres deve recompor exatamente o valor da parcela econômica pertencente ao sócio retirante como se a empresa fosse vendida no mercado em bloco, incluindo o aviamento acumulado.',
        author: 'Marcelo Fortes Barbosa Filho',
        work: 'Apuração de Haveres em Sociedades Empresárias',
        year: '2022'
      }
    ],
    overviewText: 'Resolução da sociedade em relação a um sócio, cálculo de haveres e liquidação.',
    recommendedBibliography: [
      'BARBOSA FILHO, Marcelo Fortes. Apuração de Haveres em Sociedades Empresárias.',
      'TOMAZETTE, Marlon. Curso de Direito Empresarial. Vol. 1.'
    ]
  },
  {
    id: 17,
    lessonNumber: 17,
    dateStr: '02/12',
    fullDate: '02 de dezembro de 2026',
    title: 'Rinha de Calouros e Encerramento do Semestre',
    subtitle: 'Competição de simulação em arbitragem societária e julgamento por banca examinadora',
    duration: '60 minutos',
    phase: 'Reorganizações & Prática',
    instructorName: '',
    instructorRole: '',
    actualProfessor: '',
    actualProfessorRole: '',
    status: 'upcoming',
    slidesUrl: '',
    slidesTitle: '',
    materials: [],
    links: [],
    bibliographyItems: [],
    personalNotes: '',
    keyPoints: [
      'Apresentação dos memoriais das equipes da simulação de arbitragem societária',
      'Sustentação oral perante tribunal arbitral simulado composto por advogados de escritórios parceiros',
      'Premiação da melhor equipe, melhor orador e entrega de certificados do Ciclo 2026.2'
    ],
    legislation: [
      {
        lawTag: 'LEI 9.307/96',
        article: 'Art. 1º',
        text: 'As pessoas capazes de contratar poderão valer-se da arbitragem para dirimir litígios relativos a direitos patrimoniais disponíveis.',
        sourceName: 'Lei de Arbitragem'
      }
    ],
    doctrineQuotes: [],
    overviewText: 'Fechamento do ciclo com competição prática de arbitragem corporativa.',
    recommendedBibliography: [
      'CARMONA, Carlos Alberto. Arbitragem e Processo.',
      'LEMES, Selma Ferreira. Cláusula Compromissória e Direito Societário.'
    ]
  }
];
