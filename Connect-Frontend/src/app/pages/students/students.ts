import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class Students implements OnInit {
  students: any[] = [];

  newStudent = {
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    year: null
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.api.getStudents().subscribe(data => this.students = data);
  }

  addStudent() {
    this.api.addStudent(this.newStudent).subscribe(() => {
      this.newStudent = {
        name: '',
        email: '',
        rollNumber: '',
        department: '',
        year: null
      };
      this.loadStudents();
    });
  }
}
