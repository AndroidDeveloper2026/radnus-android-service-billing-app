// // src/screens/admin/AdminScreens.js
// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { Trash2 } from 'lucide-react-native';
// import { 
//   fetchMakes, addMake, deleteMake, 
//   fetchModels, addModel, deleteModel, 
//   fetchFaults, addFault, deleteFault, 
//   fetchDrawers, addDrawer, deleteDrawer, 
//   fetchEngineers, addEngineer, deleteEngineer 
// } from '../../store/slices/adminSlice';
// import { Button, SelectModal, SectionCard, LoadingOverlay } from '../../components/UI';
// import { COLORS, SPACING } from '../../utils/theme';
// import { useToast } from 'react-native-toast-notifications';

// export default function AdminScreens() {
//   const dispatch = useDispatch();
//   const toast = useToast();
//   const { makes, models, faults, drawers, engineers, loading } = useSelector(state => state.admin);
//   const [selectedMakeId, setSelectedMakeId] = useState('');

//   useEffect(() => {
//     dispatch(fetchMakes());
//     dispatch(fetchModels());
//     dispatch(fetchFaults());
//     dispatch(fetchDrawers());
//     dispatch(fetchEngineers());
//   }, []);

//   const handleAddMake = () => {
//     Alert.prompt('Add Make', 'Enter make name', async (name) => {
//       if (name) { await dispatch(addMake(name)); toast.show('Make added', { type: 'success' }); }
//     });
//   };

//   const handleDeleteMake = (id) => {
//     Alert.alert('Delete', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' }, 
//       { text: 'Delete', onPress: async () => { await dispatch(deleteMake(id)); toast.show('Deleted', { type: 'success' }); } }
//     ]);
//   };

//   const handleAddModel = () => {
//     if (!selectedMakeId) { toast.show('Select a make first', { type: 'danger' }); return; }
//     Alert.prompt('Add Model', 'Enter model name', async (name) => {
//       if (name) { await dispatch(addModel({ makeId: selectedMakeId, name })); toast.show('Model added', { type: 'success' }); }
//     });
//   };

//   const handleDeleteModel = (id) => {
//     Alert.alert('Delete', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' }, 
//       { text: 'Delete', onPress: async () => { await dispatch(deleteModel(id)); toast.show('Deleted', { type: 'success' }); } }
//     ]);
//   };

//   const handleAddFault = () => {
//     Alert.prompt('Add Fault', 'Enter fault name', async (name) => {
//       if (name) { await dispatch(addFault(name)); toast.show('Fault added', { type: 'success' }); }
//     });
//   };

//   const handleDeleteFault = (id) => {
//     Alert.alert('Delete', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' }, 
//       { text: 'Delete', onPress: async () => { await dispatch(deleteFault(id)); toast.show('Deleted', { type: 'success' }); } }
//     ]);
//   };

//   const handleAddDrawer = () => {
//     Alert.prompt('Add Drawer', 'Enter drawer name', async (name) => {
//       if (name) { await dispatch(addDrawer(name)); toast.show('Drawer added', { type: 'success' }); }
//     });
//   };

//   const handleDeleteDrawer = (id) => {
//     Alert.alert('Delete', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' }, 
//       { text: 'Delete', onPress: async () => { await dispatch(deleteDrawer(id)); toast.show('Deleted', { type: 'success' }); } }
//     ]);
//   };

//   const handleAddEngineer = () => {
//     Alert.prompt('Add Engineer', 'Enter engineer name', async (name) => {
//       if (name) { await dispatch(addEngineer(name)); toast.show('Engineer added', { type: 'success' }); }
//     });
//   };

//   const handleDeleteEngineer = (id) => {
//     Alert.alert('Delete', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' }, 
//       { text: 'Delete', onPress: async () => { await dispatch(deleteEngineer(id)); toast.show('Deleted', { type: 'success' }); } }
//     ]);
//   };

//   const renderItem = (item, onDelete) => (
//     <View style={{ 
//       flexDirection: 'row', 
//       justifyContent: 'space-between', 
//       alignItems: 'center', 
//       paddingVertical: SPACING.sm, 
//       borderBottomWidth: 1, 
//       borderBottomColor: COLORS.border 
//     }}>
//       <Text>{item.name}</Text>
//       <TouchableOpacity onPress={() => onDelete(item.id)}>
//         <Trash2 size={20} color={COLORS.danger} />
//       </TouchableOpacity>
//     </View>
//   );

