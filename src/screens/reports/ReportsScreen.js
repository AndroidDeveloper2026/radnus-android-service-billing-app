// // src/screens/reports/ReportsScreen.js
// import React, { useState } from 'react';
// import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import DatePicker from 'react-native-date-picker';
// import { fetchEngineerWiseReport, fetchValueReport, fetchSpareReport, fetchDealerReport } from '../../store/slices/reportSlice';
// import { fetchJobs } from '../../store/slices/jobSlice';
// import { Button, Input, SelectModal, StatusChip, EmptyState, LoadingOverlay } from '../../components/UI';
// import { COLORS, SPACING, FONTS } from '../../utils/theme';

// export default function ReportsScreen() {
//   const dispatch = useDispatch();
//   const { engineerReport, noEngineerJobs, valueReport, spareReport, dealerReport, loading } = useSelector(state => state.reports);
//   const { engineers } = useSelector(state => state.admin);
//   const [reportType, setReportType] = useState('engineer');
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedEngineer, setSelectedEngineer] = useState('');
//   const [dealerName, setDealerName] = useState('');
//   const [openFrom, setOpenFrom] = useState(false);
//   const [openTo, setOpenTo] = useState(false);
//   const [tempFrom, setTempFrom] = useState(new Date());
//   const [tempTo, setTempTo] = useState(new Date());

//   const loadReport = () => {
//     const filters = { fromDate, toDate };
//     if (reportType === 'engineer') dispatch(fetchEngineerWiseReport(filters));
//     else if (reportType === 'value') dispatch(fetchValueReport(filters));
//     else if (reportType === 'spare') dispatch(fetchSpareReport({ ...filters, engineerId: selectedEngineer }));
//     else if (reportType === 'dealer') dispatch(fetchDealerReport({ dealerName, fromDate, toDate }));
//     else if (reportType === 'all') dispatch(fetchJobs(filters));
//   };

//   const renderEngineerReport = () => (
//     <ScrollView>
//       {noEngineerJobs.length > 0 && (
//         <View style={{ marginBottom: SPACING.lg }}>
//           <Text style={[FONTS.semibold, { fontSize: 18, marginBottom: SPACING.md }]}>No Engineer ({noEngineerJobs.length} jobs)</Text>
//           {noEngineerJobs.map(job => <JobRow key={job.id} job={job} />)}
//         </View>
//       )}
//       {engineerReport.map(eng => (
//         <View key={eng.engineer} style={{ marginBottom: SPACING.lg }}>
//           <Text style={[FONTS.semibold, { fontSize: 18, marginBottom: SPACING.md }]}>{eng.engineer} ({eng.jobs.length} jobs)</Text>
//           {eng.jobs.map(job => <JobRow key={job.id} job={job} />)}
//         </View>
//       ))}
//     </ScrollView>
//   );

//   const JobRow = ({ job }) => (
//     <View style={{ backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 8 }}>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//         <Text style={[FONTS.semibold]}>{job.customerName}</Text>
//         <StatusChip status={job.status} />
//       </View>
//       <Text>{job.contact}</Text>
//       <Text style={{ fontSize: 12, color: COLORS.gray }}>Saved: {job.savedDate} | Delivered: {job.deliveredDate || '-'}</Text>
//     </View>
//   );

//   const renderValueReport = () => (
//     <FlatList
//       data={valueReport}
//       keyExtractor={(item, idx) => idx.toString()}
//       renderItem={({ item }) => (
//         <View style={{ backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
//           <View><Text style={[FONTS.semibold]}>{item.jobNo}</Text><Text>{item.name}</Text></View>
//           <View><Text>Service: ₹{item.service}</Text><Text>Spare: ₹{item.spare}</Text><Text style={{ fontWeight: 'bold' }}>Total: ₹{item.total}</Text></View>
//         </View>
//       )}
//       ListEmptyComponent={<EmptyState />}
//     />
//   );

//   const renderSpareReport = () => (
//     <FlatList
//       data={spareReport}
//       keyExtractor={(item, idx) => idx.toString()}
//       renderItem={({ item }) => (
//         <View style={{ backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
//           <View><Text style={[FONTS.semibold]}>{item.jobSheet}</Text><Text>{item.spare}</Text></View>
//           <View><Text>Qty: {item.qty}</Text><Text>Rate: ₹{item.rate}</Text><Text>Amount: ₹{item.amount}</Text></View>
//         </View>
//       )}
//       ListEmptyComponent={<EmptyState />}
//     />
//   );

