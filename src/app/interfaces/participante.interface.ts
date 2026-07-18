export interface Participante {
  id: string;
  user_id: string;
  codigo: string;
  rango_edad: string;
  genero: string;
  comunidades: string[];
  escuela: string;
  programa: string;
  nivel_socioeconomico: number;
  ideologia: string;
  ideologia_otro?: string | null;
  fecha: string;
}
