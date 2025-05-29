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
} from "@gluestack-ui/themed";
import { authService } from "../../src/services/authService";
import { router } from "expo-router";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Center flex={1} px="$3">
      <Box w="100%" maxWidth="$80">
        <Heading mb="$6" textAlign="center">
          Create Account
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
          </FormControl>
          <FormControl>
            <FormControl.Label>
              <Text>Confirm Password</Text>
            </FormControl.Label>
            <Input>
              <InputField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry
              />
            </Input>
          </FormControl>
          <Button
            onPress={async () => {
              setLoading(true);
              await authService.signUp(email, password, confirmPassword);
              setLoading(false);
            }}
            mt="$4"
            isDisabled={loading}
          >
            <ButtonText>{loading ? "Signing Up..." : "Sign Up"}</ButtonText>
          </Button>
        </VStack>
        <Box mt="$6" flexDirection="row" justifyContent="center">
          <Text size="sm">Already have an account? </Text>
          <Button variant="link" onPress={() => router.push("/login")}>
            <ButtonText>Log In</ButtonText>
          </Button>
        </Box>
      </Box>
    </Center>
  );
}
