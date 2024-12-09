# Etapa de construcción
FROM node:18-alpine as build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación Angular en modo producción
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos desde la etapa de construcción a nginx
COPY --from=build /app/dist/tarea-duoc/browser /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80