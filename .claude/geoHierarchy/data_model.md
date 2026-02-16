# Modelo de Datos Geográficos para MongoDB (Multi-nivel)

> Soporta hasta 7 niveles de jerarquía administrativa según el país

## 📊 Estructura Actual

### Colección: `countries` (Existente)

```json
{
  "_id": ObjectId,
  "name": "Colombia",
  "native": "Colombia",
  "phone": [57],
  "continent": ObjectId,
  "capital": "Bogotá",
  "currency": [ObjectId],
  "languages": [ObjectId],
  "alpha2": "co",
  "alpha3": "col",
  "i18n": {
    "es": { "name": "Colombia" },
    "en": { "name": "Colombia" },
    "fr": { "name": "Colombie" }
  }
}
```

**Campos a agregar:**
```json
{
  "hierarchyLevels": [
    { "level": 1, "nameEs": "Departamento", "nameLocal": "Departamento", "quantity": 32 },
    { "level": 2, "nameEs": "Municipio", "nameLocal": "Municipio", "quantity": 1103 },
    { "level": 3, "nameEs": "Comuna/Corregimiento", "nameLocal": "Comuna/Corregimiento", "quantity": 1120 },
    { "level": 4, "nameEs": "Barrio/Vereda", "nameLocal": "Barrio/Vereda", "quantity": 50000 }
  ],
  "maxLevel": 4  // Nivel máximo de jerarquía para este país
}
```

**Ejemplo Reino Unido:**
```json
{
  "name": "Reino Unido",
  "alpha2": "gb",
  "hierarchyLevels": [
    { "level": 1, "nameEs": "Nación Constituyente", "nameLocal": "Constituent Country", "quantity": 4 },
    { "level": 2, "nameEs": "Condado/Región", "nameLocal": "County/Region", "quantity": 92 },
    { "level": 3, "nameEs": "Distrito/Ciudad", "nameLocal": "District/City", "quantity": 391 }
  ],
  "maxLevel": 3
}
```

---

## 🆕 Nueva Colección Única y Flexible

### Colección: `locations` (Todas las ubicaciones geográficas)

**Diseño flexible que soporta todos los niveles de jerarquía**

```json
{
  "_id": ObjectId,
  "countryId": ObjectId,
  "countryCode": "co",
  "name": "Medellín",
  "aliases": [
    "La Ciudad de la Eterna Primavera",
    "Capital de la Montaña"
  ],
  "nicknames": ["Medallo", "La Tacita de Plata"],

  // Jerarquía completa (path desde país hasta este nivel)
  "hierarchy": {
    "level1": {                      // Departamento
      "id": ObjectId,
      "name": "Antioquia",
      "levelName": "Departamento"
    },
    "level2": {                      // Municipio (este nivel)
      "id": ObjectId,
      "name": "Medellín",
      "levelName": "Municipio"
    }
    // level3, level4, etc. según el país
  },

  "level": 2,                        // Nivel actual en la jerarquía
  "levelName": "Municipio",
  "maxLevel": 4,                     // Nivel máximo del país

  // Parent directo (para queries rápidas)
  "parentId": ObjectId,              // ID del nivel superior
  "parentName": "Antioquia",
  "parentLevel": 1,

  // Metadata opcional
  "population": 2508452,
  "area": 380.64,                    // km²
  "coordinates": {
    "lat": 6.2476,
    "lng": -75.5658
  },
  "timezone": "America/Bogota",
  "isCapital": false,
  "isStateCapital": true,

  "i18n": {
    "en": { "name": "Medellin" }
  }
}
```

