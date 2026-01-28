import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Task } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly API_URL = 'https://6979ed46cc9c576a8e184139.mockapi.io/api/v1/tasks';

  private refreshTasks$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task);
  }

  updateTask(id: string, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${id}`, task);
  }

  deleteTask(id: any): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  triggerRefresh() {
    this.refreshTasks$.next();
  }

  onRefresh(): Observable<void> {
    return this.refreshTasks$.asObservable();
  }
}
