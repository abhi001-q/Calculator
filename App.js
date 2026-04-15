import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

const App = () => {
  const [display, setDisplay] = useState('0.');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);

  const handlePress = (value) => {
    if (value === 'AC') {
      clear();
      return;
    }
    if (value === '=') {
      calculate();
      return;
    }
    if (['check_prev', 'check_next', 'correct', 'gt', 'mu'].includes(value)) {
      // Ignore for now
      return;
    }
    if (isResult) {
      setDisplay(value);
      setExpression(value);
      setIsResult(false);
    } else {
      if (['+', '-', '×', '÷', '%'].includes(value)) {
        // If last is operator, replace
        if (['+', '-', '×', '÷', '%'].includes(expression.slice(-1))) {
          setExpression(expression.slice(0, -1) + value);
        } else {
          setExpression(expression + value);
        }
        setDisplay(value);
      } else if (value === '.') {
        // Handle decimal
        const lastNumber = expression.split(/[\+\-\×\÷\%]/).pop();
        if (!lastNumber.includes('.')) {
          setExpression(expression + value);
          setDisplay(display + value);
        }
      } else {
        setExpression(expression + value);
        setDisplay(display === '0.' ? value : display + value);
      }
    }
  };

  const calculate = () => {
    try {
      let expr = expression.replace(/×/g, '*').replace(/÷/g, '/');
      let result = eval(expr);
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        setDisplay(result.toString());
      }
      setIsResult(true);
    } catch {
      setDisplay('Error');
      setIsResult(true);
    }
  };

  const clear = () => {
    setDisplay('0.');
    setExpression('');
    setIsResult(false);
  };

  const buttons = [
    { label: 'Check\nPrev', value: 'check_prev', style: styles.functionButton, textStyle: styles.functionText },
    { label: 'Check\nNext', value: 'check_next', style: styles.functionButton, textStyle: styles.functionText },
    { label: 'CORRECT', value: 'correct', style: styles.correctButton, textStyle: styles.correctText },
    { label: 'ON/AC', value: 'AC', style: styles.acButton, textStyle: styles.acText },
    { label: 'GT', value: 'gt', style: styles.operatorButton, textStyle: styles.operatorText },
    { label: 'MU', value: 'mu', style: styles.operatorButton, textStyle: styles.operatorText },
    { label: '%', value: '%', style: styles.operatorButton, textStyle: styles.operatorText },
    { label: '÷', value: '÷', style: styles.operatorButton, textStyle: styles.operatorText },
    { label: '7', value: '7', style: styles.numberButton, textStyle: styles.numberText },
    { label: '8', value: '8', style: styles.numberButton, textStyle: styles.numberText },
    { label: '9', value: '9', style: styles.numberButton, textStyle: styles.numberText },
    { label: '×', value: '×', style: styles.operatorButton, textStyle: styles.operatorText },
    { label: '4', value: '4', style: styles.numberButton, textStyle: styles.numberText },
    { label: '5', value: '5', style: styles.numberButton, textStyle: styles.numberText },
    { label: '6', value: '6', style: styles.numberButton, textStyle: styles.numberText },
    { label: '-', value: '-', style: styles.operatorButton, textStyle: styles.operatorText },
    { label: '1', value: '1', style: styles.numberButton, textStyle: styles.numberText },
    { label: '2', value: '2', style: styles.numberButton, textStyle: styles.numberText },
    { label: '3', value: '3', style: styles.numberButton, textStyle: styles.numberText },
    { label: '+', value: '+', style: styles.plusButton, textStyle: styles.operatorText },
    { label: '0', value: '0', style: styles.numberButton, textStyle: styles.numberText },
    { label: '00', value: '00', style: styles.numberButton, textStyle: styles.numberText },
    { label: '.', value: '.', style: styles.numberButton, textStyle: styles.numberText },
    { label: 'Double Check', value: 'double_check', style: styles.doubleCheckButton, textStyle: styles.doubleCheckText },
    { label: '=', value: '=', style: styles.equalsButton, textStyle: styles.equalsText },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>🧠</Text>
          <Text style={styles.title}>CITIZEN CT-512</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>ELECTRONIC CALCULATOR</Text>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </View>
      </View>
      {/* Main */}
      <View style={styles.main}>
        {/* Solar Panel */}
        <View style={styles.solarPanel}>
          <View style={styles.solarStrip}></View>
        </View>
        {/* Display */}
        <View style={styles.display}>
          <View style={styles.displayLabels}>
            <Text style={styles.label}>LARGE DISPLAY</Text>
            <Text style={styles.label}>AUTO REPLAY</Text>
          </View>
          <Text style={styles.displayText}>{display}</Text>
        </View>
        {/* Keypad */}
        <View style={styles.keypad}>
          {buttons.slice(0, 4).map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, btn.style]}
              onPress={() => handlePress(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, btn.textStyle]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
          {buttons.slice(4, 8).map((btn, index) => (
            <TouchableOpacity
              key={index + 4}
              style={[styles.button, btn.style]}
              onPress={() => handlePress(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, btn.textStyle]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
          {buttons.slice(8, 12).map((btn, index) => (
            <TouchableOpacity
              key={index + 8}
              style={[styles.button, btn.style]}
              onPress={() => handlePress(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, btn.textStyle]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
          {buttons.slice(12, 16).map((btn, index) => (
            <TouchableOpacity
              key={index + 12}
              style={[styles.button, btn.style]}
              onPress={() => handlePress(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, btn.textStyle]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
          {buttons.slice(16, 19).map((btn, index) => (
            <TouchableOpacity
              key={index + 16}
              style={[styles.button, btn.style]}
              onPress={() => handlePress(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, btn.textStyle]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
          {/* Plus button spanning */}
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => handlePress('+')}
            activeOpacity={0.7}
          >
            <Text style={styles.operatorText}>+</Text>
          </TouchableOpacity>
          {buttons.slice(19, 22).map((btn, index) => (
            <TouchableOpacity
              key={index + 19}
              style={[styles.button, btn.style]}
              onPress={() => handlePress(btn.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, btn.textStyle]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
          {/* Double Check spanning 3 columns */}
          <TouchableOpacity
            style={styles.doubleCheckButton}
            onPress={() => handlePress('double_check')}
            activeOpacity={0.7}
          >
            <Text style={styles.doubleCheckText}>Double Check</Text>
          </TouchableOpacity>
          {/* Equals */}
          <TouchableOpacity
            style={styles.equalsButton}
            onPress={() => handlePress('=')}
            activeOpacity={0.7}
          >
            <Text style={styles.equalsText}>=</Text>
          </TouchableOpacity>
        </View>
        {/* Chassis Markings */}
        <View style={styles.chassis}>
          <Text style={styles.chassisText}>120 Steps Check & Correct</Text>
          <View style={styles.dots}>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
          </View>
        </View>
      </View>
      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}>
          <Text style={styles.navIcon}>🧮</Text>
          <Text style={styles.navText}>CALC</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>📜</Text>
          <Text style={styles.navText}>LOGS</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🔬</Text>
          <Text style={styles.navText}>LAB</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>📏</Text>
          <Text style={styles.navText}>UNITS</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#131313',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
    color: '#5ddbc2',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5ddbc2',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 2,
  },
  settingsIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  solarPanel: {
    alignSelf: 'flex-end',
    marginRight: 8,
    marginBottom: 16,
  },
  solarStrip: {
    width: 96,
    height: 24,
    backgroundColor: '#0e0e0e',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  display: {
    width: '100%',
    minHeight: 120,
    backgroundColor: '#0e0e0e',
    borderRadius: 8,
    padding: 24,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 32,
  },
  displayLabels: {
    position: 'absolute',
    top: 8,
    left: 16,
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  displayText: {
    fontSize: 48,
    color: '#5ddbc2',
    fontWeight: '300',
    letterSpacing: -1,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: width * 0.9,
    maxWidth: 400,
  },
  button: {
    width: (width * 0.9 - 36) / 4,
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    textAlign: 'center',
  },
  functionButton: {
    backgroundColor: '#0162cf',
    height: 56,
  },
  functionText: {
    color: '#dae4ff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  correctButton: {
    backgroundColor: '#2a2a2a',
    height: 56,
  },
  correctText: {
    color: '#e5e2e1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  acButton: {
    backgroundColor: '#5ddbc2',
    height: 56,
  },
  acText: {
    color: '#00382f',
    fontSize: 14,
    fontWeight: '900',
  },
  operatorButton: {
    backgroundColor: '#353534',
    height: 56,
  },
  operatorText: {
    color: '#e5e2e1',
    fontSize: 20,
    fontWeight: 'bold',
  },
  numberButton: {
    backgroundColor: '#2a2a2a',
    height: 64,
  },
  numberText: {
    color: '#e5e2e1',
    fontSize: 24,
    fontWeight: '300',
  },
  plusButton: {
    position: 'absolute',
    right: 0,
    top: 56 * 3 + 12 * 3 + 64 + 12, // adjust for rows
    width: (width * 0.9 - 36) / 4,
    height: 128,
    backgroundColor: '#353534',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  doubleCheckButton: {
    width: (width * 0.9 - 36) / 4 * 3 + 12,
    height: 64,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  doubleCheckText: {
    color: '#e5e2e1',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  equalsButton: {
    width: (width * 0.9 - 36) / 4,
    height: 64,
    backgroundColor: '#5ddbc2',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  equalsText: {
    color: '#00382f',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chassis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 16,
  },
  chassisText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#353534',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#131313',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navItemActive: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

export default App;
