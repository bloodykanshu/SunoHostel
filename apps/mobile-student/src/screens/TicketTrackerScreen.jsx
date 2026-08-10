/**
 * TicketTrackerScreen.jsx — React Native (Expo)
 * Live Complaint Tracker with Visual Progress Bar Timeline (Pending -> In Progress -> Resolved -> Closed)
 * and 1-5 Star Feedback Rating Form for resolved tickets.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  Star,
  Phone,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
} from 'lucide-react-native';

const MOCK_MY_TICKETS = [
  {
    id: 'SH-2026-1042',
    title: 'Water tap leaking continuously in washbasin',
    category: 'PLUMBING',
    urgency: 'NORMAL',
    status: 'IN_PROGRESS', // PENDING | IN_PROGRESS | RESOLVED | CLOSED
    createdAt: '10 Aug, 09:30 AM',
    roomNumber: '304',
    hostelBlock: 'Block-A',
    assignedStaff: {
      name: 'Ramesh Kumar (Plumber)',
      phone: '+91 99887 76655',
    },
    resolutionProof: null,
  },
  {
    id: 'SH-2026-1038',
    title: 'Wi-Fi connectivity dropped on 3rd floor',
    category: 'WIFI',
    urgency: 'URGENT',
    status: 'RESOLVED',
    createdAt: '08 Aug, 04:15 PM',
    roomNumber: '304',
    hostelBlock: 'Block-A',
    assignedStaff: {
      name: 'Amit Tech (IT Dept)',
      phone: '+91 98123 45678',
    },
    resolutionProof: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    resolutionNotes: 'Router restarted and fiber cable re-spliced on 3rd floor rack.',
    feedbackGiven: false,
  },
];

export default function TicketTrackerScreen() {
  const [tickets, setTickets] = useState(MOCK_MY_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(MOCK_MY_TICKETS[0]);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const submitFeedback = (ticketId) => {
    Alert.alert(
      'Feedback Submitted! ⭐',
      `Thank you for rating your service ${rating} stars! Your feedback helps us improve hostel maintenance.`
    );
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'CLOSED', feedbackGiven: true } : t))
    );
    setFeedbackComment('');
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLVED': return 3;
      case 'CLOSED': return 4;
      default: return 1;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Screen Header */}
        <Text style={styles.headerTitle}>Live Ticket Tracker</Text>
        <Text style={styles.headerSubtitle}>Monitor resolution progress & rate completed services</Text>

        {/* Ticket Selector Horizontal Stream */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ticketSelectorRow}>
          {tickets.map((t) => {
            const isSelected = selectedTicket?.id === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.ticketTab, isSelected && styles.ticketTabActive]}
                onPress={() => setSelectedTicket(t)}
              >
                <Text style={[styles.ticketTabId, isSelected && styles.ticketTabIdActive]}>{t.id}</Text>
                <Text style={[styles.ticketTabStatus, isSelected && styles.ticketTabStatusActive]}>{t.status}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Ticket Card */}
        {selectedTicket && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.ticketIdText}>{selectedTicket.id}</Text>
              <Text style={styles.categoryBadge}>{selectedTicket.category}</Text>
            </View>

            <Text style={styles.ticketTitle}>{selectedTicket.title}</Text>
            <Text style={styles.ticketMeta}>Reported on {selectedTicket.createdAt} • Room {selectedTicket.roomNumber}</Text>

            {/* VISUAL PROGRESS BAR TIMELINE */}
            <View style={styles.timelineContainer}>
              <Text style={styles.timelineTitle}>Resolution Lifecycle</Text>

              <View style={styles.progressBarWrapper}>
                {/* Step 1: Pending */}
                <View style={styles.timelineStep}>
                  <View style={[styles.stepIconCircle, getStatusStep(selectedTicket.status) >= 1 && styles.stepCompleted]}>
                    <Clock size={16} color={getStatusStep(selectedTicket.status) >= 1 ? '#FFF' : '#94A3B8'} />
                  </View>
                  <Text style={styles.stepLabel}>Pending</Text>
                </View>

                <View style={[styles.connectorLine, getStatusStep(selectedTicket.status) >= 2 && styles.lineActive]} />

                {/* Step 2: In Progress */}
                <View style={styles.timelineStep}>
                  <View style={[styles.stepIconCircle, getStatusStep(selectedTicket.status) >= 2 && styles.stepCompleted]}>
                    <RefreshCw size={16} color={getStatusStep(selectedTicket.status) >= 2 ? '#FFF' : '#94A3B8'} />
                  </View>
                  <Text style={styles.stepLabel}>In Progress</Text>
                </View>

                <View style={[styles.connectorLine, getStatusStep(selectedTicket.status) >= 3 && styles.lineActive]} />

                {/* Step 3: Resolved */}
                <View style={styles.timelineStep}>
                  <View style={[styles.stepIconCircle, getStatusStep(selectedTicket.status) >= 3 && styles.stepCompleted]}>
                    <CheckCircle2 size={16} color={getStatusStep(selectedTicket.status) >= 3 ? '#FFF' : '#94A3B8'} />
                  </View>
                  <Text style={styles.stepLabel}>Resolved</Text>
                </View>

                <View style={[styles.connectorLine, getStatusStep(selectedTicket.status) >= 4 && styles.lineActive]} />

                {/* Step 4: Closed */}
                <View style={styles.timelineStep}>
                  <View style={[styles.stepIconCircle, getStatusStep(selectedTicket.status) >= 4 && styles.stepCompleted]}>
                    <Star size={16} color={getStatusStep(selectedTicket.status) >= 4 ? '#FFF' : '#94A3B8'} />
                  </View>
                  <Text style={styles.stepLabel}>Closed</Text>
                </View>
              </View>
            </View>

            {/* Assigned Staff Info */}
            {selectedTicket.assignedStaff && (
              <View style={styles.staffCard}>
                <View style={styles.staffHeader}>
                  <Text style={styles.staffTitle}>Assigned Maintenance Staff</Text>
                  <TouchableOpacity style={styles.callButton} onPress={() => Alert.alert('Calling Staff', `Dialing ${selectedTicket.assignedStaff.phone}`)}>
                    <Phone size={14} color="#FFF" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.staffName}>{selectedTicket.assignedStaff.name}</Text>
                <Text style={styles.staffPhone}>{selectedTicket.assignedStaff.phone}</Text>
              </View>
            )}

            {/* Resolution Proof Photo Display */}
            {selectedTicket.resolutionProof && (
              <View style={styles.proofBox}>
                <Text style={styles.proofTitle}>Completion Photo Proof Verified ✅</Text>
                <Image source={{ uri: selectedTicket.resolutionProof }} style={styles.proofImage} />
                <Text style={styles.proofNotes}>{selectedTicket.resolutionNotes}</Text>
              </View>
            )}

            {/* 1-5 STAR RATING & FEEDBACK FORM */}
            {selectedTicket.status === 'RESOLVED' && !selectedTicket.feedbackGiven && (
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackTitle}>Rate Resolution Quality</Text>
                <Text style={styles.feedbackSubtitle}>How satisfied are you with the staff repair work?</Text>

                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <TouchableOpacity key={starVal} onPress={() => setRating(starVal)}>
                      <Star
                        size={28}
                        color={starVal <= rating ? '#F59E0B' : '#CBD5E1'}
                        fill={starVal <= rating ? '#F59E0B' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Optional comment about staff behavior or service quality..."
                  value={feedbackComment}
                  onChangeText={setFeedbackComment}
                />

                <TouchableOpacity style={styles.submitRatingBtn} onPress={() => submitFeedback(selectedTicket.id)}>
                  <Text style={styles.submitRatingText}>Submit Star Rating & Close Ticket</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  ticketSelectorRow: { marginBottom: 16 },
  ticketTab: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketTabActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  ticketTabId: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  ticketTabIdActive: { color: '#FFF' },
  ticketTabStatus: { fontSize: 11, color: '#64748B', marginTop: 2 },
  ticketTabStatusActive: { color: '#C7D2FE' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketIdText: { fontSize: 16, fontWeight: '800', color: '#4F46E5' },
  categoryBadge: { backgroundColor: '#EEF2FF', color: '#4F46E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: '700' },
  ticketTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 8 },
  ticketMeta: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  timelineContainer: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, marginBottom: 16 },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 12 },
  progressBarWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineStep: { alignItems: 'center' },
  stepIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  stepCompleted: { backgroundColor: '#10B981' },
  stepLabel: { fontSize: 10, fontWeight: '700', color: '#475569', marginTop: 6 },
  connectorLine: { flex: 1, height: 3, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  lineActive: { backgroundColor: '#10B981' },
  staffCard: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 12, marginBottom: 14 },
  staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  staffTitle: { fontSize: 12, fontWeight: '700', color: '#3730A3' },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4F46E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, gap: 4 },
  callButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  staffName: { fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginTop: 4 },
  staffPhone: { fontSize: 13, color: '#4338CA' },
  proofBox: { backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#A7F3D0', marginBottom: 14 },
  proofTitle: { fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 8 },
  proofImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 6 },
  proofNotes: { fontSize: 12, color: '#047857' },
  feedbackSection: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 14, marginTop: 4 },
  feedbackTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  feedbackSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 10 },
  starRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  commentInput: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 10, fontSize: 13, color: '#0F172A', marginBottom: 10 },
  submitRatingBtn: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitRatingText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
