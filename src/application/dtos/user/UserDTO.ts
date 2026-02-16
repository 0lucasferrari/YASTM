export interface UserOutputDTO {
  id: string;
  name: string;
  email: string;
  team_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateUserInputDTO {
  id: string;
  name?: string;
  email?: string;
  team_id?: string | null;
  updated_by: string;
}

