// // src/screens/admin/AdminScreens.js
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   TextInput,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';
// import {
//   Trash2,
//   Plus,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   Edit2,
//   Users,
//   FileText,
// } from 'lucide-react-native';
// import {
//   fetchMakes,
//   addMake,
//   deleteMake,
//   fetchModels,
//   addModel,
//   deleteModel,
//   fetchFaults,
//   addFault,
//   deleteFault,
//   fetchDrawers,
//   addDrawer,
//   deleteDrawer,
//   fetchEngineers,
//   addEngineer,
//   deleteEngineer,
//   updateEngineer,
// } from '../../store/slices/adminSlice';
// import { SelectModal, LoadingOverlay } from '../../components/UI';
// import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';
// import { useAuth } from '../../context/AuthContext';
// import AddItemModal from './AddItemModal';

// const SECTIONS = [
//   {
//     key: 'makes',
//     title: 'Make Master',
//     type: 'make',
//     placeholder: 'Search Make',
//   },
//   {
//     key: 'models',
//     title: 'Model Master',
//     type: 'model',
//     placeholder: 'Search model...',
//   },
//   {
//     key: 'faults',
//     title: 'Fault Master',
//     type: 'fault',
//     placeholder: 'Search fault...',
//   },
//   {
//     key: 'drawers',
//     title: 'Drawer Master',
//     type: 'drawer',
//     placeholder: 'Search drawer...',
//   },
//   {
//     key: 'engineers',
//     title: 'Engineer Master',
//     type: 'engineer',
//     placeholder: 'Search engineer...',
//   },
// ];

// export default function AdminScreens() {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const toast = useToast();
//   const { user } = useAuth();
//   const { makes, models, faults, drawers, engineers, loading } = useSelector(
//     state => state.admin,
//   );
//   const isAdmin = user?.role === 'admin';

//   const [expandedSections, setExpandedSections] = useState({
//     makes: true,
//     models: false,
//     faults: false,
//     drawers: false,
//     engineers: false,
//   });

//   const [makeSearch, setMakeSearch] = useState('');
//   const [modelSearch, setModelSearch] = useState('');
//   const [faultSearch, setFaultSearch] = useState('');
//   const [drawerSearch, setDrawerSearch] = useState('');
//   const [engineerSearch, setEngineerSearch] = useState('');

//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [selectedMakeForModel, setSelectedMakeForModel] = useState('');
//   const [selectedMakeId, setSelectedMakeId] = useState('');

//   useEffect(() => {
//     dispatch(fetchMakes());
//     dispatch(fetchModels());
//     dispatch(fetchFaults());
//     dispatch(fetchDrawers());
//     dispatch(fetchEngineers());
//   }, []);

//   const refreshMaster = useCallback(
//     type => {
//       switch (type) {
//         case 'make':
//           dispatch(fetchMakes());
//           break;
//         case 'model':
//           dispatch(fetchModels());
//           break;
//         case 'fault':
//           dispatch(fetchFaults());
//           break;
//         case 'drawer':
//           dispatch(fetchDrawers());
//           break;
//         case 'engineer':
//           dispatch(fetchEngineers());
//           break;
//       }
//     },
//     [dispatch],
//   );

//   const toggleSection = key => {
//     setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const openAddModal = useCallback((type, makeId = null) => {
//     setModalType(type);
//     setSelectedMakeForModel(makeId || '');
//     setModalVisible(true);
//   }, []);

//   const closeModal = useCallback(() => {
//     setModalVisible(false);
//     setModalType('');
//     setSelectedMakeForModel('');
//   }, []);

//   const handleAddSubmit = useCallback(
//     async inputValue => {
//       if (!inputValue.trim()) {
//         toast.show('Please enter a name', { type: 'danger' });
//         return false;
//       }
//       if (modalType === 'model' && !selectedMakeForModel) {
//         toast.show('Please select a make first', { type: 'danger' });
//         return false;
//       }

