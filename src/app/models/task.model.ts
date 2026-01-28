export interface Task {
  id?: string;
  assignedTo: string;
  status: string;
  dueDate: Date;
  priority: string;
  comments: string;
  selected?: boolean;
}
