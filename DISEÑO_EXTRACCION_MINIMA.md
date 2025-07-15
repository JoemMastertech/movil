# DISEÑO DE EXTRACCIÓN MÍNIMA

## Semana 1, Día 4: Diseño mínimo de extracción (sin cambios de código)

### 🎯 OBJETIVO
Diseñar la extracción de **3 funciones más seguras** de `product-table.js` sin modificar código.

---

## 📋 COMPONENTES IDENTIFICADOS PARA EXTRACCIÓN

### **COMPONENTE 1: TextUtils.js** 🔧

#### **Funciones a extraer:**
```javascript
// 1. getThumbnailUrl(videoUrl, productName, category)
// 2. applyIntelligentTruncation(gridContainer)
// 3. handleTextOverflow(element, maxLines)
```

#### **Diseño de interfaz:**
```javascript
// TextUtils.js
export const TextUtils = {
  getThumbnailUrl(videoUrl, productName, category) {
    // Lógica exacta actual - SIN CAMBIOS
  },
  
  applyIntelligentTruncation(gridContainer) {
    // Lógica exacta actual - SIN CAMBIOS
  },
  
  handleTextOverflow(element, maxLines) {
    // Lógica exacta actual - SIN CAMBIOS
  }
};
```

#### **Modificación en product-table.js:**
```javascript
// Al inicio del archivo
import { TextUtils } from './TextUtils.js';

// Reemplazar llamadas:
// getThumbnailUrl(...) → TextUtils.getThumbnailUrl(...)
// applyIntelligentTruncation(...) → TextUtils.applyIntelligentTruncation(...)
// handleTextOverflow(...) → TextUtils.handleTextOverflow(...)
```

#### **Métricas:**
- **Líneas a extraer**: ~125 líneas
- **Líneas a modificar**: ~8 líneas (solo imports y llamadas)
- **Riesgo**: MÍNIMO (funciones puras)
- **Beneficio**: Reutilización + mejor testing

---

### **COMPONENTE 2: ViewToggle.js** 🔄

#### **Funciones a extraer:**
```javascript
// 1. createViewToggle(container)
// 2. toggleViewMode()
```

#### **Diseño de interfaz:**
```javascript
// ViewToggle.js
export const ViewToggle = {
  currentMode: 'table', // Estado interno
  
  createViewToggle(container) {
    // Lógica exacta actual - SIN CAMBIOS
    // Usar this.toggleViewMode en lugar de toggleViewMode
  },
  
  toggleViewMode() {
    // Lógica exacta actual - SIN CAMBIOS
    // Actualizar this.currentMode
  },
  
  getCurrentMode() {
    return this.currentMode;
  }
};
```

#### **Modificación en product-table.js:**
```javascript
// Al inicio del archivo
import { ViewToggle } from './ViewToggle.js';

// Reemplazar:
// createViewToggle(...) → ViewToggle.createViewToggle(...)
// toggleViewMode() → ViewToggle.toggleViewMode()
```

#### **Métricas:**
- **Líneas a extraer**: ~25 líneas
- **Líneas a modificar**: ~3 líneas
- **Riesgo**: BAJO (funcionalidad autocontenida)
- **Beneficio**: Separación clara de responsabilidades

---

### **COMPONENTE 3: LiquorCategories.js** 🍷

#### **Funciones a extraer:**
```javascript
// 1. createLicoresCategories()
```

#### **Diseño de interfaz:**
```javascript
// LiquorCategories.js
export const LiquorCategories = {
  createLicoresCategories() {
    // Lógica exacta actual - SIN CAMBIOS
    // Retorna el mismo objeto que actualmente
  }
};
```

#### **Modificación en product-table.js:**
```javascript
// Al inicio del archivo
import { LiquorCategories } from './LiquorCategories.js';

// Reemplazar:
// createLicoresCategories() → LiquorCategories.createLicoresCategories()
```

#### **Métricas:**
- **Líneas a extraer**: ~14 líneas
- **Líneas a modificar**: ~1 línea
- **Riesgo**: MÍNIMO (función pura que retorna datos)
- **Beneficio**: Datos separados de lógica

---

## 📊 RESUMEN DE EXTRACCIÓN

### **Métricas Totales:**
- **Total líneas a extraer**: 164 líneas (14.8% del archivo)
- **Total líneas a modificar**: 12 líneas (1.1% del archivo)
- **Archivos nuevos**: 3 archivos
- **Funciones extraídas**: 6 funciones
- **Riesgo general**: MÍNIMO

### **Antes vs Después:**
```
ANTES:
├── product-table.js (1,109 líneas)

DESPUÉS:
├── product-table.js (957 líneas) ⬇️ -152 líneas
├── TextUtils.js (125 líneas) ✨ NUEVO
├── ViewToggle.js (25 líneas) ✨ NUEVO
└── LiquorCategories.js (14 líneas) ✨ NUEVO
```

