import { ReactNode, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu, History, Settings, LogOut } from "lucide-react-native";
import logo from "../../assets/Gigo.png";

const DARK_GREEN = "#1B6045";
const HEADER_HEIGHT = 40;

type Props = { title?: ReactNode; showMenu?: boolean };

export default function AppHeader({ title, showMenu = true }: Props) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const iconRef = useRef<View>(null);

  const openMenu = () => {
    iconRef.current?.measureInWindow((_x, y, _w, h) => {
      setMenuTop(y + h + 4);
      setMenuOpen(true);
    });
  };

  const menuItems = [
    {
      label: "History",
      Icon: History,
      onPress: () => navigation.navigate("History"), // adjust to your route name
    },
    {
      label: "Settings",
      Icon: Settings,
      onPress: () => {
        // TODO: navigate to settings
      },
    },
    {
      label: "Log out",
      Icon: LogOut,
      onPress: () =>
        navigation.reset({ index: 0, routes: [{ name: "Login" }] }), // adjust to your login route name
    },
  ];

  return (
    <>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.left}>
          {title ?? (
            <Image source={logo} style={styles.topLogo} resizeMode="contain" />
          )}
        </View>
        {showMenu && (
          <TouchableOpacity
            onPress={openMenu}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View ref={iconRef} collapsable={false}>
              <Menu size={25} color={DARK_GREEN} strokeWidth={1.5} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={menuOpen}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: menuTop }]}>
            {menuItems.map(({ label, Icon, onPress }) => (
              <TouchableOpacity
                key={label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  onPress();
                }}
              >
                <Icon size={18} color="#111827" />
                <Text style={styles.menuText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  left: { flex: 1, height: HEADER_HEIGHT, justifyContent: "center" },
  topLogo: { width: 90, height: HEADER_HEIGHT },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },
  menu: {
    position: "absolute",
    right: 24,
    minWidth: 170,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuText: { fontSize: 15, fontWeight: "600", color: "#111827" },
});
