import { Evento } from './Evento';
import { UserUpdate } from './identity/UserUpdate';
import { RedeSocial } from './RedeSocial';

export interface Palestrante {
  id: number;
  user: UserUpdate;
  miniCurriculo: string;
  redesSociais: RedeSocial[];
  palestrantesEventos: Evento[];
}
