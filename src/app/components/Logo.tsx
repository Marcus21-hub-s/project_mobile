import { Image, StyleSheet, View } from "react-native";


export default function Logo(){

    return(
        <View>
            <Image style={styles.logo} source={require("@/assets/expo.icon/Assets/logo.png")}></Image>
        </View>
    );
}

const styles = StyleSheet.create({
    logo:{
        width: 290,
        height: 100,
        
}})