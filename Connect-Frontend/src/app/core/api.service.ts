import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8080';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    if (token) {
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      };
    }
    return { headers: new HttpHeaders() };
  }

  // ===== Auth =====
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, userData);
  }

  // ===== Users =====
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/users`, this.getHeaders());
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.base}/users`, user, this.getHeaders());
  }

  // ===== Events =====
  getEvents(page = 0, size = 20, sortBy = 'date', direction = 'desc'): Observable<any> {
    return this.http.get(`${this.base}/events?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, this.getHeaders());
  }

  createEvent(userId: number, event: any): Observable<any> {
    return this.http.post(`${this.base}/events?userId=${userId}`, event, this.getHeaders());
  }

  requestToJoin(eventId: number, userId: number): Observable<any> {
    return this.http.post(`${this.base}/events/${eventId}/request?userId=${userId}`, {}, this.getHeaders());
  }

  getJoinRequests(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/events/${eventId}/requests`, this.getHeaders());
  }

  getBatchJoinRequests(eventIds: number[]): Observable<any[]> {
    if (!eventIds || eventIds.length === 0) {
      return of([]);
    }
    const params = eventIds.map(id => `eventIds=${id}`).join('&');
    return this.http.get<any[]>(`${this.base}/events/requests?${params}`, this.getHeaders());
  }

  approveRequest(requestId: number, userId: number): Observable<any> {
    return this.http.post(`${this.base}/events/requests/${requestId}/approve?userId=${userId}`, {}, this.getHeaders());
  }

  rejectRequest(requestId: number, userId: number): Observable<any> {
    return this.http.post(`${this.base}/events/requests/${requestId}/reject?userId=${userId}`, {}, this.getHeaders());
  }

  // ===== Students =====
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/students`, this.getHeaders());
  }

  createStudent(student: any): Observable<any> {
    return this.http.post(`${this.base}/students`, student, this.getHeaders());
  }

  getStudentEvents(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/students/${studentId}/events`, this.getHeaders());
  }

  deleteStudent(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/students/${id}?userId=${userId}`, this.getHeaders());
  }

  // ===== Notifications =====
  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/notifications?userId=${userId}`, this.getHeaders());
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.patch(`${this.base}/notifications/${id}/read`, {}, this.getHeaders());
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/notifications/unread-count?userId=${userId}`, this.getHeaders());
  }

  // ===== Posts =====
  getFeed(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.base}/posts/feed?page=${page}&size=${size}`, this.getHeaders());
  }

  createPost(post: any): Observable<any> {
    return this.http.post(`${this.base}/posts`, post, this.getHeaders());
  }

  likePost(postId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/posts/${postId}/like?userId=${userId}`, {}, this.getHeaders());
  }

  addComment(postId: number, userId: number, content: string): Observable<any> {
    return this.http.post(`${this.base}/posts/${postId}/comment`, { userId, content }, this.getHeaders());
  }

  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/posts/${postId}/comments`, this.getHeaders());
  }
}
