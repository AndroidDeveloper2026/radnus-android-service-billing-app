// src/screens/admin/SalesRepReportScreen.js
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Search, Calendar, Download, Users, ClipboardList, Clock,
  DollarSign, TrendingUp, BarChart2, Instagram, Star,
  ChevronDown, ChevronUp, FileText, X, Filter, RefreshCw,
  ChevronRight,
} from 'lucide-react-native';
import { useToast } from 'react-native-toast-notifications';
import api from '../../utils/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const C = {
  red:        '#DC2626',
  redDark:    '#B91C1C',
  redLight:   '#FEE2E2',
  redMid:     '#FECACA',
  white:      '#FFFFFF',
  gray50:     '#F8FAFC',
  gray100:    '#F1F5F9',
  gray200:    '#E2E8F0',
  gray300:    '#CBD5E1',
  gray400:    '#94A3B8',
  gray500:    '#64748B',
  gray600:    '#475569',
  gray700:    '#334155',
  gray800:    '#1E293B',
  gray900:    '#0F172A',
  success:    '#059669',
  successLt:  '#D1FAE5',
  warning:    '#D97706',
  warningLt:  '#FEF3C7',
  purple:     '#7C3AED',
  purpleLt:   '#EDE9FE',
  pink:       '#DB2777',
  pinkLt:     '#FCE7F3',
  blue:       '#2563EB',
  blueLt:     '#DBEAFE',
};

