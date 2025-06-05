import Ionicons from "@expo/vector-icons/Ionicons";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { Card, Layout } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useJourneys } from "../../hooks/useJourneys";
import { useLoginStreak } from "../../hooks/useLoginStreak";
import { Journey } from "../../types";
import { formatFirestoreDate } from "../../utils/dateUtils";

export default function YouScreen() {
  const router = useRouter();
  const [user, setUser] = useState(getAuth().currentUser);
  const { journeys, loading: journeysLoading } = useJourneys();
  const { loginStreak } = useLoginStreak();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await signOut(getAuth());
            console.log("User signed out successfully");
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Calculate stats
  const activeJourneys = journeys.filter((j) => j.status === "Active");
  const completedJourneys = journeys.filter((j) => j.status === "Completed");
  const plannedJourneys = journeys.filter((j) => j.status === "Planned");

  // Calculate total progress (average of all journeys)
  const totalProgress =
    journeys.length > 0
      ? Math.round(
          journeys.reduce((sum, j) => sum + (j.progress || 0), 0) /
            journeys.length
        )
      : 0;

  // Get account creation date (approximation from oldest journey or current date)
  const oldestJourney = journeys.reduce((oldest: Journey | null, current) => {
    if (!oldest) return current;
    if (current.createdAt && oldest.createdAt) {
      return current.createdAt < oldest.createdAt ? current : oldest;
    }
    return oldest;
  }, null);

  const accountAge = oldestJourney?.createdAt
    ? formatFirestoreDate(oldestJourney.createdAt)
    : "recently";

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    danger = false,
    showBorder = true,
    centered = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    danger?: boolean;
    showBorder?: boolean;
    centered?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingsItem,
        !showBorder && styles.settingsItemNoBorder,
        centered && styles.settingsItemCentered,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {centered ? (
        <View style={styles.settingsItemCenteredContent}>
          <Ionicons
            name={icon as any}
            size={22}
            color={danger ? "#FF3B30" : "#333333"}
          />
          <Text
            style={[
              styles.settingsTitle,
              styles.settingsTitleCentered,
              danger && styles.dangerText,
            ]}
          >
            {title}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.settingsItemLeft}>
            <Ionicons
              name={icon as any}
              size={22}
              color={danger ? "#FF3B30" : "#333333"}
            />
            <View style={styles.settingsTextContainer}>
              <Text style={[styles.settingsTitle, danger && styles.dangerText]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.settingsSubtitle}>{subtitle}</Text>
              )}
            </View>
          </View>
          {showArrow && (
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#999999"
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <Layout style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>your profile.</Text>
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-outline" size={32} color="#333333" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.displayName || user?.email?.split("@")[0] || "user"}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.memberSince}>member since {accountAge}</Text>
            </View>
          </View>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{loginStreak}</Text>
            <Text style={styles.statLabel}>day streak</Text>
            <Ionicons name="flame-outline" size={20} color="#FFC107" />
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{journeys.length}</Text>
            <Text style={styles.statLabel}>total journeys</Text>
            <Ionicons name="map-outline" size={20} color="#333333" />
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{totalProgress}%</Text>
            <Text style={styles.statLabel}>avg progress</Text>
            <Ionicons name="trending-up-outline" size={20} color="#007AFF" />
          </Card>
        </View>

        {/* Journey Breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={styles.cardTitle}>journey breakdown.</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View style={[styles.statusDot, styles.activeDot]} />
              <Text style={styles.breakdownLabel}>active</Text>
              <Text style={styles.breakdownNumber}>
                {activeJourneys.length}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.statusDot, styles.plannedDot]} />
              <Text style={styles.breakdownLabel}>planned</Text>
              <Text style={styles.breakdownNumber}>
                {plannedJourneys.length}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.statusDot, styles.completedDot]} />
              <Text style={styles.breakdownLabel}>completed</Text>
              <Text style={styles.breakdownNumber}>
                {completedJourneys.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.cardTitle}>settings.</Text>

          <SettingsItem
            icon="create-outline"
            title="edit profile"
            subtitle="update your name and email"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Profile editing will be available soon!"
              );
            }}
          />

          <SettingsItem
            icon="notifications-outline"
            title="notifications"
            subtitle="manage your reminders"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Notification settings will be available soon!"
              );
            }}
          />

          <SettingsItem
            icon="download-outline"
            title="export data"
            subtitle="download your journey data"
            onPress={() => {
              Alert.alert("Coming Soon", "Data export will be available soon!");
            }}
          />

          <SettingsItem
            icon="help-circle-outline"
            title="help & support"
            subtitle="get help using the app"
            onPress={() => {
              Alert.alert("Coming Soon", "Help center will be available soon!");
            }}
          />

          <SettingsItem
            icon="information-circle-outline"
            title="about"
            subtitle="app version and info"
            onPress={() => {
              Alert.alert(
                "jrny.",
                "Version 1.0.0\nBuilt with love for your journey."
              );
            }}
          />
        </Card>

        {/* Sign Out */}
        <Card style={styles.signOutCard}>
          <SettingsItem
            icon="log-out-outline"
            title="sign out"
            onPress={handleSignOut}
            showArrow={false}
            danger={true}
            showBorder={false}
            centered={true}
          />
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f4",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 10,
    backgroundColor: "#f7f9fc",
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: "Gabarito-ExtraBold",
    color: "#000000",
  },

  // User Info
  userCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Gabarito-Regular",
    color: "#666666",
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: "Gabarito-Regular",
    color: "#999999",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Gabarito-Regular",
    color: "#666666",
    marginBottom: 8,
  },

  // Breakdown
  breakdownCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
  },
  activeDot: {
    backgroundColor: "#34C759",
  },
  plannedDot: {
    backgroundColor: "#FF9500",
  },
  completedDot: {
    backgroundColor: "#007AFF",
  },
  breakdownLabel: {
    fontSize: 12,
    fontFamily: "Gabarito-Regular",
    color: "#666666",
    marginBottom: 4,
  },
  breakdownNumber: {
    fontSize: 20,
    fontFamily: "Gabarito-Bold",
    color: "#333333",
  },

  // Settings
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
    borderRadius: 8,
    marginVertical: 2,
  },
  settingsItemNoBorder: {
    borderBottomWidth: 0,
  },
  settingsItemCentered: {
    justifyContent: "center",
    paddingVertical: 10,
  },
  settingsItemCenteredContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsTitleCentered: {
    marginLeft: 8,
    textAlign: "center",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: "Gabarito-Regular",
    color: "#333333",
  },
  settingsSubtitle: {
    fontSize: 12,
    fontFamily: "Gabarito-Regular",
    color: "#999999",
    marginTop: 2,
  },
  dangerText: {
    color: "#FF3B30",
  },

  // Sign Out
  signOutCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    borderWidth: 1,
    shadowColor: "#FF3B30",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Bottom spacing
  bottomSpacing: {
    height: 40,
  },
});
