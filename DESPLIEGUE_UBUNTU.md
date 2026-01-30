# 🚀 GUÍA DE DESPLIEGUE EN SERVIDOR UBUNTU (obelisque.space)

Esta guía te ayudará a desplegar tu aplicación Full Stack en tu servidor Ubuntu con Docker.

---

## 📋 PREPARACIÓN PREVIA

### Información que necesitas tener:
- ✅ IP pública de tu servidor
- ✅ Dominio: obelisque.space
- ✅ Acceso SSH al servidor
- ✅ Usuario con permisos sudo

---

## PARTE 1: PREPARAR TU SERVIDOR UBUNTU

### 1.1 Conectarse al Servidor

Desde tu computadora Windows, abre PowerShell o CMD:

```bash
ssh tu_usuario@obelisque.space
# O usa la IP: ssh tu_usuario@TU_IP_PUBLICA
```

### 1.2 Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalación
docker --version
docker-compose --version
```

**IMPORTANTE:** Cierra sesión y vuelve a conectarte para que los cambios surtan efecto:

```bash
exit
ssh tu_usuario@obelisque.space
```

### 1.4 Instalar Nginx (Para el Reverse Proxy y SSL)

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Instalar Certbot (Para SSL/HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## PARTE 2: SUBIR TU PROYECTO AL SERVIDOR

### 2.1 Opción A: Usar Git (Recomendado)

En tu servidor Ubuntu:

```bash
# Crear directorio para la aplicación
mkdir -p ~/apps
cd ~/apps

# Clonar tu repositorio
git clone https://github.com/TU_USUARIO/proyecto-fullstack-fase1.git
cd proyecto-fullstack-fase1
```

### 2.2 Opción B: Subir con SCP desde Windows

Desde tu computadora Windows (PowerShell):

```powershell
# Comprimir proyecto (sin node_modules)
Compress-Archive -Path "C:\Users\R-Cou\Escritorio\CLAUDE COSAS\AvanceProyectoFULLSTACK\*" -DestinationPath "C:\Users\R-Cou\Escritorio\proyecto.zip"

# Subir al servidor
scp "C:\Users\R-Cou\Escritorio\proyecto.zip" tu_usuario@obelisque.space:~/

# Luego en el servidor:
mkdir -p ~/apps/proyecto-fullstack
cd ~/apps/proyecto-fullstack
unzip ~/proyecto.zip
```

---

## PARTE 3: CONFIGURAR VARIABLES DE ENTORNO

En tu servidor Ubuntu:

```bash
cd ~/apps/proyecto-fullstack-fase1

# Crear archivo .env.production
nano .env.production
```

Pega esto y **completa con tus valores reales**:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/proyecto_fullstack?retryWrites=true&w=majority
JWT_SECRET=GENERA_UNA_CLAVE_SEGURA_AQUI
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://obelisque.space
```

**Para generar JWT_SECRET seguro:**

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en JWT_SECRET.

Guarda con: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## PARTE 4: CONSTRUIR Y EJECUTAR CON DOCKER

```bash
cd ~/apps/proyecto-fullstack-fase1

# Construir la imagen Docker
docker-compose build

# Iniciar el contenedor
docker-compose up -d

# Verificar que esté corriendo
docker ps
docker logs proyecto-fullstack
```

Deberías ver algo como:
```
🔌 Conectado a MongoDB
MongoDB conectado: cluster0.xxxxx.mongodb.net
🚀 Servidor corriendo en http://localhost:3000
```

---

## PARTE 5: CONFIGURAR NGINX COMO REVERSE PROXY

