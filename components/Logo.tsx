
import { Image, StyleSheet, Text, View } from "react-native";

// Permite personalizar a cor dos textos em cada tela.
type LogoProps = {
  textColor?: string;
};

//Fundo claro: texto escuro (padrão) usa <Logo />
//Fundo escuro: texto branco usa <Logo textColor="#FFFFFF" />
export default function Logo({ textColor = "#12263F" }: LogoProps) {
  return ( 
    <View style={styles.container}>

      {/* Símbolo da instituição */}
      <Image
        style={styles.logo}
        source={require("@/assets/expo.icon/Assets/logomlhr.png")}
        resizeMode="contain"
      />

      {/* Nome e slogan da instituição */}
      <View style={styles.textContainer}>
        <Text style={[styles.nome, { color: textColor }]}>
          UNINASSAU
        </Text>

        <Text style={[styles.slogan, { color: textColor }]}>
          Fazendo parte da sua história
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Organiza a imagem e os textos horizontalmente.
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Dimensões do brasão.
  logo: {
    width: 58,
    height: 78,
  },

  // Agrupa o nome e o slogan.
  textContainer: {
    marginLeft: 8,
  },

  // Nome da instituição.
  nome: {
    fontSize: 36,
    fontWeight: "bold",
  },

  // Slogan institucional.
  slogan: {
    fontSize: 18,
    marginTop: -10,
  },
});
