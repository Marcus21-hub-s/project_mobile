
import {
  StyleSheet,
  Text,
  View
} from "react-native";

import { COR } from "../data/cores";

type HeaderProps = {
  title: string;
  date: string;
};

export default function Header({ title, date }: HeaderProps) {
  return (
    <View style={styles.header}>

      <View style={styles.headerInfo}>
        <Text style={styles.date}>{date}</Text>

        <Text style={styles.title}>Olá, {title}</Text>
      </View>

      

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: COR.header,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    elevation: 4,
  },

  headerInfo: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
  },

  date: {
    fontSize: 12,
    color: "#B8C5DF",
    fontWeight: "400",
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
