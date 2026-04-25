import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterModule,RouterLink,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}
