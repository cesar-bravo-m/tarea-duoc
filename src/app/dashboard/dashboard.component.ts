import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }
}
