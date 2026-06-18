-- EPIC 0 · U6 — Seed. Datos del prototipo (src/data/*.ts).
-- Nota: galeria se siembra vacía; las fotos de galería se poblarán al cablear
-- el perfil (EPIC 2). foto (pravatar) y el resto de campos van fieles.

-- Partners
insert into public.partners (id, nombre, tagline, color, text_color) values
  ('kiwoko',  'Kiwoko',  'Todo lo que tu peludo necesita', '#FF7A59', '#fff'),
  ('drbimix', 'Dr Bimix','Nutrición y bienestar canino',   '#2E7D5B', '#fff'),
  ('maikai',  'Maikai',  'Premios artesanales con mimo',    '#1F2421', '#fff')
on conflict (id) do nothing;

-- Productos
insert into public.products (id, partner_id, nombre, descripcion, emoji, costo_treats) values
  ('kw-snacks',   'kiwoko',  'Pack de snacks naturales',      'Selección de premios sin cereales, ideal entrenamiento.',        '🍪', 80),
  ('kw-juguete',  'kiwoko',  'Juguete mordedor resistente',   'Caucho natural reforzado, aguanta los mordiscos más duros.',     '🧸', 150),
  ('kw-cama',     'kiwoko',  'Cama acolchada talla M',        'Tejido lavable y memoria de forma, para descansos largos.',      '🛏️', 600),
  ('kw-bono',     'kiwoko',  'Bono descuento 10% en tienda',  'Canjeable en cualquier tienda Kiwoko o en su web.',              '🎟️', 200),
  ('db-articular','drbimix', 'Suplemento articular (30 días)','Condroprotector con colágeno y omega-3 para perros activos.',    '💊', 220),
  ('db-dentales', 'drbimix', 'Snacks dentales',               'Limpian dientes y refrescan el aliento entre cepillados.',       '🦷', 90),
  ('db-vitaminas','drbimix', 'Pack vitaminas pelo y piel',    'Biotina, zinc y aceite de salmón para un pelo brillante.',       '✨', 180),
  ('mk-boniato',  'maikai',  'Galletas artesanas de boniato', 'Horneadas a mano con boniato ecológico y canela.',               '🥮', 60),
  ('mk-hueso',    'maikai',  'Hueso natural premium',         '100% carne deshidratada, sin conservantes ni colorantes.',       '🦴', 110),
  ('mk-caja',     'maikai',  'Caja sorpresa mensual',         'Una caja con premios y un juguete sorpresa cada mes.',           '📦', 320)
on conflict (id) do nothing;

-- Treats (catálogo de regalos)
insert into public.treats (id, emoji, nombre, descripcion, precio) values
  ('galleta', '🦴', 'Galleta casera',   'Un detalle dulce',                    1),
  ('pack',    '🍖', 'Pack de premios',  'Para los días de buen comportamiento', 3),
  ('juguete', '🧸', 'Juguete mordedor', 'Para los más juguetones',             5),
  ('bolsa',   '🎁', 'Bolsa sorpresa',   'Una mezcla de premios y juego',       8),
  ('hueso',   '🦴', 'Hueso gigante',    'El rey de los premios',               12)
on conflict (id) do nothing;

-- Paseadores
insert into public.walkers (id, nombre, foto, barrio, bio, especialidades, tags, distancia_km, disponible_ahora, tiempo_respuesta, rating, num_resenas, paseos_completados, verificado, anios_experiencia, galeria, nota_recogida, tiene_perros, texto_perros, dias_no_disponibles, ofrece_estancia, precio_estancia_noche) values
  ('ana','Ana Méndez','https://i.pravatar.cc/300?img=47','Chamberí','Crecí con tres border collies y llevo cuatro años paseando perros en Chamberí. Me especializo en peludos nerviosos: paseos tranquilos, sin cruzarme con otros perros y a un ritmo que les baja las pulsaciones.',array['Perros ansiosos','Reactivos','Paseos en solitario'],array['ansioso','nervioso','reactivo','miedoso','tranquilo','golden','border','labrador'],0.6,true,'responde en ~5 min',4.9,142,612,true,4,'{}','¡Genial! Recojo a tu perro en el portal y te aviso en cuanto salgamos. 🐾',false,'No tiene perros propios, así tu perro recibe toda su atención durante el paseo.',array[2,9,16,23,30],true,22),
  ('lucia','Lucía Fernández','https://i.pravatar.cc/300?img=44','Malasaña','Veterinaria de profesión, paseadora por vocación los fines de semana. Si tu perro toma medicación o necesita cuidados especiales, estoy acostumbrada y no me pongo nerviosa.',array['Medicación','Perros mayores','Cuidados especiales'],array['medicacion','mayor','senior','anciano','enfermo','diabetes','artrosis','tranquilo'],1.2,true,'responde en ~10 min',5.0,89,312,true,6,'{}','Encantada. Recojo a tu peludo con calma y respeto su ritmo en todo momento. 🩺',true,'Convive con Mara, una galga adoptada de 7 años — está acostumbrada a la convivencia entre perros tranquilos.',array[1,5,12,19,26],true,28),
  ('marcos','Marcos Iglesias','https://i.pravatar.cc/300?img=12','Chamberí','Corredor de montaña los findes y paseador entre semana. Si tu perro necesita quemar energía de verdad, conmigo no se va a aburrir: rutas largas, parque del Oeste y mucho mordedor.',array['Razas grandes','Energía alta','Paseos largos'],array['grande','energico','energia','husky','pastor','labrador','joven','fuerte','deportista'],0.9,true,'responde en ~15 min',4.8,121,540,true,3,'{}','¡Vamos allá! Hoy toca paseo del bueno, ruta larga por el parque. 💪',true,'Vive con Toro, un labrador chocolate de 5 años — acostumbrado a salir en grupo y muy paciente.',array[4,11,18,25],false,null),
  ('sofia','Sofía Navarro','https://i.pravatar.cc/300?img=32','Lavapiés','Educadora canina en formación, vivo con dos cachorros adoptados. Me chiflan los peques que aún están aprendiendo: refuerzo positivo, paciencia infinita y cero tirones de correa.',array['Cachorros','Educación básica','Refuerzo positivo'],array['cachorro','puppy','joven','educacion','adoptado','pequeño','aprendiz'],2.3,false,'responde en ~20 min',4.9,67,198,true,2,'{}','¡Qué ganas! Vamos a hacer un paseo divertido y aprender un poquito. 🌱',true,'Convive con Lúa y Roco, dos cachorros adoptados — sabe gestionar la mezcla y los tiempos de cada uno.',array[3,6,13,20,27],true,24),
  ('javier','Javier Ortega','https://i.pravatar.cc/300?img=8','Salamanca','Llevo siete años paseando perros del barrio, soy de los que se sabe el nombre de todos los porteros. Si tu perro tira mucho o necesita socializar, lo trabajamos sin prisa.',array['Socialización','Razas pequeñas','Mayores'],array['pequeño','mini','yorkie','caniche','socializar','mayor','tranquilo'],1.8,false,'responde en ~25 min',4.7,178,980,true,7,'{}','Buenas, recojo al peque a la hora acordada y damos una buena vuelta. 🐕',false,'No tiene perros propios; tu perro es el protagonista durante todo el paseo.',array[7,8,14,21,28,29],true,26),
  ('elena','Elena Castro','https://i.pravatar.cc/300?img=49','Chamberí','Tengo una galga adoptada y entiendo bien a los perros tímidos o con miedo a la calle. Paseo sin prisa, evitando estímulos, y siempre cargo premios y bolsitas de sobra.',array['Perros miedosos','Galgos','Adoptados'],array['miedoso','tímido','timido','galgo','adoptado','tranquilo','ansioso','reactivo'],1.1,true,'responde en ~10 min',4.9,54,220,true,3,'{}','Salimos despacito y a su ritmo, sin agobios. ✨',true,'Vive con Toña, su galga adoptada — entiende muy bien la dinámica entre perros tímidos.',array[2,10,17,24,31],true,25),
  ('diego','Diego Romero','https://i.pravatar.cc/300?img=15','Retiro','Bombero de profesión, paseador en mis días libres. Me gustan los retos: si tu perro es grande, fuerte o tiene mala fama con otros perros, dame una oportunidad.',array['Razas grandes','Perros difíciles','Reactivos'],array['grande','fuerte','rottweiler','pastor','reactivo','dificil','energico'],3.1,false,'responde en ~30 min',4.8,96,412,true,5,'{}','Confía, le saco con calma y firmeza. Lo vamos a pasar bien. 🔥',false,'No tiene perros propios; toda su atención y energía es para el tuyo.',array[1,4,11,18,25],false,null),
  ('paula','Paula Herrera','https://i.pravatar.cc/300?img=20','Malasaña','Diseñadora freelance, trabajo desde casa y aprovecho para sacar perros del barrio entre reunión y reunión. Soy de las que llega siempre cinco minutos antes con golosinas en el bolsillo.',array['Puntualidad','Razas medianas','Paseos urbanos'],array['mediano','labrador','beagle','urbano','puntual'],1.5,true,'responde en ~8 min',4.8,73,286,true,3,'{}','¡Lista! Bajo a por él y te aviso en cuanto salgamos. 🐾',false,'Sin perros propios: tu peludo no comparte cariño con nadie más durante el paseo.',array[6,13,20,27],false,null),
  ('carlos','Carlos Vidal','https://i.pravatar.cc/300?img=33','Arganzuela','Profesor de yoga y dueño de un labrador color chocolate. Si buscas alguien calmado para tu perro mayor o para uno que necesite paz, esa es justo mi onda.',array['Perros mayores','Paseos lentos','Perros tranquilos'],array['mayor','senior','tranquilo','lento','labrador','calma'],2.7,false,'responde en ~20 min',4.9,41,150,true,2,'{}','Vamos a hacer un paseo calmadito, a su aire. 🌿',true,'Convive con Coco, un labrador chocolate de 9 años, tranquilo y muy bien socializado.',array[3,5,12,19,26],true,23),
  ('irene','Irene Soler','https://i.pravatar.cc/300?img=23','Chueca','Mi piso es pequeño así que paseo perros ajenos casi a diario. Tengo manejo con razas potentes y soy fan de los bullys: si tu bulldog, bóxer o staff necesita compi, aquí estoy.',array['Bulldogs','Razas potentes','Braquicéfalos'],array['bulldog','boxer','staff','potente','braquicefalo','grande','mediano'],2.0,false,'responde en ~15 min',4.7,58,240,true,4,'{}','¡Perfecto! Hago paseo cortito y sombras si hace calor. 🐶',false,'No tiene perros propios — perfecto si prefieres atención exclusiva, sobre todo con razas potentes.',array[2,9,16,23,30],false,null),
  ('mateo','Mateo Ruiz','https://i.pravatar.cc/300?img=53','Tetuán','Estudiante de biología, llevo año y medio paseando a los perros del bloque. Disponibilidad amplia entre semana y muchas ganas de conocer a tu peludo.',array['Disponibilidad amplia','Razas medianas','Paseos diarios'],array['mediano','diario','joven','labrador','mestizo'],4.2,false,'responde en ~30 min',4.6,22,88,false,1,'{}','¡Hola! Bajo a por él en un momentito. 😊',false,'Sin perros propios; ideal si tu peludo necesita un paseo en solitario y sin distracciones.',array[7,14,21,28],false,null),
  ('natalia','Natalia Prieto','https://i.pravatar.cc/300?img=25','La Latina','Trabajo en una protectora los sábados y entre semana saco perros del barrio. Sin correa en zonas seguras, mucho juego y siempre con la sesión de fotos incluida.',array['Sin correa controlada','Sociables','Foto-reportaje'],array['sociable','sin correa','juego','joven','mediano','energico'],3.5,false,'responde en ~20 min',4.8,64,270,true,3,'{}','¡Allá voy! Hoy haremos buenas fotos. 📸',true,'Vive con Luna y Bruno, dos mestizos adoptados de protectora — totalmente acostumbrada a la convivencia.',array[4,11,18,25],true,27)
on conflict (id) do nothing;

-- Reseñas (2 por paseador)
insert into public.reviews (walker_id, autor, texto) values
  ('ana','Marta R.','Mi Nala es muy reactiva y con Ana por fin vuelve a casa relajada. Puntual y me manda foto a mitad del paseo.'),
  ('ana','Diego P.','Se nota que entiende a los perros nerviosos. A mi border le costaba salir y ahora va contento a buscarla.'),
  ('lucia','Carmen L.','Mi Toby tiene 13 años y artrosis. Lucía le adapta el paseo, le da su pastilla y vuelve siempre feliz.'),
  ('lucia','Javier S.','Saber que es veterinaria me da una tranquilidad enorme. Profesional y muy cariñosa.'),
  ('marcos','Elena G.','Mi husky vuelve agotado y feliz. Marcos le da la caña justa que necesita.'),
  ('marcos','Pablo M.','Llevo a mi pastor con él desde hace meses. Súper fiable y muy buen rollo.'),
  ('sofia','Inés C.','Mi cachorra ha aprendido a no tirar de la correa en dos semanas con Sofía. Una joya.'),
  ('sofia','Raúl B.','Muy dulce con los peques. Vuelve cansada y socializada.'),
  ('javier','Cristina V.','Mi yorkie le adora. Javier es de toda la vida del barrio y eso se nota.'),
  ('javier','Andrés F.','Muy serio y puntual. Lleva a mi caniche desde hace dos años.'),
  ('elena','Nuria T.','Mi galgo es muy asustadizo y Elena tiene una paciencia que no me cabe en el pecho.'),
  ('elena','Sergio A.','La recomiendo a todo el mundo del barrio. Tranquila, dulce y muy responsable.'),
  ('diego','Mónica D.','Mi rottie no se deja pasear por cualquiera y con Diego va como un cordero.'),
  ('diego','Iván R.','Tipazo. Mi pastor alemán le adora y vuelve agotado.'),
  ('paula','Laura M.','Súper puntual y atenta. Manda foto y resumen del paseo cada vez.'),
  ('paula','Tomás G.','Mi beagle la espera en la puerta. Buena gente y muy responsable.'),
  ('carlos','Beatriz O.','Mi labradora de 12 años está encantada. Carlos respeta su paso, no la fuerza.'),
  ('carlos','Luis V.','Persona tranquila y de fiar. Recomendado para perros sénior.'),
  ('irene','Adrián P.','Mi bulldog inglés la adora. Conoce muy bien a la raza y sus limitaciones con el calor.'),
  ('irene','Sara C.','Atenta y muy cariñosa. Mi bóxer vuelve siempre contento.'),
  ('mateo','Helena R.','Mateo es muy maja, mi perro siempre vuelve contento y cansadito.'),
  ('mateo','Víctor L.','Buen chaval, atento y puntual.'),
  ('natalia','Clara N.','Las fotos que manda me alegran el día. Mi perra vuelve agotada y feliz.'),
  ('natalia','Rubén H.','Súper buen rollo. Se nota que ama a los perros.');
