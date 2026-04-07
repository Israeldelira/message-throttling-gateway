# Message Throttling Gateway

Servicio en NestJS para recibir una rafaga de mensajes, persistirlos en MySQL y despacharlos hacia un proveedor que solo acepta `100` mensajes por segundo simulando la siguiente situacion
Endpoint que simula rafaga de mensajes -> Representa **Plataforma A**
modulo message -> Representa sistma receptor y procesador **Componente B**
mock-provider -> Provedor de mensajeria **Plataforma C**

# Explicacion de solucion

## Arquitectura
- Cliente servidor para trabajar por medio de peticiones de forma simple y asincrona
- Estructura modular orientada a responsabilidades 
- Desacoplada cada quien tiene sus funciones y tareas 
- Persistencia con base de datos

## Por que NestJS?
- Tipado que ofrece con typescript
- Estructura rapida y limpia
- Herramientas utiles como schedule para los jobs, class-validator y typeorm
- Experiencia con este framework

## Por que MySQL?
- Base de datos enfocada a la persistencia enfocado principalmente para la prueba
- Soporta fallos y interrupciones
- Mejor para trazabilidad enfocado en la prueba como se indica
- Mayor experiencia y simplicidad para mi 

A diferencia de redis o memoria deci implementarlo porque tengo experiencia, es mejor para los casos plasmados en la porueba que es la trazabildiad, la seguirdad de el envio de mensajes en su totalidad y la simplicidad aunque la mejor opcion que considero con mas tiempo es implementar ambas redis para toda la gestion de colas, rate limiting y orden estricto y mysql para la persistencia y trazabilidad para ser la fuente de verdad  

## Solucion de requerimientos
  ### Throttling
  Para el Throttling se implemento un dispatcher que se ejecuta cada segundo, limite de 100 mensajes y el limite de mensajes que se le envian al provedor los cuales se definen con variables de entorno 
- **DISPATCH_INTERVAL_MS**: Para ejecucion del dispatcher (job)
- **MESSAGE_LIMIT**: Limite de mensajes que que puede procesar el dispatcher
- **MOCK_PROVIDER_MAX_MESSAGES_PER_SECOND**: Limite de mensajes que puede recibir el provedor
  Con estos variables de entorno podemos jugar para generar el error de rate limit 
  Existe una limitacion para esta implementacion es de que si se cae el servidor el rate limit se reinicia no sobrevive de esta forma ya que vive en memoria del proceso
 ### Ejecucion en colas
 Me apoye con el id de myslq como es secuencial y autoncrementable entonces con mi dispatcher ejecuto periodicmaente reviso esta parte y dependiendo del estatus es como lo gestiono
 ### Garantia de entrega 
 Con la base de datos y los mensajes persistentes ahi puedo continuar donde el flkujo se quedo y continuar el envio para asegurarme que pas elo que pase estos se envien por medio del estatus continuar donde me quede 
### Idempotencia
  Se implemento el campo externalMessageId para evitar la repeticion asi con esto se evalua ese identificador antes de procesar es emensaje asi se evita una insercion en la base de datos y que se envie el mensaje (cambiar el status a sent)
    
# Preguntas 
## Throttling
- ¿Qué pasa si C responde con error de rate limit? ¿Cómo reaccionas? Por el momento  solo actualizo el estatus del mensaje paa que uvelva a reintentarlo con retrying y simplmente ignoro y continuo trabajando hasta que ese estatus cambie a sent admas imprimo log del error
- ¿Cómo distribuyes los envíos a lo largo del tiempo de forma eficiente? Gestiono los mnesajes por medio de un dispatcher  usando ventanas de tiempo de forma secuencial termina la ventana y en la siguiente ventana continuo donde se quedo la anterior ventana de tiempo 

## Entrega garantizada
Mediante la persistencia de mysql se gestiona que todos los mensajes sean entregados y en orden gracias a su id ASC ademas al guardar los estatus se determina con cual continiar y en caso de que falle o cualquier problema continua con el ultimo con ese estatus

## Flujo

1. Plataforma A envia `POST /messages`.
2. El mensaje se guarda primero en MySQL.
3. El scheduler corre cada `1` segundo.
4. El dispatcher toma mensajes pendientes por `id ASC`.
5. El dispatcher intenta enviarlos al provider mock.
6. Si el envio sale bien, el mensaje queda en `sent`.
7. Si falla, el mensaje queda en `retrying` y se vuelve a intentar en el siguiente ciclo.

## Variables de entorno

Configura todas estas variables en tu `.env`:

```env
NODE_ENV=development
PORT=3002
MESSAGE_LIMIT=100
DISPATCH_INTERVAL_MS=1000
DISPATCH_MAX_MESSAGES_PER_SECOND=100
PROVIDER_REQUEST_TIMEOUT_MS=5000
BATCH_PROCESS_DEFAULT_TOTAL_MESSAGES=100000
BATCH_PROCESS_REQUEST_CONCURRENCY=200
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_NAME=message_db
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

## Ejecutar

1. Crear una base MySQL llamada `message_db`.
2. Ajusta el archivo `.env`.
3. Instala dependencias:

```bash
npm install
```

4. Levanta la app:

```bash
npm run start:dev
```

5. Abre Swagger en `http://localhost:3000/docs`.

