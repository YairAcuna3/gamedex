# 🎮 Gamedex

Aplicación web para gestionar tu colección de videojuegos con sistema de premios y seguimiento de progreso.

## 🚀 Inicio Rápido

```bash
# Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ✨ Características

- 🔐 Autenticación con NextAuth (login/registro)
- 👤 Perfil de usuario personalizable
- 🎯 CRUD completo de videojuegos
- 🔍 Búsqueda de juegos
- 🏆 Sistema de premios (Oro, Plata, Bronce, GOTY)
- 📊 Seguimiento de progreso
- 🎨 Diseño moderno con animaciones GSAP
- 📱 Responsive design

## 🛠️ Tecnologías

- **Framework**: Next.js 16
- **Base de datos**: PostgreSQL + Prisma 6
- **Autenticación**: NextAuth
- **Estilos**: Tailwind CSS 4
- **Animaciones**: GSAP
- **TypeScript**: Tipado completo

## 📁 Estructura del Proyecto

```
gamedex/
├── app/              # Páginas y rutas de Next.js
├── components/       # Componentes React reutilizables
├── lib/              # Utilidades y configuración
├── prisma/           # Schema y seed de base de datos
└── types/            # Definiciones de tipos TypeScript
```

## 🎮 Uso

1. **Registro**: Crea una cuenta en `/register`
2. **Login**: Inicia sesión en `/login`
3. **Agregar juegos**: Click en "Agregar Juego" en `/games`
4. **Editar perfil**: Click en tu foto de perfil en el navbar

## 🗄️ Base de Datos

El schema incluye:

- Users (usuarios con perfil)
- Games (juegos con detalles completos)
- Tags (etiquetas para categorizar)
- Awards (premios: Oro, Plata, Bronce, GOTY)
- AwardPeriods (períodos mensuales/anuales)
- GameAwards (premios asignados a juegos)

## 📝 Variables de Entorno

Asegúrate de tener configurado tu `.env`:

```env
DATABASE_URL="tu-url-postgresql"
AUTH_SECRET="tu-secreto-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

## 🎨 Paleta de Colores

- Primary: `#0e151d`
- Secondary: `#212f3a`
- Tertiary: `#0e1822`
- Accent: `#3b82f6`

---

Desarrollado con ❤️ usando Next.js y Prisma
