export type CategoriaPolitica =
  | 'derecha-autoritario'
  | 'derecha-libertario'
  | 'izquierda-autoritario'
  | 'izquierda-libertario'
  | 'centro';

export function determinarCategoria(x: number, y: number): CategoriaPolitica {
  if (x === 0 && y === 0) {
    return 'centro';
  }

  if (x >= 0 && y >= 0) {
    return 'derecha-autoritario';
  }

  if (x >= 0 && y < 0) {
    return 'derecha-libertario';
  }

  if (x < 0 && y >= 0) {
    return 'izquierda-autoritario';
  }

  return 'izquierda-libertario';
}

export function formatearCategoria(categoria: CategoriaPolitica): string {
  switch (categoria) {
    case 'derecha-autoritario':
      return 'Derecha Autoritaria';
    case 'derecha-libertario':
      return 'Derecha Libertaria';
    case 'izquierda-autoritario':
      return 'Izquierda Autoritaria';
    case 'izquierda-libertario':
      return 'Izquierda Libertaria';
    case 'centro':
      return 'Centro';
  }
}
