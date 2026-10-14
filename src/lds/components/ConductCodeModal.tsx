/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LdsCrest } from './LdsBrand';
import { X, ShieldCheck } from 'lucide-react';

interface ConductCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConductCodeModal: React.FC<ConductCodeModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      title: 'Finalidade da Convivência',
      desc: 'O Código de Conduta existe para fomentar o convívio leal entre os membros da Liga e estabelecer um padrão de probidade e ética dentro e fora da Faculdade.'
    },
    {
      title: 'Respeito e Urbanidade',
      desc: 'Todos os membros da Liga devem tratar seus pares, superiores e convidados com rigoroso respeito, urbanidade e deferência acadêmica.'
    },
    {
      title: 'Hombridade e Integridade',
      desc: 'Fora das reuniões, os membros da Liga devem se comportar com hombridade, honradez e responsabilidade social; desvios éticos ou falta de caráter não serão tolerados.'
    },
    {
      title: 'Zelo Patrimonial',
      desc: 'Não será admitido descaso com a propriedade privada dos membros e da LDS-FDR, tampouco com as instalações históricas e a biblioteca da Faculdade de Direito do Recife.'
    },
    {
      title: 'Resolução Imparcial de Conflitos',
      desc: 'Quaisquer desavenças internas deverão ser submetidas ao Conselho de Diretores, que possui jurisdição estatutária para mediar disputas de forma estritamente imparcial.'
    },
    {
      title: 'Pontualidade e Frequência Estrita',
      desc: 'É dever inafastável atender às reuniões no horário marcado (quartas-feiras às 20h00). O limite máximo de faltas sem justificativa prévia é de 3 (três) no ciclo; o atingimento deste teto implica eliminação automática.'
    },
    {
      title: 'Sobriedade e Postura Universitária',
      desc: 'Os membros devem demonstrar contínua aptidão acadêmica, preparo prévio dos textos das aulas e temperança durante os debates e arguições.'
    },
    {
      title: 'Padrão de Vestimenta Apropriado',
      desc: 'Nas reuniões solenes, bancas da rinha de calouros e eventos institucionais com escritórios e palestrantes, os membros devem trajar vestimenta condizente com a tradição jurídica.'
    },
    {
      title: 'Sigilo e Confidencialidade',
      desc: 'Em resguardo dos assuntos e estratégias da Liga e dos casos hipotéticos sob análise, os membros devem portar-se com discrição, vedado o compartilhamento indevido de materiais restritos.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF5EA] border border-[#A7002F]/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#5C0A22] text-[#FAF5EA] flex items-center justify-between border-b border-[#A7002F]">
          <div className="flex items-center gap-3">
            <LdsCrest size={32} color="#FAF5EA" />
            <div>
              <div className="eyebrow-lds text-[#FAF5EA]/80 text-[10px] tracking-widest uppercase">
                ESTATUTO & REGIMENTO INTERNO
              </div>
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white leading-tight">
                Código de Conduta da LDS FDR
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 font-['Source_Serif_4',serif] text-sm text-[#211A15]">
          <div className="p-4 bg-[#F4EDE0] border-l-4 border-[#A7002F] rounded-r-2xl text-xs font-['Inter',sans-serif] text-[#6B5D4F] leading-relaxed">
            <span className="font-bold text-[#A7002F]">Normas de Convivência: </span>
            O presente regramento vincula todos os pesquisadores, membros efetivos e membros do período de ingresso durante as atividades do Grupo de Estudos e projetos extraordinários da entidade.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-[#E5DBCA] rounded-2xl shadow-xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-['Inter',sans-serif] text-[#A7002F] bg-[#FAF5EA] px-2 py-0.5 rounded-full border border-[#A9832E]/30">
                    Art. {idx + 1}
                  </span>
                  <h4 className="font-['Cormorant_Garamond',serif] font-bold text-[#211A15] text-base">
                    {rule.title}
                  </h4>
                </div>
                <p className="text-xs text-[#211A15] leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4EDE0] border-t border-[#E5DBCA] flex items-center justify-between text-xs text-[#6B5D4F] font-['Inter',sans-serif]">
          <span>Faculdade de Direito do Recife • Praça Adolfo Cirne, Recife/PE</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-full cursor-pointer shadow-xs"
          >
            Compreendido
          </button>
        </div>
      </div>
    </div>
  );
};
