import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // GET
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  getEventsByStudent(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students/${studentId}/events`);
  }

  // POST
  addStudent(student: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/students`, student);
  }

  addEvent(studentId: number, event: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/events?studentId=${studentId}`,
      event
    );
  }
}