//   const filteredModels = models.filter(m => m.makeId === selectedMakeId);

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: COLORS.lightGray, padding: SPACING.lg }}>
//       {/* Make Master */}
//       <SectionCard title="Make Master">
//         <FlatList
//           data={makes}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => renderItem(item, handleDeleteMake)}
//           ListEmptyComponent={<Text style={{ color: COLORS.gray }}>No makes</Text>}
//           scrollEnabled={false}
//         />
//         <Button title="Add Make" onPress={handleAddMake} variant="secondary" style={{ marginTop: SPACING.md }} />
//       </SectionCard>

//       {/* Model Master */}
//       <SectionCard title="Model Master">
//         <SelectModal 
//           label="Select Make" 
//           value={selectedMakeId} 
//           options={makes} 
//           onSelect={setSelectedMakeId} 
//           placeholder="Select Make" 
//         />
//         {selectedMakeId && (
//           <>
//             <FlatList
//               data={filteredModels}
//               keyExtractor={item => item.id}
//               renderItem={({ item }) => renderItem(item, handleDeleteModel)}
//               ListEmptyComponent={<Text style={{ color: COLORS.gray }}>No models</Text>}
//               scrollEnabled={false}
//             />
//             <Button title="Add Model" onPress={handleAddModel} variant="secondary" style={{ marginTop: SPACING.md }} />
//           </>
//         )}
//       </SectionCard>

//       {/* Fault Master */}
//       <SectionCard title="Fault Master">
//         <FlatList
//           data={faults}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => renderItem(item, handleDeleteFault)}
//           ListEmptyComponent={<Text style={{ color: COLORS.gray }}>No faults</Text>}
//           scrollEnabled={false}
//         />
//         <Button title="Add Fault" onPress={handleAddFault} variant="secondary" style={{ marginTop: SPACING.md }} />
//       </SectionCard>

//       {/* Drawer Master */}
//       <SectionCard title="Drawer Master">
//         <FlatList
//           data={drawers}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => renderItem(item, handleDeleteDrawer)}
//           ListEmptyComponent={<Text style={{ color: COLORS.gray }}>No drawers</Text>}
//           scrollEnabled={false}
//         />
//         <Button title="Add Drawer" onPress={handleAddDrawer} variant="secondary" style={{ marginTop: SPACING.md }} />
//       </SectionCard>

//       {/* Engineer Master */}
//       <SectionCard title="Engineer Master">
//         <FlatList
//           data={engineers}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => renderItem(item, handleDeleteEngineer)}
//           ListEmptyComponent={<Text style={{ color: COLORS.gray }}>No engineers</Text>}
//           scrollEnabled={false}
//         />
//         <Button title="Add Engineer" onPress={handleAddEngineer} variant="secondary" style={{ marginTop: SPACING.md }} />
//       </SectionCard>

//       <LoadingOverlay visible={loading} />
//     </ScrollView>
//   );
// }

//=====================

// src/screens/admin/AdminScreens.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus } from 'lucide-react-native';
import { 
  fetchMakes, addMake, deleteMake, 
  fetchModels, addModel, deleteModel, 
  fetchFaults, addFault, deleteFault, 
  fetchDrawers, addDrawer, deleteDrawer, 
  fetchEngineers, addEngineer, deleteEngineer 
} from '../../store/slices/adminSlice';
import { Button, SelectModal, SectionCard, LoadingOverlay } from '../../components/UI';
import { COLORS, SPACING, FONTS, SHADOWS, BORDERS } from '../../utils/theme';
import { useToast } from 'react-native-toast-notifications';

