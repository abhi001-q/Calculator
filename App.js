import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  SpaceGrotesk_500Medium,
} from "@expo-google-fonts/space-grotesk";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";

const { width } = Dimensions.get("window");
const operators = ["+", "-", "×", "÷", "%"];

const App = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isResult, setIsResult] = useState(false);

  console.log("App loaded properly!");

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const endsWithOperator = (value) => operators.includes(value.slice(-1));

  const handlePress = (value) => {
    if (value === "AC") {
      clear();
      return;
    }

    if (value === "=") {
      calculate();
      return;
    }

    if (
      [
        "check_prev",
        "check_next",
        "correct",
        "gt",
        "mu",
        "double_check",
      ].includes(value)
    ) {
      return;
    }

    if (display.length >= 16 && !operators.includes(value)) {
      return;
    }

    if (isResult && !operators.includes(value)) {
      if (value === ".") {
        setExpression("0.");
        setDisplay("0.");
      } else {
        setExpression(value);
        setDisplay(value);
      }
      setIsResult(false);
      return;
    }

    if (operators.includes(value)) {
      if (expression === "" && value !== "-") {
        return;
      }
      if (endsWithOperator(expression)) {
        setExpression(expression.slice(0, -1) + value);
      } else {
        setExpression(expression + value);
      }
      setDisplay(value);
      return;
    }

    if (value === ".") {
      if (expression === "" || endsWithOperator(expression)) {
        setExpression(expression + "0.");
        setDisplay("0.");
        return;
      }

      const lastNumber = expression.split(/[\+\-\×\÷\%]/).pop();
      if (!lastNumber.includes(".")) {
        setExpression(expression + ".");
        setDisplay(endsWithOperator(display) ? "0." : display + ".");
      }
      return;
    }

    if (value === "00") {
      if (
        expression === "" ||
        endsWithOperator(expression) ||
        display === "0"
      ) {
        setExpression("0");
        setDisplay("0");
      } else {
        setExpression(expression + "00");
        setDisplay(display + "00");
      }
      return;
    }

    const newDisplay =
      display === "0" || operators.includes(display) ? value : display + value;
    const newExpression = expression === "0" ? value : expression + value;
    setExpression(newExpression);
    setDisplay(newDisplay);
  };

  const calculate = () => {
    if (!expression) {
      return;
    }

    let expr = expression.replace(/×/g, "*").replace(/÷/g, "/");
    if (endsWithOperator(expr)) {
      expr = expr.slice(0, -1);
    }

    try {
      let result = eval(expr);
      if (typeof result === "number" && isFinite(result)) {
        const formatted = parseFloat(result.toFixed(10)).toString();
        setDisplay(formatted);
        setExpression(formatted);
      } else {
        setDisplay("Error");
        setExpression("");
      }
    } catch {
      setDisplay("Error");
      setExpression("");
    }

    setIsResult(true);
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
    setIsResult(false);
  };

  const buttonProps = {
    function: {
      style: styles.functionButton,
      textStyle: styles.functionText,
    },
    correct: {
      style: styles.correctButton,
      textStyle: styles.correctText,
    },
    ac: {
      style: styles.acButton,
      textStyle: styles.acText,
    },
    operator: {
      style: styles.operatorButton,
      textStyle: styles.operatorText,
    },
    number: {
      style: styles.numberButton,
      textStyle: styles.numberText,
    },
    equals: {
      style: styles.equalsButton,
      textStyle: styles.equalsText,
    },
  };

  const topRow1 = [
    { label: "Check\nPrev", value: "check_prev", ...buttonProps.function },
    { label: "Check\nNext", value: "check_next", ...buttonProps.function },
    { label: "CORRECT", value: "correct", ...buttonProps.correct },
    { label: "ON/AC", value: "AC", ...buttonProps.ac },
  ];

  const topRow2 = [
    { label: "GT", value: "gt", ...buttonProps.operator },
    { label: "MU", value: "mu", ...buttonProps.operator },
    { label: "%", value: "%", ...buttonProps.operator },
    { label: "÷", value: "÷", ...buttonProps.operator },
  ];

  const numberRows = [
    [
      { label: "7", value: "7", ...buttonProps.number },
      { label: "8", value: "8", ...buttonProps.number },
      { label: "9", value: "9", ...buttonProps.number },
      { label: "×", value: "×", ...buttonProps.operator },
    ],
    [
      { label: "4", value: "4", ...buttonProps.number },
      { label: "5", value: "5", ...buttonProps.number },
      { label: "6", value: "6", ...buttonProps.number },
      { label: "-", value: "-", ...buttonProps.operator },
    ],
    [
      { label: "1", value: "1", ...buttonProps.number },
      { label: "2", value: "2", ...buttonProps.number },
      { label: "3", value: "3", ...buttonProps.number },
      { type: "placeholder" },
    ],
    [
      { label: "0", value: "0", ...buttonProps.number },
      { label: "00", value: "00", ...buttonProps.number },
      { label: ".", value: ".", ...buttonProps.number },
      { type: "placeholder" },
    ],
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>CITIZEN CT-512</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>SMART CALCULATOR</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.display}>
          <View style={styles.displayLabels}>
            <Text style={styles.label}>MADE BY ABHISHEK</Text>
          </View>
          <Text
            style={styles.displayText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {display}
          </Text>
        </View>

        <View style={styles.keypad}>
          <View style={styles.row}>
            {topRow1.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, btn.style]}
                onPress={() => handlePress(btn.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, btn.textStyle]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            {topRow2.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, btn.style]}
                onPress={() => handlePress(btn.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, btn.textStyle]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {numberRows.map((row, rowIndex) => (
            <View style={styles.row} key={rowIndex}>
              {row.map((btn, index) => {
                if (btn.type === "placeholder") {
                  return (
                    <View
                      key={index}
                      style={[styles.button, styles.placeholderButton]}
                    />
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.button, btn.style]}
                    onPress={() => handlePress(btn.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.buttonText, btn.textStyle]}>
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <TouchableOpacity
            style={styles.plusAbsolute}
            onPress={() => handlePress("+")}
            activeOpacity={0.7}
          >
            <Text style={styles.operatorText}>+</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.bottomWideButton,
                styles.numberButton,
              ]}
              onPress={() => handlePress("double_check")}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.numberText]}>
                Double Check
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.equalsButton]}
              onPress={() => handlePress("=")}
              activeOpacity={0.7}
            >
              <Text style={styles.equalsText}>=</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chassis}>
          <Text style={styles.chassisText}>120 Steps Check & Correct</Text>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131313",
    paddingTop: 48,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 20,
    color: "#5ddbc2",
  },
  title: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 18,
    color: "#5ddbc2",
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#9ca3af",
    letterSpacing: 2,
    fontWeight: "700",
  },
  settingsIcon: {
    fontSize: 20,
    color: "#6b7280",
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  solarPanel: {
    alignSelf: "flex-end",
    marginRight: 8,
    marginBottom: 14,
  },
  solarStrip: {
    width: 92,
    height: 22,
    backgroundColor: "#0e0e0e",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  display: {
    width: "100%",
    minHeight: 180,
    backgroundColor: "#0e0e0e",
    borderRadius: 14,
    padding: 24,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 28,
  },
  displayLabels: {
    position: "absolute",
    top: 12,
    left: 16,
    flexDirection: "row",
    gap: 16,
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    fontWeight: "700",
  },
  displayText: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 68,
    color: "#5ddbc2",
    letterSpacing: -1,
  },
  keypad: {
    position: "relative",
    width: width * 0.94,
    maxWidth: 440,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  button: {
    width: (width * 0.94 - 36) / 4,
    height: 64,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontWeight: "700",
    color: "#e5e2e1",
  },
  functionButton: {
    backgroundColor: "#0162cf",
  },
  functionText: {
    color: "#dae4ff",
    fontSize: 12,
    letterSpacing: 1,
  },
  correctButton: {
    backgroundColor: "#2a2a2a",
  },
  correctText: {
    color: "#e5e2e1",
    fontSize: 14,
  },
  acButton: {
    backgroundColor: "#5ddbc2",
  },
  acText: {
    color: "#00382f",
    fontSize: 14,
  },
  operatorButton: {
    backgroundColor: "#353534",
  },
  operatorText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#e5e2e1",
  },
  numberButton: {
    backgroundColor: "#2a2a2a",
  },
  numberText: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#e5e2e1",
  },
  placeholderButton: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  plusAbsolute: {
    position: "absolute",
    right: 0,
    top: 304,
    width: (width * 0.94 - 36) / 4,
    height: 64 * 2 + 12,
    backgroundColor: "#353534",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  plusTall: {
    width: (width * 0.94 - 36) / 4,
    height: 64 * 2 + 12,
  },
  bottomWideButton: {
    width: ((width * 0.94 - 36) / 4) * 3 + 24,
  },
  equalsButton: {
    backgroundColor: "#5ddbc2",
  },
  equalsText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#00382f",
  },
  chassis: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginTop: 16,
  },
  chassisText: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#353534",
  },
});

export default App;
