export interface CreateStatusInputDTO {
  title: string;
  description?: string | null;
  created_by: string;
}

export interface UpdateStatusInputDTO {
  id: string;
  title?: string;
  description?: string | null;
  updated_by: string;
}

export interface StatusOutputDTO {
  id: string;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

