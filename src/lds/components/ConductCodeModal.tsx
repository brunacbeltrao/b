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
      <div className="bg-[#f6f5f7] border border-[#8b1538]/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#6f0f2c] text-[#f6f5f7] flex items-center justify-between border-b border-[#8b1538]">
          <div className="flex items-center gap-3">
            <LdsCrest size={32} color="#f6f5f7" />
            <div>
              <div className="eyebrow-lds text-[#f6f5f7]/80 text-xs">
                ESTATUTO & REGIMENTO INTERNO
              </div>
              <h2 className="font-serif-title text-2xl font-bold text-white leading-tight">
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
        <div className="p-6 overflow-y-auto space-y-4 font-['Source_Serif_4',serif] text-sm text-[#1c1a1e]">
          <div className="p-4 bg-[#f6f5f7] border-l-4 border-[#8b1538] rounded-r-2xl text-xs text-[#625d66] leading-relaxed">
            <span className="font-bold text-[#8b1538]">Normas de Convivência: </span>
            O presente regramento vincula todos os pesquisadores, membros efetivos e membros do período de ingresso durante as atividades do Grupo de Estudos e projetos extraordinários da entidade.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-[#e6e4e8] rounded-2xl shadow-xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8b1538] bg-[#f6f5f7] px-2 py-0.5 rounded-full border border-[#625d66]/30">
                    Art. {idx + 1}
                  </span>
                  <h4 className="font-serif-title font-bold text-[#1c1a1e] text-base">
                    {rule.title}
                  </h4>
                </div>
                <p className="text-xs text-[#1c1a1e] leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f6f5f7] border-t border-[#e6e4e8] flex items-center justify-between text-xs text-[#625d66]">
          <span>Faculdade de Direito do Recife • Praça Adolfo Cirne, Recife/PE</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#8b1538] hover:bg-[#6f0f2c] rounded-full cursor-pointer shadow-xs"
          >
            Compreendido
          </button>
        </div>
      </div>
    </div>
  );
};