//       try {
//         switch (modalType) {
//           case 'make':
//             await dispatch(addMake(inputValue.trim())).unwrap();
//             toast.show('Make added', { type: 'success' });
//             refreshMaster('make');
//             break;
//           case 'model':
//             await dispatch(
//               addModel({
//                 makeId: selectedMakeForModel,
//                 name: inputValue.trim(),
//               }),
//             ).unwrap();
//             toast.show('Model added', { type: 'success' });
//             refreshMaster('model');
//             break;
//           case 'fault':
//             await dispatch(addFault(inputValue.trim())).unwrap();
//             toast.show('Fault added', { type: 'success' });
//             refreshMaster('fault');
//             break;
//           case 'drawer':
//             await dispatch(addDrawer(inputValue.trim())).unwrap();
//             toast.show('Drawer added', { type: 'success' });
//             refreshMaster('drawer');
//             break;
//           case 'engineer':
//             await dispatch(addEngineer(inputValue.trim())).unwrap();
//             toast.show('Engineer added', { type: 'success' });
//             refreshMaster('engineer');
//             break;
//         }
//         return true;
//       } catch (error) {
//         toast.show(error.message || 'Failed to add', { type: 'danger' });
//         return false;
//       }
//     },
//     [dispatch, modalType, selectedMakeForModel, toast, refreshMaster],
//   );

//   const handleDelete = useCallback(
//     (type, id, name) => {
//       Alert.alert('Delete', `Delete "${name}"?`, [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               switch (type) {
//                 case 'make':
//                   await dispatch(deleteMake(id)).unwrap();
//                   toast.show('Make deleted', { type: 'success' });
//                   if (selectedMakeId === id) setSelectedMakeId('');
//                   break;
//                 case 'model':
//                   await dispatch(deleteModel(id)).unwrap();
//                   toast.show('Model deleted', { type: 'success' });
//                   break;
//                 case 'fault':
//                   await dispatch(deleteFault(id)).unwrap();
//                   toast.show('Fault deleted', { type: 'success' });
//                   break;
//                 case 'drawer':
//                   await dispatch(deleteDrawer(id)).unwrap();
//                   toast.show('Drawer deleted', { type: 'success' });
//                   break;
//                 case 'engineer':
//                   await dispatch(deleteEngineer(id)).unwrap();
//                   toast.show('Engineer deleted', { type: 'success' });
//                   break;
//               }
//             } catch (error) {
//               toast.show(error.message || 'Failed to delete', {
//                 type: 'danger',
//               });
//             }
//           },
//         },
//       ]);
//     },
//     [dispatch, selectedMakeId, toast],
//   );

//   const handleEditEngineer = (id, currentName) => {
//     Alert.prompt(
//       'Edit Engineer',
//       'Enter new name',
//       currentName,
//       async newName => {
//         if (newName && newName !== currentName) {
//           try {
//             await dispatch(updateEngineer({ id, name: newName })).unwrap();
//             toast.show('Engineer updated', { type: 'success' });
//             refreshMaster('engineer');
//           } catch (error) {
//             toast.show('Update failed', { type: 'danger' });
//           }
//         }
//       },
//     );
//   };

//   const filteredMakes = useMemo(() => {
//     if (!makeSearch) return makes;
//     return makes.filter(m =>
//       m.name?.toLowerCase().includes(makeSearch.toLowerCase()),
//     );
//   }, [makes, makeSearch]);

//   const filteredModels = useMemo(() => {
//     let filtered = models;
//     if (selectedMakeId)
//       filtered = filtered.filter(m => m.makeId === selectedMakeId);
//     if (modelSearch)
//       filtered = filtered.filter(m =>
//         m.name?.toLowerCase().includes(modelSearch.toLowerCase()),
//       );
//     return filtered;
//   }, [models, selectedMakeId, modelSearch]);

