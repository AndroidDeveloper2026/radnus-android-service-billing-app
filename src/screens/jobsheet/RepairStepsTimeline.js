// src/screens/jobsheet/RepairStepsTimeline.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

/* ─── STATUS CONFIG ────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Received:          { bg: '#DBEAFE', color: '#1D4ED8', border: '#3B82F6', dot: '#3B82F6' },
  Pending:           { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B', dot: '#F59E0B' },
  'In Progress':     { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B', dot: '#F59E0B' },
  Repairing:         { bg: '#FDE8D8', color: '#9A3412', border: '#F97316', dot: '#F97316' },
  Diagnosing:        { bg: '#EDE9FE', color: '#5B21B6', border: '#8B5CF6', dot: '#8B5CF6' },
  Ready:             { bg: '#D1FAE5', color: '#065F46', border: '#10B981', dot: '#10B981' },
  Delivered:         { bg: '#D1FAE5', color: '#065F46', border: '#10B981', dot: '#10B981' },
  'Delivered NR/NA': { bg: '#D1FAE5', color: '#065F46', border: '#10B981', dot: '#10B981' },
};

const getStatusStyle = (status) =>
  STATUS_CONFIG[status] || { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF', dot: '#9CA3AF' };

const fmtDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ─── AVATAR ────────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  ['#DBEAFE','#1D4ED8'], ['#D1FAE5','#065F46'], ['#EDE9FE','#5B21B6'],
  ['#FEF3C7','#92400E'], ['#FCE7F3','#9D174D'], ['#FDE8D8','#9A3412'],
];

const Avatar = ({ name, size = 26 }) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const [bg, color] = AVATAR_COLORS[idx];
  return (
    <View style={[styles.avatar, { width: size, height: size, backgroundColor: bg, borderColor: color + '44' }]}>
      <Text style={[styles.avatarText, { fontSize: Math.round(size * 0.38), color }]}>
        {(name || '?').slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
};

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
const RepairStepsTimeline = ({ jobId }) => {
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);
  const API = API_BASE_URL;

  const fetchData = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/jobsheets/${jobId}`);
      setJobData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  if (!jobId) return null;

  const steps = jobData?.repairSteps || [];
  const statusLogs = jobData?.statusLogs || [];
  const transferLog = jobData?.transferLog || [];
  const doneCount = steps.filter(s => s.done).length;
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* ─── Repair Steps ──────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🛠️</Text>
            </View>
            <Text style={styles.cardTitle}>Engineer repair steps</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            {steps.length > 0 && (
              <View style={[styles.progressPill, pct === 100 ? styles.progressDone : styles.progressPending]}>
                <Text style={styles.progressPillText}>
                  {doneCount}/{steps.length} done
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={fetchData} disabled={loading} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>
                {loading ? '⟳ Loading...' : '⟳ Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          {/* Progress Bar */}
          {steps.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={[styles.progressPercent, pct === 100 ? styles.progressPercentDone : styles.progressPercentPending]}>
                  {pct}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pct === 100 ? '#10B981' : '#F59E0B' }]} />
              </View>
            </View>
          )}

          {/* Steps List */}
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={COLORS.gray400} />
              <Text style={styles.emptyStateText}>Loading steps...</Text>
            </View>
          ) : steps.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No repair steps added yet</Text>
            </View>
          ) : (
            <View style={styles.stepsContainer}>
              {steps.map((s, idx) => {
                const isDone = s.done;
                return (
                  <View key={s._id || idx} style={styles.stepItem}>
                    {/* Circle */}
                    <View style={[styles.stepCircle, isDone ? styles.stepCircleDone : styles.stepCirclePending]}>
                      <Text style={[styles.stepCircleText, isDone ? styles.stepCircleTextDone : styles.stepCircleTextPending]}>
                        {isDone ? '✓' : idx + 1}
                      </Text>
                    </View>
                    
                    {/* Card */}
                    <View style={[styles.stepContent, isDone ? styles.stepContentDone : styles.stepContentPending]}>
                      <View style={styles.stepHeader}>
                        <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                          {s.step}
                        </Text>
                        <View style={[styles.stepStatus, isDone ? styles.stepStatusDone : styles.stepStatusPending]}>
                          <View style={[styles.stepStatusDot, isDone ? styles.stepStatusDotDone : styles.stepStatusDotPending]} />
                          <Text style={[styles.stepStatusText, isDone ? styles.stepStatusTextDone : styles.stepStatusTextPending]}>
                            {isDone ? 'Done' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                      
                      {s.note && (
                        <View style={styles.stepNote}>
                          <Text style={styles.stepNoteText}>{s.note}</Text>
                        </View>
                      )}
                      
                      <View style={styles.stepMeta}>
                        <View style={styles.stepMetaUser}>
                          <Avatar name={s.completedBy} size={22} />
                          <Text style={styles.stepMetaName}>{s.completedBy || 'Unknown'}</Text>
                        </View>
                        {isDone && s.completedAt && (
                          <Text style={styles.stepMetaDate}>{fmtDate(s.completedAt)}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* ─── Transfer History ────────────────────────────────────────────── */}
      {transferLog.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.cardIconText}>🔀</Text>
              </View>
              <Text style={styles.cardTitle}>Transfer history</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {[...transferLog]
              .sort((a, b) => new Date(a.transferredAt) - new Date(b.transferredAt))
              .map((log, i) => (
                <View key={i} style={styles.transferItem}>
                  <View style={styles.transferRow}>
                    <View style={styles.transferFrom}>
                      <View style={[styles.transferDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={styles.transferFromText}>{log.from}</Text>
                    </View>
                    <Text style={styles.transferArrow}>→</Text>
                    <View style={styles.transferTo}>
                      <View style={[styles.transferDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.transferToText}>{log.to}</Text>
                    </View>
                  </View>
                  <View style={styles.transferMeta}>
                    <Text style={styles.transferDate}>{fmtDate(log.transferredAt)}</Text>
                    {log.note && (
                      <Text style={styles.transferNote}>"{log.note}"</Text>
                    )}
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* ─── Status History ────────────────────────────────────────────────── */}
      {statusLogs.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.cardIconText}>📋</Text>
              </View>
              <Text style={styles.cardTitle}>Status history</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {[...statusLogs].reverse().map((log, i) => {
              const sc = getStatusStyle(log.status);
              return (
                <View key={i} style={[styles.statusItem, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                  <View style={styles.statusRow}>
                    <View style={styles.statusLabel}>
                      <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
                      <Text style={[styles.statusName, { color: sc.color }]}>{log.status}</Text>
                    </View>
                    <View style={styles.statusUser}>
                      <Avatar name={log.updatedBy} size={22} />
                      <Text style={[styles.statusUserName, { color: sc.color + 'cc' }]}>
                        {log.updatedBy}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.statusDate, { color: sc.color + '99' }]}>
                    {fmtDate(log.timestamp)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    flexWrap: 'wrap',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: '#111827',
  },
  cardBody: {
    padding: 16,
  },
  progressPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  progressDone: {
    backgroundColor: '#D1FAE5',
  },
  progressPending: {
    backgroundColor: '#FEF3C7',
  },
  progressPillText: {
    ...FONTS.bold,
    fontSize: 13,
    color: '#065F46',
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  refreshButtonText: {
    ...FONTS.semibold,
    fontSize: 13,
    color: '#6B7280',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...FONTS.medium,
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercent: {
    ...FONTS.bold,
    fontSize: 14,
  },
  progressPercentDone: {
    color: '#065F46',
  },
  progressPercentPending: {
    color: '#92400E',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.5s ease',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  stepsContainer: {
    position: 'relative',
  },
  stepItem: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepCircleDone: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  stepCirclePending: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  stepCircleText: {
    ...FONTS.bold,
    fontSize: 14,
  },
  stepCircleTextDone: {
    color: '#065F46',
  },
  stepCircleTextPending: {
    color: '#9CA3AF',
  },
  stepContent: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
  },
  stepContentDone: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  stepContentPending: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#D1D5DB',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  stepTitle: {
    ...FONTS.semibold,
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  stepTitleDone: {
    color: '#065F46',
    textDecorationLine: 'line-through',
  },
  stepStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  stepStatusDone: {
    backgroundColor: '#D1FAE5',
  },
  stepStatusPending: {
    backgroundColor: '#F3F4F6',
  },
  stepStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 50,
  },
  stepStatusDotDone: {
    backgroundColor: '#10B981',
  },
  stepStatusDotPending: {
    backgroundColor: '#9CA3AF',
  },
  stepStatusText: {
    ...FONTS.bold,
    fontSize: 12,
  },
  stepStatusTextDone: {
    color: '#065F46',
  },
  stepStatusTextPending: {
    color: '#6B7280',
  },
  stepNote: {
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  stepNoteText: {
    ...FONTS.regular,
    fontSize: 13,
    color: '#6B7280',
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  stepMetaUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepMetaName: {
    ...FONTS.semibold,
    fontSize: 13,
    color: '#374151',
  },
  stepMetaDate: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  avatar: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  avatarText: {
    ...FONTS.bold,
    letterSpacing: -0.5,
  },
  transferItem: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transferFrom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  transferTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  transferDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    flexShrink: 0,
  },
  transferFromText: {
    ...FONTS.bold,
    fontSize: 15,
    color: '#991B1B',
  },
  transferToText: {
    ...FONTS.bold,
    fontSize: 15,
    color: '#065F46',
  },
  transferArrow: {
    fontSize: 18,
    color: '#D1D5DB',
  },
  transferMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  transferDate: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#9CA3AF',
  },
  transferNote: {
    ...FONTS.regular,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  statusItem: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 11,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 50,
    flexShrink: 0,
  },
  statusName: {
    ...FONTS.bold,
    fontSize: 15,
  },
  statusUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusUserName: {
    ...FONTS.semibold,
    fontSize: 13,
  },
  statusDate: {
    ...FONTS.medium,
    fontSize: 12,
    marginTop: 4,
  },
});

export default RepairStepsTimeline;