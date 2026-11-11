import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@billetera_lite_gastos';

const CATEGORIES = [
  { id: 'Comida', label: 'Comida' },
  { id: 'Transporte', label: 'Transporte' },
  { id: 'Servicios', label: 'Servicios' },
  { id: 'Gustitos', label: 'Gustitos' },
  { id: 'Otros', label: 'Otros' }
];

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [loading, setLoading] = useState(true);

  // 1. Cargar gastos persistidos al iniciar
  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setGastos(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Error al cargar datos locales:', e);
    } finally {
      setLoading(false);
    }
  };

  const persistGastos = async (nuevosGastos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosGastos));
    } catch (e) {
      console.warn('Error al guardar datos:', e);
    }
  };

  // 2. Guardar nuevo gasto
  const handleAddGasto = () => {
    const trimmedConcepto = concepto.trim();
    const parsedMonto = parseFloat(monto);

    if (!trimmedConcepto) {
      Alert.alert('Campo requerido', 'Por favor ingresa el concepto del gasto.');
      return;
    }

    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto numérico mayor a 0.');
      return;
    }

    const nuevoGasto = {
      id: 'gasto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      concepto: trimmedConcepto,
      monto: parseFloat(parsedMonto.toFixed(2)),
      categoria: categoria,
      fecha: new Date().toISOString()
    };

    // Ordenado del más reciente al más antiguo
    const updated = [nuevoGasto, ...gastos];
    setGastos(updated);
    persistGastos(updated);

    // Limpiar formulario
    setConcepto('');
    setMonto('');
  };

  // 3. Eliminar un gasto
  const handleDeleteGasto = (id, conceptoTexto) => {
    Alert.alert(
      'Eliminar gasto',
      `¿Deseas eliminar "${conceptoTexto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const filtered = gastos.filter((item) => item.id !== id);
            setGastos(filtered);
            persistGastos(filtered);
          }
        }
      ]
    );
  };

  // 4. Limpiar todo el historial
  const handleClearAll = () => {
    Alert.alert(
      'Vaciar historial',
      '¿Estás seguro de que deseas borrar todos los gastos? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: () => {
            setGastos([]);
            persistGastos([]);
          }
        }
      ]
    );
  };

  // Formato de moneda
  const total = gastos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  const formattedTotal = total.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${date.getDate()}/${date.getMonth() + 1} • ${hours}:${minutes}`;
    } catch {
      return 'Reciente';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Mi Billetera Lite</Text>
              <Text style={styles.subtitle}>Control de Gastos</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Offline</Text>
            </View>
          </View>

          {/* Tarjeta Totalizadora */}
          <View style={styles.totalCard}>
            <View style={styles.totalHeader}>
              <Text style={styles.totalLabel}>TOTAL DE GASTOS</Text>
              <Text style={styles.totalCount}>
                {gastos.length} {gastos.length === 1 ? 'movimiento' : 'movimientos'}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <Text style={styles.totalAmount}>{formattedTotal}</Text>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registrar Gasto</Text>

            <Text style={styles.inputLabel}>Concepto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Café, Pasaje, Almuerzo..."
              placeholderTextColor="#64748b"
              value={concepto}
              onChangeText={setConcepto}
              maxLength={60}
            />

            <Text style={styles.inputLabel}>Monto ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#64748b"
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Categoría</Text>
            <View style={styles.categoryChipsContainer}>
              {CATEGORIES.map((cat) => {
                const isSelected = categoria === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected
                    ]}
                    onPress={() => setCategoria(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleAddGasto}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>Guardar Gasto</Text>
            </TouchableOpacity>
          </View>

          {/* Historial de Gastos */}
          <View style={styles.card}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Historial de Gastos</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{gastos.length}</Text>
              </View>
            </View>

            {gastos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptySubtitle}>Ingresa un gasto en el formulario.</Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {gastos.map((item) => {
                  const itemMonto = (Number(item.monto) || 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });

                  return (
                    <View key={item.id} style={styles.expenseItem}>
                      <View style={styles.expenseLeft}>
                        <View style={styles.itemBadgeCategory}>
                          <Text style={styles.itemBadgeText}>
                            {item.categoria.substring(0, 1)}
                          </Text>
                        </View>
                        <View style={styles.itemTextContainer}>
                          <Text style={styles.itemConcepto} numberOfLines={1}>
                            {item.concepto}
                          </Text>
                          <Text style={styles.itemMeta}>
                            {item.categoria} • {formatDate(item.fecha)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.expenseRight}>
                        <Text style={styles.itemMonto}>-${itemMonto}</Text>
                        <TouchableOpacity
                          style={styles.btnDelete}
                          onPress={() => handleDeleteGasto(item.id, item.concepto)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.btnDeleteText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.btnClearAll}
                  onPress={handleClearAll}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnClearAllText}>Borrar historial</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f2f2f7',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#202022',
    borderWidth: 1,
    borderColor: '#2c2c2e'
  },
  badgeText: {
    color: '#a1a1a6',
    fontSize: 11,
    fontWeight: '600'
  },
  totalCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2c2c2e'
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6
  },
  totalCount: {
    color: '#a1a1a6',
    fontSize: 11,
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10
  },
  currencySymbol: {
    color: '#8e8e93',
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4
  },
  totalAmount: {
    color: '#f2f2f7',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5
  },
  totalFooterNote: {
    color: '#636366',
    fontSize: 11
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2c2c2e'
  },
  sectionTitle: {
    color: '#f2f2f7',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12
  },
  inputLabel: {
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    backgroundColor: '#242426',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38383a',
    color: '#f2f2f7',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  categoryChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8
  },
  categoryChip: {
    backgroundColor: '#242426',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38383a'
  },
  categoryChipSelected: {
    backgroundColor: '#f2f2f7',
    borderColor: '#f2f2f7'
  },
  categoryChipText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '500'
  },
  categoryChipTextSelected: {
    color: '#121214',
    fontWeight: '700'
  },
  btnPrimary: {
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14
  },
  btnPrimaryText: {
    color: '#121214',
    fontSize: 15,
    fontWeight: '700'
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  countBadge: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  countBadgeText: {
    color: '#a1a1a6',
    fontSize: 11,
    fontWeight: '600'
  },
  listContainer: {
    gap: 10,
    marginTop: 6
  },
  expenseItem: {
    backgroundColor: '#202022',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c2c2e'
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  itemBadgeCategory: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  itemBadgeText: {
    color: '#aeaeb2',
    fontSize: 13,
    fontWeight: '600'
  },
  itemTextContainer: {
    flex: 1
  },
  itemConcepto: {
    color: '#f2f2f7',
    fontSize: 14,
    fontWeight: '600'
  },
  itemMeta: {
    color: '#8e8e93',
    fontSize: 11,
    marginTop: 2
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  itemMonto: {
    color: '#f2f2f7',
    fontSize: 14,
    fontWeight: '600'
  },
  btnDelete: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnDeleteText: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: '600'
  },
  btnClearAll: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    alignItems: 'center'
  },
  btnClearAllText: {
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '500'
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  emptyTitle: {
    color: '#f2f2f7',
    fontSize: 14,
    fontWeight: '600'
  },
  emptySubtitle: {
    color: '#636366',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  }
});
