# Modelo de Datos Geográficos para MongoDB v2 (Optimizado)

> Colecciones separadas por nivel para evitar ruido en búsquedas

## 🎯 Decisiones Clave

1. **Colecciones separadas por nivel** - Evita ruido en búsquedas
2. **Solo hasta nivel 2 (ciudades)** - Priorizando 54 países con más datos
3. **Coordenadas de punto central** - No boundaries/shapes
4. **Aliases en ciudades** - Los agregamos al generar
5. **ObjectIds generados** - Usar librería existente

---

## 📊 Estructura Propuesta

### Colección: `countries` (Existente - Complementar)

```json
{
  "_id": ObjectId("existente"),
  "name": "Colombia",
  "alpha2": "co",
  "alpha3": "col",
  // ... campos existentes ...

  // AGREGAR:
  "hierarchyLevels": [
    { "level": 1, "nameEs": "Departamento", "nameLocal": "Departamento", "quantity": 32 },
    { "level": 2, "nameEs": "Municipio", "nameLocal": "Municipio", "quantity": 1103 }
  ],
  "maxLevel": 2  // Por ahora solo procesamos hasta nivel 2
}
```

---

### Colección: `states` (NUEVA - Nivel 1)

Departamentos, Estados, Provincias, Regiones, etc.

```json
{
  "_id": ObjectId("generado"),
  "countryId": ObjectId("ref_a_countries"),
  "countryCode": "co",
  "countryName": "Colombia",

  "name": "Antioquia",
  "aliases": ["Departamento de Antioquia"],
  "nicknames": [],

  "level": 1,
  "levelName": "Departamento",

  "capital": "Medellín",  // Capital del estado
  "population": 6407102,  // Opcional
  "area": 63612,          // km²

  "coordinates": {        // Punto central del estado
    "type": "Point",
    "coordinates": [-75.5658, 6.2476]  // [lng, lat] - formato GeoJSON
  },

  "i18n": {
    "en": { "name": "Antioquia" }
  }
}
```

**Índices:**
- `{ countryId: 1, name: 1 }` - Único
- `{ countryCode: 1 }`
- `{ name: "text", aliases: "text" }` - Búsqueda texto
- `{ coordinates: "2dsphere" }` - Búsquedas geoespaciales

---

### Colección: `cities` (NUEVA - Nivel 2)

Solo ciudades principales, las más relevantes por país

```json
{
  "_id": ObjectId("generado"),
  "countryId": ObjectId("ref_a_countries"),
  "countryCode": "co",
  "countryName": "Colombia",

  "stateId": ObjectId("ref_a_states"),
  "stateName": "Antioquia",

  "name": "Medellín",
  "aliases": [
    "La Ciudad de la Eterna Primavera",
    "Capital de la Montaña"
  ],
  "nicknames": ["Medallo", "La Tacita de Plata"],

  "level": 2,
  "levelName": "Municipio",

  "population": 2508452,
  "area": 380.64,         // km²

  "coordinates": {        // Punto central de la ciudad
    "type": "Point",
    "coordinates": [-75.5658, 6.2476]  // [lng, lat]
  },

  "timezone": "America/Bogota",

  "isCapital": false,           // Capital del país
  "isStateCapital": true,       // Capital del estado

  "trending": true,             // ⭐ NUEVO: Ciudades relevantes/populares
  "priority": 1,                // ⭐ NUEVO: 1=alta, 2=media, 3=baja

  "i18n": {
    "en": { "name": "Medellin" }
  }
}
```

**Índices:**
- `{ countryId: 1, stateId: 1, name: 1 }` - Único
- `{ countryCode: 1 }`
- `{ countryCode: 1, stateName: 1 }`
- `{ trending: 1, priority: 1 }` - ⭐ Para mostrar ciudades principales
- `{ name: "text", aliases: "text", nicknames: "text" }` - Búsqueda texto
- `{ coordinates: "2dsphere" }` - Búsquedas geoespaciales

---

## 🔍 Búsquedas Optimizadas

### Solo ciudades trending/principales
```javascript
db.cities.find({
  trending: true,
  priority: { $lte: 2 }  // Solo alta y media prioridad
})
```

### Ciudades de un país (sin ruido)
```javascript
db.cities.find({
  countryCode: "co",
  trending: true
})
```

### Búsqueda por alias
```javascript
db.cities.find({
  $text: { $search: "ciudad luz eterna primavera" }
})
```

