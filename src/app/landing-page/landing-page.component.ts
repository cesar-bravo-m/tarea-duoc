import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../components/register-modal/register-modal.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, LoginModalComponent, RegisterModalComponent],
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

  scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
