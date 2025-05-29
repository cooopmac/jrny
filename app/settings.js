import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  VStack,
} from "@gluestack-ui/themed";
import { authService } from "../../src/services/authService";
import { useState } from "react";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);

  return (
    <Center flex={1} px="$3">
      <Box w="100%" maxWidth="$80">
        <Heading mb="$6" textAlign="center">
          Settings
        </Heading>
        <VStack space="lg">
          {/* Placeholder for user email or other settings */}
          <Button
            onPress={async () => {
              setLoading(true);
              await authService.signOut();
              setLoading(false);
            }}
            isDisabled={loading}
            action="negative"
          >
            <ButtonText>{loading ? "Logging Out..." : "Log Out"}</ButtonText>
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
