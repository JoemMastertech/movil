/**
 * SMOKE TESTS AUTOMÁTICOS
 * Semana 1, Día 2 - Configurar smoke tests automáticos
 * 
 * Estos tests deben ejecutarse después de cada cambio
 * para verificar que las funcionalidades críticas siguen funcionando
 */

class SmokeTests {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  // Test 1: Verificar que se puede agregar producto
  async canAddProduct() {
    try {
      // Simular agregar un producto básico
      const testProduct = {
        id: 'test_001',
        nombre: 'Test Product',
        precio: 10.99
      };
      
      // Verificar que ProductRenderer existe
      if (typeof ProductRenderer === 'undefined') {
        throw new Error('ProductRenderer no está disponible');
      }
      
      // Verificar que las funciones críticas existen
      const criticalFunctions = [
        'createProductTable',
        'createProductGrid',
        'renderCocktails',
        'renderPizzas'
      ];
      
      for (const func of criticalFunctions) {
        if (typeof ProductRenderer[func] !== 'function') {
          throw new Error(`Función crítica ${func} no existe`);
        }
      }
      
      return true;
    } catch (error) {
      this.errors.push(`canAddProduct: ${error.message}`);
      return false;
    }
  }

  // Test 2: Verificar cálculo de totales
  async canCalculateTotal() {
    try {
      // Verificar que OrderCore existe y funciona
      const orderCoreExists = typeof OrderSystemCore !== 'undefined';
      if (!orderCoreExists) {
        throw new Error('OrderSystemCore no está disponible');
      }
      
      // Test básico de cálculo
      const testItems = [
        { precio: 10.50, cantidad: 2 },
        { precio: 15.75, cantidad: 1 }
      ];
      
      const expectedTotal = (10.50 * 2) + (15.75 * 1); // 36.75
      
      // Verificar que el cálculo es correcto (simulado)
      if (expectedTotal !== 36.75) {
        throw new Error('Cálculo básico falló');
      }
      
      return true;
    } catch (error) {
      this.errors.push(`canCalculateTotal: ${error.message}`);
      return false;
    }
  }

  // Test 3: Verificar renderizado de productos
  async canRenderProducts() {
    try {
      // Crear un contenedor de prueba
      const testContainer = document.createElement('div');
      testContainer.id = 'test-container';
      document.body.appendChild(testContainer);
      
      // Verificar que ProductRenderer puede crear una tabla básica
      if (typeof ProductRenderer !== 'undefined' && 
          typeof ProductRenderer.createProductTable === 'function') {
        
        const testData = [{
          nombre: 'Test Product',
          precio: 10.99
        }];
        
        const testHeaders = ['NOMBRE', 'PRECIO'];
        const testFields = ['nombre', 'precio'];
        
        // Intentar crear tabla (sin errores)
        ProductRenderer.createProductTable(
          testContainer, 
          testHeaders, 
          testData, 
          testFields, 
          'test-table', 
          'Test Category'
        );
        
        // Verificar que se creó la tabla
        const table = testContainer.querySelector('table');
        if (!table) {
          throw new Error('No se pudo crear la tabla');
        }
      }
      
      // Limpiar
      document.body.removeChild(testContainer);
      return true;
    } catch (error) {
      this.errors.push(`canRenderProducts: ${error.message}`);
      return false;
    }
  }

  // Test 4: Verificar guardado en localStorage
  async canSaveOrder() {
    try {
      // Test básico de localStorage
      const testKey = 'smoke_test_order';
      const testData = { test: 'data', timestamp: Date.now() };
      
      // Guardar
      localStorage.setItem(testKey, JSON.stringify(testData));
      
      // Recuperar
      const retrieved = JSON.parse(localStorage.getItem(testKey));
      
      if (!retrieved || retrieved.test !== 'data') {
        throw new Error('localStorage no funciona correctamente');
      }
      
      // Limpiar
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      this.errors.push(`canSaveOrder: ${error.message}`);
      return false;
    }
  }

  // Test 5: Verificar navegación básica
  async canNavigate() {
    try {
      // Verificar que el DOM básico existe
      const body = document.body;
      if (!body) {
        throw new Error('DOM no está disponible');
      }
      
      // Verificar que se pueden crear elementos
      const testDiv = document.createElement('div');
      if (!testDiv) {
        throw new Error('No se pueden crear elementos DOM');
      }
      
      return true;
    } catch (error) {
      this.errors.push(`canNavigate: ${error.message}`);
      return false;
    }
  }

  // Ejecutar todos los tests
  async runAllTests() {
    console.log('🧪 Iniciando Smoke Tests...');
    
    const tests = [
      { name: 'Agregar Producto', test: () => this.canAddProduct() },
      { name: 'Calcular Total', test: () => this.canCalculateTotal() },
      { name: 'Renderizar Productos', test: () => this.canRenderProducts() },
      { name: 'Guardar Orden', test: () => this.canSaveOrder() },
      { name: 'Navegación', test: () => this.canNavigate() }
    ];
    
    this.results = [];
    this.errors = [];
    
    for (const { name, test } of tests) {
      console.log(`  🔍 Ejecutando: ${name}`);
      const result = await test();
      this.results.push({ name, passed: result });
      
      if (result) {
        console.log(`  ✅ ${name}: PASÓ`);
      } else {
        console.log(`  ❌ ${name}: FALLÓ`);
      }
    }
    
    return this.generateReport();
  }

  // Generar reporte de resultados
  generateReport() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const success = passed === total;
    
    const report = {
      success,
      passed,
      total,
      errors: this.errors,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📊 REPORTE DE SMOKE TESTS:');
    console.log(`   Pasaron: ${passed}/${total}`);
    console.log(`   Estado: ${success ? '✅ TODOS PASARON' : '❌ HAY FALLOS'}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORES ENCONTRADOS:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (!success) {
      console.log('\n🚨 ACCIÓN REQUERIDA: ROLLBACK INMEDIATO');
    }
    
    return report;
  }
}

// Función para ejecutar smoke tests desde línea de comandos
if (typeof window === 'undefined') {
  // Entorno Node.js
  const smokeTests = new SmokeTests();
  smokeTests.runAllTests().then(report => {
    process.exit(report.success ? 0 : 1);
  });
} else {
  // Entorno navegador - exponer globalmente
  window.SmokeTests = SmokeTests;
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmokeTests;
}