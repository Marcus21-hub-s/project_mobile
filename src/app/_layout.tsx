import { Stack } from "expo-router";
import { SessaoProvider } from "../../api/authContext";

export default function RootLayout() {
    return (
        <SessaoProvider>
            <Stack screenOptions={
                {
                    headerShown: false
                }
            }>
                <Stack.Screen name="index"/>
                <Stack.Screen name="/pages/ProfessorHome"/>
                <Stack.Screen name="/pages/ProfessorRequests" />
            </Stack>
        </SessaoProvider>
    )
}