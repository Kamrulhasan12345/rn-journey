import MasonryList from "@react-native-seoul/masonry-list";
import Card from "../ui/card";
import { useCallback } from "react";
import { useNotes } from "../hooks/useNotes";
import { getRecentRequests } from "../api/client";
import { getAccessTokenFromMemory, getSession } from "../auth/session";
import { useColorScheme, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { getTheme } from "../theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Link } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

export default function NotesList() {
  const { session, logoutMutation } = useAuth();
  const hasToken = !!session?.accessToken;
  const { data: notes = [], isLoading, isError, error, refetch, isFetching } = useNotes({ enabled: hasToken });
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  // TODO: remove MMKV storage subscription and notes-store when API is fully adopted

  const renderItem = useCallback(({ item }: { item: any; }) => {
    return <Card item={item} scheme={scheme} />;
  }, [scheme]);

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).topBar}>
        <Text style={styles(theme).topBarTitle}>My Notes</Text>
        <Pressable
          onPress={() => logoutMutation.mutate()}
          style={styles(theme).logoutButton}
          disabled={logoutMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.primary} />
          <Text style={styles(theme).logoutText}>
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles(theme).loadingWrap}>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View style={styles(theme).errorWrap}>
          <Text style={styles(theme).errorTitle}>Failed to load notes.</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles(theme).retryText}>Retry</Text>
          </Pressable>
          <Text style={styles(theme).errorDetailsLabel}>Details:</Text>
          <Text style={styles(theme).errorDetails}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
          {/** Full response JSON (status + data) */}
          {!!(error as any)?.data && (
            <View style={styles(theme).jsonWrap}>
              <Text style={styles(theme).jsonTitle}>Response JSON:</Text>
              <Text style={styles(theme).jsonBlock}>
                {JSON.stringify({ status: (error as any)?.status ?? null, data: (error as any)?.data }, null, 2)}
              </Text>
            </View>
          )}
          {/* Request debug list */}
          <Text style={styles(theme).jsonTitle}>Recent Requests:</Text>
          {getRecentRequests().map((r, i) => (
            <Text key={i} style={styles(theme).jsonBlock}>
              {JSON.stringify({
                t: new Date(r.ts).toISOString(),
                m: r.method,
                u: r.url,
                hasAuth: !!(r.headers && (r.headers as any).Authorization),
              })}
            </Text>
          ))}
        </View>
      ) : (
        <MasonryList
          data={notes as any}
          keyExtractor={(item) => `${item.id}-${scheme || 'light'}`}
          numColumns={2}
          renderItem={renderItem}
          style={styles(theme).list}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.xl + 56,
          }}
          ListEmptyComponent={EmptyState}
          refreshing={isFetching}
          onRefresh={() => refetch()}
        />
      )}

      {/* Debug: auth/token state */}
      {!isLoading && (
        <View style={styles(theme).debugFooter}>
          <Text style={styles(theme).debugText}>Auth: {hasToken ? "token-present" : "missing-token"}</Text>
          <Text style={styles(theme).debugText}>MemToken: {getAccessTokenFromMemory() ? 'set' : 'unset'}</Text>
          <Text style={styles(theme).debugText}>SessTokenLen: {getSession().accessToken ? getSession().accessToken!.length : 0}</Text>
        </View>
      )}

      <Pressable
        style={styles(theme).fab}
        accessibilityRole="button"
        accessibilityLabel="Add note"
      >
        <Link screen='CreateNote' params={{}}>
          <Ionicons name="add" size={28} color="#fff" />
        </Link>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  return (
    <View style={styles(theme).emptyWrap}>
      <Text style={styles(theme).emptyTitle}>No notes yet</Text>
      <Text style={styles(theme).emptySub}>Create your first note to get started.</Text>
      <Pressable
        style={styles(theme).cta}
        accessibilityRole="button"
        accessibilityLabel="Create note"
      >
        <Link screen='CreateNote' params={{}}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles(theme).ctaText}>Create Note</Text>
        </Link>
      </Pressable>
    </View>
  );
}

const styles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { flex: 1 },
    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl * 2,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    emptySub: {
      color: theme.colors.subtext,
      marginBottom: theme.spacing.sm,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    topBarTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.elevated,
    },
    logoutText: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.radius.pill,
    },
    ctaText: { color: "#fff", fontWeight: "600" },
    errorWrap: { padding: 20 },
    errorTitle: { color: theme.colors.text, marginBottom: 8 },
    retryText: { color: theme.colors.primary, marginBottom: 12 },
    errorDetailsLabel: { color: theme.colors.subtext, fontSize: 12 },
    errorDetails: { color: theme.colors.subtext, fontSize: 12 },
    jsonWrap: { marginTop: 8, backgroundColor: theme.colors.elevated, borderRadius: 8, padding: 10 },
    jsonTitle: { color: theme.colors.subtext, fontSize: 12, marginBottom: 6 },
    jsonBlock: { color: theme.colors.subtext, fontSize: 12 },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    debugFooter: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
    debugText: { color: theme.colors.subtext, fontSize: 12 },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
  });