### Ciudades cerca de un punto
```javascript
db.cities.find({
  coordinates: {
    $near: {
      $geometry: { type: "Point", coordinates: [-75.5658, 6.2476] },
      $maxDistance: 50000  // 50km
    }
  }
})
```

---

## 📋 Plan de Generación Ajustado

### Paso 1: Complementar `countries` ✅
- [ ] Leer `src/data/countryHierarchies.json`
- [ ] Leer `data/geo/mongo/artist_hive.countries.json`
- [ ] Agregar `hierarchyLevels` y `maxLevel: 2`
- [ ] Salida: `countries_updates.json`

### Paso 2: Generar `states` (Nivel 1) ✅
- [ ] Leer `Geography/Ciudades.csv`
- [ ] Extraer estados únicos de los **54 países prioritarios**
- [ ] Generar ObjectIds con librería existente
- [ ] Cruzar con countries para obtener countryId
- [ ] Asignar capital del estado (si está disponible)
- [ ] Salida: `states.json`

### Paso 3: Generar `cities` (Nivel 2) ✅
- [ ] Leer `Geography/Ciudades.csv`
- [ ] Filtrar solo **54 países prioritarios**
- [ ] Generar ObjectIds con librería existente
- [ ] Cruzar con countries y states
- [ ] Asignar `trending` y `priority`:
  - **trending: true** → Ciudades con > X población o capitales
  - **priority: 1** → Capitales nacionales/estadales + ciudades grandes
  - **priority: 2** → Ciudades medianas importantes
  - **priority: 3** → Ciudades pequeñas
- [ ] Agregar aliases conocidos
- [ ] Agregar coordenadas (si disponibles)
- [ ] Salida: `cities.json`

### Paso 4: Crear archivo de aliases ✅
- [ ] Crear `city_aliases.json` con apodos de ciudades famosas
- [ ] Formato:
```json
{
  "Medellín": {
    "aliases": ["La Ciudad de la Eterna Primavera", "Capital de la Montaña"],
    "nicknames": ["Medallo", "La Tacita de Plata"],
    "trending": true,
    "priority": 1
  },
  "París": {
    "aliases": ["La Ciudad Luz", "La Ville Lumière"],
    "nicknames": [],
    "trending": true,
    "priority": 1
  }
}
```

---

## 🌍 Países Prioritarios (54)

Basado en participación/relevancia:
1. Colombia
2. México
3. Estados Unidos
4. España
5. Argentina
6. Brasil
7. Chile
8. Perú
9. Francia
10. Reino Unido
... (completar con los 44 restantes según datos)

---

## 📊 Estimación de Volumen

### Con el modelo optimizado:

**States (~5,000 documentos)**
- ~100 estados promedio × 54 países = ~5,400 estados

**Cities (~50,000 documentos)**
- Solo ciudades principales de Ciudades.csv
- Filtrado por trending/priority
- Mucho más manejable que 310K registros

**Total: ~55,000 documentos** (vs. 310K+ en modelo anterior)

---

## 🎯 Ventajas del Modelo v2

1. ✅ **Sin ruido**: Búsquedas solo en datos relevantes
2. ✅ **Performance**: Menos documentos = búsquedas más rápidas
3. ✅ **Trending/Priority**: Filtros para mostrar solo lo importante
4. ✅ **Extensible**: Fácil agregar nivel 3+ después
5. ✅ **Coordenadas punto central**: Búsquedas geoespaciales simples
6. ✅ **Separación clara**: states vs cities (fácil de mantener)

---

## 💭 Validación del Path de Niveles

Para cada país revisaremos:
```json
// Colombia
"hierarchyLevels": [
  { "level": 1, "nameEs": "Departamento", "nameLocal": "Departamento" },
  { "level": 2, "nameEs": "Municipio", "nameLocal": "Municipio" }
]

// Reino Unido
"hierarchyLevels": [
  { "level": 1, "nameEs": "Nación Constituyente", "nameLocal": "Constituent Country" },
  { "level": 2, "nameEs": "Distrito/Ciudad", "nameLocal": "District/City" }
]
```

Verificaremos que:
- El nivel 1 en Ciudades.csv corresponda al level1 definido
- El nivel 2 en Ciudades.csv corresponda al level2 definido

---

**Siguiente paso:** Aprobar modelo v2 → Generar scripts
