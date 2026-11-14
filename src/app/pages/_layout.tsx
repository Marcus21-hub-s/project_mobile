
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function PagesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#e9c020ff",
        tabBarInactiveTintColor: "#9f9696ff",
        

        tabBarStyle: {
          backgroundColor: "#ffffffff",
          borderTopColor: "#ffffffff",
          height: 55,
          paddingBottom: 6,
          paddingTop: 6,
          
        },
      }}
    >
      <Tabs.Screen
        name="ProfessorHome"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              color={color as string}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfessorRequests"
        options={{
          title: "Solicitações",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="clipboard-outline"
              color={color as string}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
