# **OpenJourney MVP: React Native Development Checklist**

This checklist outlines the steps to build the Minimum Viable Product (MVP) for the OpenJourney mobile app using React Native, based on the PRD version 1.0.

## **Phase 1: Project Setup & Foundation**

- [x] **1.1. Set up Development Environment:**
  - [x] Install Node.js and npm/yarn.
  - [x] Install React Native CLI or Expo CLI (decide which workflow: Expo Go for faster start, or React Native CLI for more control).
  - [x] Install an IDE (e.g., VS Code) with relevant extensions (ESLint, Prettier, React Native tools).
  - [x] Set up emulators/simulators (Android Studio for Android, Xcode for iOS) or physical devices for testing.
- [x] **1.2. Create React Native Project:**
  - [x] Initialize a new React Native project (e.g., npx react-native init OpenJourneyApp or npx create-expo-app OpenJourneyApp).
  - [x] Set up project structure (e.g., src folder with screens, components, navigation, services, assets, utils).
- [x] **1.3. Install Core Libraries:**
  - [x] Navigation: React Navigation (@react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs if needed) - Switched to expo-router.
  - [x] UI Kitten / Paper / NativeBase (Optional, for pre-built UI components, or plan for custom styling) - Using UI Kitten.
  - [x] Vector Icons (react-native-vector-icons) - Used @expo/vector-icons.
  - [ ] State Management (Optional for MVP if simple, but consider Zustand or Redux Toolkit for scalability).
- [x] **1.4. Basic App Navigation:**
  - [x] Implement a basic stack navigator (Done with expo-router).
  - [x] Define initial screens (e.g., AuthLoadingScreen, LoginScreen, SignUpScreen).
- [ ] **1.5. Core UI Components:**
  - [ ] Design and implement reusable UI components (e.g., CustomButton, CustomInput, Card, ListItem, ProgressBar, Header) - Using UI Kitten defaults for now.
  - [ ] Establish a basic theme (colors, typography) - Using UI Kitten defaults for now.

## **Phase 2: User Authentication (Supabase)**

