/**
 * AdminDashboard.jsx — React.js + Modern Styling
 * Production-ready Ticket Management Dashboard for Wardens & Admin Staff.
 * Features: Stat metrics overview cards, filter controls, interactive ticket table,
 * Staff Assignment Modal, and Resolution Proof Photo Verification Modal.
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  UserPlus,
  Shield,
  UploadCloud,
  X,
  Phone,
  Eye,
  Megaphone,
  Check,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

// Mock Initial Ticket Data
const INITIAL_TICKETS = [
  {
    id: 'SH-2026-1042',
    title: 'Water tap leaking continuously',
    category: 'PLUMBING',
    urgency: 'NORMAL',
    status: 'PENDING',
    roomNumber: '304',
    hostelBlock: 'Block-A',
    isAnonymous: false,
    studentName: 'Rahul Sharma',
    studentPhone: '+91 98765 43210',
    description: 'The main washbasin tap is leaking heavily causing water accumulation on the bathroom floor.',
    createdAt: '2026-08-10 09:30 AM',
    assignedStaff: null,
    resolutionProof: null,
  },
  {
    id: 'SH-2026-1043',
    title: 'Main ceiling fan not rotating',
    category: 'ELECTRICITY',
    urgency: 'URGENT',
    status: 'IN_PROGRESS',
    roomNumber: '112',
    hostelBlock: 'Block-B',
    isAnonymous: false,
    studentName: 'Priya Verma',
    studentPhone: '+91 98123 45678',
    description: 'Regulator is on level 5 but fan refuses to turn on. Extremely hot during afternoon.',
    createdAt: '2026-08-10 10:15 AM',
    assignedStaff: { name: 'Ramesh (Electrician)', phone: '+91 99887 76655' },
    resolutionProof: null,
  },
  {
    id: 'SH-2026-1044',
    title: 'Wi-Fi router on 2nd floor offline',
    category: 'WIFI',
    urgency: 'EMERGENCY',
    status: 'PENDING',
    roomNumber: '208',
    hostelBlock: 'Block-A',
    isAnonymous: false,
    studentName: 'Ankit Kumar',
    studentPhone: '+91 97654 32109',
    description: 'Entire 2nd floor Wi-Fi signal lost since morning. Unable to submit online assignments.',
    createdAt: '2026-08-10 11:00 AM',
    assignedStaff: null,
    resolutionProof: null,
  },
  {
    id: 'SH-2026-1045',
    title: 'Hygiene & waste removal delayed',
    category: 'CLEANING',
    urgency: 'NORMAL',
    status: 'RESOLVED',
    roomNumber: '405',
    hostelBlock: 'Block-C',
    isAnonymous: true,
    studentName: 'Anonymous Student',
    description: 'Dustbin on 4th floor corridor hasn’t been emptied for two days.',
    createdAt: '2026-08-09 03:20 PM',
    assignedStaff: { name: 'Suresh (Housekeeping)', phone: '+91 91234 56789' },
    resolutionProof: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    resolutionNotes: 'Corridor dustbin emptied and disinfected thoroughly.',
  },
];

export default function AdminDashboard() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'ASSIGN' | 'RESOLVE' | 'VIEW' | 'NOTICE'
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Assign Form Inputs
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('Plumber');

  // Resolve Form Inputs
  const [resolutionProofFile, setResolutionProofFile] = useState(null);
  const [resolutionProofPreview, setResolutionProofPreview] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Notice Broadcast State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // Calculate Stat Metrics
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'PENDING').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    emergency: tickets.filter((t) => t.urgency === 'EMERGENCY').length,
  };

  // Filter Logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || ticket.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'ALL' || ticket.urgency === selectedUrgency;
    const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesUrgency && matchesStatus;
  });

  // Handle Staff Assignment Submit
  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!staffName || !staffPhone) return alert('Please provide staff name and phone number.');

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              status: 'IN_PROGRESS',
              assignedStaff: { name: `${staffName} (${staffRole})`, phone: staffPhone },
            }
          : t
      )
    );
    closeModal();
  };

  // Handle Proof Image File Select
  const handleProofImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionProofFile(file);
      setResolutionProofPreview(URL.createObjectURL(file));
    }
  };

  // Handle Resolve Submit (Requires Proof Upload)
  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolutionProofPreview) {
      return alert('Mandatory Action: Please upload photo proof of resolution before completing!');
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              status: 'RESOLVED',
              resolutionProof: resolutionProofPreview,
              resolutionNotes: resolutionNotes || 'Work completed and verified by admin.',
            }
          : t
      )
    );
    closeModal();
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTicket(null);
    setStaffName('');
    setStaffPhone('');
    setResolutionProofFile(null);
    setResolutionProofPreview('');
    setResolutionNotes('');
  };

  return (
    <div style={styles.container}>
      
      {/* Top Header Bar */}
      <header style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.logoIcon}>🏰</div>
            <h1 style={styles.title}>SunoHostel Admin Dashboard</h1>
          </div>
          <p style={styles.subtitle}>Warden & Operations Command Center • Central Management Console</p>
        </div>

        <button style={styles.noticeButton} onClick={() => setActiveModal('NOTICE')}>
          <Megaphone size={18} style={{ marginRight: '8px' }} />
          Broadcast Digital Notice
        </button>
      </header>

      {/* Analytics Summary Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total Complaints</span>
            <Clock size={20} color="#3B82F6" />
          </div>
          <span style={styles.statValue}>{stats.total}</span>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Pending Action</span>
            <Clock size={20} color="#F59E0B" />
          </div>
          <span style={{ ...styles.statValue, color: '#F59E0B' }}>{stats.pending}</span>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #8B5CF6' }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>In Progress</span>
            <RefreshCw size={20} color="#8B5CF6" />
          </div>
          <span style={{ ...styles.statValue, color: '#8B5CF6' }}>{stats.inProgress}</span>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Resolved</span>
            <CheckCircle size={20} color="#10B981" />
          </div>
          <span style={{ ...styles.statValue, color: '#10B981' }}>{stats.resolved}</span>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #EF4444' }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Emergency Alerts</span>
            <AlertTriangle size={20} color="#EF4444" />
          </div>
          <span style={{ ...styles.statValue, color: '#EF4444' }}>{stats.emergency}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94A3B8" style={{ marginLeft: '12px' }} />
          <input
            type="text"
            placeholder="Search by Room (e.g. 304), Ticket ID, or keywords..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <SlidersHorizontal size={16} color="#64748B" />
          
          <select
            style={styles.select}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="WIFI">Wi-Fi</option>
            <option value="MESS_FOOD">Mess Food</option>
            <option value="CLEANING">Cleaning</option>
            <option value="SECURITY">Security</option>
            <option value="OTHERS">Others</option>
          </select>

          <select
            style={styles.select}
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
          >
            <option value="ALL">All Urgencies</option>
            <option value="NORMAL">Normal</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>

          <select
            style={styles.select}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Ticket Details</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Room & Block</th>
              <th style={styles.th}>Urgency</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Assigned Duty Staff</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textStyle: 'center', padding: '30px', color: '#94A3B8' }}>
                  No complaints match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr key={t.id} style={styles.tr}>
                  {/* Ticket Details */}
                  <td style={styles.td}>
                    <div style={{ fontWeight: '700', color: '#F8FAFC' }}>{t.ticketId}</div>
                    <div style={{ color: '#E2E8F0', fontSize: '14px', marginTop: '2px' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                      {t.isAnonymous ? (
                        <span style={{ color: '#818CF8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={12} /> Anonymous Student
                        </span>
                      ) : (
                        `Reported by: ${t.studentName} (${t.studentPhone})`
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td style={styles.td}>
                    <span style={styles.categoryPill}>{t.category}</span>
                  </td>

                  {/* Room & Block */}
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600', color: '#38BDF8' }}>Room {t.roomNumber}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{t.hostelBlock}</div>
                  </td>

                  {/* Urgency */}
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.urgencyBadge,
                        backgroundColor:
                          t.urgency === 'EMERGENCY'
                            ? '#7F1D1D'
                            : t.urgency === 'URGENT'
                            ? '#78350F'
                            : '#064E3B',
                        color:
                          t.urgency === 'EMERGENCY'
                            ? '#FCA5A5'
                            : t.urgency === 'URGENT'
                            ? '#FDE68A'
                            : '#6EE7B7',
                      }}
                    >
                      {t.urgency}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          t.status === 'RESOLVED'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : t.status === 'IN_PROGRESS'
                            ? 'rgba(139, 92, 246, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          t.status === 'RESOLVED'
                            ? '#34D399'
                            : t.status === 'IN_PROGRESS'
                            ? '#A78BFA'
                            : '#FBBF24',
                        borderColor:
                          t.status === 'RESOLVED'
                            ? '#059669'
                            : t.status === 'IN_PROGRESS'
                            ? '#7C3AED'
                            : '#D97706',
                      }}
                    >
                      {t.status}
                    </span>
                  </td>

                  {/* Assigned Staff */}
                  <td style={styles.td}>
                    {t.assignedStaff ? (
                      <div>
                        <div style={{ fontSize: '13px', color: '#F1F5F9', fontWeight: '600' }}>
                          {t.assignedStaff.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {t.assignedStaff.phone}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Assign Staff Button */}
                      {t.status !== 'RESOLVED' && (
                        <button
                          style={styles.actionBtnAssign}
                          onClick={() => {
                            setSelectedTicket(t);
                            setActiveModal('ASSIGN');
                          }}
                          title="Assign Staff Member"
                        >
                          <UserPlus size={14} /> Assign
                        </button>
                      )}

                      {/* Resolve Button with Photo Verification */}
                      {t.status === 'IN_PROGRESS' && (
                        <button
                          style={styles.actionBtnResolve}
                          onClick={() => {
                            setSelectedTicket(t);
                            setActiveModal('RESOLVE');
                          }}
                          title="Mark Resolved with Proof"
                        >
                          <Check size={14} /> Resolve
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        style={styles.actionBtnView}
                        onClick={() => {
                          setSelectedTicket(t);
                          setActiveModal('VIEW');
                        }}
                        title="View Complete Details"
                      >
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ASSIGN STAFF TO TICKET */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'ASSIGN' && selectedTicket && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Assign Duty Staff to {selectedTicket.ticketId}</h3>
              <button style={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleAssignSubmit} style={styles.modalBody}>
              <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '14px' }}>
                Select specialized staff to resolve ticket in <strong>Room {selectedTicket.roomNumber} ({selectedTicket.category})</strong>.
              </p>

              <label style={styles.label}>Staff Specialization Role</label>
              <select style={styles.modalInput} value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                <option value="Plumber">Plumber Specialist</option>
                <option value="Electrician">Electrician Specialist</option>
                <option value="IT & Wi-Fi Tech">IT & Wi-Fi Specialist</option>
                <option value="Housekeeping Supervisor">Housekeeping Supervisor</option>
                <option value="Security Officer">Security Officer</option>
              </select>

              <label style={styles.label}>Staff Member Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                style={styles.modalInput}
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />

              <label style={styles.label}>Contact Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 99887 76655"
                style={styles.modalInput}
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
              />

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Assign Staff & Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: RESOLUTION PROOF PHOTO VERIFICATION */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'RESOLVE' && selectedTicket && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Resolution Verification — Photo Proof Required</h3>
              <button style={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleResolveSubmit} style={styles.modalBody}>
              <div style={styles.alertNotice}>
                <AlertTriangle size={18} color="#F59E0B" />
                <span>Admin policy requires verified photo proof before marking ticket as RESOLVED.</span>
              </div>

              <label style={styles.label}>Upload Completion Photo Proof *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProofImageChange}
                style={{ display: 'none' }}
                id="proofFileInput"
              />
              <label htmlFor="proofFileInput" style={styles.uploadArea}>
                {resolutionProofPreview ? (
                  <img src={resolutionProofPreview} alt="Proof preview" style={styles.proofPreviewImage} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <UploadCloud size={32} color="#818CF8" />
                    <p style={{ color: '#E2E8F0', marginTop: '8px', fontSize: '14px' }}>Click to select photo proof from camera/device</p>
                  </div>
                )}
              </label>

              <label style={styles.label}>Resolution Summary Notes</label>
              <textarea
                placeholder="Describe how the issue was repaired or addressed..."
                style={{ ...styles.modalInput, height: '80px' }}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#10B981' }}>
                  Verify & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: VIEW COMPLETE TICKET DETAILS */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'VIEW' && selectedTicket && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Ticket Details: {selectedTicket.ticketId}</h3>
              <button style={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: '#F1F5F9', fontWeight: '600', fontSize: '16px' }}>{selectedTicket.title}</p>
              <p style={{ color: '#94A3B8', marginTop: '6px', lineHeight: '1.5' }}>{selectedTicket.description}</p>
              
              <div style={{ margin: '16px 0', padding: '12px', background: '#0F172A', borderRadius: '8px' }}>
                <div><strong>Category:</strong> {selectedTicket.category}</div>
                <div style={{ marginTop: '4px' }}><strong>Room:</strong> {selectedTicket.roomNumber} ({selectedTicket.hostelBlock})</div>
                <div style={{ marginTop: '4px' }}><strong>Status:</strong> {selectedTicket.status}</div>
              </div>

              {selectedTicket.resolutionProof && (
                <div>
                  <h4 style={{ color: '#34D399', marginBottom: '8px' }}>Verified Completion Proof:</h4>
                  <img src={selectedTicket.resolutionProof} alt="Proof" style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
                  <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '6px' }}>{selectedTicket.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Object with Sleek Glassmorphism Dark Aesthetic
const styles = {
  container: {
    backgroundColor: '#090D16',
    color: '#F8FAFC',
    minHeight: '100vh',
    padding: '24px 32px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  logoIcon: {
    fontSize: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#F8FAFC',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '4px',
  },
  noticeButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#94A3B8',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    marginTop: '10px',
    display: 'block',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: '10px',
    flex: '1',
    minWidth: '280px',
    border: '1px solid #334155',
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F8FAFC',
    padding: '12px 14px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  select: {
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    outline: 'none',
  },
  tableCard: {
    backgroundColor: '#1E293B',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid #334155',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: '#0F172A',
    borderBottom: '1px solid #334155',
  },
  th: {
    padding: '14px 18px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '16px 18px',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  categoryPill: {
    backgroundColor: '#334155',
    color: '#CBD5E1',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  urgencyBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid',
  },
  actionBtnAssign: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#3B82F6',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnResolve: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#10B981',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnView: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#475569',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '520px',
    padding: '24px',
    border: '1px solid #475569',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#CBD5E1',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
  },
  uploadArea: {
    border: '2px dashed #6366F1',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofPreviewImage: {
    maxHeight: '160px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  alertNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid #F59E0B',
    padding: '10px',
    borderRadius: '8px',
    color: '#FDE68A',
    fontSize: '13px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
  },
  cancelBtn: {
    backgroundColor: '#334155',
    color: '#F8FAFC',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