//   const filteredFaults = useMemo(() => {
//     if (!faultSearch) return faults;
//     return faults.filter(f =>
//       f.name?.toLowerCase().includes(faultSearch.toLowerCase()),
//     );
//   }, [faults, faultSearch]);

//   const filteredDrawers = useMemo(() => {
//     if (!drawerSearch) return drawers;
//     return drawers.filter(d =>
//       d.name?.toLowerCase().includes(drawerSearch.toLowerCase()),
//     );
//   }, [drawers, drawerSearch]);

//   const filteredEngineers = useMemo(() => {
//     if (!engineerSearch) return engineers;
//     return engineers.filter(e =>
//       e.name?.toLowerCase().includes(engineerSearch.toLowerCase()),
//     );
//   }, [engineers, engineerSearch]);

//   // ✅ renderItemRow using map() — no nested FlatList
//   const renderItemRow = (item, type) => {
//     const isEngineer = type === 'engineer';
//     return (
//       <View key={String(item.id)} style={styles.listItem}>
//         <Text style={styles.itemName}>{item.name}</Text>
//         <View style={styles.actionButtons}>
//           {isEngineer && (
//             <TouchableOpacity
//               onPress={() => handleEditEngineer(item.id, item.name)}
//               style={styles.editButton}
//             >
//               <Edit2 size={18} color={COLORS.info} />
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity
//             onPress={() => handleDelete(type, item.id, item.name)}
//             style={styles.deleteButton}
//           >
//             <Trash2 size={20} color={COLORS.error} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderSection = ({ item: section }) => {
//     const isExpanded = expandedSections[section.key];
//     let data,
//       searchValue,
//       setSearch,
//       addModalType,
//       extraComponent = null;

//     switch (section.key) {
//       case 'makes':
//         data = filteredMakes;
//         searchValue = makeSearch;
//         setSearch = setMakeSearch;
//         addModalType = 'make';
//         break;
//       case 'models':
//         data = filteredModels;
//         searchValue = modelSearch;
//         setSearch = setModelSearch;
//         addModalType = 'model';
//         extraComponent = (
//           <SelectModal
//             label="Filter by Make"
//             value={selectedMakeId}
//             options={makes}
//             onSelect={setSelectedMakeId}
//             placeholder="All Makes"
//             style={styles.filterSelect}
//           />
//         );
//         break;
//       case 'faults':
//         data = filteredFaults;
//         searchValue = faultSearch;
//         setSearch = setFaultSearch;
//         addModalType = 'fault';
//         break;
//       case 'drawers':
//         data = filteredDrawers;
//         searchValue = drawerSearch;
//         setSearch = setDrawerSearch;
//         addModalType = 'drawer';
//         break;
//       case 'engineers':
//         data = filteredEngineers;
//         searchValue = engineerSearch;
//         setSearch = setEngineerSearch;
//         addModalType = 'engineer';
//         break;
//       default:
//         return null;
//     }

//     return (
//       <View style={styles.sectionCard} key={section.key}>
//         <TouchableOpacity
//           style={styles.sectionHeader}
//           onPress={() => toggleSection(section.key)}
//         >
//           <Text style={styles.sectionTitle}>{section.title}</Text>
//           {isExpanded ? (
//             <ChevronUp size={22} color={COLORS.gray600} />
//           ) : (
//             <ChevronDown size={22} color={COLORS.gray600} />
//           )}
//         </TouchableOpacity>

//         {isExpanded && (
//           <View style={styles.sectionContent}>
//             {/* Search Bar */}
//             <View style={styles.searchContainer}>
//               <Search size={18} color={COLORS.gray400} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder={section.placeholder}
//                 value={searchValue}
//                 onChangeText={setSearch}
//                 placeholderTextColor={COLORS.gray400}
//               />
//             </View>

//             {extraComponent}

//             {/* ✅ FIX: map() instead of nested FlatList */}
//             <View>
//               {data.length === 0 ? (
//                 <Text style={styles.emptyText}>No items found</Text>
//               ) : (
//                 data.map(item => renderItemRow(item, section.type))
//               )}
//             </View>