---

## 🛡️ ESTRATEGIA DE IMPLEMENTACIÓN ULTRA-SEGURA

### **Orden de Extracción (1 por día):**

#### **Día 1: LiquorCategories.js**
- ✅ Función más simple (14 líneas)
- ✅ Función pura (sin efectos secundarios)
- ✅ Fácil de probar
- ✅ Menor riesgo

#### **Día 2: TextUtils.js**
- ✅ Funciones utilitarias
- ✅ Bien definidas
- ✅ Reutilizables
- ⚠️ Más líneas, pero bajo riesgo

#### **Día 3: ViewToggle.js**
- ✅ Funcionalidad autocontenida
- ⚠️ Maneja estado (currentMode)
- ⚠️ Requiere más testing

### **Procedimiento por Extracción:**

#### **PASO 1: Crear archivo nuevo**
```bash
# Crear archivo con función extraída
# Copiar lógica EXACTA (sin modificaciones)
# Agregar exports apropiados
```

#### **PASO 2: Modificar product-table.js**
```bash
# Agregar import
# Reemplazar llamadas a función
# NO modificar lógica
```

#### **PASO 3: Verificación inmediata**
```bash
# Ejecutar smoke tests
node smoke-tests.js

# Probar funcionalidad manualmente
# Verificar que no hay errores en consola
```

#### **PASO 4: Commit inmediato**
```bash
# Commit pequeño y específico
git add .
git commit -m "Extraer [NOMBRE_FUNCION] - Sin cambios de lógica"
```

#### **PASO 5: Rollback si hay problemas**
```bash
# Si algo falla, rollback inmediato
git reset --hard HEAD~1
```

---

## 🧪 PLAN DE TESTING

### **Tests por Componente:**

#### **TextUtils.js**
```javascript
// Test 1: getThumbnailUrl retorna URL válida
// Test 2: applyIntelligentTruncation no rompe DOM
// Test 3: handleTextOverflow maneja texto largo
```

#### **ViewToggle.js**
```javascript
// Test 1: createViewToggle crea botón
// Test 2: toggleViewMode cambia estado
// Test 3: getCurrentMode retorna modo actual
```

#### **LiquorCategories.js**
```javascript
// Test 1: createLicoresCategories retorna objeto válido
// Test 2: Estructura de datos es correcta
```

### **Smoke Tests Adicionales:**
```javascript
// Verificar que imports funcionan
// Verificar que funciones son llamadas correctamente
// Verificar que no hay regresiones
```

---

## 📁 ESTRUCTURA DE ARCHIVOS RESULTANTE

```
Interfaces/web/ui-adapters/components/
├── product-table.js (957 líneas) ⬅️ MODIFICADO
├── TextUtils.js (125 líneas) ⬅️ NUEVO
├── ViewToggle.js (25 líneas) ⬅️ NUEVO
└── LiquorCategories.js (14 líneas) ⬅️ NUEVO
```

### **Imports en product-table.js:**
```javascript
// Al inicio del archivo
import { TextUtils } from './TextUtils.js';
import { ViewToggle } from './ViewToggle.js';
import { LiquorCategories } from './LiquorCategories.js';
```

---

## ✅ CRITERIOS DE ÉXITO

### **Funcionalidad:**
- [ ] ✅ Todos los smoke tests pasan
- [ ] ✅ No hay errores en consola
- [ ] ✅ Funcionalidad idéntica a antes
- [ ] ✅ Performance igual o mejor

### **Código:**
- [ ] ✅ Imports funcionan correctamente
- [ ] ✅ Funciones son llamadas sin errores
- [ ] ✅ Lógica no modificada
- [ ] ✅ Archivos nuevos bien estructurados

### **Proceso:**
- [ ] ✅ Un componente por día
- [ ] ✅ Commit después de cada extracción
- [ ] ✅ Verificación inmediata
- [ ] ✅ Rollback disponible

---

## 🚨 REGLAS INQUEBRANTABLES

### **✅ PERMITIDO:**
- Copiar lógica exacta
- Agregar imports/exports
- Cambiar llamadas a funciones
- Crear archivos nuevos

### **❌ PROHIBIDO:**
- Modificar lógica de funciones
- Cambiar parámetros
- Optimizar código
- Agregar funcionalidad
- Refactorizar lógica interna
- Cambiar nombres de funciones

---

## 📅 CRONOGRAMA

### **Semana 1:**
- **Día 4**: ✅ Diseño completo (este documento)
- **Día 5**: Extracción de LiquorCategories.js

### **Semana 2:**
- **Día 1**: Extracción de TextUtils.js
- **Día 2**: Extracción de ViewToggle.js
- **Día 3**: Verificación final y documentación

---

*Diseño completado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
*Estado: Listo para implementación*
*Próximo paso: Semana 1, Día 5 - Extracción de LiquorCategories.js*