//   const renderDealerReport = () => (
//     <FlatList
//       data={dealerReport}
//       keyExtractor={(item, idx) => idx.toString()}
//       renderItem={({ item }) => (
//         <View style={{ backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 8 }}>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//             <Text style={[FONTS.semibold]}>{item.customerName}</Text>
//             <StatusChip status={item.status} />
//           </View>
//           <Text>{item.contact}</Text>
//           <Text>Dealer: {item.dealerName || '-'} | Engineer: {item.engineerId}</Text>
//         </View>
//       )}
//       ListEmptyComponent={<EmptyState />}
//     />
//   );

//   const renderAllReport = () => {
//     const { list, loading: jobsLoading } = useSelector(state => state.jobs);
//     return (
//       <FlatList
//         data={list}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <View style={{ backgroundColor: COLORS.white, padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 8 }}>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//               <Text style={[FONTS.semibold]}>{item.jobNo} - {item.customerName}</Text>
//               <StatusChip status={item.status} />
//             </View>
//             <Text>{item.contact}</Text>
//             <Text>Engineer: {item.engineerId} | Model: {item.modelId}</Text>
//             <Text>Problem: {item.remarks?.substring(0, 50)}</Text>
//           </View>
//         )}
//         ListEmptyComponent={<EmptyState />}
//       />
//     );
//   };

//   const reportTypes = [
//     { id: 'engineer', name: 'Engineer Report' },
//     { id: 'value', name: 'Value Report' },
//     { id: 'spare', name: 'Spare Report' },
//     { id: 'dealer', name: 'Dealer Report' },
//     { id: 'all', name: 'All Reports' },
//   ];

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: COLORS.lightGray, padding: SPACING.lg }}>
//       <View style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.lg, marginBottom: SPACING.lg }}>
//         <Text style={[FONTS.bold, { fontSize: 20, marginBottom: SPACING.md }]}>Report Dashboard</Text>
//         <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
//           {reportTypes.map(type => (
//             <TouchableOpacity key={type.id} onPress={() => setReportType(type.id)} style={{ backgroundColor: reportType === type.id ? COLORS.primary : COLORS.lightGray, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, marginRight: SPACING.sm, marginBottom: SPACING.sm }}>
//               <Text style={{ color: reportType === type.id ? COLORS.white : COLORS.dark }}>{type.name}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
//           <TouchableOpacity onPress={() => setOpenFrom(true)} style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, marginRight: SPACING.sm }}>
//             <Text>{fromDate || 'From Date'}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setOpenTo(true)} style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md }}>
//             <Text>{toDate || 'To Date'}</Text>
//           </TouchableOpacity>
//         </View>
//         <DatePicker modal open={openFrom} date={tempFrom} onConfirm={date => { setOpenFrom(false); setTempFrom(date); setFromDate(date.toISOString().split('T')[0]); }} onCancel={() => setOpenFrom(false)} />
//         <DatePicker modal open={openTo} date={tempTo} onConfirm={date => { setOpenTo(false); setTempTo(date); setToDate(date.toISOString().split('T')[0]); }} onCancel={() => setOpenTo(false)} />
        
//         {reportType === 'spare' && (
//           <SelectModal label="Select Engineer" value={selectedEngineer} options={engineers} onSelect={setSelectedEngineer} placeholder="All Engineers" style={{ marginBottom: SPACING.md }} />
//         )}
//         {reportType === 'dealer' && (
//           <Input label="Dealer Name" value={dealerName} onChangeText={setDealerName} placeholder="Enter dealer name" style={{ marginBottom: SPACING.md }} />
//         )}
        
//         <Button title="Load Report" onPress={loadReport} />
//       </View>
      
//       {reportType === 'engineer' && renderEngineerReport()}
//       {reportType === 'value' && renderValueReport()}
//       {reportType === 'spare' && renderSpareReport()}
//       {reportType === 'dealer' && renderDealerReport()}
//       {reportType === 'all' && renderAllReport()}
//       <LoadingOverlay visible={loading} />
//     </ScrollView>
//   );
// }

//==============================

// src/screens/reports/ReportsScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import { fetchEngineerWiseReport, fetchValueReport, fetchSpareReport, fetchDealerReport } from '../../store/slices/reportSlice';
import { fetchJobs } from '../../store/slices/jobSlice';
import { Button, Input, SelectModal, StatusChip, EmptyState, LoadingOverlay } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';