**Ejemplo Nivel 1 (Departamento):**
```json
{
  "_id": ObjectId("dept_antioquia"),
  "countryId": ObjectId("country_co"),
  "countryCode": "co",
  "name": "Antioquia",
  "aliases": ["Departamento de Antioquia"],
  "nicknames": [],

  "hierarchy": {
    "level1": {
      "id": ObjectId("dept_antioquia"),
      "name": "Antioquia",
      "levelName": "Departamento"
    }
  },

  "level": 1,
  "levelName": "Departamento",
  "maxLevel": 4,
  "parentId": ObjectId("country_co"),
  "parentName": "Colombia",
  "parentLevel": 0,

  "capital": "Medellín"
}
```

**Ejemplo Nivel 4 (Barrio):**
```json
{
  "_id": ObjectId,
  "countryId": ObjectId("country_co"),
  "countryCode": "co",
  "name": "El Poblado",
  "aliases": ["Barrio El Poblado"],
  "nicknames": ["El Pob"],

  "hierarchy": {
    "level1": {
      "id": ObjectId("dept_antioquia"),
      "name": "Antioquia",
      "levelName": "Departamento"
    },
    "level2": {
      "id": ObjectId("city_medellin"),
      "name": "Medellín",
      "levelName": "Municipio"
    },
    "level3": {
      "id": ObjectId("comuna_14"),
      "name": "Comuna 14 - El Poblado",
      "levelName": "Comuna"
    },
    "level4": {
      "id": ObjectId("barrio_poblado"),
      "name": "El Poblado",
      "levelName": "Barrio"
    }
  },

  "level": 4,
  "levelName": "Barrio",
  "maxLevel": 4,
  "parentId": ObjectId("comuna_14"),
  "parentName": "Comuna 14 - El Poblado",
  "parentLevel": 3
}
```

**Índices:**
- `{ countryCode: 1, level: 1, name: 1 }` - Único por nivel
- `{ countryCode: 1, level: 1 }` - Todas las ubicaciones de un nivel
- `{ parentId: 1 }` - Hijos de una ubicación
- `{ countryCode: 1, "hierarchy.level1.name": 1 }` - Por nivel 1
- `{ countryCode: 1, "hierarchy.level2.name": 1 }` - Por nivel 2
- `{ name: "text", aliases: "text", nicknames: "text" }` - Búsqueda texto
- `{ coordinates: "2dsphere" }` - Búsquedas geoespaciales

---

## 🔍 Casos de Uso y Búsquedas

### Búsqueda por alias/apodo
```javascript
db.locations.find({
  $or: [
    { name: /medellín/i },
    { aliases: /eterna primavera/i },
    { nicknames: /medallo/i }
  ]
})
```

### Todos los municipios (nivel 2) de Colombia
```javascript
db.locations.find({
  countryCode: "co",
  level: 2
})
```

### Todos los barrios de Medellín
```javascript
db.locations.find({
  "hierarchy.level2.name": "Medellín",
  level: 4
})
```

### Todas las ubicaciones de un departamento
```javascript
db.locations.find({
  "hierarchy.level1.name": "Antioquia"
})
```

### Jerarquía completa de una ubicación
```javascript
// Obtener barrio con toda su jerarquía
db.locations.findOne({ name: "El Poblado", level: 4 })
// Retorna: Colombia > Antioquia > Medellín > Comuna 14 > El Poblado
```

### Hijos directos de una ubicación
```javascript
// Todas las comunas de Medellín
db.locations.find({
  parentId: ObjectId("city_medellin"),
  level: 3
})
```

### Búsqueda de texto completo
```javascript
db.locations.find({
  $text: { $search: "ciudad luz" }
})
```

---

## 📋 Plan de Generación

### Paso 1: Complementar `countries`
- [ ] Leer `src/data/countryHierarchies.json`
- [ ] Agregar campo `hierarchyLevels` y `maxLevel` a cada país
- [ ] Generar `countries_update.json`

### Paso 2: Crear colección `locations` (todos los niveles)
- [ ] Leer `Geography/Ciudades.csv`
- [ ] Procesar nivel por nivel:
  - Nivel 1: Departamentos/Estados/Regiones
  - Nivel 2: Municipios/Ciudades principales
  - Nivel 3+: Comunas/Distritos/etc (según datos disponibles)
