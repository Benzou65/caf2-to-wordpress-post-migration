export interface IPhotosSorties {
  id: number
  FK_sortie: number
  nomfichier: string
  commentaire: string
}

type IPhotosSortiesWithoutFK = Omit<IPhotosSorties, 'FK_sortie'>
export interface ISortie {
  id: number
  nom: string
  datedu: string
  dateau: string
  FK_typesortie: number
  description: string
  deniv: number
  FK_difficulte: number
  nbpart: number
  FK_resp: number
  ya_photos: number
  lienhttp: string
  auteurs: string
  visible: number
  date_crea: string
  FK_crea_parqui: number
  date_modif: string
  FK_modif_parqui: number
}

export interface ISortieConcatenated {
  id: number
  nom: string
  datedu: string
  dateau: string
  description: string
  deniv: number
  nbpart: number
  lienhttp: string
  auteurs: string
  date_crea: string
  typesortie: string
  difficulte: string
  photosSortie: IPhotosSortiesWithoutFK[]
}