const shadow = Platform.select({
  ios:     { shadowColor: C.gray900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 2 },
  default: {},
});
const softShadow = Platform.select({
  ios:     { shadowColor: C.gray900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  android: { elevation: 1 },
  default: {},
});

const STATUS_COLORS = {
  Received:        { bg: C.successLt,  color: '#065F46', dot: '#10B981' },
  Pending:         { bg: C.warningLt,  color: '#92400E', dot: '#F59E0B' },
  Repaired:        { bg: C.blueLt,     color: '#1E40AF', dot: '#3B82F6' },
  Delivered:       { bg: C.successLt,  color: '#065F46', dot: '#10B981' },
  'Delivered NR/NA':{ bg: C.redLight,  color: '#991B1B', dot: '#EF4444' },
  Cancelled:       { bg: C.redLight,   color: '#991B1B', dot: '#EF4444' },
};
const DEFAULT_STATUS = { bg: C.gray100, color: C.gray600, dot: C.gray400 };

const AVATAR_PALETTE = [
  { bg: C.redLight,   color: C.redDark },
  { bg: C.successLt,  color: '#065F46' },
  { bg: C.warningLt,  color: '#92400E' },
  { bg: C.blueLt,     color: '#1E40AF' },
  { bg: C.purpleLt,   color: '#5B21B6' },
];

// ─── Utils ───────────────────────────────────────────────────────────────────

const fmt = (n) => (n ? '₹' + Number(n).toLocaleString('en-IN') : '₹0');
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
const sumField = (arr, fn) => arr.reduce((s, j) => s + fn(j), 0);

// ─── Memoised Atoms ──────────────────────────────────────────────────────────

const StatusBadge = memo(({ status }) => {
  const s = STATUS_COLORS[status] || DEFAULT_STATUS;
  return (
    <View style={[S.statusBadge, { backgroundColor: s.bg }]}>
      <View style={[S.statusDot, { backgroundColor: s.dot }]} />
      <Text style={[S.statusBadgeText, { color: s.color }]} numberOfLines={1}>{status || '—'}</Text>
    </View>
  );
});

const Avatar = memo(({ name, idx, size = 36 }) => {
  const c = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
  return (
    <View style={[S.avatar, { backgroundColor: c.bg, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[S.avatarText, { color: c.color, fontSize: size * 0.4 }]}>
        {(name || '?')[0].toUpperCase()}
      </Text>
    </View>
  );
});

const SummaryCard = memo(({ label, value, accent, icon: Icon }) => (
  <View style={S.summaryCard}>
    <View style={[S.summaryAccentBar, { backgroundColor: accent || C.red }]} />
    <View style={S.summaryCardBody}>
      <View style={S.summaryCardHeader}>
        <View style={[S.summaryIconWrap, { backgroundColor: (accent || C.red) + '18' }]}>
          {Icon && <Icon size={14} color={accent || C.red} />}
        </View>
        <Text style={S.summaryLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={S.summaryValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
));

const MetricChip = memo(({ label, value, color, bg, emphasized }) => (
  <View style={[S.metricChip, { backgroundColor: bg }, emphasized && { borderWidth: 1, borderColor: color + '55' }]}>
    <Text style={[S.metricChipLabel, { color }]}>{label}</Text>
    <Text style={[S.metricChipValue, { color }]} numberOfLines={1}>{value}</Text>
  </View>
));

const SocialText = memo(({ val }) => {
  if (!val || val === '-' || val === '') return <Text style={S.socialText}>—</Text>;
  if (val === 'Already Done')  return <Text style={[S.socialText, S.socialDone]}>Done</Text>;
  if (val === 'Yes')           return <Text style={[S.socialText, S.socialYes]}>Yes</Text>;
  if (val === 'No')            return <Text style={[S.socialText, S.socialNo]}>No</Text>;
  return <Text style={S.socialText}>{val}</Text>;
});

// ─── JobRow & JobHeaders ──────────────────────────────────────────────────────

const JobHeaders = memo(() => (
  <View style={S.headerRow}>
    {[
      [30, '#'],     [80, 'Job Sheet'],  [76, 'Sales Rep'], [76, 'Created By'],
      [90, 'Customer'],[80, 'Contact'],  [90, 'Device'],    [78, 'Status'],
      [70, 'Service'],[70, 'Spare'],     [70, 'Margin'],    [70, 'Advance'],
      [80, 'Adv.Date'],[70, 'Total'],   [60, 'Insta'],     [60, 'Google'],
      [80, 'Date'],
    ].map(([w, label]) => (
      <Text key={label} style={[S.headerText, { width: w }]}>{label}</Text>
    ))}
  </View>
));

const JobRow = memo(({ job, index, rep }) => {
  const sc  = Number(job.service?.serviceCharge  || 0);
  const sp  = Number(job.service?.spareCharge    || 0);
  const mg  = Number(job.service?.margin         || 0);
  const adv = Number(job.service?.advanceAmount  || 0);
  const tot = sc + sp;
  const bg  = index % 2 === 0 ? C.white : C.gray50;

  return (
    <View style={[S.jobRow, { backgroundColor: bg }]}>
      <Text style={[S.jCell, S.jIdx]}>{index + 1}</Text>
      <Text style={[S.jCell, S.jSheet]}>{job.jobSheetNo}</Text>
      <View style={[S.jCell, S.jRepBadge]}>
        <Text style={S.jRepText} numberOfLines={1}>{job.service?.serviceRep || rep || '—'}</Text>
      </View>
      <View style={[S.jCell, S.jCreatorBadge]}>
        <Text style={S.jCreatorText} numberOfLines={1}>{job.createdBy?.username || '—'}</Text>
      </View>
      <Text style={[S.jCell, { width: 90, fontSize: 11.5, color: C.gray700 }]} numberOfLines={1}>
        {job.customer?.name || '—'}
      </Text>
      <Text style={[S.jCell, { width: 80, fontSize: 11, color: C.gray400 }]} numberOfLines={1}>
        {job.customer?.contact || '—'}
      </Text>
      <Text style={[S.jCell, { width: 90, fontSize: 11.5 }]} numberOfLines={1}>
        {[job.device?.make, job.device?.model].filter(Boolean).join(' ') || '—'}
      </Text>
      <StatusBadge status={job.device?.mobileStatus} />
      <Text style={[S.jCell, S.jAmt, { color: C.purple }]}>{sc ? fmt(sc) : '—'}</Text>
      <Text style={[S.jCell, S.jAmt, { color: C.pink }]}>{sp ? fmt(sp) : '—'}</Text>
      <Text style={[S.jCell, S.jAmt, { color: C.warning }]}>{mg ? fmt(mg) : '—'}</Text>
      <Text style={[S.jCell, S.jAmt, { color: C.blue }]}>{adv ? fmt(adv) : '—'}</Text>
      <Text style={[S.jCell, { width: 80, fontSize: 10.5, color: C.gray400 }]}>{fmtDate(job.service?.advanceDate)}</Text>
      <Text style={[S.jCell, S.jAmt, S.jTot]}>{tot ? fmt(tot) : '—'}</Text>
      <View style={[S.jCell, { width: 60, alignItems: 'center' }]}>
        <SocialText val={job.service?.instaFollowers} />
      </View>
      <View style={[S.jCell, { width: 60, alignItems: 'center' }]}>
        <SocialText val={job.service?.googleReview} />
      </View>
      <Text style={[S.jCell, { width: 80, fontSize: 10.5, color: C.gray400 }]}>
        {new Date(job.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
});

const SubtotalRow = memo(({ sc, sp, mg, adv, tot, insta, google }) => (
  <View style={S.subtotalRow}>
    {[30, 80, 76, 76, 90, 80, 90].map((w, i) => (
      <Text key={i} style={[S.subtotalText, { width: w }]}>—</Text>
    ))}
    <Text style={[S.subtotalText, { width: 78 }]}>Subtotal</Text>
    <Text style={[S.subtotalText, { width: 70, color: C.purple }]}>{fmt(sc)}</Text>
    <Text style={[S.subtotalText, { width: 70, color: C.pink }]}>{fmt(sp)}</Text>
    <Text style={[S.subtotalText, { width: 70, color: C.warning }]}>{fmt(mg)}</Text>
    <Text style={[S.subtotalText, { width: 70, color: C.blue }]}>{fmt(adv)}</Text>
    <Text style={[S.subtotalText, { width: 80 }]}>—</Text>
    <Text style={[S.subtotalText, { width: 70, color: C.success }]}>{fmt(tot)}</Text>
    <Text style={[S.subtotalText, { width: 60, color: C.red, textAlign: 'center' }]}>{insta}</Text>
    <Text style={[S.subtotalText, { width: 60, color: C.warning, textAlign: 'center' }]}>{google}</Text>
    <Text style={[S.subtotalText, { width: 80 }]}>—</Text>
  </View>
));

// ─── RepCard (table view) ─────────────────────────────────────────────────────

const RepCard = memo(({ rep, idx, jobs, isExpanded, onToggle }) => {
  // compute per-rep aggregates only when jobs changes
  const metrics = useMemo(() => {
    const sc  = sumField(jobs, j => Number(j.service?.serviceCharge || 0));
    const sp  = sumField(jobs, j => Number(j.service?.spareCharge   || 0));
    const mg  = sumField(jobs, j => Number(j.service?.margin        || 0));
    const adv = sumField(jobs, j => Number(j.service?.advanceAmount || 0));
    const insta  = jobs.filter(j => j.service?.instaFollowers === 'Yes').length;
    const google = jobs.filter(j => j.service?.googleReview   === 'Yes').length;
    return { sc, sp, mg, adv, tot: sc + sp, insta, google };
  }, [jobs]);

  return (
    <View style={S.repCard}>
      <TouchableOpacity style={S.repHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={S.repHeaderTop}>
          <View style={S.repHeaderLeft}>
            <Avatar name={rep} idx={idx} />
            <View>
              <Text style={S.repName}>{rep}</Text>
              <Text style={S.repJobCount}>{jobs.length} job{jobs.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <View style={S.chevronWrap}>
            {isExpanded ? <ChevronUp size={18} color={C.gray400} /> : <ChevronDown size={18} color={C.gray400} />}
          </View>
        </View>

        <View style={S.repMetricsRow}>
          <MetricChip label="Service" value={fmt(metrics.sc)}  color={C.purple}  bg={C.purpleLt} />
          <MetricChip label="Spare"   value={fmt(metrics.sp)}  color={C.pink}    bg={C.pinkLt} />
          <MetricChip label="Margin"  value={fmt(metrics.mg)}  color={C.warning} bg={C.warningLt} />
          <MetricChip label="Advance" value={fmt(metrics.adv)} color={C.blue}    bg={C.blueLt} />
          <MetricChip label="Total"   value={fmt(metrics.tot)} color={C.success} bg={C.successLt} emphasized />
        </View>
      </TouchableOpacity>

      {isExpanded && jobs.length > 0 && (
        <View style={{ overflow: 'hidden' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <JobHeaders />
              {jobs.map((job, i) => (
                <JobRow key={job._id || job.id} job={job} index={i} rep={rep} />
              ))}
              <SubtotalRow {...metrics} />
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SalesRepReportScreen() {
  const toast = useToast();

  const [data,         setData]         = useState({});
  const [loading,      setLoading]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [searchText,   setSearchText]   = useState('');
  const [fromDate,     setFromDate]     = useState('');
  const [toDate,       setToDate]       = useState('');
  const [repFilter,    setRepFilter]    = useState('');
  const [view,         setView]         = useState('table');
  const [expandedReps, setExpandedReps] = useState({});

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (search = '', from = '', to = '') => {
    setLoading(true);
    try {
      const res = await api.getSalesRepReport({
        salesRep: search  || undefined,
        fromDate: from    || undefined,
        toDate:   to      || undefined,
      });
      const responseData = res || {};
      setData(responseData);

      const reps = Object.keys(responseData);
      if (reps.length === 0) {
        toast.show('No data found for the given filters', { type: 'info' });
      }
      setExpandedReps(Object.fromEntries(reps.map(r => [r, true])));
    } catch (err) {
      const msg =
        err.response?.data?.message
        ?? (err.response?.status === 401 ? 'Please login again' : 'Failed to load report');
      toast.show(msg, { type: 'danger' });
      setData({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, []);

  const handleSearch  = useCallback(() => fetchData(searchText, fromDate, toDate), [searchText, fromDate, toDate, fetchData]);
  const handleClear   = useCallback(() => { setSearchText(''); setFromDate(''); setToDate(''); fetchData(); }, [fetchData]);
  const onRefresh     = useCallback(() => { setRefreshing(true); fetchData(searchText, fromDate, toDate); }, [searchText, fromDate, toDate, fetchData]);
  const clearSearch   = useCallback(() => setSearchText(''), []);
  const setTableView  = useCallback(() => setView('table'), []);
  const setDashView   = useCallback(() => setView('dashboard'), []);
  const clearRepFilt  = useCallback(() => setRepFilter(''), []);

  const toggleRepExpansion = useCallback((rep) => {
    setExpandedReps(prev => ({ ...prev, [rep]: !prev[rep] }));
  }, []);

  // ── derived data (cheap — runs only when data changes) ────────────────────
  const repList = useMemo(() => Object.keys(data).sort(), [data]);
  const allJobs = useMemo(() => Object.values(data).flat(), [data]);

  const totals = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return {
      jobs:    allJobs.length,
      reps:    repList.length,
      todayJobs: allJobs.filter(j => new Date(j.createdAt).toLocaleDateString() === today).length,
      service:   sumField(allJobs, j => Number(j.service?.serviceCharge || 0)),
      spare:     sumField(allJobs, j => Number(j.service?.spareCharge   || 0)),
      margin:    sumField(allJobs, j => Number(j.service?.margin        || 0)),
      advance:   sumField(allJobs, j => Number(j.service?.advanceAmount || 0)),
      insta:     allJobs.filter(j => j.service?.instaFollowers === 'Yes').length,
      google:    allJobs.filter(j => j.service?.googleReview   === 'Yes').length,
    };
  }, [allJobs, repList]);

  const grandTotal = totals.service + totals.spare;

  const repSummaries = useMemo(() => repList.map(rep => {
    const jobs = data[rep] || [];
    const sc  = sumField(jobs, j => Number(j.service?.serviceCharge || 0));
    const sp  = sumField(jobs, j => Number(j.service?.spareCharge   || 0));
    const mg  = sumField(jobs, j => Number(j.service?.margin        || 0));
    const adv = sumField(jobs, j => Number(j.service?.advanceAmount || 0));
    const insta  = jobs.filter(j => j.service?.instaFollowers === 'Yes').length;
    const google = jobs.filter(j => j.service?.googleReview   === 'Yes').length;
    const statusCount = {};
    jobs.forEach(j => { const st = j.device?.mobileStatus || 'Unknown'; statusCount[st] = (statusCount[st] || 0) + 1; });
    return { rep, jobs: jobs.length, sc, sp, mg, adv, tot: sc + sp, insta, google, statusCount };
  }), [data, repList]);

  // ── export ─────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!repList.length) { toast.show('No data to export', { type: 'warning' }); return; }
    toast.show('Excel export coming soon', { type: 'info' });
  }, [repList, toast]);

  // ── empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={S.emptyContainer}>
      <View style={S.emptyIconWrap}>
        <BarChart2 size={44} color={C.gray300} />
      </View>
      <Text style={S.emptyTitle}>No data found</Text>
      <Text style={S.emptySubtitle}>Try adjusting your search or date filters</Text>
    </View>
  );

  // ── table view ─────────────────────────────────────────────────────────────
  const renderRepItem = useCallback(({ item: rep, index }) => (
    <RepCard
      key={rep}
      rep={rep}
      idx={index}
      jobs={data[rep] || []}
      isExpanded={expandedReps[rep] !== false}
      onToggle={() => toggleRepExpansion(rep)}
    />
  ), [data, expandedReps, toggleRepExpansion]);

  const renderTableView = () => {
    if (!repList.length) return <EmptyState />;
    return (
      <FlatList
        data={repList}
        keyExtractor={k => k}
        renderItem={renderRepItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.red]} tintColor={C.red} />}
        contentContainerStyle={S.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={7}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // ── dashboard view ─────────────────────────────────────────────────────────
  const renderDashboard = () => {
    if (!repList.length) return <EmptyState />;

    if (repFilter) {
      const rd = repSummaries.find(r => r.rep === repFilter);
      if (!rd) return null;
      const repIdx = repList.indexOf(repFilter);
      return (
        <ScrollView style={S.dashContainer} contentContainerStyle={S.dashContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.red]} tintColor={C.red} />}>
          <TouchableOpacity style={S.backBtn} onPress={clearRepFilt} activeOpacity={0.7}>
            <ChevronRight size={16} color={C.red} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={S.backBtnText}>All reps</Text>
          </TouchableOpacity>

          <View style={S.repDetailHeader}>
            <Avatar name={rd.rep} idx={repIdx} size={44} />
            <View>
              <Text style={S.repDetailName}>{rd.rep}</Text>
              <Text style={S.repDetailCount}>{rd.jobs} job{rd.jobs !== 1 ? 's' : ''} on record</Text>
            </View>
          </View>

          <View style={S.dashGrid}>
            <SummaryCard label="Total Jobs"     value={rd.jobs}        icon={ClipboardList} accent={C.red} />
            <SummaryCard label="Service"        value={fmt(rd.sc)}     icon={DollarSign}    accent={C.purple} />
            <SummaryCard label="Spare"          value={fmt(rd.sp)}     icon={DollarSign}    accent={C.pink} />
            <SummaryCard label="Total"          value={fmt(rd.tot)}    icon={DollarSign}    accent={C.success} />
            <SummaryCard label="Advance"        value={fmt(rd.adv)}    icon={DollarSign}    accent={C.blue} />
            <SummaryCard label="Margin"         value={fmt(rd.mg)}     icon={TrendingUp}    accent={C.warning} />
            <SummaryCard label="Instagram Yes"  value={rd.insta}       icon={Instagram}     accent={C.red} />
            <SummaryCard label="Google Yes"     value={rd.google}      icon={Star}          accent={C.warning} />
          </View>

          <View style={S.statusContainer}>
            <Text style={S.statusTitle}>Status distribution</Text>
            <View style={S.statusChipContainer}>
              {Object.entries(rd.statusCount).map(([status, count]) => {
                const sc2 = STATUS_COLORS[status] || DEFAULT_STATUS;
                return (
                  <View key={status} style={[S.statusChip, { backgroundColor: sc2.bg }]}>
                    <View style={[S.statusDot, { backgroundColor: sc2.dot }]} />
                    <Text style={[S.statusChipText, { color: sc2.color }]}>
                      {status} · <Text style={{ fontWeight: '700' }}>{count}</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={S.repDetailTable}>
            <View style={S.repDetailTableHdr}>
              <Text style={S.repDetailTableTitle}>Job details</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <JobHeaders />
                {(data[repFilter] || []).map((job, i) => (
                  <JobRow key={job._id || job.id} job={job} index={i} rep={repFilter} />
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={S.dashContainer} contentContainerStyle={S.dashContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.red]} tintColor={C.red} />}>
        <View style={S.allRepsCard}>
          <View style={S.allRepsHdr}>
            <Text style={S.allRepsTitle}>All sales reps</Text>
            <Text style={S.allRepsSub}>Tap a row to drill in</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={S.overviewHdr}>
                {[
                  [130,'Sales Rep'], [60,'Jobs'], [80,'Service'], [80,'Spare'],
                  [80,'Total'], [80,'Advance'], [80,'Margin'], [54,'Insta'], [54,'Google'],
                ].map(([w, label]) => (
                  <Text key={label} style={[S.overviewHdrText, { width: w, textAlign: w <= 60 ? 'center' : w === 130 ? 'left' : 'right' }]}>
                    {label}
                  </Text>
                ))}
              </View>

              {repSummaries.map((u, idx) => (
                <TouchableOpacity key={u.rep}
                  style={[S.overviewRow, idx % 2 !== 0 && { backgroundColor: C.gray50 }]}
                  onPress={() => setRepFilter(u.rep)} activeOpacity={0.7}>
                  <View style={{ width: 130, flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar name={u.rep} idx={idx} size={28} />
                    <Text style={S.overviewRepName} numberOfLines={1}>{u.rep}</Text>
                  </View>
                  <Text style={[S.overviewRowText, { width: 60, textAlign: 'center', fontWeight: '600', color: C.gray700 }]}>{u.jobs}</Text>
                  <Text style={[S.overviewRowText, { width: 80, textAlign: 'right', color: C.purple }]}>{fmt(u.sc)}</Text>
                  <Text style={[S.overviewRowText, { width: 80, textAlign: 'right', color: C.pink }]}>{fmt(u.sp)}</Text>
                  <Text style={[S.overviewRowText, { width: 80, textAlign: 'right', color: C.success, fontWeight: '700' }]}>{fmt(u.tot)}</Text>
                  <Text style={[S.overviewRowText, { width: 80, textAlign: 'right', color: C.blue }]}>{fmt(u.adv)}</Text>
                  <Text style={[S.overviewRowText, { width: 80, textAlign: 'right', color: C.warning }]}>{fmt(u.mg)}</Text>
                  <Text style={[S.overviewRowText, { width: 54, textAlign: 'center', color: C.red, fontWeight: '600' }]}>{u.insta}</Text>
                  <Text style={[S.overviewRowText, { width: 54, textAlign: 'center', color: C.warning, fontWeight: '600' }]}>{u.google}</Text>
                </TouchableOpacity>
              ))}

              <View style={S.grandTotalRow}>
                <Text style={[S.grandTotalText, { width: 130 }]}>Grand Total</Text>
                <Text style={[S.grandTotalText, { width: 60, textAlign: 'center' }]}>{totals.jobs}</Text>
                <Text style={[S.grandTotalText, { width: 80, textAlign: 'right', color: C.purple }]}>{fmt(totals.service)}</Text>
                <Text style={[S.grandTotalText, { width: 80, textAlign: 'right', color: C.pink }]}>{fmt(totals.spare)}</Text>
                <Text style={[S.grandTotalText, { width: 80, textAlign: 'right', color: C.success }]}>{fmt(grandTotal)}</Text>
                <Text style={[S.grandTotalText, { width: 80, textAlign: 'right', color: C.blue }]}>{fmt(totals.advance)}</Text>
                <Text style={[S.grandTotalText, { width: 80, textAlign: 'right', color: C.warning }]}>{fmt(totals.margin)}</Text>
                <Text style={[S.grandTotalText, { width: 54, textAlign: 'center', color: C.red }]}>{totals.insta}</Text>
                <Text style={[S.grandTotalText, { width: 54, textAlign: 'center', color: C.warning }]}>{totals.google}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={S.container}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerLeft}>
          <View style={S.headerIconWrap}>
            <BarChart2 size={20} color={C.white} />
          </View>
          <View>
            <Text style={S.headerTitle}>Sales Rep Report</Text>
            <Text style={S.headerSub}>{totals.reps} rep{totals.reps !== 1 ? 's' : ''} · {totals.jobs} job{totals.jobs !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={S.viewToggle}>
          <TouchableOpacity style={[S.toggleBtn, view === 'table' && S.toggleActive]} onPress={setTableView} activeOpacity={0.8}>
            <FileText size={13} color={view === 'table' ? C.white : C.gray500} />
            <Text style={[S.toggleText, view === 'table' && { color: C.white }]}>Table</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.toggleBtn, view === 'dashboard' && S.toggleActive]} onPress={setDashView} activeOpacity={0.8}>
            <BarChart2 size={13} color={view === 'dashboard' ? C.white : C.gray500} />
            <Text style={[S.toggleText, view === 'dashboard' && { color: C.white }]}>Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Strip */}
      <View style={S.summaryStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.summaryContent}>
          <SummaryCard label="Total Reps"  value={totals.reps}          icon={Users}        accent={C.red} />
          <SummaryCard label="Total Jobs"  value={totals.jobs}          icon={ClipboardList} accent={C.red} />
          <SummaryCard label="Today"       value={totals.todayJobs}     icon={Clock}        accent={C.gray700} />
          <SummaryCard label="Service"     value={fmt(totals.service)}  icon={DollarSign}   accent={C.purple} />
          <SummaryCard label="Spare"       value={fmt(totals.spare)}    icon={DollarSign}   accent={C.pink} />
          <SummaryCard label="Grand Total" value={fmt(grandTotal)}      icon={DollarSign}   accent={C.success} />
          <SummaryCard label="Advance"     value={fmt(totals.advance)}  icon={DollarSign}   accent={C.blue} />
          <SummaryCard label="Margin"      value={fmt(totals.margin)}   icon={TrendingUp}   accent={C.warning} />
          <SummaryCard label="Instagram"   value={totals.insta}         icon={Instagram}    accent={C.red} />
          <SummaryCard label="Google"      value={totals.google}        icon={Star}         accent={C.warning} />
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={S.filterContainer}>
        <View style={S.searchWrap}>
          <Search size={17} color={C.gray400} />
          <TextInput
            style={S.searchInput}
            placeholder="Search sales rep..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholderTextColor={C.gray400}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={8}><X size={15} color={C.gray400} /></TouchableOpacity>
          )}
        </View>

        <View style={S.dateRow}>
          <View style={S.dateWrap}>
            <Calendar size={15} color={C.gray400} />
            <TextInput style={S.dateInput} placeholder="From" value={fromDate} onChangeText={setFromDate} placeholderTextColor={C.gray400} />
          </View>
          <View style={S.dateWrap}>
            <Calendar size={15} color={C.gray400} />
            <TextInput style={S.dateInput} placeholder="To" value={toDate} onChangeText={setToDate} placeholderTextColor={C.gray400} />
          </View>
        </View>

        <View style={S.actionRow}>
          <TouchableOpacity style={S.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
            <Filter size={15} color={C.white} />
            <Text style={S.searchBtnText}>Search</Text>
          </TouchableOpacity>
          {(searchText || fromDate || toDate) && (
            <TouchableOpacity style={S.clearBtn} onPress={handleClear} activeOpacity={0.85}>
              <X size={15} color={C.gray500} />
              <Text style={S.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={S.exportBtn} onPress={handleExport} activeOpacity={0.85}>
            <Download size={15} color={C.white} />
            <Text style={S.exportBtnText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.refreshBtn} onPress={onRefresh} activeOpacity={0.85}>
            <RefreshCw size={16} color={C.red} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={S.loaderWrap}>
          <ActivityIndicator size="large" color={C.red} />
          <Text style={S.loaderText}>Loading report…</Text>
        </View>
      ) : view === 'table' ? renderTableView() : renderDashboard()}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.gray50 },

  // header
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrap: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.red, justifyContent: 'center', alignItems: 'center', ...softShadow },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: C.gray900, letterSpacing: -0.2 },
  headerSub:      { fontSize: 11.5, fontWeight: '500', color: C.gray400, marginTop: 1 },

  // toggle
  viewToggle:     { flexDirection: 'row', backgroundColor: C.gray100, borderRadius: 10, padding: 3 },
  toggleBtn:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8, gap: 4 },
  toggleActive:   { backgroundColor: C.red, ...softShadow },
  toggleText:     { fontSize: 12, fontWeight: '600', color: C.gray500 },

  // summary strip
  summaryStrip:   { backgroundColor: C.white, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  summaryContent: { paddingHorizontal: 16, gap: 10 },
  summaryCard:    { flexDirection: 'row', backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.gray200, minWidth: 118, overflow: 'hidden', ...softShadow },
  summaryAccentBar: { width: 4 },
  summaryCardBody:{ paddingHorizontal: 12, paddingVertical: 10, flex: 1 },
  summaryCardHeader:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  summaryIconWrap:{ width: 24, height: 24, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  summaryLabel:   { fontSize: 10, fontWeight: '600', color: C.gray500, textTransform: 'uppercase', letterSpacing: 0.4 },
  summaryValue:   { fontSize: 17, fontWeight: '700', color: C.gray900, letterSpacing: -0.2 },

  // filters
  filterContainer:{ backgroundColor: C.white, padding: 12, borderBottomWidth: 1, borderBottomColor: C.gray200, gap: 8 },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray50, borderRadius: 11, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: C.gray200, gap: 8 },
  searchInput:    { flex: 1, fontSize: 14, color: C.gray900, height: 42 },
  dateRow:        { flexDirection: 'row', gap: 8 },
  dateWrap:       { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray50, borderRadius: 11, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: C.gray200, gap: 6 },
  dateInput:      { flex: 1, fontSize: 13, color: C.gray900, height: 40 },
  actionRow:      { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.red, paddingHorizontal: 16, height: 40, borderRadius: 11, gap: 6, flex: 1, justifyContent: 'center' },
  searchBtnText:  { fontSize: 14, fontWeight: '600', color: C.white },
  clearBtn:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 40, borderRadius: 11, gap: 4, borderWidth: 1, borderColor: C.gray200 },
  clearBtnText:   { fontSize: 13, fontWeight: '500', color: C.gray500 },
  exportBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.success, paddingHorizontal: 14, height: 40, borderRadius: 11, gap: 6 },
  exportBtnText:  { fontSize: 13, fontWeight: '600', color: C.white },
  refreshBtn:     { width: 40, height: 40, borderRadius: 11, backgroundColor: C.redLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.redMid },

  // loader / empty
  loaderWrap:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText:     { fontSize: 14, fontWeight: '500', color: C.gray400 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 10 },
  emptyIconWrap:  { width: 76, height: 76, borderRadius: 38, backgroundColor: C.gray100, justifyContent: 'center', alignItems: 'center' },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: C.gray700 },
  emptySubtitle:  { fontSize: 13, color: C.gray400, textAlign: 'center' },

  // list
  listContent:    { padding: 12, paddingBottom: 80 },

  // rep card
  repCard:        { backgroundColor: C.white, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: C.gray200, overflow: 'hidden', ...shadow },
  repHeader:      { padding: 14, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  repHeaderTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  repHeaderLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chevronWrap:    { width: 28, height: 28, borderRadius: 8, backgroundColor: C.gray50, justifyContent: 'center', alignItems: 'center' },
  repName:        { fontSize: 15, fontWeight: '700', color: C.gray900 },
  repJobCount:    { fontSize: 12, fontWeight: '500', color: C.gray400, marginTop: 1 },
  repMetricsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metricChip:     { borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6, minWidth: 76 },
  metricChipLabel:{ fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, opacity: 0.85, marginBottom: 2 },
  metricChipValue:{ fontSize: 13, fontWeight: '700' },

  // table
  headerRow:      { flexDirection: 'row', backgroundColor: C.redLight, paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.redMid },
  headerText:     { fontSize: 10, fontWeight: '700', color: C.redDark, textTransform: 'uppercase', letterSpacing: 0.3 },
  jobRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: C.gray100 },
  jCell:          { fontSize: 12, fontWeight: '400', color: C.gray600 },
  jIdx:           { width: 30, color: C.gray400 },
  jSheet:         { width: 80, fontWeight: '700', color: C.red },
  jRepBadge:      { width: 76, backgroundColor: C.successLt, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  jRepText:       { fontSize: 10.5, fontWeight: '600', color: '#065F46' },
  jCreatorBadge:  { width: 76, backgroundColor: C.redLight, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  jCreatorText:   { fontSize: 10.5, fontWeight: '600', color: C.redDark },
  jAmt:           { width: 70, fontSize: 11.5, fontWeight: '500', textAlign: 'right' },
  jTot:           { color: C.success, fontWeight: '700' },
  subtotalRow:    { flexDirection: 'row', backgroundColor: C.redLight, paddingVertical: 9, paddingHorizontal: 10, borderTopWidth: 1.5, borderTopColor: C.redMid },
  subtotalText:   { fontSize: 11.5, fontWeight: '700', color: C.redDark },

  // social
  socialText:     { fontSize: 11, fontWeight: '600', color: C.gray500 },
  socialYes:      { color: C.success },
  socialNo:       { color: C.red },
  socialDone:     { color: C.blue },

  // status badge
  statusBadge:    { width: 78, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12 },
  statusDot:      { width: 6, height: 6, borderRadius: 3 },
  statusBadgeText:{ fontSize: 9.5, fontWeight: '700', flexShrink: 1 },

  // avatar
  avatar:         { justifyContent: 'center', alignItems: 'center' },
  avatarText:     { fontWeight: '700' },

  // dashboard
  dashContainer:  { flex: 1 },
  dashContent:    { padding: 12, paddingBottom: 32 },
  dashGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  backBtn:        { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 4, alignSelf: 'flex-start' },
  backBtnText:    { fontSize: 14, fontWeight: '600', color: C.red },
  repDetailHeader:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, backgroundColor: C.white, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.gray200, ...softShadow },
  repDetailName:  { fontSize: 18, fontWeight: '700', color: C.gray900, letterSpacing: -0.2 },
  repDetailCount: { fontSize: 13, fontWeight: '500', color: C.gray400, marginTop: 1 },

  statusContainer:{ backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.gray200, ...softShadow },
  statusTitle:    { fontSize: 12.5, fontWeight: '700', color: C.gray700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
  statusChipContainer:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusChipText: { fontSize: 12, fontWeight: '500' },

  repDetailTable: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.gray200, overflow: 'hidden', ...softShadow },
  repDetailTableHdr:{ padding: 14, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  repDetailTableTitle:{ fontSize: 14, fontWeight: '700', color: C.gray900 },

  // overview
  allRepsCard:    { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.gray200, overflow: 'hidden', ...softShadow },
  allRepsHdr:     { padding: 14, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  allRepsTitle:   { fontSize: 15, fontWeight: '700', color: C.gray900 },
  allRepsSub:     { fontSize: 12, fontWeight: '500', color: C.gray400, marginTop: 2 },
  overviewHdr:    { flexDirection: 'row', backgroundColor: C.redLight, paddingVertical: 9, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.redMid },
  overviewHdrText:{ fontSize: 11, fontWeight: '700', color: C.redDark, textTransform: 'uppercase', letterSpacing: 0.3 },
  overviewRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.gray100, backgroundColor: C.white },
  overviewRepName:{ fontSize: 13, fontWeight: '600', color: C.gray700, marginLeft: 8 },
  overviewRowText:{ fontSize: 12, color: C.gray600 },
  grandTotalRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.redLight, paddingVertical: 10, paddingHorizontal: 8, borderTopWidth: 1.5, borderTopColor: C.redMid },
  grandTotalText: { fontSize: 13, fontWeight: '700', color: C.redDark },
});