//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={() => openAddModal(addModalType, selectedMakeId)}
//             >
//               <Plus size={18} color={COLORS.white} />
//               <Text style={styles.addButtonText}>
//                 Add{' '}
//                 {section.type === 'make'
//                   ? 'Make'
//                   : section.type === 'model'
//                   ? 'Model'
//                   : section.type === 'fault'
//                   ? 'Fault'
//                   : section.type === 'drawer'
//                   ? 'Drawer'
//                   : 'Engineer'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {isAdmin && (
//         <View style={styles.adminHeader}>
//           <TouchableOpacity
//             style={styles.adminNavButton}
//             onPress={() => navigation.navigate('UserList')}
//           >
//             <Users size={20} color={COLORS.white} />
//             <Text style={styles.adminNavText}>User List</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.adminNavButton}
//             onPress={() => navigation.navigate('UserReport')}
//           >
//             <FileText size={20} color={COLORS.white} />
//             <Text style={styles.adminNavText}>User Report</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* ✅ Only ONE FlatList at the top level */}
//       <FlatList
//         data={SECTIONS}
//         keyExtractor={item => item.key}
//         renderItem={renderSection}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//       />

//       <AddItemModal
//         visible={modalVisible}
//         type={modalType}
//         makes={makes}
//         selectedMakeId={selectedMakeForModel}
//         onSelectMake={setSelectedMakeForModel}
//         onSubmit={handleAddSubmit}
//         onClose={closeModal}
//       />
//       <LoadingOverlay visible={loading} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.gray50 },
//   adminHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginHorizontal: SPACING.lg,
//     marginTop: SPACING.lg,
//     marginBottom: SPACING.sm,
//     gap: SPACING.md,
//   },
//   adminNavButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     paddingVertical: SPACING.sm,
//     borderRadius: BORDERS.radius.md,
//     gap: SPACING.sm,
//   },
//   adminNavText: { ...FONTS.medium, fontSize: 14, color: COLORS.white },
//   listContent: { padding: SPACING.lg, paddingTop: 16 },
//   sectionCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: BORDERS.radius.lg,
//     marginBottom: SPACING.lg,
//     ...SHADOWS.small,
//     overflow: 'hidden',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: SPACING.md,
//     backgroundColor: COLORS.white,
//   },
//   sectionTitle: { ...FONTS.bold, fontSize: 16, color: COLORS.gray900 },
//   sectionContent: {
//     paddingHorizontal: SPACING.md,
//     paddingBottom: SPACING.md,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.gray100,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.gray50,
//     borderRadius: BORDERS.radius.md,
//     paddingHorizontal: SPACING.md,
//     marginVertical: SPACING.sm,
//     height: 44,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: SPACING.sm,
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray900,
//   },
//   filterSelect: { marginVertical: SPACING.sm },
//   listItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: SPACING.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray100,
//   },
//   itemName: { ...FONTS.regular, fontSize: 14, color: COLORS.gray700 },
//   actionButtons: { flexDirection: 'row', alignItems: 'center' },
//   editButton: { marginRight: SPACING.sm, padding: SPACING.xs },
//   deleteButton: { padding: SPACING.xs },
//   emptyText: {
//     ...FONTS.regular,
//     fontSize: 14,
//     color: COLORS.gray400,
//     textAlign: 'center',
//     paddingVertical: SPACING.md,
//   },
//   addButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.primary,
//     borderRadius: BORDERS.radius.md,
//     paddingVertical: SPACING.sm,
//     marginTop: SPACING.md,
//     gap: SPACING.sm,
//   },
//   addButtonText: { ...FONTS.semibold, fontSize: 13, color: COLORS.white },
// });


//++++++++++++++++++++++++++++

