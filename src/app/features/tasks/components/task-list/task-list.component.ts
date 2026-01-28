import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../models/task.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  pagedTasks: Task[] = [];

  searchText = '';

  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 1;

  showDeleteModal = false;
  deleteTaskId: string | null = null;
  deleteTaskName = '';

  minPageSize = 1;
  maxPageSize = 50;
  step = 1;

  isBulkDelete = false;
  selectedTaskCount = 0;

  selectedTaskIds = new Set<string>();

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadTasks();

    this.taskService.onRefresh().subscribe(() => {
      this.loadTasks();
    });

    this.route.queryParams.subscribe((params) => {
      if (params['lastPage']) {
        this.goToLast();
      }
    });
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe((data) => {
      this.tasks = data;
      this.filteredTasks = [...this.tasks];
      console.log('Tasks loaded:', this.tasks);
      console.log('Filtered Tasks:', this.filteredTasks);
      this.totalRecords = this.filteredTasks.length;
      this.calculatePagination();
    });
  }

  onSearch(): void {
    this.filteredTasks = this.tasks.filter(
      (task) =>
        task.assignedTo.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.status.toLowerCase().includes(this.searchText.toLowerCase()),
    );

    this.page = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalRecords = this.filteredTasks.length;

    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

    if (this.page > this.totalPages) {
      this.page = this.totalPages || 1;
    }

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.pagedTasks = this.filteredTasks.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.calculatePagination();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.calculatePagination();
    }
  }

  goToFirst(): void {
    this.page = 1;
    this.calculatePagination();
  }

  goToLast(): void {
    this.page = this.totalPages;
    this.calculatePagination();
  }

  addTask(): void {
    this.router.navigate(['/tasks/add']);
  }

  editTask(id: string): void {
    this.router.navigate(['/tasks/edit', id]);
  }

  openDeleteModal(task: Task): void {
    this.isBulkDelete = false;
    this.deleteTaskId = task.id!;
    this.deleteTaskName = task.assignedTo;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTaskId = null;
  }

  confirmDelete() {
    if (this.isBulkDelete) {
      this.bulkDeleteConfirmed();
    } else {
      this.deleteSingleConfirmed();
    }

    this.showDeleteModal = false;
  }

  deleteSingleConfirmed() {
    if (!this.deleteTaskId) return;

    this.taskService.deleteTask(this.deleteTaskId).subscribe(() => {
      this.filteredTasks = this.filteredTasks.filter(
        (t) => t.id !== this.deleteTaskId,
      );
      this.calculatePagination();
      this.closeDeleteModal();
    });
  }

  hasSelection(): boolean {
    return this.tasks.some((t: any) => t.selected);
  }

  bulkDeleteConfirmed(): void {
    const ids = Array.from(this.selectedTaskIds);
    if (!ids.length) return;

    const deleteNext = (index: number) => {
      if (index >= ids.length) {
        this.selectedTaskIds.clear();
        return;
      }

      const id = ids[index];
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.selectedTaskIds.delete(id);

          this.filteredTasks = this.filteredTasks.filter((t) => t.id !== id);

          this.calculatePagination();

          setTimeout(() => deleteNext(index + 1), 100);
        },
        error: (err) => {
          console.error(`Failed to delete task ${id}`, err);
          setTimeout(() => deleteNext(index + 1), 100);
        },
      });
    };

    deleteNext(0);
  }

  increasePageSize(): void {
    if (this.pageSize < this.maxPageSize) {
      this.pageSize += this.step;
      this.page = 1;
      this.calculatePagination();
    }
  }

  decreasePageSize(): void {
    if (this.pageSize > this.minPageSize) {
      this.pageSize -= this.step;
      this.page = 1;
      this.calculatePagination();
    }
  }

  isSelected(id: string): boolean {
    return this.selectedTaskIds.has(id);
  }

  toggleTask(id: string, event: any): void {
    if (event.target.checked) {
      this.selectedTaskIds.add(id);
    } else {
      this.selectedTaskIds.delete(id);
    }
  }

  isAllSelected(): boolean {
    return (
      this.filteredTasks.length > 0 &&
      this.selectedTaskIds.size === this.filteredTasks.length
    );
  }

  toggleAll(event: any): void {
    if (event.target.checked) {
      this.filteredTasks.forEach((task) => this.selectedTaskIds.add(task.id!));
    } else {
      this.selectedTaskIds.clear();
    }
  }

  closeFormModal(): void {
    this.router.navigate(['/tasks']);
  }

  isFormRouteActive(): boolean {
    const active = !!this.route.firstChild;
    document.body.style.overflow = active ? 'hidden' : '';
    return active;
  }

  openBulkDeleteModal() {
    this.isBulkDelete = true;
    this.selectedTaskCount = this.selectedTaskIds.size;
    this.showDeleteModal = true;
  }
}
