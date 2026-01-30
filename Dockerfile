# Usar Node.js 18 Alpine (imagen ligera)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Variable de entorno por defecto
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]