export default function AdminScreens() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { makes, models, faults, drawers, engineers, loading } = useSelector(state => state.admin);
  const [selectedMakeId, setSelectedMakeId] = useState('');

  useEffect(() => {
    dispatch(fetchMakes());
    dispatch(fetchModels());
    dispatch(fetchFaults());
    dispatch(fetchDrawers());
    dispatch(fetchEngineers());
  }, []);

  const handleAddMake = () => {
    Alert.prompt('Add Make', 'Enter make name', async (name) => {
      if (name) { await dispatch(addMake(name)); toast.show('Make added', { type: 'success' }); }
    });
  };

  const handleDeleteMake = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' }, 
      { text: 'Delete', style: 'destructive', onPress: async () => { await dispatch(deleteMake(id)); toast.show('Deleted', { type: 'success' }); } }
    ]);
  };

  const handleAddModel = () => {
    if (!selectedMakeId) { toast.show('Select a make first', { type: 'danger' }); return; }
    Alert.prompt('Add Model', 'Enter model name', async (name) => {
      if (name) { await dispatch(addModel({ makeId: selectedMakeId, name })); toast.show('Model added', { type: 'success' }); }
    });
  };

  const handleDeleteModel = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' }, 
      { text: 'Delete', style: 'destructive', onPress: async () => { await dispatch(deleteModel(id)); toast.show('Deleted', { type: 'success' }); } }
    ]);
  };

  const handleAddFault = () => {
    Alert.prompt('Add Fault', 'Enter fault name', async (name) => {
      if (name) { await dispatch(addFault(name)); toast.show('Fault added', { type: 'success' }); }
    });
  };

  const handleDeleteFault = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' }, 
      { text: 'Delete', style: 'destructive', onPress: async () => { await dispatch(deleteFault(id)); toast.show('Deleted', { type: 'success' }); } }
    ]);
  };

  const handleAddDrawer = () => {
    Alert.prompt('Add Drawer', 'Enter drawer name', async (name) => {
      if (name) { await dispatch(addDrawer(name)); toast.show('Drawer added', { type: 'success' }); }
    });
  };

  const handleDeleteDrawer = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' }, 
      { text: 'Delete', style: 'destructive', onPress: async () => { await dispatch(deleteDrawer(id)); toast.show('Deleted', { type: 'success' }); } }
    ]);
  };

  const handleAddEngineer = () => {
    Alert.prompt('Add Engineer', 'Enter engineer name', async (name) => {
      if (name) { await dispatch(addEngineer(name)); toast.show('Engineer added', { type: 'success' }); }
    });
  };

  const handleDeleteEngineer = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' }, 
      { text: 'Delete', style: 'destructive', onPress: async () => { await dispatch(deleteEngineer(id)); toast.show('Deleted', { type: 'success' }); } }
    ]);
  };

  const renderItem = (item, onDelete) => (
    <View style={styles.listItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Trash2 size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const filteredModels = models.filter(m => m.makeId === selectedMakeId);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.gray50, padding: SPACING.lg }}>
      {/* Makes */}
      <SectionCard title="Make Master">
        <FlatList
          data={makes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderItem(item, handleDeleteMake)}
          ListEmptyComponent={<Text style={styles.emptyText}>No makes found</Text>}
          scrollEnabled={false}
        />
        <Button title="Add Make" onPress={handleAddMake} variant="secondary" style={{ marginTop: SPACING.md }} icon={Plus} />
      </SectionCard>

      {/* Models */}
      <SectionCard title="Model Master">
        <SelectModal 
          label="Select Make" 
          value={selectedMakeId} 
          options={makes} 
          onSelect={setSelectedMakeId} 
          placeholder="Select a make first"
        />
        {selectedMakeId && (
          <>
            <FlatList
              data={filteredModels}
              keyExtractor={item => item.id}
              renderItem={({ item }) => renderItem(item, handleDeleteModel)}
              ListEmptyComponent={<Text style={styles.emptyText}>No models found</Text>}
              scrollEnabled={false}
            />
            <Button title="Add Model" onPress={handleAddModel} variant="secondary" style={{ marginTop: SPACING.md }} icon={Plus} />
          </>
        )}
      </SectionCard>

      {/* Faults */}
      <SectionCard title="Fault Master">
        <FlatList
          data={faults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderItem(item, handleDeleteFault)}
          ListEmptyComponent={<Text style={styles.emptyText}>No faults found</Text>}
          scrollEnabled={false}
        />
        <Button title="Add Fault" onPress={handleAddFault} variant="secondary" style={{ marginTop: SPACING.md }} icon={Plus} />
      </SectionCard>

      {/* Drawers */}
      <SectionCard title="Drawer Master">
        <FlatList
          data={drawers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderItem(item, handleDeleteDrawer)}
          ListEmptyComponent={<Text style={styles.emptyText}>No drawers found</Text>}
          scrollEnabled={false}
        />
        <Button title="Add Drawer" onPress={handleAddDrawer} variant="secondary" style={{ marginTop: SPACING.md }} icon={Plus} />
      </SectionCard>

      {/* Engineers */}
      <SectionCard title="Engineer Master">
        <FlatList
          data={engineers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderItem(item, handleDeleteEngineer)}
          ListEmptyComponent={<Text style={styles.emptyText}>No engineers found</Text>}
          scrollEnabled={false}
        />
        <Button title="Add Engineer" onPress={handleAddEngineer} variant="secondary" style={{ marginTop: SPACING.md }} icon={Plus} />
      </SectionCard>

      <LoadingOverlay visible={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  itemName: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray700,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});