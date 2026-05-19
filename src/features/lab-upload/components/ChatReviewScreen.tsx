import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen, Typography } from '@/shared/components';

const messages = [
  'Hi Chioma, I have analysed your test results',
  "Your Hba1c is 15.5 and that's quite high. It means your blood sugar has been elevated over the past 2-3 months, not just recently.",
  "The good news is this is something we can work on. Let's look at the breakdown together",
];

const sections = [
  'Detailed Assessment',
  'What your test values mean',
  'What you can do now',
  "Risk Factors and what's linked",
];

export function ChatReviewScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top', 'bottom']} backgroundColor="#FFFFFF" style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>
        <Typography style={styles.headerTitle}>Chat with Chris</Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {messages.map((message) => (
          <ChatBubble key={message}>{message}</ChatBubble>
        ))}

        <View style={styles.sectionCard}>
          {sections.map((section, index) => (
            <Pressable
              key={section}
              accessibilityRole="button"
              style={[styles.sectionRow, index < sections.length - 1 && styles.sectionDivider]}
            >
              <Typography style={styles.sectionText}>{section}</Typography>
              <Ionicons name="chevron-forward" size={28} color="#1B1B1B" />
            </Pressable>
          ))}
        </View>

        <ChatBubble>
          With the changes recommended above you should feel better in a few months.
        </ChatBubble>
        <ChatBubble>
          Tell me Chioma, are you satisfied with my review. Do you have any questions or you would
          prefer a second opinion?
        </ChatBubble>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.composerRow}>
          <View style={styles.inputPill}>
            <Ionicons name="arrow-up-circle-outline" size={24} color="#767676" />
            <Typography style={styles.placeholder}>Ask Chris</Typography>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record voice"
            style={styles.iconButton}
          >
            <Ionicons name="mic-outline" size={28} color="#767676" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={styles.sendButton}
          >
            <Ionicons name="paper-plane-outline" size={28} color="#767676" />
          </Pressable>
        </View>
        <Typography style={styles.disclaimer}>
          Clinsight provides AI-powered explanations, not medical diagnoses.
        </Typography>
      </View>
    </Screen>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bubble}>
      <Typography style={styles.bubbleText}>{children}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 72,
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.18,
    lineHeight: 27,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingBottom: 174,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  bubble: {
    alignSelf: 'stretch',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleText: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: 16,
  },
  sectionDivider: {
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  sectionText: {
    color: '#1B1B1B',
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.17,
    lineHeight: 25.5,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F0F0F0',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  composerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  inputPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  placeholder: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
  },
  iconButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 32,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  disclaimer: {
    color: '#8A8A8A',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16.5,
    marginTop: 14,
    paddingBottom: 10,
    textAlign: 'center',
  },
});