- [ ] **2.1. Set up Supabase Project:**
  - [ ] Create a new project on the Supabase dashboard ([https://supabase.com/dashboard/](https://supabase.com/dashboard/)).
  - [ ] Obtain Project URL and anon (public) API key.
  - [ ] Configure Supabase JS SDK in your React Native project (`@supabase/supabase-js`).
- [ ] **2.2. Implement Email/Password Authentication:**
  - [ ] Create SignUpScreen UI (email, password, confirm password fields).
  - [ ] Implement sign-up logic using `supabase.auth.signUp()`.
  - [ ] Create LoginScreen UI (email, password fields).
  - [ ] Implement login logic using `supabase.auth.signInWithPassword()`.
  - [ ] Implement logout functionality using `supabase.auth.signOut()`.
  - [ ] Handle authentication state changes (e.g., redirect to dashboard on login, login screen on logout using `supabase.auth.onAuthStateChange()`).
- [ ] **2.3. Implement Social Logins (Optional for MVP, but listed in PRD):**
  - [ ] Google Sign-In:
    - [ ] Configure Google Sign-In in Supabase Authentication settings.
    - [ ] Install and configure a suitable library for React Native Google Sign-In (e.g., `@react-native-google-signin/google-signin` and handle token exchange or use Supabase's provider method).
    - [ ] Add Google Sign-In button and logic.
  - [ ] Apple Sign-In (iOS only):
    - [ ] Configure Apple Sign-In in Supabase Authentication settings.
    - [ ] Install and configure a suitable library for React Native Apple Sign-In (e.g., `@invertase/react-native-apple-authentication` and handle token exchange or use Supabase's provider method).
    - [ ] Add Apple Sign-In button and logic.
- [ ] **2.4. Password Reset Functionality:**
  - [ ] UI for "Forgot Password" (email input).
  - [ ] Logic to send password reset email using `supabase.auth.resetPasswordForEmail()`.
- [ ] **2.5. Authentication Flow & Protected Routes:**
  - [ ] Implement logic to show auth screens if not logged in, and main app screens if logged in.
  - [ ] Create an AuthLoading/Splash screen to check auth state on app start.

## **Phase 3: Backend (Supabase Database & Edge Functions) & AI Integration**

- [ ] **3.1. Set up Supabase Database:**
  - [ ] Define database tables (e.g., for users, journeys, steps).
  - [ ] Define Row Level Security (RLS) policies for your tables (start with authenticated users can read/write their own data).
  - [ ] Plan data structure for users, journeys, and steps (e.g., `users` table, `journeys` table with `user_id` foreign key, `steps` table with `journey_id` foreign key).
- [ ] **3.2. Set up Supabase Edge Functions (for AI API calls):**
  - [ ] Initialize Supabase Edge Functions in your project (e.g., using Supabase CLI `supabase functions new <function_name>`). Choose TypeScript or Deno.
  - [ ] Write a Supabase Edge Function (HTTP callable) that:
    - [ ] Takes a user's journey description as input.
    - [ ] Makes a secure call to the Gemini API (or chosen LLM API).
    - [ ] **Prompt Engineering:** Craft a good prompt to instruct the AI to return a list of actionable steps in a structured format (e.g., JSON array of strings or objects).
    - [ ] Parses the AI's response.
    - [ ] Returns the structured steps to the app.
  - [ ] Deploy the function (`supabase functions deploy <function_name>`).
  - [ ] Secure the function (e.g., ensure only authenticated users can call it by checking JWT in the function).
- [ ] **3.3. API Key Management:**
  - [ ] Securely store your AI API key (e.g., using Supabase Edge Functions environment variables, do NOT hardcode in the app or function).
- [ ] **3.4. Error Handling for AI Integration:**
  - [ ] Handle API errors, rate limits, and invalid responses from the AI service within the Edge Function and app.
  - [ ] Provide appropriate feedback to the user (e.g., "Could not generate steps, please try again").

## **Phase 4: Journey Management - Core Loop**

- [ ] **4.1. Create Journey Screen (AddJourneyScreen):**
  - [ ] UI with an input field for the journey title/description.
  - [ ] "Generate Steps" button.
  - [ ] On button press, call the Supabase Edge Function to get AI-generated steps.
  - [ ] Display a loading indicator while AI is processing.
- [ ] **4.2. Display AI-Generated Steps:**
  - [ ] Once steps are received, display them to the user (perhaps in a review/editable list format).
  - [ ] Logic to save the new journey and its AI-generated steps to Supabase tables under the current user's data.
  - [ ] Navigate to the JourneyDetailScreen for the newly created journey or back to Dashboard.
- [ ] **4.3. Dashboard Screen (DashboardScreen):**
  - [ ] Fetch and display a list of the user's active journeys from Supabase tables.
  - [ ] Each item should show journey title and overall progress (e.g., "2/5 steps completed").
  - [ ] Allow navigation to the JourneyDetailScreen for each journey.
  - [ ] "Add New Journey" button/FAB.
  - [ ] (Optional for MVP) Tabs or filters for "Active" and "Completed" journeys.
- [ ] **4.4. Journey Detail Screen (JourneyDetailScreen):**
  - [ ] Display journey title.
  - [ ] Fetch and display the list of steps for the selected journey from Supabase tables.
  - [ ] Each step should have a checkbox or similar UI to mark as complete/incomplete.
  - [ ] Update step completion status in Supabase tables when a checkbox is toggled.
  - [ ] Update overall journey progress display dynamically.
- [ ] **4.5. Manual Step Management:**
  - [ ] Ability to manually add a new step to a journey.
  - [ ] Ability to edit an existing step's text.
  - [ ] Ability to delete a step.
  - [ ] (Optional for MVP) Ability to reorder steps.
- [ ] **4.6. Mark Journey as Complete:**
  - [ ] Button or option in JourneyDetailScreen to mark the entire journey as complete.
  - [ ] Update journey status in Supabase tables (e.g., add a `completed_at` timestamp or a `status: 'completed'` field).
  - [ ] Visually differentiate completed journeys on the Dashboard.
- [ ] **4.7. Real-time Updates (Optional but Recommended):**
  - [ ] Use Supabase Realtime subscriptions to update UI automatically when data changes (e.g., journey progress, new steps).

## **Phase 5: Basic App Functionality**

- [ ] **5.1. Settings Screen (SettingsScreen):**
  - [ ] Basic account management:
    - [ ] Display user email.
    - [ ] Logout button.
    - [ ] (Optional for MVP) "Delete Account" option (ensure proper data deletion in Supabase tables and Auth).
  - [ ] Notification Preferences (placeholder for MVP, actual implementation in a later phase if complex).
    - [ ] Simple toggle: "Enable/Disable Reminders" (if implementing basic reminders).
- [ ] **5.2. Basic Notifications (Optional for MVP, as per PRD):**
  - [ ] If implementing, use a library like react-native-push-notification or Expo's notification API.
  - [ ] Logic for simple, non-intrusive reminders (e.g., a daily local notification if there are active journeys). This can be very basic for MVP.

## **Phase 6: UI/UX Refinement & Testing**

- [ ] **6.1. Styling and Visual Polish:**
  - [ ] Ensure consistent styling across all screens.
  - [ ] Use a clean, intuitive, and mobile-first design.
  - [ ] Add icons where appropriate.
  - [ ] Implement loading states and empty states gracefully.
- [ ] **6.2. Error Handling:**
  - [ ] Implement user-friendly error messages for network issues, Supabase errors, etc.
  - [ ] Validate user inputs.
- [ ] **6.3. Testing:**
  - [ ] Manual testing of all user flows on both iOS and Android (emulators and physical devices).
  - [ ] Test edge cases (e.g., no journeys, very long journey names, AI failing to return steps).
  - [ ] (Optional for MVP) Basic unit tests for critical functions (e.g., utility functions, state management logic if used).

## **Phase 7: Deployment Preparation (Basic)**

- [ ] **7.1. App Icons and Splash Screens:**
  - [ ] Create and add app icons for different resolutions (iOS and Android).
  - [ ] Create and configure splash screens.
- [ ] **7.2. Build Configurations:**
  - [ ] Configure release builds for Android (signing).
  - [ ] Configure release builds for iOS (certificates, provisioning profiles).
- [ ] **7.3. Review App Store Guidelines:**
  - [ ] Familiarize yourself with Apple App Store and Google Play Store submission guidelines.

This checklist provides a detailed path for your MVP. Remember to break these down further into smaller tasks as you go. Good luck with the development of OpenJourney!
