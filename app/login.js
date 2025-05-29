import { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  Input,
  Button,
  Text,
  Center,
  InputField,
  ButtonText,
  Link,
  LinkText,
} from "@gluestack-ui/themed";
import { authService } from "../../src/services/authService"; // Updated import
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Center flex={1} px="$3">
      <Box w="100%" maxWidth="$80">
        <Heading mb="$6" textAlign="center">
          Welcome Back!
        </Heading>
        <VStack space="md">
          <FormControl>
            <FormControl.Label>
              <Text>Email</Text>
            </FormControl.Label>
            <Input>
              <InputField
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
          </FormControl>
          <FormControl>
            <FormControl.Label>
              <Text>Password</Text>
            </FormControl.Label>
            <Input>
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
              />
            </Input>
            <Link href="/forgot-password" mt="$2" alignSelf="flex-end">
              <LinkText size="sm">Forgot Password?</LinkText>
            </Link>
          </FormControl>
          <Button
            onPress={async () => {
              setLoading(true);
              await authService.signIn(email, password);
              setLoading(false);
            }}
            mt="$4"
            isDisabled={loading}
          >
            <ButtonText>{loading ? "Logging In..." : "Log In"}</ButtonText>
          </Button>
        </VStack>
        <Box mt="$6" flexDirection="row" justifyContent="center">
          <Text size="sm">Don't have an account? </Text>
          <Button variant="link" onPress={() => router.push("/sign-up")}>
            <ButtonText>Sign Up</ButtonText>
          </Button>
        </Box>
      </Box>
    </Center>
  );
}