// src/screens/admin/AdminScreens.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Users,
  FileText,
} from 'lucide-react-native';
import {
  fetchMakes,
  addMake,
  deleteMake,
  fetchModels,
  addModel,
  deleteModel,
  fetchFaults,
  addFault,
  deleteFault,
  fetchDrawers,
  addDrawer,
  deleteDrawer,
  fetchEngineers,
  addEngineer,
  deleteEngineer,
  updateEngineer,
} from '../../store/slices/adminSlice';
import { SelectModal } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';
import { useAuth } from '../../context/AuthContext';
import AddItemModal from './AddItemModal';

const SECTIONS = [
  {
    key: 'makes',
    title: 'Make Master',
    type: 'make',
    placeholder: 'Search Make',
  },
  {
    key: 'models',
    title: 'Model Master',
    type: 'model',
    placeholder: 'Search model...',
  },
  {
    key: 'faults',
    title: 'Fault Master',
    type: 'fault',
    placeholder: 'Search fault...',
  },
  {
    key: 'drawers',
    title: 'Drawer Master',
    type: 'drawer',
    placeholder: 'Search drawer...',
  },
  {
    key: 'engineers',
    title: 'Engineer Master',
    type: 'engineer',
    placeholder: 'Search engineer...',
  },
];

export default function AdminScreens() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const toast = useToast();
  const { user } = useAuth();
  const { makes, models, faults, drawers, engineers, loading } = useSelector(
    state => state.admin,
  );
  const isAdmin = user?.role === 'admin';

  const [expandedSections, setExpandedSections] = useState({
    makes: true,
    models: false,
    faults: false,
    drawers: false,
    engineers: false,
  });

  const [makeSearch, setMakeSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [faultSearch, setFaultSearch] = useState('');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [engineerSearch, setEngineerSearch] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedMakeForModel, setSelectedMakeForModel] = useState('');
  const [selectedMakeId, setSelectedMakeId] = useState('');

  useEffect(() => {
    dispatch(fetchMakes());
    dispatch(fetchModels());
    dispatch(fetchFaults());
    dispatch(fetchDrawers());
    dispatch(fetchEngineers());
  }, []);

  const refreshMaster = useCallback(
    type => {
      switch (type) {
        case 'make':
          dispatch(fetchMakes());
          break;
        case 'model':
          dispatch(fetchModels());
          break;
        case 'fault':
          dispatch(fetchFaults());
          break;
        case 'drawer':
          dispatch(fetchDrawers());
          break;
        case 'engineer':
          dispatch(fetchEngineers());
          break;
      }
    },
    [dispatch],
  );

  const toggleSection = key => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openAddModal = useCallback((type, makeId = null) => {
    setModalType(type);
    setSelectedMakeForModel(makeId || '');
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setModalType('');
    setSelectedMakeForModel('');
  }, []);

  const handleAddSubmit = useCallback(
    async inputValue => {
      if (!inputValue.trim()) {
        toast.show('Please enter a name', { type: 'danger' });
        return false;
      }
      if (modalType === 'model' && !selectedMakeForModel) {
        toast.show('Please select a make first', { type: 'danger' });
        return false;
      }

      try {
        switch (modalType) {
          case 'make':
            await dispatch(addMake(inputValue.trim())).unwrap();
            toast.show('Make added', { type: 'success' });
            refreshMaster('make');
            break;
          case 'model':
            await dispatch(
              addModel({
                makeId: selectedMakeForModel,
                name: inputValue.trim(),
              }),
            ).unwrap();
            toast.show('Model added', { type: 'success' });
            refreshMaster('model');
            break;
          case 'fault':
            await dispatch(addFault(inputValue.trim())).unwrap();
            toast.show('Fault added', { type: 'success' });
            refreshMaster('fault');
            break;
          case 'drawer':
            await dispatch(addDrawer(inputValue.trim())).unwrap();
            toast.show('Drawer added', { type: 'success' });
            refreshMaster('drawer');
            break;
          case 'engineer':
            await dispatch(addEngineer(inputValue.trim())).unwrap();
            toast.show('Engineer added', { type: 'success' });
            refreshMaster('engineer');
            break;
        }
        return true;
      } catch (error) {
        toast.show(error.message || 'Failed to add', { type: 'danger' });
        return false;
      }
    },
    [dispatch, modalType, selectedMakeForModel, toast, refreshMaster],
  );

  const handleDelete = useCallback(
    (type, id, name) => {
      Alert.alert('Delete', `Delete "${name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              switch (type) {
                case 'make':
                  await dispatch(deleteMake(id)).unwrap();
                  toast.show('Make deleted', { type: 'success' });
                  if (selectedMakeId === id) setSelectedMakeId('');
                  break;
                case 'model':
                  await dispatch(deleteModel(id)).unwrap();
                  toast.show('Model deleted', { type: 'success' });
                  break;
                case 'fault':
                  await dispatch(deleteFault(id)).unwrap();
                  toast.show('Fault deleted', { type: 'success' });
                  break;
                case 'drawer':
                  await dispatch(deleteDrawer(id)).unwrap();
                  toast.show('Drawer deleted', { type: 'success' });
                  break;
                case 'engineer':
                  await dispatch(deleteEngineer(id)).unwrap();
                  toast.show('Engineer deleted', { type: 'success' });
                  break;
              }
            } catch (error) {
              toast.show(error.message || 'Failed to delete', {
                type: 'danger',
              });
            }
          },
        },
      ]);
    },
    [dispatch, selectedMakeId, toast],
  );

  const handleEditEngineer = (id, currentName) => {
    Alert.prompt(
      'Edit Engineer',
      'Enter new name',
      currentName,
      async newName => {
        if (newName && newName !== currentName) {
          try {
            await dispatch(updateEngineer({ id, name: newName })).unwrap();
            toast.show('Engineer updated', { type: 'success' });
            refreshMaster('engineer');
          } catch (error) {
            toast.show('Update failed', { type: 'danger' });
          }
        }
      },
    );
  };

  const filteredMakes = useMemo(() => {
    if (!makeSearch) return makes;
    return makes.filter(m =>
      m.name?.toLowerCase().includes(makeSearch.toLowerCase()),
    );
  }, [makes, makeSearch]);

  const filteredModels = useMemo(() => {
    let filtered = models;
    if (selectedMakeId)
      filtered = filtered.filter(m => m.makeId === selectedMakeId);
    if (modelSearch)
      filtered = filtered.filter(m =>
        m.name?.toLowerCase().includes(modelSearch.toLowerCase()),
      );
    return filtered;
  }, [models, selectedMakeId, modelSearch]);

  const filteredFaults = useMemo(() => {
    if (!faultSearch) return faults;
    return faults.filter(f =>
      f.name?.toLowerCase().includes(faultSearch.toLowerCase()),
    );
  }, [faults, faultSearch]);

  const filteredDrawers = useMemo(() => {
    if (!drawerSearch) return drawers;
    return drawers.filter(d =>
      d.name?.toLowerCase().includes(drawerSearch.toLowerCase()),
    );
  }, [drawers, drawerSearch]);

  const filteredEngineers = useMemo(() => {
    if (!engineerSearch) return engineers;
    return engineers.filter(e =>
      e.name?.toLowerCase().includes(engineerSearch.toLowerCase()),
    );
  }, [engineers, engineerSearch]);

  // ✅ renderItemRow using map() — no nested FlatList
  const renderItemRow = (item, type) => {
    const isEngineer = type === 'engineer';
    return (
      <View key={String(item.id)} style={styles.listItem}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.actionButtons}>
          {isEngineer && (
            <TouchableOpacity
              onPress={() => handleEditEngineer(item.id, item.name)}
              style={styles.editButton}
            >
              <Edit2 size={18} color={COLORS.info} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(type, item.id, item.name)}
            style={styles.deleteButton}
          >
            <Trash2 size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSection = ({ item: section }) => {
    const isExpanded = expandedSections[section.key];
    let data,
      searchValue,
      setSearch,
      addModalType,
      extraComponent = null;

    switch (section.key) {
      case 'makes':
        data = filteredMakes;
        searchValue = makeSearch;
        setSearch = setMakeSearch;
        addModalType = 'make';
        break;
      case 'models':
        data = filteredModels;
        searchValue = modelSearch;
        setSearch = setModelSearch;
        addModalType = 'model';
        extraComponent = (
          <SelectModal
            label="Filter by Make"
            value={selectedMakeId}
            options={makes}
            onSelect={setSelectedMakeId}
            placeholder="All Makes"
            style={styles.filterSelect}
          />
        );
        break;
      case 'faults':
        data = filteredFaults;
        searchValue = faultSearch;
        setSearch = setFaultSearch;
        addModalType = 'fault';
        break;
      case 'drawers':
        data = filteredDrawers;
        searchValue = drawerSearch;
        setSearch = setDrawerSearch;
        addModalType = 'drawer';
        break;
      case 'engineers':
        data = filteredEngineers;
        searchValue = engineerSearch;
        setSearch = setEngineerSearch;
        addModalType = 'engineer';
        break;
      default:
        return null;
    }

    return (
      <View style={styles.sectionCard} key={section.key}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section.key)}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {isExpanded ? (
            <ChevronUp size={22} color={COLORS.gray600} />
          ) : (
            <ChevronDown size={22} color={COLORS.gray600} />
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color={COLORS.gray400} />
              <TextInput
                style={styles.searchInput}
                placeholder={section.placeholder}
                value={searchValue}
                onChangeText={setSearch}
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            {extraComponent}

            {/* ✅ FIX: map() instead of nested FlatList */}
            <View>
              {data.length === 0 ? (
                <Text style={styles.emptyText}>No items found</Text>
              ) : (
                data.map(item => renderItemRow(item, section.type))
              )}
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openAddModal(addModalType, selectedMakeId)}
            >
              <Plus size={18} color={COLORS.white} />
              <Text style={styles.addButtonText}>
                Add{' '}
                {section.type === 'make'
                  ? 'Make'
                  : section.type === 'model'
                  ? 'Model'
                  : section.type === 'fault'
                  ? 'Fault'
                  : section.type === 'drawer'
                  ? 'Drawer'
                  : 'Engineer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.adminHeader}>
          <TouchableOpacity
            style={styles.adminNavButton}
            onPress={() => navigation.navigate('UserList')}
          >
            <Users size={20} color={COLORS.white} />
            <Text style={styles.adminNavText}>User List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminNavButton}
            onPress={() => navigation.navigate('UserReport')}
          >
            <FileText size={20} color={COLORS.white} />
            <Text style={styles.adminNavText}>User Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Only ONE FlatList at the top level */}
      <FlatList
        data={SECTIONS}
        keyExtractor={item => item.key}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <AddItemModal
        visible={modalVisible}
        type={modalType}
        makes={makes}
        selectedMakeId={selectedMakeForModel}
        onSelectMake={setSelectedMakeForModel}
        onSubmit={handleAddSubmit}
        onClose={closeModal}
      />
      {loading && (
        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={{ marginVertical: SPACING.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  adminNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    gap: SPACING.sm,
  },
  adminNavText: { ...FONTS.medium, fontSize: 14, color: COLORS.white },
  listContent: { padding: SPACING.lg, paddingTop: 16 },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  sectionTitle: { ...FONTS.bold, fontSize: 16, color: COLORS.gray900 },
  sectionContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray900,
  },
  filterSelect: { marginVertical: SPACING.sm },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  itemName: { ...FONTS.regular, fontSize: 14, color: COLORS.gray700 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  editButton: { marginRight: SPACING.sm, padding: SPACING.xs },
  deleteButton: { padding: SPACING.xs },
  emptyText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDERS.radius.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: { ...FONTS.semibold, fontSize: 13, color: COLORS.white },
});