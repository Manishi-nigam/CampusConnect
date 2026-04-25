import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  studentId!: number;
  events: any[] = [];
  loading = false;
  error = '';

  newEvent = {
    title: '',
    description: '',
    date: '',
    location: ''
  };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    // ✅ react to route changes properly
    this.route.paramMap.subscribe(params => {
      this.studentId = Number(params.get('id'));
      if (this.studentId) {
        this.loadEvents();
      }
    });
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';

    this.api.getEventsByStudent(this.studentId).subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load events';
        this.loading = false;
      }
    });
  }

  addEvent(): void {
    if (!this.newEvent.title || !this.newEvent.date) return;

    this.api.addEvent(this.studentId, this.newEvent).subscribe({
      next: () => {
        this.resetForm();
        this.loadEvents(); // ✅ refresh list
      },
      error: () => {
        this.error = 'Failed to add event';
      }
    });
  }

  resetForm(): void {
    this.newEvent = {
      title: '',
      description: '',
      date: '',
      location: ''
    };
  }
}
