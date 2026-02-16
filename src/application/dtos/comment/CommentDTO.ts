export interface CreateCommentInputDTO {
  task_id: string;
  creator_id: string;
  content: string;
  created_by: string;
}

export interface UpdateCommentInputDTO {
  id: string;
  content: string;
  updated_by: string;
}

export interface CommentOutputDTO {
  id: string;
  task_id: string;
  creator_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

