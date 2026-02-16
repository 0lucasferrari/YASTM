export interface RegisterInputDTO {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutputDTO {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

