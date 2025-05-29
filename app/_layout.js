import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config"; // Optional if you want to use default theme

export default function Layout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack />
    </GluestackUIProvider>
  );
}
