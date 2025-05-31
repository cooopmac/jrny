import {
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getAuth,
} from "@react-native-firebase/auth";

export async function signUpWithEmailPassword(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential | void> {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User account created & signed in!", userCredential.user.uid);
    return userCredential;
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("That email address is already in use!");
      // Potentially throw a custom error or return a specific indicator
      throw new Error("email-already-in-use");
    }

    if (error.code === "auth/invalid-email") {
      console.log("That email address is invalid!");
      throw new Error("invalid-email");
    }

    console.error("Error during sign up:", error);
    throw error; // Re-throw other errors
  }
}
