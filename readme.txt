Estoy ideando una página web que sirva como un tipo de 
registro para accidentes viales, ya sean accidentes, trafico 
o calles cerradas, dónde el usuario puede crear un reporte 
dando detalles de lo sucedido, su nombre y alguna foto, un 
buscador por relación de nombre y unos especificos para cada 
punto. En otro página dentro de la misma web un grafico de 
la estadística según cada tipo.




idea de construccion:

Proyecto 1: Reportes viales

Tablas principales:

usuarios
---------
id, nombre, correo, password

reportes
---------
id, usuario_id, tipo, ubicacion,descripcion, fecha, imagen


comentarios
---------
id, reporte_id, usuario_id, comentario


Stack recomendado para ambos

Frontend
---------
HTML
CSS
JavaScript
React

Backend
---------
Node.js
Express.js

Base de datos
---------
PostgreSQL

Autenticación
---------
JWT (JSON Web Tokens)


Implementacion actual:

cree un repositorio para el primer proyecto: Instale node.js 
v24.17.0 y npm 11.13.0. cree el proyecto en la carpeta 
"Reporte_vial", ejecute: 
npm create vite@latest frontend -- --template react 
y dentro de "frontend" instale npm e hice una prueba con 
npm run dev. dentro de "frontend/src" cree la carpeta de 
components y pages, dentro de la ultima; Home,Reportes,
Estadisticas todos jsx. despues continue instalando node.js, 
cree la carpeta backend e instale express, cree los archivos 
server.js y package.json. instale PostgreSQL. 
instale la libreria de pg en backend, realice una prueba 
creando un archivo db.js y desde server.js utilice un 
endpoint, luego ejecute el archivo para que abriese en 
el puerot 5000.
Instale la libreria para JWT y Bcrypt:
npm install jsonwebtoken bcrypt.
Dentro de pgAdmin cree una DB con el nombre de: 
reportes_viales_db


De momento el seguimiento seria:
server.js utiliza las credenciasles dadas en db.js , utiliza
authRoutes.js para saber si va a registrar o hacer login, 
este utiliza authControllers.js para la logica detras, como 
la comprobacion de un usuario existente, guardando los datos 
en la base de datos si no existe , luego un login comprobado 
por el correo y contraseña y por ultimo con los datos lo 
muestra al usuario. 
