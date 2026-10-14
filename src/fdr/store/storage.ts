import { Estado } from '../domain/types';
import { criarEstadoInicial } from '../data/initialState';
import { migrarEstado } from '../data/migrations';
import { EstadoCompletoSchema } from '../data/schema';

export const CHAVE_STORAGE = 'bruna-fdr:v1';

let memoriaFallback: Estado | null = null;
let usandoFallbackMemoria = false;

export function estaUsandoFallback(): boolean {
  return usandoFallbackMemoria;
}

export function carregarEstadoDoStorage(): Estado {
  try {
    const salvo = typeof window !== 'undefined' ? localStorage.getItem(CHAVE_STORAGE) : null;
    if (salvo) {
      const objeto = JSON.parse(salvo);
      const migrado = migrarEstado(objeto);
      const validado = EstadoCompletoSchema.safeParse(migrado);
      if (validado.success) {
        return validado.data as Estado;
      } else {
        console.warn('Dados no localStorage com formato desatualizado, restaurando padrão:', validado.error);
      }
    }
  } catch (erro) {
    console.warn('localStorage inacessível, ativando fallback em memória:', erro);
    usandoFallbackMemoria = true;
  }

  if (memoriaFallback) {
    return memoriaFallback;
  }

  const inicial = criarEstadoInicial();
  memoriaFallback = inicial;
  return inicial;
}

let timeoutDebounce: ReturnType<typeof setTimeout> | null = null;

export function salvarEstadoNoStorage(estado: Estado, debounceMs: number = 300): void {
  if (timeoutDebounce) {
    clearTimeout(timeoutDebounce);
  }
  timeoutDebounce = setTimeout(() => {
    try {
      memoriaFallback = estado;
      if (typeof window !== 'undefined') {
        const json = JSON.stringify(estado);
        localStorage.setItem(CHAVE_STORAGE, json);
        usandoFallbackMemoria = false;
      }
    } catch (erro) {
      console.warn('Falha ao salvar no localStorage, mantendo em memória:', erro);
      usandoFallbackMemoria = true;
    }
  }, debounceMs);
}
