import { Injectable, signal } from '@angular/core';

import { Resultado } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TestStateService {
  private readonly participanteStorageKey = 'compass_politico_participante_id';
  readonly participanteId = signal<string | null>(null);
  readonly resultado = signal<Resultado | null>(null);

  constructor() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const storedParticipanteId = localStorage.getItem(this.participanteStorageKey);

    if (storedParticipanteId) {
      this.participanteId.set(storedParticipanteId);
    }
  }

  setParticipanteId(participanteId: string): void {
    this.participanteId.set(participanteId);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.participanteStorageKey, participanteId);
    }
  }

  setResultado(resultado: Resultado): void {
    this.resultado.set(resultado);
  }

  clear(): void {
    this.participanteId.set(null);
    this.resultado.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.participanteStorageKey);
    }
  }
}
