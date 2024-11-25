import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../components/register-modal/register-modal.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LoginModalComponent, RegisterModalComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  showLoginModal = false;
  showRegisterModal = false;

  toggleLoginModal() {
    this.showLoginModal = !this.showLoginModal;
    if (this.showRegisterModal) this.showRegisterModal = false;
  }

  toggleRegisterModal() {
    this.showRegisterModal = !this.showRegisterModal;
    if (this.showLoginModal) this.showLoginModal = false;
  }
}
