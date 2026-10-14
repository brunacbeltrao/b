import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { LESSONS_DATABASE, FACULTY_MEMBERS } from './src/lds/data/curriculum';
import { INITIAL_DOCUMENTS } from './src/lds/data/documents';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Shared Gemini client utility on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to find lesson by number or date string
function findLesson(query: string | number): (typeof LESSONS_DATABASE)[0] {
  if (typeof query === 'number') {
    return LESSONS_DATABASE.find(l => l.lessonNumber === query) || LESSONS_DATABASE[1];
  }
  const clean = query.trim().toLowerCase();
  const matchNum = clean.match(/aula\s*0?(\d+)/i) || clean.match(/^0?(\d+)$/);
  if (matchNum) {
    const num = parseInt(matchNum[1], 10);
    const found = LESSONS_DATABASE.find(l => l.lessonNumber === num);
    if (found) return found;
  }
  const matchDate = clean.match(/(\d{1,2})\/(\d{1,2})/);
  if (matchDate) {
    const dStr = `${matchDate[1].padStart(2, '0')}/${matchDate[2].padStart(2, '0')}`;
    const found = LESSONS_DATABASE.find(l => l.dateStr === dStr);
    if (found) return found;
  }
  return LESSONS_DATABASE.find(l => l.title.toLowerCase().includes(clean)) || LESSONS_DATABASE[1];
}

