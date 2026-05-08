import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  Modal,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  useFonts,
  SpaceGrotesk_500Medium,
} from "@expo-google-fonts/space-grotesk";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";

import { Feather } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");
const operators = ["+", "-", "×", "÷", "%"];

export default function App() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isResult, setIsResult] = useState(false);
  const [currentOp, setCurrentOp] = useState("");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [stepCount, setStepCount] = useState(1);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showGT, setShowGT] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Calculator");
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    Inter_400Regular,
    Inter_700Bold,
  });
  if (!fontsLoaded) return null;

  const endsWithOp = (v) => operators.includes(v.slice(-1));

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsSidebarOpen(false));
  };

  const renderMenuItem = (label, iconName) => {
    const isActive = activeTab === label;
    return (
      <TouchableOpacity
        key={label}
        style={[s.menuItem, isActive && s.menuItemActive]}
        onPress={() => {
          setActiveTab(label);
          if (label !== "Calculator") {
            Alert.alert("Coming Soon", `${label} feature will be available in the next update.`);
          }
          closeSidebar();
        }}
      >
        <Feather name={iconName} size={18} color={isActive ? "#11bcb0" : "#888"} />
        <Text style={[s.menuItemText, isActive && s.menuItemTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const press = (value) => {
    // Increment step count on every key press except AC (which resets it)
    if (value !== "AC") setStepCount((prev) => prev + 1);

    if (value === "AC") {
      clear();
      return;
    }
    if (value === "=") {
      calculate();
      return;
    }
    if (value === "check") {
      setHistoryVisible(true);
      return;
    }
    if (value === "DEL") {
      if (expression.length <= 1) {
        setExpression("0");
        setDisplay("0");
      } else {
        const ne = expression.slice(0, -1);
        setExpression(ne);
        setDisplay(ne.slice(-1) || "0");
      }
      return;
    }
    if (value === "mrc") {
      // Memory Recall
      const memStr = memory.toString();
      setExpression(memStr);
      setDisplay(memStr);
      setIsResult(true);
      return;
    }
    if (value === "m_plus") {
      // Memory Add
      const num = parseFloat(display);
      setMemory((prev) => prev + (isNaN(num) ? 0 : num));
      return;
    }
    if (value === "m_minus") {
      // Memory Subtract
      const num = parseFloat(display);
      setMemory((prev) => prev - (isNaN(num) ? 0 : num));
      return;
    }
    if (value === "plusminus") {
      if (display === "0") return;
      const toggled = display.startsWith("-")
        ? display.slice(1)
        : "-" + display;
      setExpression(toggled);
      setDisplay(toggled);
      return;
    }
    if (value === "sqrt") {
      const num = parseFloat(display);
      if (num < 0) {
        setDisplay("Error");
        setExpression("");
        return;
      }
      const res = Math.sqrt(num).toString();
      setExpression(res);
      setDisplay(res);
      return;
    }
    if (value === "gt") {
      const gtStr = grandTotal.toString();
      setExpression(gtStr);
      setDisplay(gtStr);
      setIsResult(true);
      return;
    }
    if (value === "mu") {
      // Mark Up: (A + B) MU % -> A / (1 - B/100)
      // For now, simpler implementation: Current * 1.15
      const num = parseFloat(display);
      if (isNaN(num)) return;
      const res = (num * 1.15).toString();
      setExpression(res);
      setDisplay(res);
      setIsResult(true);
      return;
    }
    if (value === "gst") {
      // GST tax calculation (apply 5% tax)
      const num = parseFloat(display);
      if (isNaN(num)) {
        setDisplay("Error");
        setExpression("");
        return;
      }
      const taxed = (num * 1.05).toString();
      setExpression(taxed);
      setDisplay(taxed);
      return;
    }
    if (display.length >= 14 && !operators.includes(value)) return;

    if (isResult && !operators.includes(value)) {
      const nv = value === "." ? "0." : value;
      setExpression(nv);
      setDisplay(nv);
      setIsResult(false);
      return;
    }
    if (operators.includes(value)) {
      if (expression === "" && value !== "-") return;
      if (endsWithOp(expression))
        setExpression(expression.slice(0, -1) + value);
      else setExpression(expression + value);
      setCurrentOp(value);
      setDisplay(value);
      return;
    }
    if (value === ".") {
      if (expression === "" || endsWithOp(expression)) {
        setExpression(expression + "0.");
        setDisplay("0.");
        return;
      }
      const last = expression.split(/[\+\-\×\÷\%]/).pop();
      if (!last.includes(".")) {
        setExpression(expression + ".");
        setDisplay(endsWithOp(display) ? "0." : display + ".");
      }
      return;
    }
    if (value === "00") {
      if (!expression || endsWithOp(expression) || display === "0") {
        setExpression("0");
        setDisplay("0");
      } else {
        setExpression(expression + "00");
        setDisplay(display + "00");
      }
      return;
    }
    const nd =
      display === "0" || operators.includes(display) ? value : display + value;
    const ne = expression === "0" ? value : expression + value;
    setExpression(ne);
    setDisplay(nd);
    setCurrentOp(""); // clear op indicator once user types next number
  };

  const calculate = () => {
    if (!expression) return;
    let expr = expression.replace(/×/g, "*").replace(/÷/g, "/");
    if (endsWithOp(expr)) expr = expr.slice(0, -1);
    try {
      const result = eval(expr);
      if (typeof result === "number" && isFinite(result)) {
        const fmt = parseFloat(result.toFixed(10)).toString();
        const exStr = expression.replace(/\*/g, "×").replace(/\//g, "÷");
        const now = new Date();
        setHistory((prev) => [
          ...prev,
          {
            time: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            equation: `${exStr} = ${fmt}`,
          },
        ]);
        setDisplay(fmt);
        setExpression(fmt);
        // Add to Grand Total
        setGrandTotal((prev) => prev + parseFloat(fmt));
        setShowGT(true);
      } else {
        setDisplay("Error");
        setExpression("");
      }
    } catch {
      setDisplay("Error");
      setExpression("");
    }
    setCurrentOp("=");
    setIsResult(true);
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
    setIsResult(false);
    setCurrentOp("");
    setStepCount(1);
    setMemory(0);
    setGrandTotal(0);
    setShowGT(false);
  };

  const downloadReceipt = async () => {
    if (!history.length) {
      Alert.alert("No History", "No calculations yet.");
      return;
    }
    try {
      const content =
        "CITIZEN CT-512\n=== RECEIPT ===\n\n" +
        history.map((h) => `[${h.time}]\n${h.equation}`).join("\n\n");
      if (Platform.OS === "android") {
        const { StorageAccessFramework } = FileSystem;
        const p =
          await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (p.granted) {
          const uri = await StorageAccessFramework.createFileAsync(
            p.directoryUri,
            "citizen-receipt.txt",
            "text/plain",
          );
          await FileSystem.writeAsStringAsync(uri, content, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          Alert.alert("✓ Saved", "Receipt saved to your folder.");
          return;
        }
        Alert.alert("Permission Denied");
        return;
      }
      const uri = FileSystem.cacheDirectory + "citizen-receipt.txt";
      await FileSystem.writeAsStringAsync(uri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(uri, { mimeType: "text/plain" });
    } catch {
      Alert.alert("Error", "Could not save.");
    }
  };

  // Simple button wrapper
  const Btn = ({ label, onPress, bg, color, flex = 1, fz = 20 }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[s.btn, { flex, backgroundColor: bg }]}
    >
      <Text
        style={[s.btnTxt, { color, fontSize: fz }]}
        adjustsFontSizeToFit
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />

      {/* ── Sidebar Menu Modal ── */}
      <Modal visible={isSidebarOpen} transparent={true} animationType="none" onRequestClose={closeSidebar}>
        <View style={s.sidebarOverlay}>
          <TouchableOpacity style={s.sidebarBg} activeOpacity={1} onPress={closeSidebar} />
          <Animated.View style={[s.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={s.sidebarHeader}>
              <Text style={s.sidebarTitle}>Menu</Text>
              <TouchableOpacity onPress={closeSidebar} style={s.sidebarCloseBtn}>
                <Feather name="x" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.sidebarScroll} contentContainerStyle={s.sidebarScrollContent}>
              <Text style={s.sidebarSectionTitle}>Calculator</Text>
              {renderMenuItem("Calculator", "cpu")}
              {renderMenuItem("History", "clock")}
              {renderMenuItem("Cash Note Counter", "dollar-sign")}
              {renderMenuItem("Amount to Words", "type")}
              {renderMenuItem("Currency Converter", "refresh-cw")}
              {renderMenuItem("Age Calculator", "calendar")}
              {renderMenuItem("World Clock", "globe")}

              <View style={s.sidebarDivider} />

              <Text style={s.sidebarSectionTitle}>Tools</Text>
              {renderMenuItem("Compass", "compass")}
              {renderMenuItem("Notes", "file-text")}
              {renderMenuItem("QR Code Scanner", "maximize")}
              {renderMenuItem("Unit Converter", "sliders")}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* ── History Modal (slide-up sheet) ── */}
      <Modal visible={historyVisible} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>CITIZEN CT-512</Text>
            <Text style={s.sheetSub}>— RECEIPT —</Text>
            <ScrollView
              style={{ maxHeight: height * 0.42, marginBottom: 20 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {!history.length ? (
                <Text style={s.emptyTxt}>No calculations yet.</Text>
              ) : (
                [...history].reverse().map((item, i) => (
                  <View key={i} style={s.histRow}>
                    <Text style={s.histTime}>{item.time}</Text>
                    <Text style={s.histEq}>{item.equation}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={s.sheetFoot}>
              <TouchableOpacity
                onPress={() => setHistory([])}
                style={s.fBtnRed}
                activeOpacity={0.7}
              >
                <Text style={s.fTxtRed}>CLEAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={downloadReceipt}
                style={s.fBtnTeal}
                activeOpacity={0.7}
              >
                <Text style={s.fTxtW}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHistoryVisible(false)}
                style={s.fBtnGrey}
                activeOpacity={0.7}
              >
                <Text style={s.fTxtW}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Calculator Body ── */}
      <View style={s.body}>
        {/* Brand bar */}
        <View style={s.brandBar}>
          <View style={s.brandBarLeft}>
            <TouchableOpacity onPress={openSidebar} style={s.hamburgerBtn}>
              <Feather name="menu" size={24} color="#11bcb0" />
            </TouchableOpacity>
            <Text style={s.brandName}>CITIZEN</Text>
          </View>
          <Text style={s.brandMeta}>CT-512 · 112 STEPS CHECK</Text>
        </View>

        {/* LCD */}
        <View style={s.lcdBezel}>
          <View style={s.lcdScreen}>
            <Text style={s.lcdStep}>
              {stepCount.toString().padStart(2, "0")}
            </Text>
            {showGT && <Text style={s.lcdGT}>GT</Text>}
            {memory !== 0 && <Text style={s.lcdMem}>M={memory}</Text>}

            {/* Operator indicator — shown top-right when operator is active */}
            {currentOp ? <Text style={s.lcdOp}>{currentOp}</Text> : null}
            {/* Main number — hide the bare operator symbol, show the last number instead */}
            <Text style={s.lcdNum} numberOfLines={1} adjustsFontSizeToFit>
              {operators.includes(display)
                ? expression.split(/[\+\-\×\÷\%]/).slice(-2, -1)[0] || "0"
                : display}
            </Text>
          </View>
        </View>

        {/* Sub-panel row: CHECK | CORRECT+DEL | Solar */}
        <View style={s.subRow}>
          <TouchableOpacity
            style={s.checkBtn}
            onPress={() => press("check")}
            activeOpacity={0.75}
          >
            <Text style={s.checkTxt}>CHECK ➔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.correctBtn}
            onPress={() => press("DEL")}
            activeOpacity={0.75}
          >
            <Text style={s.correctTxt}>CORRECT / DEL</Text>
          </TouchableOpacity>
          <View style={s.solar}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={s.solarCell} />
            ))}
          </View>
        </View>
        <Text style={s.stepsLbl}>112 STEPS CHECK</Text>

        {/* CE | Settings | ON/AC row */}
        <View style={s.acRow}>
          <Btn
            label="Menu"
            onPress={() => {}}
            bg="#2a2a2a"
            color="#aaa"
            fz={20}
          />
          <Btn
            label="CE"
            onPress={() => press("AC")}
            bg="#1e1e1e"
            color="#11bcb0"
            fz={16}
          />
          <Btn
            label="ON / AC"
            onPress={() => press("AC")}
            bg="#00b894"
            color="#fff"
            fz={15}
          />
        </View>

        {/* ─── MAIN KEYPAD ───────────────────────────────────────
          Layout matches Citizen CT-512 + reference image 2:

          LEFT COL (narrow, light grey):
            MR | M+ | M- | +/- | √x | GT | MU   (7 buttons)

          RIGHT 4 COLS × 5 rows (with + spanning rows 3+4):
            Col-A:  GST  |  7  |  4  |  1  |  0
            Col-B:   %   |  8  |  5  |  2  |  00
            Col-C:   ÷   |  9  |  6  |  3  |  .
            Col-D:   ×   |  -  | [+tall]   |  =
        ──────────────────────────────────────────────────────── */}
        <View style={s.keypad}>
          {/* Left memory column — 7 light-grey buttons */}
          <View style={s.memCol}>
            <Btn
              label="MR"
              onPress={() => press("mrc")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={13}
            />
            <Btn
              label="M+"
              onPress={() => press("m_plus")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={13}
            />
            <Btn
              label="M−"
              onPress={() => press("m_minus")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={13}
            />
            <Btn
              label="+/−"
              onPress={() => press("plusminus")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={12}
            />
            <Btn
              label="√x"
              onPress={() => press("sqrt")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={13}
            />
            <Btn
              label="GT"
              onPress={() => press("gt")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={13}
            />
            <Btn
              label="MU"
              onPress={() => press("mu")}
              bg="#d2cec8"
              color="#1a1a1a"
              fz={13}
            />
          </View>

          {/* Col-A: GST 7 4 1 0 */}
          <View style={s.col}>
            <Btn
              label="GST"
              onPress={() => press("gst")}
              bg="#2a2a2a"
              color="#ccc"
              fz={13}
            />
            <Btn
              label="7"
              onPress={() => press("7")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="4"
              onPress={() => press("4")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="1"
              onPress={() => press("1")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="0"
              onPress={() => press("0")}
              bg="#212121"
              color="#eee"
            />
          </View>

          {/* Col-B: % 8 5 2 00 */}
          <View style={s.col}>
            <Btn
              label="%"
              onPress={() => press("%")}
              bg="#2a2a2a"
              color="#ccc"
            />
            <Btn
              label="8"
              onPress={() => press("8")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="5"
              onPress={() => press("5")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="2"
              onPress={() => press("2")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="00"
              onPress={() => press("00")}
              bg="#212121"
              color="#eee"
            />
          </View>

          {/* Col-C: ÷ 9 6 3 . */}
          <View style={s.col}>
            <Btn
              label="÷"
              onPress={() => press("÷")}
              bg="#2a2a2a"
              color="#ddd"
            />
            <Btn
              label="9"
              onPress={() => press("9")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="6"
              onPress={() => press("6")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="3"
              onPress={() => press("3")}
              bg="#212121"
              color="#eee"
            />
            <Btn
              label="·"
              onPress={() => press(".")}
              bg="#212121"
              color="#eee"
            />
          </View>

          {/* Col-D: × − [+tall flex:2] = */}
          <View style={s.col}>
            <Btn
              label="×"
              onPress={() => press("×")}
              bg="#2a2a2a"
              color="#ddd"
            />
            <Btn
              label="−"
              onPress={() => press("-")}
              bg="#2a2a2a"
              color="#ddd"
            />
            {/* Tall + button takes flex:2 (same as 2 normal rows) */}
            <Btn
              label="+"
              onPress={() => press("+")}
              bg="#2a2a2a"
              color="#ddd"
              flex={2}
              fz={28}
            />
            <Btn
              label="="
              onPress={() => press("=")}
              bg="#00b894"
              color="#fff"
              fz={26}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>MADE BY ABHISHEK</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const GAP = 5;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  body: { flex: 1, backgroundColor: "#161616" },

  // Brand bar
  brandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#0d0d0d",
  },
  brandBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  hamburgerBtn: {
    marginRight: 12,
    padding: 2,
  },
  brandName: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 17,
    color: "#11bcb0",
    letterSpacing: 3,
  },
  brandMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    color: "#3a3a3a",
    letterSpacing: 1.5,
  },

  // LCD
  lcdBezel: {
    backgroundColor: "#090909",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  lcdScreen: {
    backgroundColor: "#7a9e72",
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 150,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    position: "relative",
  },
  lcdStep: {
    position: "absolute",
    top: 7,
    left: 10,
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 13,
    color: "#3e5438",
  },
  lcdOp: {
    position: "absolute",
    top: 10,
    right: 14,
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 22,
    color: "#2e4228",
  },
  lcdGT: {
    position: "absolute",
    top: 10,
    left: 85,
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 17,
    color: "#2e4228",
  },
  lcdMem: {
    position: "absolute",
    top: 10,
    left: 155,
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 16,
    color: "#2e4228",
  },
  lcdNum: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 68,
    color: "#1e2e1a",
    letterSpacing: -2,
  },

  // Sub row: CHECK | CORRECT/DEL | Solar
  subRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 10,
    paddingTop: 6,
    gap: GAP,
  },
  checkBtn: {
    flex: 1.1,
    backgroundColor: "#4170c4",
    borderRadius: 3,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkTxt: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#fff" },
  correctBtn: {
    flex: 1.3,
    backgroundColor: "#252525",
    borderRadius: 3,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  correctTxt: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#888" },
  solar: {
    width: 66,
    flexDirection: "row",
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#221810",
  },
  solarCell: { flex: 1, borderRightWidth: 1, borderRightColor: "#3a2416" },

  stepsLbl: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: "#c9a85c",
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 2,
    letterSpacing: 1,
  },

  // ON/AC row
  acRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 5,
    height: 42,
    gap: GAP,
  },

  // Keypad
  keypad: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 8,
    gap: GAP,
  },

  memCol: { width: 54, gap: GAP },
  col: { flex: 1, gap: GAP },

  // Generic button
  btn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  btnTxt: { fontFamily: "Inter_700Bold", textAlign: "center" },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 5,
    backgroundColor: "#0d0d0d",
  },
  footerTxt: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    color: "#2a2a2a",
    letterSpacing: 2,
  },

  // ── History Modal ──
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#181818",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: height * 0.78,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#252525",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 22,
    color: "#11bcb0",
    textAlign: "center",
    letterSpacing: 3,
  },
  sheetSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#3a3a3a",
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 3,
    marginBottom: 18,
  },
  emptyTxt: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#2e2e2e",
    textAlign: "center",
    paddingVertical: 28,
  },
  histRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingVertical: 12,
    alignItems: "flex-end",
  },
  histTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#3a3a3a",
    letterSpacing: 1,
    marginBottom: 3,
  },
  histEq: { fontFamily: "SpaceGrotesk_500Medium", fontSize: 20, color: "#ddd" },
  sheetFoot: { flexDirection: "row", gap: 10 },
  fBtnRed: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e11d48",
    alignItems: "center",
  },
  fBtnTeal: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: "#11bcb0",
    alignItems: "center",
  },
  fBtnGrey: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: "#222",
    alignItems: "center",
  },
  fTxtRed: { fontFamily: "Inter_700Bold", color: "#e11d48", fontSize: 12 },
  fTxtW: { fontFamily: "Inter_700Bold", color: "#fff", fontSize: 12 },

  // ── Sidebar Menu ──
  sidebarOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sidebarContainer: {
    width: width * 0.75,
    maxWidth: 320,
    backgroundColor: "#161616",
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#252525",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  sidebarTitle: {
    fontFamily: "SpaceGrotesk_500Medium",
    fontSize: 22,
    color: "#fff",
    letterSpacing: 1,
  },
  sidebarCloseBtn: {
    padding: 5,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarScrollContent: {
    paddingVertical: 15,
  },
  sidebarSectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  menuItemActive: {
    backgroundColor: "rgba(17, 188, 176, 0.1)",
    borderLeftColor: "#11bcb0",
  },
  menuItemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#ccc",
    marginLeft: 15,
  },
  menuItemTextActive: {
    fontFamily: "Inter_700Bold",
    color: "#11bcb0",
  },
});
