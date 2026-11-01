import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="Professorlogin" />
            <Stack.Screen name="Alunologin" />
            <Stack.Screen name="ProfessorHome"/>
        </Stack>
    )
}