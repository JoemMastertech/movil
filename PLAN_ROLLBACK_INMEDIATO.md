# PLAN DE ROLLBACK INMEDIATO

## 🚨 PROCEDIMIENTO DE EMERGENCIA

### **ACTIVACIÓN DEL ROLLBACK**
Este plan se activa INMEDIATAMENTE si:
- ❌ Cualquier smoke test falla
- ❌ Error en producción
- ❌ Funcionalidad crítica no responde
- ❌ Performance degradada >20%
- ❌ Cualquier duda sobre estabilidad

---

## 📋 CHECKLIST DE ROLLBACK (EJECUTAR EN ORDEN)

### **PASO 1: DETENER CAMBIOS** ⏹️
```bash
# 1. Detener cualquier proceso en curso
# 2. No hacer más commits
# 3. Documentar el problema encontrado
```

### **PASO 2: ROLLBACK GIT** 🔄
```bash
# Volver al commit seguro
git checkout main
git reset --hard HEAD~1

# O volver al commit inicial específico
git reset --hard [COMMIT_INICIAL_HASH]

# Verificar estado
git status
git log --oneline -5
```

### **PASO 3: VERIFICACIÓN INMEDIATA** ✅
```bash
# Ejecutar smoke tests
node smoke-tests.js

# O en navegador:
# Abrir index.html
# Ejecutar: new SmokeTests().runAllTests()
```

### **PASO 4: RESTAURAR ARCHIVOS** 📁
```bash
# Si hay archivos nuevos que causan problemas
rm -f [ARCHIVO_PROBLEMÁTICO]

# Restaurar desde backup
git checkout HEAD -- [ARCHIVO_ESPECÍFICO]
```

---

## 🎯 ROLLBACK POR TIPO DE PROBLEMA

### **PROBLEMA: Smoke Tests Fallan**
```bash
# 1. Identificar qué test falló
node smoke-tests.js

# 2. Rollback inmediato
git reset --hard HEAD~1

# 3. Verificar que tests pasan
node smoke-tests.js

# 4. Documentar el problema
echo "$(date): Rollback por smoke test fallido" >> rollback.log
```

### **PROBLEMA: Error en ProductTable**
```bash
# 1. Restaurar product-table.js original
git checkout HEAD~1 -- Interfaces/web/ui-adapters/components/product-table.js

# 2. Eliminar archivos nuevos si existen
rm -f TextUtils.js ViewToggle.js LiquorCategories.js

# 3. Verificar funcionalidad
# Abrir navegador y probar agregar productos
```

### **PROBLEMA: Error en OrderSystem**
```bash
# 1. Restaurar order-system.js original
git checkout HEAD~1 -- Interfaces/web/core/order-system.js

# 2. Verificar cálculos
# Probar agregar productos y calcular total
```

### **PROBLEMA: Performance Degradada**
```bash
# 1. Rollback completo
git reset --hard HEAD~1

# 2. Medir performance baseline
# Usar DevTools para comparar tiempos

# 3. Documentar métricas
echo "$(date): Rollback por performance" >> rollback.log
```

---

## 📊 VERIFICACIÓN POST-ROLLBACK

### **CHECKLIST OBLIGATORIO**
- [ ] ✅ Smoke tests pasan al 100%
- [ ] ✅ Página principal carga sin errores
- [ ] ✅ Se pueden agregar productos
- [ ] ✅ Cálculos funcionan correctamente
- [ ] ✅ LocalStorage funciona
- [ ] ✅ No hay errores en consola
- [ ] ✅ Performance normal

### **COMANDOS DE VERIFICACIÓN**
```bash
# 1. Estado del repositorio
git status
git log --oneline -3

# 2. Archivos críticos
ls -la Interfaces/web/ui-adapters/components/product-table.js
ls -la Interfaces/web/core/order-system.js

# 3. Tests automáticos
node smoke-tests.js
```

---

## 🔍 DIAGNÓSTICO POST-ROLLBACK

### **ANÁLISIS DEL PROBLEMA**
1. **¿Qué cambio causó el problema?**
   - Revisar último commit
   - Identificar archivo específico
   - Documentar síntoma exacto

2. **¿Por qué no se detectó antes?**
   - ¿Fallaron los smoke tests?
   - ¿Se saltó algún paso del plan?
   - ¿Faltó alguna verificación?

3. **¿Cómo prevenir en el futuro?**
   - Mejorar smoke tests
   - Agregar verificación específica
   - Revisar proceso

### **DOCUMENTACIÓN OBLIGATORIA**
```markdown
## Incidente: [FECHA_HORA]
- **Problema**: [DESCRIPCIÓN]
- **Cambio que causó**: [COMMIT/ARCHIVO]
- **Síntoma**: [QUÉ FALLÓ]
- **Rollback ejecutado**: [COMANDOS USADOS]
- **Tiempo de resolución**: [MINUTOS]
- **Lección aprendida**: [PREVENCIÓN]
```

---

## ⚡ ROLLBACK EXPRESS (1 MINUTO)

### **COMANDO ÚNICO DE EMERGENCIA**
```bash
#!/bin/bash
# rollback-express.sh
echo "🚨 EJECUTANDO ROLLBACK EXPRESS..."
git reset --hard HEAD~1
node smoke-tests.js
echo "✅ ROLLBACK COMPLETADO - VERIFICAR MANUALMENTE"
```

### **USO**
```bash
# Hacer ejecutable
chmod +x rollback-express.sh

# Ejecutar en emergencia
./rollback-express.sh
```

---

## 📞 CONTACTOS DE EMERGENCIA

### **ESCALACIÓN**
1. **Nivel 1**: Desarrollador (tú)
2. **Nivel 2**: Lead técnico
3. **Nivel 3**: Arquitecto de software

### **COMUNICACIÓN**
- 🔴 **Crítico**: Notificar inmediatamente
- 🟡 **Alto**: Notificar en 15 minutos
- 🟢 **Medio**: Documentar para revisión

---

## 🎯 MÉTRICAS DE ROLLBACK

### **OBJETIVOS**
- ⏱️ **Tiempo de detección**: <2 minutos
- ⏱️ **Tiempo de rollback**: <5 minutos
- ⏱️ **Tiempo de verificación**: <3 minutos
- ⏱️ **Tiempo total**: <10 minutos

### **REGISTRO**
```bash
# Crear log de rollback
echo "$(date): INICIO ROLLBACK" >> rollback.log
# ... ejecutar rollback ...
echo "$(date): FIN ROLLBACK - ÉXITO" >> rollback.log
```

---

## ✅ ESTADO ACTUAL

- **Commit seguro**: `[COMMIT_INICIAL_HASH]`
- **Rama segura**: `main`
- **Archivos críticos**: Respaldados ✅
- **Smoke tests**: Configurados ✅
- **Plan probado**: ❌ (Probar en entorno de desarrollo)

---

*Documento creado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
*Versión: 1.0*
*Estado: Listo para uso*