export default function ReportsScreen() {
  const dispatch = useDispatch();
  
  const { engineerReport, noEngineerJobs, valueReport, spareReport, dealerReport, loading } = useSelector(state => state.reports);
  const { engineers } = useSelector(state => state.admin);
  const { list } = useSelector(state => state.jobs);
  
  const [reportType, setReportType] = useState('engineer');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [tempFrom, setTempFrom] = useState(new Date());
  const [tempTo, setTempTo] = useState(new Date());

  const loadReport = () => {
    const filters = { fromDate, toDate };
    if (reportType === 'engineer') dispatch(fetchEngineerWiseReport(filters));
    else if (reportType === 'value') dispatch(fetchValueReport(filters));
    else if (reportType === 'spare') dispatch(fetchSpareReport({ ...filters, engineerId: selectedEngineer }));
    else if (reportType === 'dealer') dispatch(fetchDealerReport({ dealerName, fromDate, toDate }));
    else if (reportType === 'all') dispatch(fetchJobs(filters));
  };

  const JobRow = ({ job }) => (
    <View style={styles.jobRow}>
      <View style={styles.jobRowHeader}>
        <Text style={styles.jobCustomer}>{job.customerName}</Text>
        <StatusChip status={job.status} />
      </View>
      <Text style={styles.jobContact}>{job.contact}</Text>
      <Text style={styles.jobDate}>Saved: {job.savedDate} | Delivered: {job.deliveredDate || '-'}</Text>
    </View>
  );

  const renderFilterCard = () => (
    <View style={styles.filterCard}>
      <Text style={styles.cardTitle}>Report Dashboard</Text>
      
      <View style={styles.tagsContainer}>
        {[
          { id: 'engineer', name: 'Engineer Report' },
          { id: 'value', name: 'Value Report' },
          { id: 'spare', name: 'Spare Report' },
          { id: 'dealer', name: 'Dealer Report' },
          { id: 'all', name: 'All Reports' },
        ].map(type => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setReportType(type.id)}
            style={[styles.tag, reportType === type.id && styles.tagActive]}
          >
            <Text style={[styles.tagText, reportType === type.id && styles.tagTextActive]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => setOpenFrom(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{fromDate || 'From Date'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOpenTo(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{toDate || 'To Date'}</Text>
        </TouchableOpacity>
      </View>

      <DatePicker
        modal
        open={openFrom}
        date={tempFrom}
        onConfirm={date => {
          setOpenFrom(false);
          setTempFrom(date);
          setFromDate(date.toISOString().split('T')[0]);
        }}
        onCancel={() => setOpenFrom(false)}
      />
      <DatePicker
        modal
        open={openTo}
        date={tempTo}
        onConfirm={date => {
          setOpenTo(false);
          setTempTo(date);
          setToDate(date.toISOString().split('T')[0]);
        }}
        onCancel={() => setOpenTo(false)}
      />

      {reportType === 'spare' && (
        <SelectModal
          label="Select Engineer"
          value={selectedEngineer}
          options={engineers}
          onSelect={(id) => {
            const eng = engineers.find(e => e.id === id);
            setSelectedEngineer(eng ? eng.name : '');
          }}
          placeholder="All Engineers"
          style={styles.selectMargin}
        />
      )}

      {reportType === 'dealer' && (
        <Input
          label="Dealer Name"
          value={dealerName}
          onChangeText={setDealerName}
          placeholder="Enter dealer name"
          style={styles.selectMargin}
        />
      )}

      <Button title="Load Report" onPress={loadReport} style={styles.loadButton} />
    </View>
  );

  // Different data sources based on report type
  const getReportData = () => {
    switch (reportType) {
      case 'engineer':
        // For engineer report, we need to flatten sections
        const sections = [];
        if (noEngineerJobs?.length > 0) {
          sections.push({ type: 'header', title: `No Engineer (${noEngineerJobs.length} jobs)`, data: noEngineerJobs });
        }
        engineerReport?.forEach(eng => {
          sections.push({ type: 'header', title: `${eng.engineer} (${eng.jobs.length} jobs)`, data: eng.jobs });
        });
        return { type: 'sections', data: sections };
      case 'value':
        return { type: 'flat', data: valueReport };
      case 'spare':
        return { type: 'flat', data: spareReport };
      case 'dealer':
        return { type: 'flat', data: dealerReport };
      case 'all':
        return { type: 'flat', data: list };
      default:
        return { type: 'flat', data: [] };
    }
  };

  const renderSectionHeader = ({ item }) => (
    <Text style={styles.sectionTitle}>{item.title}</Text>
  );

  const renderEngineerJob = ({ item }) => <JobRow job={item} />;

  const renderValueItem = ({ item }) => (
    <View style={styles.valueRow}>
      <View>
        <Text style={styles.valueJobNo}>{item.jobNo}</Text>
        <Text style={styles.valueName}>{item.name}</Text>
      </View>
      <View>
        <Text>Service: ₹{item.service}</Text>
        <Text>Spare: ₹{item.spare}</Text>
        <Text style={styles.valueTotal}>Total: ₹{item.total}</Text>
      </View>
    </View>
  );

  const renderSpareItem = ({ item }) => (
    <View style={styles.spareRow}>
      <View>
        <Text style={styles.spareJobSheet}>{item.jobSheet}</Text>
        <Text>{item.spare}</Text>
      </View>
      <View>
        <Text>Qty: {item.qty}</Text>
        <Text>Rate: ₹{item.rate}</Text>
        <Text style={styles.spareAmount}>Amount: ₹{item.amount}</Text>
      </View>
    </View>
  );

  const renderDealerItem = ({ item }) => (
    <View style={styles.dealerRow}>
      <View style={styles.dealerHeader}>
        <Text style={styles.dealerCustomer}>{item.customerName}</Text>
        <StatusChip status={item.status} />
      </View>
      <Text>{item.contact}</Text>
      <Text>Dealer: {item.dealerName || '-'} | Engineer: {item.engineerId}</Text>
    </View>
  );

  const renderAllItem = ({ item }) => (
    <View style={styles.allRow}>
      <View style={styles.allHeader}>
        <Text style={styles.allJobNo}>{item.jobNo} - {item.customerName}</Text>
        <StatusChip status={item.status} />
      </View>
      <Text>{item.contact}</Text>
      <Text>Engineer: {item.engineerId} | Model: {item.modelId}</Text>
      <Text>Problem: {item.remarks?.substring(0, 50)}</Text>
    </View>
  );

  const { type, data } = getReportData();

  if (type === 'sections') {
    // For engineer report with sections
    const flattenedData = [];
    data.forEach(section => {
      flattenedData.push({ type: 'sectionHeader', title: section.title });
      section.data.forEach(job => {
        flattenedData.push({ type: 'job', job });
      });
    });

    return (
      <View style={styles.container}>
        <FlatList
          data={flattenedData}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={({ item }) => {
            if (item.type === 'sectionHeader') {
              return <Text style={styles.sectionTitle}>{item.title}</Text>;
            }
            return <JobRow job={item.job} />;
          }}
          ListHeaderComponent={renderFilterCard}
          ListFooterComponent={<LoadingOverlay visible={loading} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  // For flat list reports (value, spare, dealer, all)
  let renderItem;
  if (reportType === 'value') renderItem = renderValueItem;
  else if (reportType === 'spare') renderItem = renderSpareItem;
  else if (reportType === 'dealer') renderItem = renderDealerItem;
  else renderItem = renderAllItem;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderFilterCard}
        ListFooterComponent={<LoadingOverlay visible={loading} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  filterCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 20,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagActive: {
    backgroundColor: COLORS.primary,
  },
  tagText: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.gray700,
  },
  tagTextActive: {
    color: COLORS.white,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  dateText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray600,
  },
  selectMargin: {
    marginBottom: SPACING.md,
  },
  loadButton: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    ...FONTS.semibold,
    fontSize: 18,
    color: COLORS.gray900,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  jobRow: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  jobRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  jobCustomer: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
  },
  jobContact: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  jobDate: {
    ...FONTS.regular,
    fontSize: 11,
    color: COLORS.gray400,
  },
  valueRow: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...SHADOWS.small,
  },
  valueJobNo: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
  },
  valueName: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.gray600,
  },
  valueTotal: {
    ...FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
  },
  spareRow: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...SHADOWS.small,
  },
  spareJobSheet: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
  },
  spareAmount: {
    ...FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
  },
  dealerRow: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  dealerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dealerCustomer: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
  },
  allRow: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  allHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  allJobNo: {
    ...FONTS.semibold,
    fontSize: 14,
    color: COLORS.gray900,
  },
});