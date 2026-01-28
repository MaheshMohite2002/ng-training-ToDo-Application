import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../models/task.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent implements OnInit {
  task: Task = {
    assignedTo: '',
    status: 'Not Started',
    dueDate: new Date(),
    priority: 'Normal',
    comments: '',
  };

  isEditMode = false;
  taskId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');

    if (this.taskId) {
      this.isEditMode = true;
      this.loadTaskById(this.taskId);
    }
  }

  loadTaskById(id: string): void {
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        this.task = response;
      },
      error: (err) => {
        console.error('Error loading task', err);
      },
    });
  }

  saveTask(): void {
    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, this.task).subscribe({
        next: () => {
          this.taskService.triggerRefresh();
          this.navigateAfterSave(false);
        },
        error: (err) => console.error('Update failed', err),
      });
    } else {
      this.taskService.addTask(this.task).subscribe({
        next: () => {
          this.taskService.triggerRefresh();
          this.navigateAfterSave(true);
        },
        error: (err) => console.error('Create failed', err),
      });
    }
  }

  private navigateAfterSave(goToLastPage: boolean): void {
    if (goToLastPage) {
      this.router.navigate(['/tasks'], { queryParams: { lastPage: true } });
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  cancel(): void {
    this.navigateAfterSave(false);
  }
}