// Fallback high-rigor generator when API key is not yet set or during offline mode
function buildFallbackApostila(lessonNumber: number, customFocus?: string) {
  const lesson = LESSONS_DATABASE.find(l => l.lessonNumber === lessonNumber) || LESSONS_DATABASE[1];
  const docs = INITIAL_DOCUMENTS.filter(d => d.lessonNumber === lesson.lessonNumber);
  return {
    id: `apostila-${lesson.lessonNumber}-${Date.now()}`,
    lessonNumber: lesson.lessonNumber,
    lessonTitle: lesson.title,
    lessonDate: lesson.fullDate,
    generatedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    eyebrow: `GRUPO DE ESTUDOS • CICLO-BASE DE DIREITO SOCIETÁRIO`,
    introduction: `A presente anotação acadêmica estrutura os fundamentos dogmáticos e práticos do encontro nº ${lesson.lessonNumber.toString().padStart(2, '0')} do Grupo de Estudos da Liga de Direito Societário e Mercado de Capitais da Faculdade de Direito do Recife (FDR/UFPE). O tema central orbita em torno de "${lesson.title}", com ênfase no método do caso e na hermenêutica dos dispositivos da Lei nº 6.404/76 e do Código Civil de 2002. ${customFocus ? `\n\nFoco temático priorizado: ${customFocus}.` : ''}`,
    keyPoints: lesson.keyPoints,
    legislation: lesson.legislation,
    doctrineQuotes: lesson.doctrineQuotes,
    comparisonTable: lesson.comparisonTable || {
      title: 'Tabela Analítica Dogmática',
      leftHeader: 'CRITÉRIO TEÓRICO / REGULATÓRIO',
      rightHeader: 'IMPLICAÇÃO PRÁTICA NO MERCADO',
      rows: [
        {
          criterion: 'Segurança Jurídica e Tutela da Confiança',
          left: 'Exigência de publicidade registral dos atos societários e livros contábeis.',
          right: 'Mitigação da assimetria informacional e atração de liquidez ao capital social.'
        },
        {
          criterion: 'Autonomia da Pessoa Jurídica',
          left: 'Segregação patrimonial imperativa prevista no art. 49-A do Código Civil.',
          right: 'Estímulo ao empreendimento inovador com delimitação expressa do risco negocial.'
        }
      ]
    },
    detailedAnalysis: `### 1. Enquadramento Dogmático e Evolução Histórica\n\nO estudo de ${lesson.title.toLowerCase()} na Faculdade de Direito do Recife reclama a compreensão da empresa enquanto atividade econômica organizada voltada à circulação e produção de bens e serviços. A superação da teoria dos atos de comércio napoleônica em favor da teoria da empresa (adotada formalmente pelo Código Civil de 2002 a partir do modelo italiano de 1942) deslocou o foco do comerciante isolado para a estrutura societária institucionalizada.\n\n### 2. Análise Exegética dos Dispositivos Aplicáveis\n\nConforme estabelece a redação legal, os direitos essenciais dos sócios e acionistas configuram o núcleo inviolável da relação societária. A vedação a práticas espoliativas ou deliberações abusivas pelo acionista controlador ou administrador encontra salvaguarda expressa nos deveres fiduciários de lealdade e diligência. Como ressalta a melhor doutrina societária brasileira, a tutela do investidor minoritário não visa engessar a administração da companhia, mas garantir a lisura e a confiança no mercado de capitais.\n\n### 3. Síntese dos Documentos Vinculados\n\n${docs.length > 0 ? docs.map(d => `• **${d.title}** (${d.type}): ${d.summary}`).join('\n') : 'Não foram anexados documentos acessórios extraordinários para esta sessão; prevalece a legislação federal e a doutrina recomendada no plano de aula.'}`,
    jurisprudenceCase: {
      title: `Precedente Paradigmático em ${lesson.title}`,
      courtOrAgency: 'Comissão de Valores Mobiliários (CVM) & STJ',
      caseNumber: `Processo de Referência LDS-FDR/${lesson.lessonNumber.toString().padStart(2, '0')}`,
      summary: 'A jurisprudência consolidada reafirma a prevalência da boa-fé objetiva, a necessidade de fundamentação técnica das decisões assembleares e o respeito intransigente às cláusulas estatutárias regularmente arquivadas.'
    },
    conclusion: `A correta apreensão dos institutos de ${lesson.title.toLowerCase()} confere ao pesquisador da FDR a base sólida necessária para a resolução dos casos complexos da rinha de calouros e para a prática jurídica de alto nível no mercado financeiro nacional.`,
    footerReference: `LDS-FDR • GRUPO DE ESTUDOS 2026.2 • AULA ${lesson.lessonNumber.toString().padStart(2, '0')}`
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'Personal OS • Bruna Beltrão (FDR & LDS)',
      timestamp: new Date().toISOString(),
    });
  });

  // Daily reflection & quote
  app.get('/api/daily-brief', (_req, res) => {
    const quotes = [
      {
        quote: "A excelência não é um ato, mas um hábito.",
        author: "Aristóteles",
        context: "Executivo & Acadêmico",
      },
      {
        quote: "O segredo do sucesso na advocacia e na liderança é a preparação minuciosa e a escuta ativa.",
        author: "Faculdade de Direito do Recife",
        context: "Liderança e Negócios",
      },
      {
        quote: "A disciplina é a ponte entre metas e realizações.",
        author: "Jim Rohn",
        context: "Rotina & Alta Performance",
      },
    ];
    const todayIndex = new Date().getDay() % quotes.length;
    res.json({
      brief: quotes[todayIndex],
      date: new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
  });

  // LDS Endpoints
  app.get('/api/lessons', (_req, res) => {
    res.json({ success: true, data: LESSONS_DATABASE });
  });

  app.get('/api/documents', (_req, res) => {
    res.json({ success: true, data: INITIAL_DOCUMENTS });
  });

  app.get('/api/faculty', (_req, res) => {
    res.json({ success: true, data: FACULTY_MEMBERS });
  });

  // POST /api/gemini/generate-notes
  app.post('/api/gemini/generate-notes', async (req, res) => {
    try {
      const { lessonNumber = 2, customFocus = '', additionalDocs = '' } = req.body;
      const lesson = LESSONS_DATABASE.find(l => l.lessonNumber === Number(lessonNumber)) || LESSONS_DATABASE[1];
      const docs = INITIAL_DOCUMENTS.filter(d => d.lessonNumber === lesson.lessonNumber);

      if (!ai) {
        const fallback = buildFallbackApostila(lesson.lessonNumber, customFocus);
        return res.json({ success: true, data: fallback, mode: 'template' });
      }

      const systemInstruction = `Você é o Agente de Inteligência Artificial Especializado do Sistema LDS FDR (Liga de Direito Societário e Mercado de Capitais da tradicional Faculdade de Direito do Recife - FDR/UFPE, fundada em 1827). Sua missão é atuar como redator acadêmico sênior, com absoluto rigor metodológico, fidelidade dogmática e precisão conceitual. Responda ESTRITAMENTE em formato JSON compatível com o schema requisitado.`;

      const promptText = `Gere a Apostila Acadêmica Técnica Completa para o seguinte encontro do Ciclo-base 2026.2:
- Número da Aula: Aula ${lesson.lessonNumber.toString().padStart(2, '0')}
- Título Oficial: ${lesson.title}
- Data Oficial: ${lesson.fullDate} (${lesson.dateStr})
- Carga Horária: ${lesson.duration}
- Fase do Curso: ${lesson.phase}
- Pontos Base do Programa: ${lesson.keyPoints.join('; ')}
- Legislação Preliminar do Programa: ${JSON.stringify(lesson.legislation)}
- Doutrina Preliminar: ${JSON.stringify(lesson.doctrineQuotes)}
${customFocus ? `- Foco Customizado Solicitado pelo Aluno/Pesquisador: ${customFocus}` : ''}
${docs.length > 0 ? `- Documentos de Apoio Existentes no Repositório:\n${docs.map(d => `${d.title} (${d.type}): ${d.summary}`).join('\n')}` : ''}
${additionalDocs ? `- Documentos Adicionais Fornecidos:\n${additionalDocs}` : ''}
Elabore um texto acadêmico de excelência e máxima densidade dogmática.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              eyebrow: { type: Type.STRING },
              lessonTitle: { type: Type.STRING },
              lessonDate: { type: Type.STRING },
              introduction: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              legislation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    lawTag: { type: Type.STRING },
                    article: { type: Type.STRING },
                    text: { type: Type.STRING },
                    sourceName: { type: Type.STRING },
                    commentary: { type: Type.STRING }
                  },
                  required: ['lawTag', 'article', 'text', 'sourceName']
                }
              },
              doctrineQuotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    quote: { type: Type.STRING },
                    author: { type: Type.STRING },
                    work: { type: Type.STRING },
                    year: { type: Type.STRING }
                  },
                  required: ['quote', 'author', 'work']
                }
              },
              comparisonTable: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  leftHeader: { type: Type.STRING },
                  rightHeader: { type: Type.STRING },
                  rows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criterion: { type: Type.STRING },
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      },
                      required: ['criterion', 'left', 'right']
                    }
                  }
                },
                required: ['title', 'leftHeader', 'rightHeader', 'rows']
              },
              detailedAnalysis: { type: Type.STRING },
              jurisprudenceCase: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  courtOrAgency: { type: Type.STRING },
                  caseNumber: { type: Type.STRING },
                  summary: { type: Type.STRING }
                },
                required: ['title', 'courtOrAgency', 'caseNumber', 'summary']
              },
              conclusion: { type: Type.STRING },
              footerReference: { type: Type.STRING }
            },
            required: [
              'eyebrow',
              'lessonTitle',
              'lessonDate',
              'introduction',
              'keyPoints',
              'legislation',
              'doctrineQuotes',
              'detailedAnalysis',
              'conclusion',
              'footerReference'
            ]
          }
        }
      });

      const parsedJson = JSON.parse(response.text || '{}');
      const resultData = {
        id: `apostila-${lesson.lessonNumber}-${Date.now()}`,
        lessonNumber: lesson.lessonNumber,
        ...parsedJson
      };
      res.json({ success: true, data: resultData, mode: 'gemini' });
    } catch (error) {
      console.error('Error generating notes with Gemini:', error);
      const { lessonNumber = 2, customFocus = '' } = req.body;
      const fallback = buildFallbackApostila(Number(lessonNumber), customFocus);
      res.json({ success: true, data: fallback, mode: 'fallback_on_error', error: String(error) });
    }
  });

  // POST /api/gemini/chat
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message = '', conversationHistory = [] } = req.body;
      const referencedLesson = findLesson(message);

      if (!ai) {
        const reply = `[Agente LDS FDR • Modo Integrado]\nIdentifiquei referência ao tema do ciclo-base: **Aula ${referencedLesson.lessonNumber.toString().padStart(2, '0')} - ${referencedLesson.title}** (${referencedLesson.fullDate}).\n\n📌 **Dispositivos normativos essenciais**: ${referencedLesson.legislation.map(l => `${l.lawTag} ${l.article}`).join(', ')}.\n📌 **Pontos dogmáticos principais**:\n${referencedLesson.keyPoints.map(kp => `• ${kp}`).join('\n')}\n\nConsulte os detalhes na aba de Acompanhamento das Aulas para ver slides e bibliografia.`;
        return res.json({
          success: true,
          reply,
          lessonReferenced: referencedLesson.lessonNumber
        });
      }

      const systemInstruction = `Você é o Agente Inteligente Especializado do Sistema LDS FDR (Liga de Direito Societário e Mercado de Capitais da Faculdade de Direito do Recife - FDR/UFPE). Quando o usuário (por exemplo, Bruna ou outro membro do grupo) fornecer o número da aula ou uma dúvida corporativa, recupere o tema na base de dados oficial, liste a documentação pertinente e estruture uma resposta lógica, direta e fundamentada no padrão visual e dogmático da LDS FDR. Mantenha tom acadêmico culto, rigor terminológico e faça referências a dispositivos da Lei 6.404/76, Código Civil 2002 e doutrina autorizada. Cronograma do Ciclo-base 2026.2 disponível: ${LESSONS_DATABASE.map(l => `Aula ${l.lessonNumber} (${l.dateStr}): ${l.title}`).join('\n')}`;

      const formattedHistory = conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      res.json({
        success: true,
        reply: response.text,
        lessonReferenced: referencedLesson?.lessonNumber
      });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // POST /api/gemini/glossary-define
  app.post('/api/gemini/glossary-define', async (req, res) => {
    try {
      const { term = '', lessonNumber = 4 } = req.body;
      if (!term) {
        return res.status(400).json({ success: false, error: 'Termo é obrigatório' });
      }

      if (!ai) {
        return res.json({
          success: true,
          data: {
            term,
            category: 'Societário Básico',
            definition: `Conceito fundamental de Direito Societário e Mercado de Capitais abordado na Faculdade de Direito do Recife. Refere-se à disciplina jurídica e aos reflexos corporativos de ${term}.`,
            legalBasis: 'Lei 6.404/76 e Código Civil',
            practicalExample: `Aplicação prática de ${term} em deliberações societárias e atos de governança.`,
            tags: ['Societário', 'LDS FDR']
          }
        });
      }

      const systemInstruction = `Você é um jurista e professor de Direito Societário e Mercado de Capitais da Faculdade de Direito do Recife (FDR/UFPE). Gere uma definição técnica, rigorosa e prática para o termo societário fornecido pelo aluno. Responda ESTRITAMENTE em formato JSON com o seguinte schema:
- term: string
- latinOrEnglish: string opcional (termo correspondente em latim ou inglês, ex: "Duty of Care", "Tag Along Right")
- category: uma de ["Societário Básico", "Mercado de Capitais", "M&A & Reorganizações", "Governança & Fiduciário", "Processual & Conflitos"]
- definition: string (2 a 4 frases densas e conceituais)
- legalBasis: string (artigos específicos da Lei 6.404/76, Código Civil 10.406/02, Resoluções CVM ou jurisprudência do STJ)
- practicalExample: string (exemplo prático de aplicação em empresa, assembleia ou litígio)
- tags: array de strings (3 a 4 tags)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Gere a definição acadêmica para o termo de direito societário: "${term}". A aula associada sugerida é a Aula ${lessonNumber}.`,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, data: parsed });
    } catch (error) {
      console.error('Error in glossary-define:', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // POST /api/gemini/lesson-qa
  app.post('/api/gemini/lesson-qa', async (req, res) => {
    try {
      const { lessonNumber, question = '', personalNotes = '', attachedMaterials = [] } = req.body;
      const lesson = LESSONS_DATABASE.find(l => l.lessonNumber === Number(lessonNumber)) || LESSONS_DATABASE[0];

      if (!ai) {
        return res.json({
          success: true,
          answer: `[LDS FDR • Modo Local] Sobre a Aula ${lesson.lessonNumber} (${lesson.title}): os dispositivos legais essenciais são ${lesson.legislation.map(l => l.article).join(', ')}. Os pontos de debate centrais do programa são:\n${lesson.keyPoints.map(kp => `• ${kp}`).join('\n')}.`
        });
      }

      const systemInstruction = `Você é o tutor inteligente da Liga de Direito Societário e Mercado de Capitais da Faculdade de Direito do Recife (FDR/UFPE). O aluno está acompanhando a Aula ${lesson.lessonNumber} - "${lesson.title}" (${lesson.fullDate}). Professor que ministrou: ${lesson.actualProfessor || lesson.instructorName || 'Diretoria LDS FDR'}. Responda à dúvida do aluno com alta precisão jurídica, citando leis (Lei 6.404/76, CC/02, normas CVM) e doutrina consagrada. Seja didático, claro e estimulante.`;

      const prompt = `Contexto da Aula:
Título: ${lesson.title}
Data: ${lesson.fullDate}
Pontos-chave: ${lesson.keyPoints.join('\n')}
Legislação da Aula: ${JSON.stringify(lesson.legislation)}
Doutrina da Aula: ${JSON.stringify(lesson.doctrineQuotes)}
Anotações pessoais do aluno registradas na aula: ${personalNotes || 'Nenhuma anotação pessoal inserida ainda.'}
Materiais anexados: ${JSON.stringify(attachedMaterials)}
Pergunta do aluno sobre esta aula: "${question}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      res.json({ success: true, answer: response.text });
    } catch (error) {
      console.error('Error in lesson-qa:', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Vite middleware in dev or static files in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal OS Server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
