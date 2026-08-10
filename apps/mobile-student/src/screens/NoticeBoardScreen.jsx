/**
 * NoticeBoardScreen.jsx — React Native (Expo)
 * Digital Notice Board Screen displaying warden broadcasts, maintenance alerts, & hostel announcements.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Megaphone, Pin, Calendar, AlertCircle, Info, Utensils } from 'lucide-react-native';

const INITIAL_NOTICES = [
  {
    id: 'not-1',
    title: 'Water Supply Maintenance Schedule',
    content: 'Tanks cleaning scheduled for Block-A & Block-B on Saturday between 10:00 AM and 02:00 PM. Please store water in advance.',
    category: 'MAINTENANCE',
    isPinned: true,
    author: 'Warden Office',
    date: '10 Aug 2026',
  },
  {
    id: 'not-2',
    title: 'Independence Day Hostel Mess Special Dinner',
    content: 'Special dinner menu including Paneer Butter Masala, Gulab Jamun, and Pulao served from 7:30 PM on 15th August.',
    category: 'MESS',
    isPinned: true,
    author: 'Mess Committee',
    date: '09 Aug 2026',
  },
  {
    id: 'not-3',
    title: 'Strict Security Rules for Late Night Entry',
    content: 'All students must scan their hostel biometric ID before 10:00 PM. Late entry after 10:30 PM requires warden permission.',
    category: 'URGENT',
    isPinned: false,
    author: 'Chief Security Warden',
    date: '07 Aug 2026',
  },
];

export default function NoticeBoardScreen() {
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredNotices = notices.filter((n) => filterCategory === 'ALL' || n.category === filterCategory);

  const getCategoryBadgeStyle = (cat) => {
    switch (cat) {
      case 'URGENT': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'MAINTENANCE': return { bg: '#FEF3C7', text: '#D97706' };
      case 'MESS': return { bg: '#E0E7FF', text: '#4F46E5' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Megaphone color="#4F46E5" size={28} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Hostel Notice Board</Text>
            <Text style={styles.headerSubtitle}>Official announcements & maintenance alerts</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['ALL', 'URGENT', 'MAINTENANCE', 'MESS'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, filterCategory === cat && styles.filterPillActive]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notices Stream */}
        {filteredNotices.map((item) => {
          const badge = getCategoryBadgeStyle(item.category);
          return (
            <View key={item.id} style={[styles.card, item.isPinned && styles.pinnedCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{item.category}</Text>
                </View>
                {item.isPinned && (
                  <View style={styles.pinnedTag}>
                    <Pin size={12} color="#D97706" />
                    <Text style={styles.pinnedText}>Pinned Notice</Text>
                  </View>
                )}
              </View>

              <Text style={styles.noticeTitle}>{item.title}</Text>
              <Text style={styles.noticeContent}>{item.content}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.authorText}>Issued by: {item.author}</Text>
                <View style={styles.dateRow}>
                  <Calendar size={12} color="#94A3B8" />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
              </View>
            </View>
          );
        })}

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
  filterRow: { marginBottom: 16 },
  filterPill: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  filterPillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterTextActive: { color: '#FFF' },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  pinnedCard: { borderColor: '#FCD34D', backgroundColor: '#FFFDF5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  pinnedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  pinnedText: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  noticeTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  noticeContent: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  authorText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11, color: '#94A3B8' },
});
