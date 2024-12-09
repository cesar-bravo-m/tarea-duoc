/**
 * Punto de entrada principal de la aplicación
 * @description Inicializa la aplicación Angular con la configuración especificada
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Inicia la aplicación Angular
 * @description Arranca la aplicación usando el componente raíz y la configuración global
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