- [ ] Construir objeto `hierarchy` para cada ubicación
- [ ] Asignar `parentId` correctamente
- [ ] Generar `locations.json`

### Paso 3: Aliases de ubicaciones famosas
- [ ] Crear archivo `location_aliases.json` con apodos conocidos:
```json
{
  "Medellín": {
    "level": 2,
    "aliases": ["La Ciudad de la Eterna Primavera", "Capital de la Montaña"],
    "nicknames": ["Medallo", "La Tacita de Plata"]
  },
  "Bogotá": {
    "level": 2,
    "aliases": ["La Atenas Sudamericana", "Capital de Colombia"],
    "nicknames": ["Bogo"]
  },
  "París": {
    "level": 2,
    "aliases": ["La Ciudad Luz", "La Ciudad del Amor", "La Ville Lumière"],
    "nicknames": []
  },
  "Cartagena": {
    "level": 2,
    "aliases": ["La Heroica", "La Perla del Caribe"],
    "nicknames": ["Cartagena de Indias"]
  },
  "Antioquia": {
    "level": 1,
    "aliases": ["Departamento de Antioquia"],
    "nicknames": []
  },
  "El Poblado": {
    "level": 4,
    "aliases": ["Barrio El Poblado"],
    "nicknames": ["El Pob"]
  }
}
```

---

## 🎯 Ventajas del Modelo

1. **Flexible hasta 7 niveles**: Soporta cualquier jerarquía administrativa
2. **Una sola colección**: Simplifica queries y mantenimiento
3. **Jerarquía completa**: Cada documento tiene su path completo
4. **Búsquedas en cualquier nivel**: Por departamento, ciudad, comuna, barrio, etc.
5. **Navegación bidireccional**: De padre a hijos (`parentId`) o ver path completo (`hierarchy`)
6. **Búsquedas por alias/apodo**: En cualquier nivel
7. **Desnormalización inteligente**: `countryCode`, `parentName` para queries rápidas
8. **Extensible**: Fácil agregar población, coordenadas, etc.
9. **i18n ready**: Soporte multiidioma

---

## 💭 Decisiones Pendientes

1. **¿Incluir población y coordenadas?** (requiere fuente de datos adicional)
2. **¿Incluir timezones?** (útil para eventos de artistas)
3. **¿Hasta qué nivel procesamos inicialmente?**
   - Nivel 1 y 2: Siempre (tenemos datos en Ciudades.csv)
   - Nivel 3+: Solo si tenemos datos
4. **¿Generamos ObjectIds o los crea MongoDB?**
5. **¿Cómo identificamos capitales de niveles superiores?**
6. **¿Datos históricos?** (nombres antiguos de ubicaciones) - Por ahora NO

## 🌍 Ejemplos de Jerarquías por País

**Colombia (4 niveles):**
- Nivel 1: Departamento → Antioquia
- Nivel 2: Municipio → Medellín
- Nivel 3: Comuna → Comuna 14
- Nivel 4: Barrio → El Poblado

**Reino Unido (3 niveles):**
- Nivel 1: Constituent Country → Inglaterra
- Nivel 2: County → Greater London
- Nivel 3: District → Westminster

**España (5 niveles):**
- Nivel 1: Comunidad Autónoma → Cataluña
- Nivel 2: Provincia → Barcelona
- Nivel 3: Municipio → Barcelona
- Nivel 4: Distrito → Eixample
- Nivel 5: Barrio → Sagrada Familia

**Estados Unidos (4 niveles):**
- Nivel 1: State → California
- Nivel 2: County → Los Angeles County
- Nivel 3: City → Los Angeles
- Nivel 4: Neighborhood → Hollywood

---

**Siguiente paso:** Revisar y aprobar modelo → Generar scripts de migración
