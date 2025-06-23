export interface UserType {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
}

export type MessageReactionType = {
  id: string;
  react: string;
  react_by: UserType;
  created_at: string;
};
