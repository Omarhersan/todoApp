export type Todo = {
  id: number;
  title: string;
  created_at: string;
  is_completed: boolean;
  completed_at: string | null;
  description: string;
  user_id: number;
  enhanced_title?: string;
  steps?: string[];
  enhancement_status?: string;
};
