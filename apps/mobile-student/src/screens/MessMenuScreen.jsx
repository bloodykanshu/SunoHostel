/**
 * MessMenuScreen.jsx — React Native (Expo)
 * Daily Mess Menu Display with simple Thumbs Up 👍 / Thumbs Down 👎 Meal Quality Feedback Voting.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Utensils, ThumbsUp, ThumbsDown, CheckCircle, Clock } from 'lucide-react-native';

const MOCK_MESS_MENU = [
  {
    type: 'BREAKFAST',
    time: '07:30 AM - 09:30 AM',
    items: ['Puri Bhaji', 'Boiled Eggs / Banana', 'Hot Tea & Coffee', 'Bread Butter Jam'],
    userVote: null, // 'LIKE' | 'DISLIKE' | null
    likesCount: 142,
    dislikesCount: 18,
  },
  {
    type: 'LUNCH',
    time: '12:30 PM - 02:30 PM',
    items: ['Paneer Butter Masala', 'Dal Tadka', 'Jeera Rice', 'Butter Tandoori Roti', 'Green Salad'],
    userVote: 'LIKE',
    likesCount: 289,
    dislikesCount: 24,
  },
  {
    type: 'SNACKS',
    time: '05:00 PM - 06:00 PM',
    items: ['Crispy Samosa (2 pcs)', 'Mint & Tamarind Chutney', 'Special Ginger Tea'],
    userVote: null,
    likesCount: 195,
    dislikesCount: 12,
  },
  {
    type: 'DINNER',
    time: '07:30 PM - 09:30 PM',
    items: ['Mix Veg Korma', 'South Indian Rasam', 'Steamed Rice', 'Chapati', 'Gulab Jamun (1 pc)'],
    userVote: null,
    likesCount: 210,
    dislikesCount: 31,
  },
];

export default function MessMenuScreen() {
  const [meals, setMeals] = useState(MOCK_MESS_MENU);

  const handleVote = (mealType, isLike) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.type === mealType) {
          const voteType = isLike ? 'LIKE' : 'DISLIKE';
          const alreadyVoted = m.userVote === voteType;

          return {
            ...m,
            userVote: alreadyVoted ? null : voteType,
            likesCount: isLike ? (alreadyVoted ? m.likesCount - 1 : m.likesCount + 1) : m.likesCount,
            dislikesCount: !isLike ? (alreadyVoted ? m.dislikesCount - 1 : m.dislikesCount + 1) : m.dislikesCount,
          };
        }
        return m;
      })
    );

    Alert.alert(
      'Vote Recorded! 🍽️',
      `Thank you for giving ${isLike ? 'Thumbs Up 👍' : 'Thumbs Down 👎'} feedback for ${mealType}.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Utensils color="#4F46E5" size={28} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Daily Mess Menu & Voting</Text>
            <Text style={styles.headerSubtitle}>Today's meals • Rate quality to help mess committee</Text>
          </View>
        </View>

        {/* Meal Cards */}
        {meals.map((meal) => (
          <View key={meal.type} style={styles.card}>
            <View style={styles.cardHeader}>
              <div>
                <Text style={styles.mealTypeTitle}>{meal.type}</Text>
                <View style={styles.timeRow}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.timeText}>{meal.time}</Text>
                </View>
              </div>
            </View>

            {/* Menu Items List */}
            <View style={styles.itemsContainer}>
              {meal.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Thumbs Up / Down Voting Bar */}
            <View style={styles.votingBar}>
              <Text style={styles.voteLabel}>Meal Quality Feedback:</Text>

              <View style={styles.voteButtonsRow}>
                {/* Thumbs Up */}
                <TouchableOpacity
                  style={[styles.voteButton, meal.userVote === 'LIKE' && styles.voteButtonLiked]}
                  onPress={() => handleVote(meal.type, true)}
                >
                  <ThumbsUp size={16} color={meal.userVote === 'LIKE' ? '#FFF' : '#10B981'} />
                  <Text style={[styles.voteCount, meal.userVote === 'LIKE' && styles.voteCountActive]}>
                    {meal.likesCount}
                  </Text>
                </TouchableOpacity>

                {/* Thumbs Down */}
                <TouchableOpacity
                  style={[styles.voteButton, meal.userVote === 'DISLIKE' && styles.voteButtonDisliked]}
                  onPress={() => handleVote(meal.type, false)}
                >
                  <ThumbsDown size={16} color={meal.userVote === 'DISLIKE' ? '#FFF' : '#EF4444'} />
                  <Text style={[styles.voteCount, meal.userVote === 'DISLIKE' && styles.voteCountActive]}>
                    {meal.dislikesCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mealTypeTitle: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timeText: { fontSize: 12, color: '#64748B' },
  itemsContainer: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginBottom: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4F46E5', marginRight: 8 },
  itemText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  votingBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  voteLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  voteButtonsRow: { flexDirection: 'row', gap: 10 },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
  },
  voteButtonLiked: { backgroundColor: '#10B981', borderColor: '#10B981' },
  voteButtonDisliked: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  voteCount: { fontSize: 13, fontWeight: '700', color: '#334155' },
  voteCountActive: { color: '#FFF' },
});