### 5.1 Crear Configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/obelisque.space
```

Pega esto:

```nginx
server {
    listen 80;
    server_name obelisque.space www.obelisque.space;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guarda: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.2 Activar el Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/obelisque.space /etc/nginx/sites-enabled/

# Eliminar sitio default si existe
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## PARTE 6: CONFIGURAR SSL/HTTPS CON LET'S ENCRYPT

```bash
# Obtener certificado SSL
sudo certbot --nginx -d obelisque.space -d www.obelisque.space

# Durante el proceso:
# 1. Ingresa tu email
# 2. Acepta términos de servicio (Y)
# 3. Selecciona opción 2: Redirect (forzar HTTPS)
```

Certbot configurará automáticamente Nginx para usar HTTPS.

### 6.1 Renovación Automática

```bash
# Probar renovación
sudo certbot renew --dry-run

# Configurar renovación automática (ya viene configurado)
sudo systemctl status certbot.timer
```

---

## PARTE 7: VERIFICAR QUE TODO FUNCIONA

### 7.1 Probar desde el Navegador

Abre tu navegador y ve a:

```
https://obelisque.space
```

Deberías ver tu página de login.

### 7.2 Probar la API

```bash
# Desde el servidor o tu computadora
curl https://obelisque.space/api

# Deberías ver:
{
  "success": true,
  "message": "API de Gestión de Tareas Educativas",
  "version": "1.0.0"
}
```

---

## PARTE 8: COMANDOS ÚTILES DE MANTENIMIENTO

### Ver logs en tiempo real:
```bash
docker logs -f proyecto-fullstack
```

### Reiniciar la aplicación:
```bash
cd ~/apps/proyecto-fullstack-fase1
docker-compose restart
```

### Detener la aplicación:
```bash
docker-compose down
```

### Actualizar la aplicación:
```bash
cd ~/apps/proyecto-fullstack-fase1
git pull  # Si usaste Git
docker-compose down
docker-compose build
docker-compose up -d
```

### Ver estado del contenedor:
```bash
docker ps
docker stats proyecto-fullstack
```

### Ver logs de Nginx:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## PARTE 9: CONFIGURAR FIREWALL (Opcional pero Recomendado)

```bash
# Permitir tráfico HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Permitir SSH (¡IMPORTANTE! No te bloquees)
sudo ufw allow OpenSSH

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

---

## PARTE 10: CONFIGURAR INICIO AUTOMÁTICO

Docker Compose ya está configurado con `restart: always`, por lo que:

✅ Tu aplicación se reiniciará automáticamente si falla
✅ Se iniciará automáticamente cuando el servidor reinicie
✅ Estará disponible 24/7

Para verificar:

```bash
# Reiniciar el servidor
sudo reboot

# Después de reiniciar, conectarte de nuevo
ssh tu_usuario@obelisque.space

# Verificar que el contenedor esté corriendo
docker ps
```

---

## ✅ CHECKLIST FINAL

- [ ] Servidor Ubuntu actualizado
- [ ] Docker y Docker Compose instalados
- [ ] Proyecto subido al servidor
- [ ] Variables de entorno configuradas
- [ ] Contenedor Docker corriendo
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/HTTPS configurado con Certbot
- [ ] Firewall configurado
- [ ] Aplicación accesible en https://obelisque.space
- [ ] Registro de usuario funciona
- [ ] Creación de tareas funciona

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to MongoDB"
- Verifica tu MONGODB_URI en .env.production
- Verifica que MongoDB Atlas permita conexiones desde cualquier IP (0.0.0.0/0)

### Error: "502 Bad Gateway"
- Verifica que el contenedor esté corriendo: `docker ps`
- Verifica los logs: `docker logs proyecto-fullstack`
- Verifica Nginx: `sudo nginx -t`

### Error: "CORS"
- Verifica que CORS_ORIGIN en .env.production sea: `https://obelisque.space`
- Reinicia el contenedor: `docker-compose restart`

### La aplicación no inicia automáticamente después de reiniciar el servidor
- Verifica: `docker ps -a`
- Debería estar en estado "Up"
- Si no, ejecuta: `docker-compose up -d`

---

## 📊 MONITOREO

### Ver uso de recursos:
```bash
docker stats proyecto-fullstack
htop  # Instalar con: sudo apt install htop
```

### Ver espacio en disco:
```bash
df -h
```

### Ver logs de sistema:
```bash
sudo journalctl -u docker
```

---

¡Listo! Tu aplicación está desplegada y funcionando 24/7 en https://obelisque.space 🎉
