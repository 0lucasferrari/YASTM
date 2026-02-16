export interface CreateTeamInputDTO {
  name: string;
  created_by: string;
}

export interface UpdateTeamInputDTO {
  id: string;
  name?: string;
  updated_by: string;
}

export interface TeamOutputDTO {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

