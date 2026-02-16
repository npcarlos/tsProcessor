# Plan: Generar JSONs de Geografía para MongoDB

> 📁 `.claude/geoHierarchy/` | 📅 2025-11-09 | v2.0

## 🎯 Objetivo

Generar archivos JSON listos para subir a MongoDB con datos de países, jerarquías y ciudades.

**Input:**
- `src/data/countryHierarchies.json` - Jerarquías administrativas por país
- `data/drive/2025/10-31/Geography/Ciudades.csv` - 310K+ registros de ciudades

**Output:**
- JSONs optimizados para MongoDB (estructura simple, búsquedas rápidas)

---

## 💡 Modelo de Datos Propuesto (v2 - Optimizado)

Ver detalle completo en: **[data_model_v2.md](data_model_v2.md)**

### Colección: `countries` (Complementar existente)
```json
{
  // ... campos existentes ...
  "hierarchyLevels": [
    { "level": 1, "nameEs": "Departamento", "nameLocal": "Departamento", "quantity": 32 },
    { "level": 2, "nameEs": "Municipio", "nameLocal": "Municipio", "quantity": 1103 }
  ],
  "maxLevel": 2
}
```

### Colección: `states` (NUEVA - Nivel 1)
~5,000 documentos - Estados/Departamentos/Provincias

```json
{
  "_id": ObjectId("generado"),
  "countryId": ObjectId,
  "countryCode": "co",
  "name": "Antioquia",
  "aliases": ["Departamento de Antioquia"],
  "level": 1,
  "levelName": "Departamento",
  "capital": "Medellín",
  "coordinates": { "type": "Point", "coordinates": [-75.5658, 6.2476] }
}
```

### Colección: `cities` (NUEVA - Nivel 2)
~50,000 documentos - Solo ciudades principales

```json
{
  "_id": ObjectId("generado"),
  "countryId": ObjectId,
  "countryCode": "co",
  "stateId": ObjectId,
  "stateName": "Antioquia",
  "name": "Medellín",
  "aliases": ["La Ciudad de la Eterna Primavera"],
  "nicknames": ["Medallo", "La Tacita de Plata"],
  "level": 2,
  "levelName": "Municipio",
  "trending": true,        // ⭐ Filtrar ciudades principales
  "priority": 1,           // ⭐ 1=alta, 2=media, 3=baja
  "coordinates": { "type": "Point", "coordinates": [-75.5658, 6.2476] },
  "timezone": "America/Bogota",
  "isStateCapital": true
}
```

**Ventajas:**
- ✅ **Sin ruido**: Solo ~55K docs (vs 310K)
- ✅ **Trending/Priority**: Filtrar ciudades relevantes
- ✅ **Colecciones separadas**: Búsquedas más rápidas
- ✅ **Coordenadas punto central**: Búsquedas geoespaciales
- ✅ **54 países prioritarios**: Por participación

---

## 📝 Plan de Trabajo

### Paso 1: Complementar `countries`
- [ ] Leer `src/data/countryHierarchies.json`
- [ ] Leer `data/geo/mongo/artist_hive.countries.json`
- [ ] Mapear alpha2/alpha3 entre ambos archivos
- [ ] Agregar `hierarchyLevels` y `maxLevel: 2`
- [ ] Validar que paths de niveles coincidan con Ciudades.csv
- [ ] Salida: `countries_updates.json`

### Paso 2: Generar `states` (Nivel 1)
- [ ] Leer `Geography/Ciudades.csv`
- [ ] Filtrar solo **54 países prioritarios** (por participación)
- [ ] Extraer estados únicos por país
- [ ] Generar ObjectIds con librería existente
- [ ] Cruzar con countries para obtener countryId
- [ ] Asignar `levelName` según jerarquía del país
- [ ] Salida: `states.json` (~5,000 docs)

### Paso 3: Generar `cities` (Nivel 2)
- [ ] Leer `Geography/Ciudades.csv`
- [ ] Filtrar solo **54 países prioritarios**
- [ ] Generar ObjectIds con librería existente
- [ ] Cruzar con countries y states
- [ ] Asignar `trending` y `priority`:
  - trending: true → Capitales + ciudades grandes
  - priority: 1 → Capitales nacionales/estadales
  - priority: 2 → Ciudades medianas
  - priority: 3 → Ciudades pequeñas
- [ ] Agregar coordenadas (punto central) si disponibles
- [ ] Agregar timezone si disponible
- [ ] Agregar aliases conocidos desde archivo
- [ ] Salida: `cities.json` (~50,000 docs)

### Paso 4: Crear archivo de aliases
- [ ] Crear `city_aliases.json` con ciudades famosas:
  - Medellín, Bogotá, Cartagena (Colombia)
  - París, Lyon, Marseille (Francia)
  - Barcelona, Madrid, Valencia (España)
  - NYC, LA, Chicago (USA)
  - etc.
- [ ] Incluir: aliases, nicknames, trending, priority

### Paso 5: Validar
- [ ] Verificar que paths de jerarquía son correctos
- [ ] Revisar muestra de cada país
- [ ] Validar ObjectIds generados
- [ ] Verificar formato GeoJSON de coordenadas
- [ ] Listo para MongoDB

---

## ✅ Decisiones Tomadas

1. ✅ **Colecciones separadas**: `states` y `cities` (evita ruido en búsquedas)
2. ✅ **Solo hasta nivel 2**: Estados y ciudades (no barrios por ahora)
3. ✅ **54 países prioritarios**: Por participación en datos
4. ✅ **Coordenadas punto central**: Sí (formato GeoJSON)
5. ✅ **Timezones**: Sí (útil para artistas/eventos)
6. ✅ **Trending/Priority**: Filtrar ciudades principales
7. ✅ **Aliases al generar**: Archivo `city_aliases.json`
8. ✅ **ObjectIds generados**: Con librería existente

## ❓ Pendiente Definir

1. **¿Cuáles son los 54 países prioritarios?** (por orden de participación)
2. **¿Fuente de coordenadas?** (¿las tienes o las buscamos?)
3. **¿Fuente de timezones?** (¿las tienes o las buscamos?)
4. **¿Fuente de población?** (opcional, pero útil para trending)
5. **¿Criterio exacto para `trending`?** (ej: capitales + ciudades > 500K habitantes)

---

**Estado:** ⏸️ Esperando feedback sobre el modelo de datos
