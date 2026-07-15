export type RespuestaValor = -2 | -1 | 0 | 1 | 2;

export interface Respuesta {
  id: string;
  participante_id: string;
  pregunta_id: string;
  valor: RespuestaValor;
}
