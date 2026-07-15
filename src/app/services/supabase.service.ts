import { Injectable } from '@angular/core';
import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';
import { Pregunta, Respuesta, RespuestaValor, Resultado } from '../interfaces';

type NuevaRespuesta = Pick<Respuesta, 'pregunta_id' | 'valor'>;
type NuevoResultado = Pick<Resultado, 'x' | 'y' | 'categoria'>;

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async getPreguntas(): Promise<Pregunta[]> {
    const { data, error } = await this.supabase.from('preguntas').select('*').order('id');

    if (error) {
      this.throwSupabaseError('No se pudieron cargar las preguntas', error);
    }

    return data ?? [];
  }

  async crearParticipante(nombre: string, edad?: number): Promise<string> {
    const userId = await this.ensureUserId();
    const participante = {
      user_id: userId,
      nombre,
      ...(edad === undefined ? {} : { edad }),
    };

    const { data, error } = await this.supabase.from('participantes').insert(participante).select('id').single();

    if (error) {
      this.throwSupabaseError('No se pudo crear el participante', error);
    }

    return data.id;
  }

  async guardarRespuestas(participanteId: string, respuestas: NuevaRespuesta[]): Promise<void> {
    const rows = respuestas.map((respuesta) => ({
      participante_id: participanteId,
      pregunta_id: respuesta.pregunta_id,
      valor: respuesta.valor satisfies RespuestaValor,
    }));

    const { error } = await this.supabase.from('respuestas').insert(rows);

    if (error) {
      this.throwSupabaseError('No se pudieron guardar las respuestas', error);
    }
  }

  async guardarResultado(participanteId: string, x: number, y: number, categoria: string): Promise<void> {
    const resultado: NuevoResultado & { participante_id: string } = {
      participante_id: participanteId,
      x,
      y,
      categoria,
    };

    const { error } = await this.supabase.from('resultados').insert(resultado);

    if (error) {
      this.throwSupabaseError('No se pudo guardar el resultado', error);
    }
  }

  async getResultado(participanteId: string): Promise<Resultado | null> {
    const { data, error } = await this.supabase
      .from('resultados')
      .select('*')
      .eq('participante_id', participanteId)
      .maybeSingle();

    if (error) {
      this.throwSupabaseError('No se pudo cargar el resultado', error);
    }

    return data;
  }

  private throwSupabaseError(message: string, error: PostgrestError): never {
    throw new Error(`${message}: ${error.message}`);
  }

  private async ensureUserId(): Promise<string> {
    const { data: sessionData } = await this.supabase.auth.getSession();

    if (sessionData.session?.user.id) {
      return sessionData.session.user.id;
    }

    const { data: signInData, error: signInError } = await this.supabase.auth.signInAnonymously();

    if (signInError) {
      throw new Error(
        'No hay sesión de Supabase y no se pudo crear una sesión anónima. ' +
          'Habilita Anonymous Sign-Ins en Supabase Auth o inicia sesión antes de comenzar.'
      );
    }

    const anonymousUserId = signInData.user?.id;

    if (!anonymousUserId) {
      throw new Error('No se pudo obtener el user_id de Supabase.');
    }

    return anonymousUserId;
  }
}
