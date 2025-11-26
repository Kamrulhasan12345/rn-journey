import { Link } from "@react-navigation/native"
import { ColorSchemeName, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native"
import { useMemo } from "react";
import { Note } from "../notes-store";
import { getTheme } from "../theme";

export default function Card({ item, scheme: schemeProp }: { item: Note; scheme?: ColorSchemeName }) {
  const systemScheme = useColorScheme();
  const scheme = schemeProp ?? systemScheme;
  const theme = getTheme(scheme);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      marginHorizontal: 6,
      padding: 14,
      marginVertical: 8,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
    title: {
      fontWeight: "700",
      fontSize: 16,
      marginBottom: 6,
      color: theme.colors.text,
    },
    description: {
      color: theme.colors.subtext,
      marginBottom: 10,
      lineHeight: 20,
    },
    tagContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    tag: {
      backgroundColor: theme.colors.chipBg,
      color: theme.colors.subtext,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      marginRight: 6,
      marginBottom: 6,
      fontSize: 12,
    },
  }), [theme]);

  return (
    <Pressable
      style={styles.card}
      android_ripple={{ color: theme.colors.border }}
      accessibilityRole="button"
      accessibilityLabel={`Open note ${item.title}`}
    >
      <Link screen='NoteDetail' params={{id: item.id}}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
        {!!item.description && (
          <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">{item.description}</Text>
        )}
        {item.tags?.length ? (
          <View style={styles.tagContainer}>
            {item.tags.map((v, i) => (
              <Text key={i} style={styles.tag}>{v}</Text>
            ))}
          </View>
        ) : null}
      </Link>
    </Pressable>
  )
}