/**
 * Configuración de la aplicación
 * @description Define los proveedores y configuraciones globales de la aplicación
 */
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

/**
 * Configuración de la aplicación
 * @description Proporciona el enrutador y otros servicios globales
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
