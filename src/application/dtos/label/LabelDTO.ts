export interface CreateLabelInputDTO {
  title: string;
  description?: string | null;
  created_by: string;
}

export interface UpdateLabelInputDTO {
  id: string;
  title?: string;
  description?: string | null;
  updated_by: string;
}

export interface LabelOutputDTO {
  id: string;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

