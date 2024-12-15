import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../components/register-modal/register-modal.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        LoginModalComponent,
        RegisterModalComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Modal toggles', () => {
    it('debe alternar el modal de login', () => {
      expect(component.showLoginModal).toBeFalse();
      component.toggleLoginModal();
      expect(component.showLoginModal).toBeTrue();
      component.toggleLoginModal();
      expect(component.showLoginModal).toBeFalse();
    });

    it('debe alternar el modal de registro', () => {
      expect(component.showRegisterModal).toBeFalse();
      component.toggleRegisterModal();
      expect(component.showRegisterModal).toBeTrue();
      component.toggleRegisterModal();
      expect(component.showRegisterModal).toBeFalse();
    });

    it('debe cerrar el modal de registro cuando se abre el modal de login', () => {
      component.showRegisterModal = true;
      component.toggleLoginModal();
      expect(component.showLoginModal).toBeTrue();
      expect(component.showRegisterModal).toBeFalse();
    });

    it('debe cerrar el modal de login cuando se abre el modal de registro', () => {
      component.showLoginModal = true;
      component.toggleRegisterModal();
      expect(component.showRegisterModal).toBeTrue();
      expect(component.showLoginModal).toBeFalse();
    });
  });

  describe('Template integration', () => {
    it('debe mostrar todas las cards de características', () => {
      const featureCards = fixture.debugElement.nativeElement.querySelectorAll('.feature-card');
      expect(featureCards.length).toBe(4);
    });
  });
});
